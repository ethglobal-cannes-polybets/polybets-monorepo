import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import PolyBetModule from "./polybet";

// Chain Family Enum from the contract: 0 = EVM, 1 = SVM
enum ChainFamily {
  EVM,
  SVM,
}

const MarketplacesModule = buildModule("MarketplacesModule", (m) => {
  const { polybet } = m.useModule(PolyBetModule);

  // Data from marketplaces_rows.sql
  const marketplaces = [
    {
      name: "PolyMarket",
      chainId: 137,
      chainFamily: ChainFamily.EVM,
      marketplaceProxy: "0x0000000000000000000000000000000000000000",
    },
    {
      name: "Slaughterhouse Predictions",
      chainId: 0, // Solana chainId is not applicable in the same way, can be 0
      chainFamily: ChainFamily.SVM,
      marketplaceProxy: "Bh2UXpftCKHCqM4sQwHUtY8DMBQ35fxaBrLyHadaUpVb",
    },
    {
      name: "Terminal Degeneracy Labs",
      chainId: 0,
      chainFamily: ChainFamily.SVM,
      marketplaceProxy: "9Mfat3wrfsciFoi4kUTt7xVxvgYJietFTbAoZ1U6sUPY",
    },
    // The other marketplaces from the SQL are not fully defined, skipping for now.
  ];

  marketplaces.forEach((mp, index) => {
    console.log(`Preparing to add marketplace: ${mp.name}`);
    m.call(
      polybet,
      "addMarketplace",
      [mp.chainId, mp.chainFamily, mp.name, mp.marketplaceProxy],
      { id: `AddMarketplace_${index}` }
    );
  });

  return { polybet };
});

export default MarketplacesModule;
