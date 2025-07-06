import type { MarketplaceConfig } from "./types";

export const polybetsContractAddress = "0xd474F5ec5e1E7B14E0639F388A42637129D068Be";

export const marketplaceConfigs: MarketplaceConfig[] = [
  {
    // Config is for Variant 1
    name: "Slaughterhouse Predictions",
    description:
      "Where dreams get butchered and only the most ruthless degenerates survive. Your portfolio's funeral starts here.",
    programId: "Bh2UXpftCKHCqM4sQwHUtY8DMBQ35fxaBrLyHadaUpVb", // Variant 1 program ID
    keypair:
      process.env.OPERATIONS_KEYPAIR ??
      "~/.config/solana/canibeton-cannes.json",
    authorityKeypair:
      process.env.MIGRATE_KEYPAIR ?? "~/.config/solana/canibeton.json",
    rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    usdcMintAddress:
      process.env.USDC_MINT_ADDRESS ||
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    bettingPoolsPda: process.env.SPORTS_BETTING_POOLS_PDA || "",
    authority: process.env.SPORTS_AUTHORITY || "",
    creatorName: "SportsBets",
    creatorId: "sports_admin",
    oddsVarianceRange: [0.15, 0.25], // 15-25% variance
    betAmountUsdc: 105,
  },
  {
    // Config is for Variant 2
    name: "Terminal Degeneracy Labs",
    description:
      "Weaponized spectrum energy meets financial nihilism. We don't just predict the future - we execute it with surgical precision while your hopes bleed out.",
    programId: "9Mfat3wrfsciFoi4kUTt7xVxvgYJietFTbAoZ1U6sUPY", // Variant 2 program ID
    keypair:
      process.env.VARIANT2_KEYPAIR || "~/.config/solana/canibeton-cannes.json",
    authorityKeypair: "~/.config/solana/canibeton.json",
    rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    usdcMintAddress:
      process.env.USDC_MINT_ADDRESS ||
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    bettingPoolsPda: process.env.CRYPTO_BETTING_POOLS_PDA || "",
    authority: process.env.CRYPTO_AUTHORITY || "",
    creatorName: "CryptoOracle",
    creatorId: "crypto_admin",
    oddsVarianceRange: [0.2, 0.3], // 20-30% variance
    betAmountUsdc: 105,
  },
  {
    // Config is for Variant 3
    name: "Degen Execution Chamber",
    description:
      "Where financial suicide becomes an art form. Your losses fuel our algorithms while we feast on your liquidated dreams.",
    programId: "4XVwcwETMmcFcV33uBp66gQLd3AJpxd2qz7E2JTn5Jkm", // Variant 3 program ID
    keypair:
      process.env.VARIANT3_KEYPAIR || "~/.config/solana/canibeton-cannes.json",
    authorityKeypair: "~/.config/solana/canibeton.json",
    rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    usdcMintAddress:
      process.env.USDC_MINT_ADDRESS ||
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    bettingPoolsPda: process.env.CRYPTO_BETTING_POOLS_PDA || "",
    authority: process.env.CRYPTO_AUTHORITY || "",
    creatorName: "CryptoOracle",
    creatorId: "crypto_admin",
    oddsVarianceRange: [0.05, 0.1], // 5-10% variance
    betAmountUsdc: 105,
  },
  {
    // Config is for Variant 4
    name: "Nihilistic Prophet Syndicate",
    description:
      "Sleep paralysis demons are real. We're here to help you navigate the dark side of the subconscious.",
    programId: "EWwuoaLcycGPMQWg8Xbyg5x2HVdNWgPF5AwZNRPibeWz", // Variant 4 program ID
    keypair:
      process.env.VARIANT4_KEYPAIR || "~/.config/solana/canibeton-cannes.json",
    authorityKeypair: "~/.config/solana/canibeton.json",
    rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    usdcMintAddress:
      process.env.USDC_MINT_ADDRESS ||
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    bettingPoolsPda: process.env.CRYPTO_BETTING_POOLS_PDA || "",
    authority: process.env.CRYPTO_AUTHORITY || "",
    creatorName: "CryptoOracle",
    creatorId: "crypto_admin",
    oddsVarianceRange: [0.05, 0.1], // 5-10% variance
    betAmountUsdc: 105,
  },
];

export function loadMarketplaceConfigs(): MarketplaceConfig[] {
  // Filter out configs with missing required fields
  return marketplaceConfigs.filter((config) => {
    const isValid = config.name && config.programId && config.rpcUrl;
    if (!isValid) {
      console.warn(`⚠️  Skipping invalid marketplace config: ${config.name}`);
    }
    return isValid;
  });
}
