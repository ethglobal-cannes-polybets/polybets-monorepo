import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { SolanaPoolManager, TokenType } from "../clients/solana-pool-manager";
import { calculateCurrentPrices } from "../lib/lmsr-calculator";
import type { MarketplaceConfig } from "../types";
import type {
  BuySharesArgs,
  ClaimPayoutArgs,
  GetPricesArgs,
  MarketplaceAdapter,
  SellSharesArgs,
} from "./types";

const SCALE_FACTOR = 1_000_000_000;
const LMSR_POOL_SEED = Buffer.from("lmsr_pool");

// Solana-specific arg types
export interface SolanaBuySharesArgs extends BuySharesArgs<number> {}
export interface SolanaSellSharesArgs extends SellSharesArgs<number> {}
export interface SolanaGetPricesArgs extends GetPricesArgs<number> {}
export interface SolanaClaimPayoutArgs extends ClaimPayoutArgs<number> {}

export class SolanaMarketplaceAdapter
  implements
    MarketplaceAdapter<
      number,
      SolanaBuySharesArgs,
      SolanaSellSharesArgs,
      SolanaGetPricesArgs,
      SolanaClaimPayoutArgs
    >
{
  private client: SolanaPoolManager;
  private programId: PublicKey;

  constructor(marketplaceConfig: MarketplaceConfig) {
    this.client = new SolanaPoolManager(marketplaceConfig);
    this.programId = new PublicKey(marketplaceConfig.programId);
  }

  private getLmsrPoolPda(poolId: number): PublicKey {
    const poolIdBN = new BN(poolId);
    const poolIdBytes = poolIdBN.toBuffer("le", 8);
    const [pda] = PublicKey.findProgramAddressSync(
      [LMSR_POOL_SEED, poolIdBytes],
      this.programId
    );
    return pda;
  }

  async buyShares(
    args: SolanaBuySharesArgs
  ): Promise<{ transactionId: string; sharesMinted: number }> {
    return this.client.buyLmsrShares(
      args.marketId,
      args.optionIndex,
      args.collateralAmount,
      TokenType.Usdc
    );
  }

  async sellShares(
    args: SolanaSellSharesArgs
  ): Promise<{ transactionId: string; collateralReceived: number }> {
    return this.client.sellLmsrShares(
      args.marketId,
      args.optionIndex,
      args.amount,
      TokenType.Usdc
    );
  }

  async getPrices(
    args: SolanaGetPricesArgs
  ): Promise<[number, number] | Error> {
    const poolPda = this.getLmsrPoolPda(args.marketId);
    const poolState = await this.client.getLmsrPoolState(poolPda);
    if (!poolState) {
      return new Error(`Could not fetch pool state for pool ${args.marketId}`);
    }

    const scaleFactorBN = new BN(SCALE_FACTOR);

    const initial_liquidity_A = poolState.initialLiquidityYesUsdc
      .div(scaleFactorBN)
      .toNumber();
    const initial_liquidity_B = poolState.initialLiquidityNoUsdc
      .div(scaleFactorBN)
      .toNumber();
    const current_q_A = poolState.yesUsdcCurrentSupply.toNumber();
    const current_q_B = poolState.noUsdcCurrentSupply.toNumber();

    return calculateCurrentPrices(
      initial_liquidity_A,
      initial_liquidity_B,
      current_q_A,
      current_q_B
    );
  }

  async claimPayout(args: SolanaClaimPayoutArgs): Promise<any> {
    console.log("claimPayout not implemented for Solana adapter yet.", args);
    return Promise.resolve();
  }
}
