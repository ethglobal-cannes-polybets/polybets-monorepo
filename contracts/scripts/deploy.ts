import { ethers } from "hardhat";

enum ChainFamily {
  EVM,
  SVM,
}

async function main() {
  const polybet = await ethers.deployContract("PolyBet");

  await polybet.waitForDeployment();

  const polybetAddress = await polybet.getAddress();
  console.log(`PolyBet deployed to: ${polybetAddress}`);

  const marketplaces = [
    {
      name: "Blank market to get around index misalign",
      chainId: 137,
      chainFamily: ChainFamily.EVM,
      marketplaceProxy: "0x0000000000000000000000000000000000000000",
    },
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

  for (const mp of marketplaces) {
    console.log(`Adding marketplace: ${mp.name}`);
    const tx = await polybet.addMarketplace(
      mp.chainId,
      mp.chainFamily,
      mp.name,
      mp.marketplaceProxy
    );
    await tx.wait();
    console.log(`Marketplace "${mp.name}" added.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
