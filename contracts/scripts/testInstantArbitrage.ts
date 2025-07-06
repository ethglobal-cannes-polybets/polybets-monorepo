import { ethers } from "hardhat";
import { polybetsContractAddress } from "polybets-common/src/config";
import { SiweMessage } from 'siwe';

enum BetSlipStrategy {
  MaximizeShares,
  MaximizePrivacy,
}

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

enum BetSlipStatus {
  Pending,
  Processing,
  Placed,
  Selling,
  Failed,
  Closed,
}

async function main() {
  const [owner, testacct] = await ethers.getSigners();
  console.log("Testing instant arbitrage functionality");
  console.log("Owner account:", owner.address);
  console.log("Test account:", testacct.address);

  // Get the deployed PolyBet contract
  const polybet = await ethers.getContractAt(
    "PolyBet",
    polybetsContractAddress
  );

  // Get mUSDC token address from the contract
  const musdcAddress = await polybet.musdcToken();
  const musdc = await ethers.getContractAt("MockUSDC", musdcAddress);
  console.log("mUSDC token address:", musdcAddress);

  // Step 1: Place a bet with instant arbitrage enabled
  console.log("\n=== Step 1: Placing bet with instant arbitrage enabled ===");
  const strategy = BetSlipStrategy.MaximizeShares;
  const totalCollateralAmount = 120_000_000; // 120 USDC
  const instantArbitrage = true; // Enable instant arbitrage
  const parentId = 0; // No parent

  // Approve mUSDC spending
  const currentAllowance = await musdc.allowance(testacct.address, polybetsContractAddress);
  console.log(`Current mUSDC allowance: ${currentAllowance}`);
  
  if (currentAllowance < totalCollateralAmount) {
    console.log("Approving mUSDC spending...");
    const approveTx = await musdc
      .connect(testacct)
      .approve(polybetsContractAddress, totalCollateralAmount);
    await approveTx.wait();
    console.log("Approval complete");
  }

  // Create 4 markets to test instant arbitrage
  const marketplaceIds = [
    ethers.zeroPadValue(ethers.toBeHex(1), 32),
    ethers.zeroPadValue(ethers.toBeHex(2), 32),
    ethers.zeroPadValue(ethers.toBeHex(3), 32),
    ethers.zeroPadValue(ethers.toBeHex(4), 32),
  ];

  const marketIds = [
    ethers.zeroPadValue(ethers.toBeHex(201), 32),
    ethers.zeroPadValue(ethers.toBeHex(202), 32),
    ethers.zeroPadValue(ethers.toBeHex(203), 32),
    ethers.zeroPadValue(ethers.toBeHex(204), 32),
  ];

  const tx = await polybet.connect(testacct).placeBet(
    strategy,
    totalCollateralAmount,
    0, // outcome index
    marketplaceIds,
    marketIds,
    instantArbitrage,
    parentId
  );

  const receipt = await tx.wait();
  console.log("Bet placed successfully with instant arbitrage enabled!");
  const parsedLog = polybet.interface.parseLog(receipt.logs[2]);
  const betSlipId = parsedLog.args[0];
  console.log(`Created BetSlip ID: ${betSlipId}`);
  
  // Verify instant arbitrage is enabled
  let betSlip = await polybet.getBetSlip(betSlipId);
  console.log(`Instant arbitrage enabled: ${betSlip.instantArbitrage}`);
  console.log(`BetSlip status: ${betSlip.status} (0=Pending)`);

  // Step 2: Simulate BetRouter recording proxied bets
  console.log("\n=== Step 2: Recording proxied bets ===");

  // Verify owner permissions
  const contractOwner = await polybet.owner();
  console.log(`Contract owner: ${contractOwner}`);
  console.log(`Current signer: ${owner.address}`);
  console.log(`Is owner: ${contractOwner.toLowerCase() === owner.address.toLowerCase()}`);

  const proxiedBets = [
    {
      id: ethers.keccak256(ethers.toUtf8Bytes(`arb-bet-${betSlipId}-0`)),
      betSlipId: betSlipId,
      marketplaceId: 1,
      marketId: 201,
      optionIndex: 0,
      minimumShares: 0,
      blockTimestamp: Math.floor(Date.now() / 1000),
      originalCollateralAmount: 30_000_000, // 30 USDC
      finalCollateralAmount: 0,
      sharesBought: 40, // 40 shares
      sharesSold: 0,
      outcome: BetOutcome.Placed,
      failureReason: "",
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes(`arb-bet-${betSlipId}-1`)),
      betSlipId: betSlipId,
      marketplaceId: 2,
      marketId: 202,
      optionIndex: 0,
      minimumShares: 0,
      blockTimestamp: Math.floor(Date.now() / 1000),
      originalCollateralAmount: 30_000_000, // 30 USDC
      finalCollateralAmount: 0,
      sharesBought: 35, // 35 shares
      sharesSold: 0,
      outcome: BetOutcome.Placed,
      failureReason: "",
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes(`arb-bet-${betSlipId}-2`)),
      betSlipId: betSlipId,
      marketplaceId: 3,
      marketId: 203,
      optionIndex: 0,
      minimumShares: 0,
      blockTimestamp: Math.floor(Date.now() / 1000),
      originalCollateralAmount: 30_000_000, // 30 USDC
      finalCollateralAmount: 0,
      sharesBought: 45, // 45 shares
      sharesSold: 0,
      outcome: BetOutcome.Placed,
      failureReason: "",
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes(`arb-bet-${betSlipId}-3`)),
      betSlipId: betSlipId,
      marketplaceId: 4,
      marketId: 204,
      optionIndex: 0,
      minimumShares: 0,
      blockTimestamp: Math.floor(Date.now() / 1000),
      originalCollateralAmount: 30_000_000, // 30 USDC
      finalCollateralAmount: 0,
      sharesBought: 50, // 50 shares
      sharesSold: 0,
      outcome: BetOutcome.Placed,
      failureReason: "",
    },
  ];

  // Record each proxied bet
  for (let i = 0; i < proxiedBets.length; i++) {
    const proxiedBet = proxiedBets[i];
    console.log(`\n[${i+1}/${proxiedBets.length}] Sending proxied bet ${proxiedBet.id.substring(0, 10)}...`);
    console.log(`  - BetSlip ID: ${betSlipId}`);
    console.log(`  - Market ID: ${proxiedBet.marketId}`);
    console.log(`  - Collateral: ${ethers.formatUnits(proxiedBet.originalCollateralAmount, 6)} USDC`);
    
    try {
      console.log("  - Calling recordProxiedBetPlaced...");
      const recordTx = await polybet.recordProxiedBetPlaced(
        betSlipId,
        proxiedBet,
        { 
          gasLimit: 5_000_000,
          maxFeePerGas: ethers.parseUnits("100", "gwei"),
          maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
        }
      );
      console.log(`  - Transaction sent! Hash: ${recordTx.hash}`);
      console.log("  - Waiting for confirmation...");
      
      const receipt = await recordTx.wait(1);
      console.log(`  - Transaction confirmed! Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed}`);
      console.log(
        `  ✅ Recorded proxied bet ${proxiedBet.id.substring(0, 10)}... on market ${proxiedBet.marketId}`
      );
    } catch (error: any) {
      console.error(`  ❌ Failed to record proxied bet:`, error);
      if (error.data) {
        try {
          const decodedError = polybet.interface.parseError(error.data);
          console.error(`  - Decoded error:`, decodedError);
        } catch (e) {
          console.error(`  - Raw error data:`, error.data);
        }
      }
      throw error;
    }
  }

  betSlip = await polybet.getBetSlip(betSlipId);
  console.log(`\nBetSlip now has ${betSlip.proxiedBets.length} proxied bets`);
  console.log(`BetSlip status: ${betSlip.status} (2=Placed)`);

  // Step 3: Simulate one bet losing to trigger instant arbitrage
  console.log("\n=== Step 3: Triggering instant arbitrage by recording a loss ===");
  
  // Listen for BetSlipSellingStateUpdate event
  const filter = polybet.filters.BetSlipSellingStateUpdate();
  let sellingEventFired = false;
  
  polybet.once(filter, (betSlipIdFromEvent) => {
    console.log(`\n🚨 BetSlipSellingStateUpdate event fired for betSlip ${betSlipIdFromEvent}`);
    sellingEventFired = true;
  });

  // Record the first bet as lost with 0 winnings
  const losingBet = proxiedBets[0];
  console.log(`Recording bet ${losingBet.id.substring(0, 10)}... as LOST`);
  
  try {
    const closeTx = await polybet.recordProxiedBetClosed(
      losingBet.id,
      BetOutcome.Lost,
      0, // 0 winnings
      {
        gasLimit: 1_000_000
      }
    );
    console.log(`Transaction sent! Hash: ${closeTx.hash}`);
    const receipt = await closeTx.wait();
    console.log(`Transaction confirmed! Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed}`);
  } catch (error: any) {
    console.error(`Failed to record proxied bet as closed:`, error);
    if (error.data) {
      try {
        const decodedError = polybet.interface.parseError(error.data);
        console.error(`Decoded error:`, decodedError);
      } catch (e) {
        console.error(`Raw error data:`, error.data);
      }
    }
    throw error;
  }
  
  // Give a moment for event to be processed
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`\nInstant arbitrage triggered: ${sellingEventFired}`);
  
  // Check betSlip status - should be "Selling" now
  betSlip = await polybet.getBetSlip(betSlipId);
  console.log(`BetSlip status after loss: ${betSlip.status} (should be 3=Selling)`);
  
  if (Number(betSlip.status) === BetSlipStatus.Selling) {
    console.log("✅ Instant arbitrage successfully triggered - bet slip is now in SELLING state");
  } else {
    console.log("❌ Instant arbitrage did NOT trigger - bet slip status unchanged");
  }

  // Step 4: Verify we can sell the remaining bets
  console.log("\n=== Step 4: Selling remaining proxied bets ===");
  
  // Let's sell the remaining 3 bets at discounted prices
  const sellOperations = [
    { bet: proxiedBets[1], sharesToSell: 35, sellValue: 25_000_000 }, // Sell all 35 shares for 25 USDC (loss)
    { bet: proxiedBets[2], sharesToSell: 45, sellValue: 27_000_000 }, // Sell all 45 shares for 27 USDC (loss)
    { bet: proxiedBets[3], sharesToSell: 50, sellValue: 28_000_000 }, // Sell all 50 shares for 28 USDC (loss)
  ];

  for (const sellOp of sellOperations) {
    console.log(`\nSelling ${sellOp.sharesToSell} shares from bet ${sellOp.bet.id.substring(0, 10)}...`);
    const sellTx = await polybet.recordProxiedBetSold(
      sellOp.bet.id,
      sellOp.sharesToSell,
      sellOp.sellValue
    );
    await sellTx.wait();
    console.log(`Sold for ${ethers.formatUnits(sellOp.sellValue, 6)} USDC`);
    
    // Check if bet is marked as sold
    const proxiedBetData = await polybet.proxiedBets(sellOp.bet.id);
    console.log(`Bet outcome: ${proxiedBetData.outcome} (should be ${BetOutcome.Sold}=Sold)`);
  }

  // Step 5: Check final state
  console.log("\n=== Step 5: Final State Analysis ===");
  
  betSlip = await polybet.getBetSlip(betSlipId);
  console.log(`BetSlip final status: ${betSlip.status}`);
  console.log(`BetSlip final collateral: ${ethers.formatUnits(betSlip.finalCollateral, 6)} USDC`);
  
  // Calculate total returns
  const totalReturns = 0 + 25_000_000 + 27_000_000 + 28_000_000; // 0 from loss + sales
  const netLoss = totalReturns - totalCollateralAmount;
  
  console.log(`\nFinancial Summary:`);
  console.log(`- Initial investment: ${ethers.formatUnits(totalCollateralAmount, 6)} USDC`);
  console.log(`- Total returns: ${ethers.formatUnits(totalReturns, 6)} USDC`);
  console.log(`- Net loss: ${ethers.formatUnits(netLoss, 6)} USDC`);
  console.log(`- Loss prevented by instant arbitrage: ${ethers.formatUnits(-netLoss, 6)} USDC`);

  // Check user balance
  const siweMessage = new SiweMessage({
    domain: "PolyBet",
    address: testacct.address,
    uri: "https://polybet.com",
    version: "1",
    chainId: 23295,
  }).toMessage();
  const signature = await testacct.signMessage(siweMessage);
  const sig = ethers.Signature.from(signature);
  
  try {
    const token = await polybet.login(siweMessage, sig);
    const userBalance = await polybet["getUserBalance(bytes)"](token);
    console.log(`\nUser balance: ${ethers.formatUnits(userBalance, 6)} USDC`);
    
    // Verify bet moved to closed
    const closedBets = await polybet["getUserClosedBets(bytes)"](token);
    const isInClosed = closedBets.includes(betSlipId);
    console.log(`Bet is in closed bets: ${isInClosed}`);
  } catch (error: any) {
    console.error("Login failed:", error.message || error);
  }

  console.log("\n✅ Instant arbitrage test completed!");
  console.log("The test demonstrated that when one bet loses, instant arbitrage automatically");
  console.log("triggers the selling process for remaining bets to minimize losses.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
