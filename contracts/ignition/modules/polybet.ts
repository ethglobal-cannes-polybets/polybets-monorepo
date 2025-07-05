// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

enum ChainFamily {
  EVM,
  SVM,
}

const PolyBetModule = buildModule("PolyBetModule", (m) => {
  // Step 1: Deploy the PolyBet contract
  const polybet = m.contract("PolyBet");

  // Step 2: Add the marketplaces
  const marketplaces = [
    {
      name: "PolyMarket",
      chainId: 137,
      chainFamily: ChainFamily.EVM,
      marketplaceProxy: "0x0000000000000000000000000000000000000000",
    },
    {
      name: "Slaughterhouse Predictions",
      chainId: 0, // Solana, chainId not used
      chainFamily: ChainFamily.SVM,
      marketplaceProxy: "Bh2UXpftCKHCqM4sQwHUtY8DMBQ35fxaBrLyHadaUpVb",
    },
    {
      name: "Terminal Degeneracy Labs",
      chainId: 0, // Solana, chainId not used
      chainFamily: ChainFamily.SVM,
      marketplaceProxy: "9Mfat3wrfsciFoi4kUTt7xVxvgYJietFTbAoZ1U6sUPY",
    },
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

export default PolyBetModule;
