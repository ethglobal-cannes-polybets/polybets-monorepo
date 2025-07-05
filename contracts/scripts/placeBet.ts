import { ethers } from "hardhat";
import { polybetsContractAddress } from "polybets-common";

enum BetSlipStrategy {
  MaximizeShares,
  MaximizePrivacy,
}

async function main() {
  // Get the deployed PolyBet contract
  const polybet = await ethers.getContractAt(
    "PolyBet",
    polybetsContractAddress
  );

  // Parameters for placeBet
  const strategy = BetSlipStrategy.MaximizeShares; // 0 - maximize shares strategy
  const totalCollateralAmount = 100_000_000; // 100 million

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

  console.log("Placing bet with parameters:");
  console.log(`Strategy: ${strategy} (MaximizeShares)`);
  console.log(`Total Collateral Amount: ${totalCollateralAmount}`);
  console.log(`Marketplace IDs: [${marketplaceIds.join(", ")}]`);
  console.log(`Market IDs: [${marketIds.join(", ")}]`);

  try {
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
    console.log(`Transaction confirmed in block`);
  } catch (error) {
    console.error("Error placing bet:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
