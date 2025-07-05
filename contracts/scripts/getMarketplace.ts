import { ethers } from "hardhat";
// @ts-ignore
import { polybetsContractAddress } from "polybets-common/src/config";

async function main() {
  console.log(
    `Attempting to connect to PolyBet contract at: ${polybetsContractAddress}`
  );

  const polyBet = await ethers.getContractAt(
    "PolyBet",
    polybetsContractAddress
  );

  const chainFamilyMap = ["EVM", "SVM"];
  const pricingStrategyMap = ["ORDERBOOK", "AMM", "LMSR"];

  console.log(
    "Querying for first 5 marketplaces on PolyBets (some entries may be blank)..."
  );

  for (let i = 0; i < 5; i++) {
    const marketplaceId = i;
    console.log(`\n--- Marketplace ID: ${marketplaceId} ---`);

    try {
      const marketplace = await polyBet.getMarketplace(marketplaceId);

      const {
        warpRouterId,
        chainId,
        chainFamily,
        name,
        marketplaceProxy,
        pricingStrategy,
      } = marketplace;

      console.log(`  Name:             ${name}`);
      console.log(`  Chain ID:         ${chainId.toString()}`);
      console.log(
        `  Chain Family:     ${chainFamilyMap[Number(chainFamily)] || "Unknown"}`
      );
      console.log(`  Proxy Address:    ${marketplaceProxy}`);
      console.log(
        `  Pricing Strategy: ${pricingStrategyMap[Number(pricingStrategy)] || "Unknown"}`
      );
      console.log(`  Warp Router ID:   ${warpRouterId.toString()}`);
    } catch (error: any) {
      if (
        error.message.includes("Transaction reverted without a reason string")
      ) {
        console.log(
          `  Error: Could not retrieve marketplace ${marketplaceId}. It might not exist (e.g., deployment script added fewer than ${i + 1} marketplaces).`
        );
      } else if (error.message.includes("call to non-contract")) {
        console.log(
          `  Error: The provided address ${polybetsContractAddress} does not seem to be a contract on this network.`
        );
        break; // Exit loop if contract is not found
      } else {
        console.error(
          `  An unexpected error occurred while fetching marketplace ${marketplaceId}:`,
          error
        );
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
