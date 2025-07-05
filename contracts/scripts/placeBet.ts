import { ethers } from "hardhat";
import { polybetsContractAddress } from "polybets-common";

enum BetSlipStrategy {
  MaximizeShares,
  MaximizePrivacy,
}

// Generate random collateral amount between 1-10 USDC (in wei, USDC has 6 decimals)
function getRandomCollateralAmount(): number {
  const min = 1_000_000; // 1 USDC
  const max = 10_000_000; // 10 USDC
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  // Get all signers (accounts)
  const signers = await ethers.getSigners();

  if (signers.length < 4) {
    throw new Error("Need at least 4 accounts configured in hardhat.config.ts");
  }

  // Use accounts 1, 2, and 3 (test accounts)
  const testAccounts = [signers[1], signers[2], signers[3]];

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
      `Random Collateral Amount: ${totalCollateralAmount / 1_000_000} USDC`
    );

    try {
      // Get the contract instance for this specific account
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
