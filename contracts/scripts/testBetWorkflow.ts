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

async function main() {
  const [owner, testacct] = await ethers.getSigners();
  console.log("Testing bet workflow with account:", owner.address);

  // Get the deployed PolyBet contract
  const polybet = await ethers.getContractAt(
    "PolyBet",
    polybetsContractAddress
  );

  // Get mUSDC token address from the contract
  const musdcAddress = await polybet.musdcToken();
  const musdc = await ethers.getContractAt("MockUSDC", musdcAddress);
  console.log("mUSDC token address:", musdcAddress);

  // Step 1: Place a bet that will spawn multiple proxied bets
  console.log("\n=== Step 1: Placing bet ===");
  const strategy = BetSlipStrategy.MaximizeShares;
  const totalCollateralAmount = 100_000_000; // 100 USDC

  // Check current allowance and approve if needed
  const currentAllowance = await musdc.allowance(testacct.address, polybetsContractAddress);
  console.log(`Current mUSDC allowance: ${currentAllowance}`);
  
  if (currentAllowance < totalCollateralAmount) {
    console.log("Approving mUSDC spending...");
    const approveTx = await musdc
      .connect(testacct)
      .approve(polybetsContractAddress, totalCollateralAmount);
    await approveTx.wait();
    console.log("Approval complete");
  } else {
    console.log("Sufficient allowance already exists, skipping approval");
  }

  const marketplaceIds = [
    ethers.zeroPadValue(ethers.toBeHex(1), 32), // marketplace 1
    ethers.zeroPadValue(ethers.toBeHex(2), 32), // marketplace 2
    ethers.zeroPadValue(ethers.toBeHex(3), 32), // marketplace 3
  ];

  const marketIds = [
    ethers.zeroPadValue(ethers.toBeHex(101), 32), // market 101
    ethers.zeroPadValue(ethers.toBeHex(124), 32), // market 124
    ethers.zeroPadValue(ethers.toBeHex(118), 32), // market 118
  ];

  const tx = await polybet.connect(testacct).placeBet(
    strategy,
    totalCollateralAmount,
    0,
    marketplaceIds,
    marketIds
  );

  const receipt = await tx.wait();
  console.log("Bet placed successfully!");
  const parsedLog = polybet.interface.parseLog(receipt.logs[2]);
  const betSlipId = parsedLog.args[0]; // First argument is the betId
  console.log(`Created BetSlip ID: ${betSlipId}`);
  
  // Check initial bet slip state
  let betSlip = await polybet.getBetSlip(betSlipId);
  console.log(`BetSlip status: ${betSlip.status} (0=Pending)`);
  console.log(`Number of markets: ${betSlip.marketplaceIds.length}`);

  // Step 2: Simulate BetRouter recording proxied bets
  console.log("\n=== Step 2: Recording proxied bets (simulating BetRouter) ===");

  // In real scenario, BetRouter would split the 100 USDC across markets
  // Let's say it splits: 40 USDC, 35 USDC, 25 USDC
  const proxiedBets = [
    {
      id: ethers.keccak256(ethers.toUtf8Bytes(`bet-${betSlipId}-0`)),
      betSlipId: betSlipId,
      marketplaceId: 1,
      marketId: 101,
      optionIndex: 0, // YES option
      minimumShares: 0,
      blockTimestamp: Math.floor(Date.now() / 1000),
      originalCollateralAmount: 40_000_000, // 40 USDC
      finalCollateralAmount: 0,
      sharesBought: 50, // Got 50 shares for 40 USDC
      sharesSold: 0,
      outcome: BetOutcome.Placed,
      failureReason: "",
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes(`bet-${betSlipId}-1`)),
      betSlipId: betSlipId,
      marketplaceId: 2,
      marketId: 124,
      optionIndex: 0,
      minimumShares: 0,
      blockTimestamp: Math.floor(Date.now() / 1000),
      originalCollateralAmount: 35_000_000, // 35 USDC
      finalCollateralAmount: 0,
      sharesBought: 42, // Got 42 shares for 35 USDC
      sharesSold: 0,
      outcome: BetOutcome.Placed,
      failureReason: "",
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes(`bet-${betSlipId}-2`)),
      betSlipId: betSlipId,
      marketplaceId: 3,
      marketId: 118,
      optionIndex: 0,
      minimumShares: 0,
      blockTimestamp: Math.floor(Date.now() / 1000),
      originalCollateralAmount: 25_000_000, // 25 USDC
      finalCollateralAmount: 0,
      sharesBought: 30, // Got 30 shares for 25 USDC
      sharesSold: 0,
      outcome: BetOutcome.Placed,
      failureReason: "",
    },
  ];

  // Record each proxied bet
  for (const proxiedBet of proxiedBets) {
    const recordTx = await polybet.recordProxiedBetPlaced(
      betSlipId,
      proxiedBet
    );
    await recordTx.wait();
    console.log(
      `Recorded proxied bet ${proxiedBet.id.substring(0, 10)}... on market ${proxiedBet.marketId}`
    );
  }

  // Check bet slip after placing proxied bets
  betSlip = await polybet.getBetSlip(betSlipId);
  console.log(`\nBetSlip now has ${betSlip.proxiedBets.length} proxied bets`);

  // Step 3: Simulate markets closing and recording outcomes
  console.log("\n=== Step 3: Closing proxied bets (simulating market resolution) ===");

  // Let's say: bet 1 wins, bet 2 loses, bet 3 wins
  const outcomes = [
    { betId: proxiedBets[0].id, outcome: BetOutcome.Won, winnings: 80_000_000 }, // Won 80 USDC
    { betId: proxiedBets[1].id, outcome: BetOutcome.Lost, winnings: 0 }, // Lost
    { betId: proxiedBets[2].id, outcome: BetOutcome.Won, winnings: 45_000_000 }, // Won 45 USDC
  ];

  for (const result of outcomes) {
    const closeTx = await polybet.recordProxiedBetClosed(
      result.betId,
      result.outcome,
      result.winnings
    );
    await closeTx.wait();
    console.log(
      `Closed bet ${result.betId.substring(0, 10)}... - Outcome: ${result.outcome === BetOutcome.Won ? "Won" : "Lost"}, Winnings: ${ethers.formatUnits(result.winnings, 6)} USDC`
    );
  }

  // Check final state
  console.log("\n=== Final State ===");
  betSlip = await polybet.getBetSlip(betSlipId);
  console.log(
    `BetSlip final collateral: ${ethers.formatUnits(betSlip.finalCollateral, 6)} USDC`
  );
  console.log(
    `Total winnings: ${(80_000_000 + 0 + 45_000_000) / 1_000_000} USDC`
  );
  console.log(
    `Net profit/loss: ${(80_000_000 + 0 + 45_000_000 - 100_000_000) / 1_000_000} USDC`
  );

  // Check user balance - On Oasis, even view functions need to be sent as transactions
  const siweMessage = new SiweMessage({
    domain: "PolyBet",
    address: testacct.address,
    uri: "https://polybet.com",
    version: "1",
    chainId: 23295, // 0x5aff in decimal - Sapphire testnet
  }).toMessage();
  const signature = await testacct.signMessage(siweMessage);
  const sig = ethers.Signature.from(signature);
  try {
    const token = await polybet.login(siweMessage, sig);
    const userBalance = await polybet["getUserBalance(bytes)"](token);
    console.log(`User balance: ${ethers.formatUnits(userBalance, 6)} USDC`);
    
    // Check that bet is no longer in active bets
    console.log("\n=== Checking Bet Status ===");
    const activeBets = await polybet["getUserActiveBetslips(bytes)"](token);
    console.log(`Active bets count: ${activeBets.length}`);
    if (activeBets.length > 0) {
      console.log(`Active bet IDs: ${activeBets.join(', ')}`);
    }
    
    // Check that bet is in closed bets
    const closedBets = await polybet["getUserClosedBets(bytes)"](token);
    console.log(`Closed bets count: ${closedBets.length}`);
    if (closedBets.length > 0) {
      console.log(`Closed bet IDs: ${closedBets.join(', ')}`);
    }
    
    // Verify the bet has moved from active to closed
    const isInActive = activeBets.includes(betSlipId);
    const isInClosed = closedBets.includes(betSlipId);
    console.log(`\nBet ${betSlipId} verification:`);
    console.log(`- In active bets: ${isInActive} (should be false)`);
    console.log(`- In closed bets: ${isInClosed} (should be true)`);
    
    if (!isInActive && isInClosed) {
      console.log("✓ Bet successfully moved from active to closed");
    } else if (isInActive && !isInClosed) {
      console.log("✗ Bet is still active and not closed");
    } else if (isInActive && isInClosed) {
      console.log("✗ Bet is in both active and closed (invalid state)");
    } else {
      console.log("✗ Bet not found in either active or closed bets");
    }
  } catch (error: any) {
    console.error("Login failed with error:", error.message || error);
    if (error.reason) {
      console.error("Error reason:", error.reason);
    }
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
