async function main() {
  const contractAddress = "0x633D59F15e588c4a5D8F2E35e4d65041191517AA";
  const betSlipId = 14;
  
  console.log(`Calling getBetSlip(${betSlipId}) on Polybet contract at ${contractAddress}`);
  
  // Get the contract factory and attach to deployed contract
  const PolyBet = await ethers.getContractFactory("PolyBet");
  const polybet = PolyBet.attach(contractAddress);
  
  try {
    // First, let's get the function selector
    const functionSelector = polybet.interface.encodeFunctionData("getBetSlip", [betSlipId]);
    console.log("\nFunction call data:", functionSelector);
    
    // Make a raw call to get the hex data
    const rawData = await ethers.provider.call({
      to: contractAddress,
      data: functionSelector
    });
    
    console.log("\nRaw response data:");
    console.log(rawData);
    
    // Also try to decode it manually
    console.log("\nDecoding attempt:");
    try {
      const decoded = polybet.interface.decodeFunctionResult("getBetSlip", rawData);
      console.log("Decoded:", decoded);
    } catch (e) {
      console.log("Decode error:", e.message);
    }
    
    // Also call it normally for comparison
    console.log("\nNormal function call result:");
    const betSlip = await polybet.getBetSlip(betSlipId);
    console.log(betSlip);
    
  } catch (error) {
    console.error("Error:", error.message);
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