import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";

// Get projectId from https://cloud.reown.com
export const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID || "85134ed298d40617cb1b42624d166098"; // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Define Oasis Sapphire Testnet
export const sapphireTestnet: AppKitNetwork = {
  id: 23295,
  name: "Oasis Sapphire Testnet",
  nativeCurrency: {
    name: "TEST",
    symbol: "TEST",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.sapphire.oasis.io"],
    },
    public: {
      http: ["https://testnet.sapphire.oasis.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Oasis Sapphire Testnet Explorer",
      url: "https://testnet.explorer.sapphire.oasis.io",
    },
  },
  testnet: true,
};

export const networks = [sapphireTestnet] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
