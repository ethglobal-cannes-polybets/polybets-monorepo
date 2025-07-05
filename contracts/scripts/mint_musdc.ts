import { ethers } from "hardhat";

async function main() {
  const musdc_address_str = "0xa65FAB615E26e84c51940259aD4BDba6B386d35E";
  const musdc_address = ethers.getAddress(musdc_address_str);
  const musdc = await ethers.getContractAt("MockUSDC", musdc_address);
  
  const [signer, testacct1, testacct2, testacct3 ] = await ethers.getSigners();
  const accounts = [ testacct1, testacct2, testacct3 ]

  for (const account of accounts) {
    console.log(`minting to ${account.address}`);
    const tx = await musdc.connect(signer).mint(account.address, ethers.parseUnits("10000", 6));
    await tx.wait();
    console.log(`minted 10000 MUSDC to ${account.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
