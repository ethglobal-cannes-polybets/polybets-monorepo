import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100000,
      },
    },
  },
  etherscan: {
    enabled: false, // From Oasis guide, Oasis doesn't use etherscan. Can set to true and just ignore the error message since sourcify verification will succeed.
    apiKey: {
      // Doesn't use etherscan, api key can be blank and verification will still succeed. Only here because nostalgia.
      sapphiretestnet: process.env.SAPPHIRETESTNET_ETHERSCAN_KEY || "",
    },
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true,
  },
  networks: {
    sapphiretestnet: {
      // url: "https://testnet.sapphire.oasis.io",
      url: process.env.SAPPHIRETESTNET_RPC_URL,
      chainId: 23295,
      // gas: 10_000_000, // High gas limit for complex operations
      // gasPrice: 50_000_000_000, // 50 gwei, adjust based on network conditions
      accounts:
        process.env.SAPPHIRETESTNET_PRIVATE_KEY !== undefined
          ? [process.env.SAPPHIRETESTNET_PRIVATE_KEY]
          : [],
    },
  },
};

export default config;
