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
  networks: {
    sapphiretestnet: {
      // url: "https://testnet.sapphire.oasis.io",
      url: process.env.SAPPHIRETESTNET_RPC_URL,
      chainId: 23295,
      accounts:
        process.env.SAPPHIRETESTNET_PRIVATE_KEY !== undefined
          ? [process.env.SAPPHIRETESTNET_PRIVATE_KEY]
          : [],
    },
  },
};

export default config;
