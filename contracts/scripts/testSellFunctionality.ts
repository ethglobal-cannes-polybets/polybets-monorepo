import { ethers } from "hardhat";
import { polybetsContractAddress } from "polybets-common/src/config";

enum BetOutcome {
  None,
  Placed,
  Failed,
  Sold,
  Won,
  Lost,
  Draw,
  Void,
}

async function main() {
  const [owner, testacct] = await ethers.getSigners();
  console.log("Owner account:", owner.address);
  console.log("Test account:", testacct.address);

  // Get the deployed PolyBet contract
  const polybet = await ethers.getContractAt(
    "PolyBet",
    polybetsContractAddress
  );

  // Check who owns the contract
  const contractOwner = await polybet.owner();
  console.log("Contract owner:", contractOwner);
  console.log("Is owner account the contract owner?", owner.address === contractOwner);

  // First, let's create a valid betSlip as the test account
  console.log("\n=== Creating a test betSlip ===");
  
  // Get mUSDC token for approval
  const musdcAddress = await polybet.musdcToken();
  const musdc = await ethers.getContractAt("MockUSDC", musdcAddress);
  
  // Approve spending
  const amount = 10_000_000; // 10 USDC
  const approveTx = await musdc.connect(testacct).approve(polybetsContractAddress, amount);
  await approveTx.wait();
  
  // Place a bet
  const marketplaceIds = [ethers.zeroPadValue(ethers.toBeHex(1), 32)];
  const marketIds = [ethers.zeroPadValue(ethers.toBeHex(101), 32)];
  
  const betTx = await polybet.connect(testacct).placeBet(
    0, // MaximizeShares strategy
    amount,
    0,
    marketplaceIds,
    marketIds
  );
  const betReceipt = await betTx.wait();
  
  // Get the betSlipId from the event
  const parsedLog = polybet.interface.parseLog(betReceipt.logs[2]);
  const betSlipId = parsedLog.args[0];
  console.log(`Created BetSlip ID: ${betSlipId}`);

  // Create a proxied bet ID for testing
  const mockProxiedBetId = ethers.keccak256(ethers.toUtf8Bytes(`test-bet-${betSlipId}-0`));
  
  console.log("\n=== Setting up test proxied bet ===");
  console.log(`Proxied bet ID: ${mockProxiedBetId}`);

  // Record a proxied bet to test selling (as owner)
  const proxiedBet = {
    id: mockProxiedBetId,
    betSlipId: betSlipId,
    marketplaceId: 1,
    marketId: 101,
    optionIndex: 0,
    minimumShares: 0,
    blockTimestamp: Math.floor(Date.now() / 1000),
    originalCollateralAmount: amount, // Use the full amount
    finalCollateralAmount: 0,
    sharesBought: 100, // 100 shares bought
    sharesSold: 0,
    outcome: BetOutcome.Placed,
    failureReason: "",
  };

  try {
    console.log("Recording proxied bet as owner...");
    const recordTx = await polybet.connect(owner).recordProxiedBetPlaced(betSlipId, proxiedBet);
    await recordTx.wait();
    console.log("Proxied bet recorded successfully");
  } catch (error: any) {
    console.error("Failed to record proxied bet:", error.reason || error.message);
    return;
  }

  console.log("\n=== Testing partial sale ===");
  
  // Test 1: Partial sale (40 shares out of 100)
  const partialShares = 40;
  const partialSaleValue = 20_000_000; // 20 USDC
  
  console.log(`Selling ${partialShares} shares for ${ethers.formatUnits(partialSaleValue, 6)} USDC`);
  
  try {
    const sellTx1 = await polybet.connect(owner).recordProxiedBetSold(
      mockProxiedBetId,
      partialShares,
      partialSaleValue
    );
    await sellTx1.wait();
    console.log("✓ Partial sale completed successfully");
    
    // Check the state after partial sale
    const betData = await polybet.proxiedBets(mockProxiedBetId);
    console.log(`Shares sold after partial sale: ${betData.sharesSold}`);
    console.log(`Outcome after partial sale: ${betData.outcome} (should be ${BetOutcome.Placed})`);
    
  } catch (error: any) {
    console.error("✗ Partial sale failed:", error.reason || error.message);
  }

  console.log("\n=== Testing complete sale ===");
  
  // Test 2: Sell remaining shares (60 shares)
  const remainingShares = 60;
  const remainingSaleValue = 30_000_000; // 30 USDC
  
  console.log(`Selling remaining ${remainingShares} shares for ${ethers.formatUnits(remainingSaleValue, 6)} USDC`);
  
  try {
    const sellTx2 = await polybet.connect(owner).recordProxiedBetSold(
      mockProxiedBetId,
      remainingShares,
      remainingSaleValue
    );
    await sellTx2.wait();
    console.log("✓ Remaining shares sold successfully");
    
    // Check final state
    const finalBetData = await polybet.proxiedBets(mockProxiedBetId);
    console.log(`\nFinal bet state:`);
    console.log(`- Total shares sold: ${finalBetData.sharesSold} (should be 100)`);
    console.log(`- Outcome: ${finalBetData.outcome} (should be ${BetOutcome.Sold})`);
    console.log(`- Final collateral amount: ${ethers.formatUnits(finalBetData.finalCollateralAmount, 6)} USDC`);
    
  } catch (error: any) {
    console.error("✗ Complete sale failed:", error.reason || error.message);
  }

  console.log("\n=== Testing over-selling protection ===");
  
  // Test 3: Try to sell more shares (should fail)
  console.log("Attempting to sell 10 more shares (should fail)...");
  
  try {
    const oversellTx = await polybet.connect(owner).recordProxiedBetSold(
      mockProxiedBetId,
      10,
      5_000_000
    );
    await oversellTx.wait();
    console.error("✗ Over-selling was allowed (this is a bug!)");
  } catch (error: any) {
    console.log("✓ Over-selling correctly prevented:", error.reason || "cannot sell more shares than bought");
  }
  
  // Check final state
  console.log("\n=== Checking final state ===");
  const betSlipData = await polybet.getBetSlip(betSlipId);
  console.log(`BetSlip final collateral: ${ethers.formatUnits(betSlipData.finalCollateral, 6)} USDC`);
  console.log(`Total proceeds from selling shares: ${ethers.formatUnits(partialSaleValue + remainingSaleValue, 6)} USDC`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });