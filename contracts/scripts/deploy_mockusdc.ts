import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying MockUSDC with account: ${deployer.address}`);
  
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const musdc = await MockUSDC.deploy();
  await musdc.waitForDeployment();
  
  const address = await musdc.getAddress();
  console.log(`MockUSDC deployed to: ${address}`);
  console.log(`Owner: ${deployer.address}`);
  
  // Mint some initial tokens to the deployer
  console.log("Minting initial supply...");
  const tx = await musdc.mint(deployer.address, ethers.parseUnits("1000000", 6)); // 1M USDC
  await tx.wait();
  console.log("Minted 1,000,000 mUSDC to deployer");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });