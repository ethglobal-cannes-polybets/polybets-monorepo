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

  const musdc_address_str = "0xa65FAB615E26e84c51940259aD4BDba6B386d35E";
  const musdc_address = ethers.getAddress(musdc_address_str);
  
  // Set collateral token in PolyBet
  console.log("\nSetting collateral token...");
  const setTokenTx = await polybet.setCollateralToken(musdc_address);
  await setTokenTx.wait();
  console.log(`Collateral token set to: ${musdc_address}`);

  // Important that the array indices align with the Supabase integer ID
  // because we embrace entropy
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
    {
      name: "Degen Execution Chamber",
      chainId: 0, // Solana, chainId not used
      chainFamily: ChainFamily.SVM,
      marketplaceProxy: "4XVwcwETMmcFcV33uBp66gQLd3AJpxd2qz7E2JTn5Jkm",
    },
    {
      name: "Nihilistic Prophet Syndicate",
      chainId: 0, // Solana, chainId not used
      chainFamily: ChainFamily.SVM,
      marketplaceProxy: "EWwuoaLcycGPMQWg8Xbyg5x2HVdNWgPF5AwZNRPibeWz",
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
