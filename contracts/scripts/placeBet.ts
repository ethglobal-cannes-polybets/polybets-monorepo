import { ethers } from "hardhat";
import { polybetsContractAddress } from "polybets-common";

enum BetSlipStrategy {
  MaximizeShares,
  MaximizePrivacy,
}

// Generate random collateral amount between 1-10 USDC (in wei, USDC has 6 decimals)
function getRandomCollateralAmount(): bigint {
  const min = 1_000_000; // 1 USDC
  const max = 10_000_000; // 10 USDC
  return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
}

async function main() {
  const musdcAddress =
    process.env.SAPPHIRETESTNET_MUSDC_ADDRESS ||
    "0xa65FAB615E26e84c51940259aD4BDba6B386d35E";
  // Get all signers (accounts)
  const signers = await ethers.getSigners();

  if (signers.length < 4) {
    throw new Error("Need at least 4 accounts configured in hardhat.config.ts");
  }

  // signers[0] is the mint authority for MUSDC
  const mintAuthority = signers[0];

  // Use accounts 1, 2, and 3 (test accounts)
  const testAccounts = [signers[1], signers[2], signers[3]];

  // Get mUSDC contract instance with mint authority
  const musdcContract = await ethers.getContractAt(
    "MockUSDC",
    musdcAddress,
    mintAuthority
  );

  // Parameters for placeBet
  const strategy = BetSlipStrategy.MaximizeShares; // 0 - maximize shares strategy

  // Convert marketplace IDs to bytes32
  const marketplaceIds = [
    ethers.zeroPadValue(ethers.toBeHex(2), 32), // marketplace 2
    ethers.zeroPadValue(ethers.toBeHex(3), 32), // marketplace 3
  ];

  // Convert market IDs to bytes32
  const marketIds = [
    ethers.zeroPadValue(ethers.toBeHex(124), 32), // market id 124 for marketplace 2
    ethers.zeroPadValue(ethers.toBeHex(118), 32), // market id 118 for marketplace 3
  ];

  console.log("Placing bets with parameters:");
  console.log(`Strategy: ${strategy} (MaximizeShares)`);
  console.log(`Marketplace IDs: [${marketplaceIds.join(", ")}]`);
  console.log(`Market IDs: [${marketIds.join(", ")}]`);
  console.log("---");

  // Place bets for each test account
  for (let i = 0; i < testAccounts.length; i++) {
    const account = testAccounts[i];
    const accountIndex = i + 1; // Account indices 1, 2, 3
    const totalCollateralAmount = getRandomCollateralAmount();

    console.log(`\nAccount ${accountIndex} (${account.address}):`);
    console.log(
      `Random Collateral Amount: ${Number(totalCollateralAmount) / 1_000_000} USDC`
    );

    try {
      // Get mUSDC contract instance for this user
      const userMusdcContract = await ethers.getContractAt(
        "MockUSDC",
        musdcAddress,
        account
      );

      // 1. Check user's MUSDC balance
      const userBalance = await userMusdcContract.balanceOf(account.address);
      console.log(
        `Current MUSDC balance: ${Number(userBalance) / 1_000_000} USDC`
      );

      // 2. If they don't have enough, mint them the amount they need
      if (userBalance < totalCollateralAmount) {
        const amountToMint = totalCollateralAmount - userBalance;
        console.log(
          `Insufficient balance. Minting ${Number(amountToMint) / 1_000_000} USDC...`
        );

        const mintTx = await musdcContract.mint(account.address, amountToMint);
        await mintTx.wait();
        console.log("Minted successfully!");

        // Verify new balance
        const newBalance = await userMusdcContract.balanceOf(account.address);
        console.log(
          `New MUSDC balance: ${Number(newBalance) / 1_000_000} USDC`
        );
      }

      // 3. Check the user's approved amount for the PolyBet contract
      const currentAllowance = await userMusdcContract.allowance(
        account.address,
        polybetsContractAddress
      );
      console.log(
        `Current allowance: ${Number(currentAllowance) / 1_000_000} USDC`
      );

      // 4. If their approval is too low, approve 10x the amount they want to bet
      if (currentAllowance < totalCollateralAmount) {
        const approvalAmount = totalCollateralAmount * 10n; // 10x the bet amount
        console.log(
          `Insufficient allowance. Approving ${Number(approvalAmount) / 1_000_000} USDC...`
        );

        const approveTx = await userMusdcContract.approve(
          polybetsContractAddress,
          approvalAmount
        );
        await approveTx.wait();
        console.log("Approved successfully!");

        // Verify new allowance
        const newAllowance = await userMusdcContract.allowance(
          account.address,
          polybetsContractAddress
        );
        console.log(`New allowance: ${Number(newAllowance) / 1_000_000} USDC`);
      }

      // 5. Get the PolyBet contract instance for this specific account and place the bet
      const polybet = await ethers.getContractAt(
        "PolyBet",
        polybetsContractAddress,
        account
      );

      // Call placeBet function
      const tx = await polybet.placeBet(
        strategy,
        totalCollateralAmount,
        marketplaceIds,
        marketIds
      );

      console.log("Transaction submitted, waiting for confirmation...");
      console.log(`Transaction hash: ${tx.hash}`);

      await tx.wait();

      console.log("Bet placed successfully!");
      console.log(`Transaction confirmed`);
    } catch (error) {
      console.error(`Error placing bet for account ${accountIndex}:`, error);
      // Continue with other accounts even if one fails
    }
  }

  console.log("\n=== All bets completed ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
