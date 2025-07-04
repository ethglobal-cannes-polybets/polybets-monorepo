import { PublicKey } from "@solana/web3.js";

// Marketplace configuration
export interface MarketplaceConfig {
  name: string;
  description: string;
  programId: string;
  keypair: string;
  authorityKeypair?: string; // Optional: path to the authority keypair for migrations
  rpcUrl: string;
  usdcMintAddress: string;
  bettingPoolsPda: string;
  authority: string;
  creatorName: string;
  creatorId: string;
  // Betting variance config
  oddsVarianceRange: [number, number]; // e.g., [0.2, 0.3] for 20-30% variance
  betAmountUsdc: number; // e.g., 105 USDC total
}

// Solana-specific types
export interface BettingParams {
  yesAmount: number;
  noAmount: number;
  totalAmount: number;
  yesPrice: number;
  noPrice: number;
  variance: number;
}

// Utility types
export interface OddsCalculation {
  originalYesPrice: number;
  originalNoPrice: number;
  adjustedYesPrice: number;
  adjustedNoPrice: number;
  normalizedYes: number;
  normalizedNo: number;
  yesProbability: number;
  noProbability: number;
  yesAmount: number;
  noAmount: number;
  totalAmount: number;
  variance: number;
}

export interface PoolPDAs {
  bettingPoolsState: PublicKey;
  pool: PublicKey;
  yesTokenMint: PublicKey;
  noTokenMint: PublicKey;
  yesUsdcMint: PublicKey;
  noUsdcMint: PublicKey;
  yesPointsMint: PublicKey;
  noPointsMint: PublicKey;
  yesVault: PublicKey;
  noVault: PublicKey;
}

export interface CreatePoolArgs {
  question: string;
  outcomes: string[];
  endDate: Date;
  imageUrl: string;
  mediaType: string;
  category: string;
}
