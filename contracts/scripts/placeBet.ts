import { ethers } from "hardhat";
import { polybetsContractAddress } from "polybets-common/src/config";

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

// Helper function to extract bet slip ID from transaction receipt
async function extractBetSlipId(txReceipt: any, contract: any): Promise<bigint | null> {
  try {
    // Parse the logs to find BetSlipCreated event
    const betSlipCreatedEvent = contract.interface.parseLog(txReceipt.logs[2]);
    
    if (betSlipCreatedEvent && betSlipCreatedEvent.name === "BetSlipCreated") {
      return betSlipCreatedEvent.args.betId;
    }
    
    // If first log isn't the event, search through all logs
    for (const log of txReceipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === "BetSlipCreated") {
          return parsedLog.args.betId;
        }
      } catch {
        // Skip logs that can't be parsed by this contract
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting bet slip ID:", error);
    return null;
  }
}

// Helper function to wait for specified seconds
function sleep(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
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
  const testAccounts = [signers[0]];

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
    ethers.zeroPadValue(ethers.toBeHex(190), 32), // market id 190 for marketplace 2
    ethers.zeroPadValue(ethers.toBeHex(185), 32), // market id 185 for marketplace 3
  ];

  console.log("Placing bets with parameters:");
  console.log(`Strategy: ${strategy} (MaximizeShares)`);
  console.log(`Marketplace IDs: [${marketplaceIds.join(", ")}]`);
  console.log(`Market IDs: [${marketIds.join(", ")}]`);
  console.log("---");

  // Array to store bet slip IDs for selling later
  const betSlipIds: bigint[] = [];

  // Place bets for each test account
  for (let i = 0; i < testAccounts.length; i++) {
    const account = testAccounts[i];
    const accountIndex = i + 1; // Account indices 1, 2, 3
    const totalCollateralAmount = getRandomCollateralAmount();
    const outcomeIndex = Math.floor(Math.random() * 2);

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
        outcomeIndex,
        marketplaceIds,
        marketIds,
        true,
        0
      );

      console.log("Transaction submitted, waiting for confirmation...");
      console.log(`Transaction hash: ${tx.hash}`);

      const receipt = await tx.wait();

      console.log("Bet placed successfully!");
      console.log(`Transaction confirmed`);

      // Extract bet slip ID from the transaction receipt
      const betSlipId = await extractBetSlipId(receipt, polybet);
      if (betSlipId) {
        console.log(`Bet Slip ID: ${betSlipId}`);
        betSlipIds.push(betSlipId);
      } else {
        console.log("Warning: Could not extract bet slip ID from transaction");
      }

    } catch (error) {
      console.error(`Error placing bet for account ${accountIndex}:`, error);
      // Continue with other accounts even if one fails
    }
  }

  console.log("\n=== All bets placed ===");
  
  // Now initiate selling process for all placed bets
  if (betSlipIds.length > 0) {
    console.log(`\n🕐 Waiting 1 minute before initiating sell orders...`);
    await sleep(60); // Wait 1 minute (60 seconds)
    
    console.log(`\n💰 Initiating sell orders for ${betSlipIds.length} bet slips...`);
    
    // Use the first test account for selling (you could also use the same account that placed each bet)
    const sellingAccount = testAccounts[0];
    const polybet = await ethers.getContractAt(
      "PolyBet",
      polybetsContractAddress,
      sellingAccount
    );
    
    for (let i = 0; i < betSlipIds.length; i++) {
      const betSlipId = betSlipIds[i];
      console.log(`\nInitiating sell for Bet Slip ID: ${betSlipId}`);
      
      try {
        const sellTx = await polybet.initiateSellProxiedBets(betSlipId);
        console.log(`Sell transaction submitted: ${sellTx.hash}`);
        
        const sellReceipt = await sellTx.wait();
        if (sellReceipt) {
          console.log(`✅ Sell initiated successfully for Bet Slip ID: ${betSlipId}`);
          console.log(`Gas used: ${sellReceipt.gasUsed}`);
        } else {
          console.log(`⚠️  Sell transaction receipt is null for Bet Slip ID: ${betSlipId}`);
        }
        
      } catch (error) {
        console.error(`❌ Error initiating sell for Bet Slip ID ${betSlipId}:`, error);
      }
    }
    
    console.log("\n=== All sell orders initiated ===");
  } else {
    console.log("\n⚠️  No bet slip IDs found to sell");
  }

  console.log("\n=== Script completed ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
