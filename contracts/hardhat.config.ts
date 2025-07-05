import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

// Load environment variables from .env file
dotenv.config();
const {
  SAPPHIRETESTNET_PRIVATE_KEY,
  SAPPHIRETESTNET_TESTACCOUNT_1_KEY,
  SAPPHIRETESTNET_TESTACCOUNT_2_KEY,
  SAPPHIRETESTNET_TESTACCOUNT_3_KEY,
} = process.env;

if (
  !SAPPHIRETESTNET_PRIVATE_KEY ||
  !SAPPHIRETESTNET_TESTACCOUNT_1_KEY ||
  !SAPPHIRETESTNET_TESTACCOUNT_2_KEY ||
  !SAPPHIRETESTNET_TESTACCOUNT_3_KEY
) {
  throw new Error(
    "Missing one or more of the required environment variables: SAPPHIRETESTNET_PRIVATE_KEY, SAPPHIRETESTNET_TESTACCOUNT_1_KEY, SAPPHIRETESTNET_TESTACCOUNT_2_KEY, SAPPHIRETESTNET_TESTACCOUNT_3_KEY"
  );
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
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
      accounts: [
        SAPPHIRETESTNET_PRIVATE_KEY,
        SAPPHIRETESTNET_TESTACCOUNT_1_KEY,
        SAPPHIRETESTNET_TESTACCOUNT_2_KEY,
        SAPPHIRETESTNET_TESTACCOUNT_3_KEY,
      ],
    },
  },
};

export default config;
