import { ethers } from "hardhat";
import { polybetsContractAddress } from "polybets-common/src/config";

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

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("Testing partial bet closing with account:", owner.address);

  const polybet = await ethers.getContractAt(
    "PolyBet",
    polybetsContractAddress
  );

  // Place a bet across 4 markets
  console.log("\n=== Placing bet across 4 markets ===");
  const strategy = BetSlipStrategy.MaximizeShares;
  const totalCollateralAmount = 200_000_000; // 200 USDC

  const marketplaceIds = [
    ethers.zeroPadValue(ethers.toBeHex(1), 32),
    ethers.zeroPadValue(ethers.toBeHex(1), 32),
    ethers.zeroPadValue(ethers.toBeHex(2), 32),
    ethers.zeroPadValue(ethers.toBeHex(3), 32),
  ];

  const marketIds = [
    ethers.zeroPadValue(ethers.toBeHex(101), 32),
    ethers.zeroPadValue(ethers.toBeHex(102), 32),
    ethers.zeroPadValue(ethers.toBeHex(201), 32),
    ethers.zeroPadValue(ethers.toBeHex(301), 32),
  ];

  const tx = await polybet.placeBet(
    strategy,
    totalCollateralAmount,
    marketplaceIds,
    marketIds
  );

  const receipt = await tx.wait();
  const betSlipCreatedEvent = receipt.logs.find(
    (log: any) => log.eventName === "BetSlipCreated"
  );
  const betSlipId = betSlipCreatedEvent.args[0];
  console.log(`Created BetSlip ID: ${betSlipId}`);

  // Record 4 proxied bets
  console.log("\n=== Recording 4 proxied bets ===");
  const proxiedBets = [];
  for (let i = 0; i < 4; i++) {
    const proxiedBet = {
      id: ethers.keccak256(ethers.toUtf8Bytes(`bet-${betSlipId}-${i}`)),
      betSlipId: betSlipId,
      marketplaceId: Number(marketplaceIds[i]),
      marketId: Number(marketIds[i]),
      optionIndex: 0,
      minimumShares: 0,
      blockTimestamp: Math.floor(Date.now() / 1000),
      originalCollateralAmount: 50_000_000, // 50 USDC each
      finalCollateralAmount: 0,
      sharesBought: 60 + i * 5, // Different share amounts
      sharesSold: 0,
      outcome: BetOutcome.Placed,
      failureReason: "",
    };

    proxiedBets.push(proxiedBet);
    const recordTx = await polybet.recordProxiedBetPlaced(
      betSlipId,
      proxiedBet
    );
    await recordTx.wait();
    console.log(`Recorded bet ${i + 1}/4 on market ${proxiedBet.marketId}`);
  }

  await polybet.updateBetSlipStatus(betSlipId, 3); // Placed

  // Test partial closing - close 2 out of 4 bets
  console.log("\n=== Closing 2 out of 4 bets ===");

  // Close first bet as Won
  let closeTx = await polybet.recordProxiedBetClosed(
    proxiedBets[0].id,
    BetOutcome.Won,
    100_000_000 // Won 100 USDC
  );
  await closeTx.wait();
  console.log("Closed bet 1/4 - Won 100 USDC");

  // Check if betslip is still active
  let activeBets = await polybet.getUserActiveBetslips();
  console.log(`Active betslips after closing 1 bet: ${activeBets.length}`);
  console.log(
    `BetSlip ${betSlipId} still active: ${activeBets.includes(betSlipId)}`
  );

  // Close second bet as Lost
  closeTx = await polybet.recordProxiedBetClosed(
    proxiedBets[1].id,
    BetOutcome.Lost,
    0 // Lost
  );
  await closeTx.wait();
  console.log("Closed bet 2/4 - Lost");

  // Check status again
  activeBets = await polybet.getUserActiveBetslips();
  console.log(`Active betslips after closing 2 bets: ${activeBets.length}`);
  console.log(
    `BetSlip ${betSlipId} still active: ${activeBets.includes(betSlipId)}`
  );

  // Close remaining bets
  console.log("\n=== Closing remaining 2 bets ===");

  // Close third bet as Draw
  closeTx = await polybet.recordProxiedBetClosed(
    proxiedBets[2].id,
    BetOutcome.Draw,
    50_000_000 // Return original stake
  );
  await closeTx.wait();
  console.log("Closed bet 3/4 - Draw (returned 50 USDC)");

  // Close fourth bet as Void
  closeTx = await polybet.recordProxiedBetClosed(
    proxiedBets[3].id,
    BetOutcome.Void,
    50_000_000 // Return original stake
  );
  await closeTx.wait();
  console.log("Closed bet 4/4 - Void (returned 50 USDC)");

  // Final checks
  console.log("\n=== Final State ===");
  const betSlip = await polybet.getBetSlip(betSlipId);
  console.log(
    `BetSlip final collateral: ${betSlip.finalCollateral / 1_000_000} USDC`
  );

  activeBets = await polybet.getUserActiveBetslips();
  const closedBets = await polybet.getUserClosedBets();
  console.log(`Active betslips: ${activeBets.length}`);
  console.log(`Closed betslips: ${closedBets.length}`);
  console.log(
    `BetSlip ${betSlipId} is now closed: ${closedBets.includes(betSlipId)}`
  );

  const userBalance = await polybet.getUserBalance();
  console.log(`\nUser balance: ${userBalance / 1_000_000} USDC`);
  console.log(
    `Expected: 100 (won) + 0 (lost) + 50 (draw) + 50 (void) = 200 USDC`
  );

  // Verify individual proxied bet states
  console.log("\n=== Verifying proxied bet states ===");
  for (let i = 0; i < proxiedBets.length; i++) {
    const proxiedBet = await polybet.getProxiedBet(proxiedBets[i].id);
    const outcomeStr = [
      "None",
      "Placed",
      "Failed",
      "Sold",
      "Won",
      "Lost",
      "Draw",
      "Void",
    ][proxiedBet.outcome];
    console.log(
      `Bet ${i + 1}: ${outcomeStr}, Final amount: ${proxiedBet.finalCollateralAmount / 1_000_000} USDC`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
