import { ethers } from "hardhat";

async function main() {
  const POLYBET_ADDRESS =
    process.env.POLYBET_ADDRESS || "0xaecDA91C878735D6a24A53EbE9C2F7b6c47C9454";
  const MUSDC_ADDRESS = process.env.MUSDC_ADDRESS || "0xa65FAB615E26e84c51940259aD4BDba6B386d35E";

  console.log("Setting collateral token...");
  console.log(`PolyBet contract: ${POLYBET_ADDRESS}`);
  console.log(`MUSDC token: ${MUSDC_ADDRESS}`);

  // Get the PolyBet contract
  const polybet = await ethers.getContractAt("PolyBet", POLYBET_ADDRESS);

  // Set collateral token
  const musdc_address = ethers.getAddress(MUSDC_ADDRESS);
  const setTokenTx = await polybet.setCollateralToken(musdc_address);
  
  console.log(`Transaction hash: ${setTokenTx.hash}`);
  await setTokenTx.wait();
  
  console.log(`✅ Collateral token successfully set to: ${musdc_address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
