async function main() {
  const txHash = "0xa8cd3c9ba236a0e12fd7ac49c7577b01dc5349a7c02d54bd6e290836e7d68397";
  
  console.log(`Fetching transaction: ${txHash}`);
  
  const tx = await ethers.provider.getTransaction(txHash);
  
  if (tx) {
    console.log("\nTransaction Details:");
    console.log("==================");
    console.log(`Hash: ${tx.hash}`);
    console.log(`From: ${tx.from}`);
    console.log(`To: ${tx.to}`);
    console.log(`Value: ${ethers.formatEther(tx.value)} ETH`);
    console.log(`Gas Price: ${ethers.formatUnits(tx.gasPrice, "gwei")} gwei`);
    console.log(`Gas Limit: ${tx.gasLimit}`);
    console.log(`Nonce: ${tx.nonce}`);
    console.log(`Block Number: ${tx.blockNumber}`);
    console.log(`Data: ${tx.data}`);
    
    // Get transaction receipt for additional details
    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    if (receipt) {
      console.log("\nTransaction Receipt:");
      console.log("==================");
      console.log(`Status: ${receipt.status === 1 ? "Success" : "Failed"}`);
      console.log(`Gas Used: ${receipt.gasUsed}`);
      if (receipt.effectiveGasPrice) {
        console.log(`Effective Gas Price: ${ethers.formatUnits(receipt.effectiveGasPrice, "gwei")} gwei`);
      }
      console.log(`Contract Address: ${receipt.contractAddress || "N/A"}`);
      console.log(`Logs: ${receipt.logs.length} events`);
      
      // Decode logs if any
      if (receipt.logs.length > 0) {
        console.log("\nEvent Logs:");
        receipt.logs.forEach((log, index) => {
          console.log(`  Log ${index}:`);
          console.log(`    Address: ${log.address}`);
          console.log(`    Topics: ${log.topics.length}`);
          log.topics.forEach((topic, i) => {
            console.log(`      [${i}]: ${topic}`);
          });
          if (log.data && log.data !== "0x") {
            console.log(`    Data: ${log.data}`);
          }
        });
      }
    }
  } else {
    console.log("Transaction not found!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });