import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type {
  BettingParams,
  CreatePoolArgs,
  MarketplaceConfig,
  OddsCalculation,
  PoolPDAs,
} from "../types";

// For now, we'll use a temporary approach that works with the test
type AnyProgram = Program<any>;

// Constants - these should match your Solana program
const BETTING_POOLS_SEED = Buffer.from("betting_pools");
const POOL_SEED = Buffer.from("pool");
const BET_SEED = Buffer.from("bet");
const MINT_SEED = Buffer.from("mint");
const METADATA_SEED = Buffer.from("metadata");
const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// Import the actual IDL files
import type { BettingPools2 as Variant1IDL } from "../artifacts/variant1_betting_pools_2";
import type { BettingPools2 as Variant2IDL } from "../artifacts/variant2_betting_pools_2";
import type { BettingPools2 as Variant3IDL } from "../artifacts/variant3_betting_pools_2";
import type { BettingPools2 as Variant4IDL } from "../artifacts/variant4_betting_pools_2";

// Constants from the IDL files
const VARIANT1_PROGRAM_ID = "Bh2UXpftCKHCqM4sQwHUtY8DMBQ35fxaBrLyHadaUpVb";
const VARIANT2_PROGRAM_ID = "9Mfat3wrfsciFoi4kUTt7xVxvgYJietFTbAoZ1U6sUPY";
const VARIANT3_PROGRAM_ID = "4XVwcwETMmcFcV33uBp66gQLd3AJpxd2qz7E2JTn5Jkm";
const VARIANT4_PROGRAM_ID = "EWwuoaLcycGPMQWg8Xbyg5x2HVdNWgPF5AwZNRPibeWz";

// PDA seeds (from the IDL)
const YES_USDC_MINT_SEED = Buffer.from("yes_usdc_mint");
const NO_USDC_MINT_SEED = Buffer.from("no_usdc_mint");
const YES_POINTS_MINT_SEED = Buffer.from("yes_points_mint");
const NO_POINTS_MINT_SEED = Buffer.from("no_points_mint");
const LMSR_POOL_SEED = Buffer.from("lmsr_pool");
const YES_LMSR_USDC_MINT_SEED = Buffer.from("yes_lmsr_usdc_mint");
const NO_LMSR_USDC_MINT_SEED = Buffer.from("no_lmsr_usdc_mint");
const YES_LMSR_POINTS_MINT_SEED = Buffer.from("yes_lmsr_points_mint");
const NO_LMSR_POINTS_MINT_SEED = Buffer.from("no_lmsr_points_mint");

// TokenType enum
export enum TokenType {
  Usdc = "usdc",
  Points = "points",
}

// MediaType enum
enum MediaType {
  X = "x",
  TikTok = "tikTok",
  Instagram = "instagram",
  Facebook = "facebook",
  Image = "image",
  Video = "video",
  ExternalLink = "externalLink",
}

// TODO: replace with actual program ID
const PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

// This should be defined based on the anchor IDL
// I am defining a placeholder based on the user's snippet
export interface LmsrPool {
  originalPoolId: anchor.BN;
  creatorAuthority: PublicKey;
  usdcMint: PublicKey;
  pointsMint: PublicKey;
  yesLmsrUsdcMint: PublicKey;
  noLmsrUsdcMint: PublicKey;
  yesLmsrPointsMint: PublicKey;
  noLmsrPointsMint: PublicKey;
  initialLiquidityYesUsdc: anchor.BN;
  initialLiquidityNoUsdc: anchor.BN;
  initialLiquidityYesPoints: anchor.BN;
  initialLiquidityNoPoints: anchor.BN;
  bUsdc: anchor.BN;
  initialQYesUsdc: anchor.BN;
  initialQNoUsdc: anchor.BN;
  initialPriceYesUsdc: anchor.BN;
  initialPriceNoUsdc: anchor.BN;
  actualMaxLossUsdc: anchor.BN;
  yesUsdcCurrentSupply: anchor.BN;
  noUsdcCurrentSupply: anchor.BN;
  yesPointsCurrentSupply: anchor.BN;
  noPointsCurrentSupply: anchor.BN;
  bPoints: anchor.BN;
  initialQYesPoints: anchor.BN;
  initialQNoPoints: anchor.BN;
  initialPriceYesPoints: anchor.BN;
  initialPriceNoPoints: anchor.BN;
  actualMaxLossPoints: anchor.BN;
  feesCollectedUsdc: anchor.BN;
  feesCollectedPoints: anchor.BN;
  bump: number;
  feeRateBasisPoints: number;
}

export class SolanaPoolManager {
  private connection: Connection;
  private program: Program<
    Variant1IDL | Variant2IDL | Variant3IDL | Variant4IDL
  > | null = null;
  private provider: AnchorProvider;
  private wallet: Wallet;
  private authorityWallet: Wallet | null = null;
  private marketplace: MarketplaceConfig;
  private variant: "variant1" | "variant2" | "variant3" | "variant4";
  private programId: PublicKey;
  private bettingPoolsPDA: PublicKey;

  constructor(marketplace: MarketplaceConfig) {
    this.marketplace = marketplace;
    this.connection = new Connection(marketplace.rpcUrl, "confirmed");

    // Determine which variant to use based on program ID
    if (marketplace.programId === VARIANT1_PROGRAM_ID) {
      this.variant = "variant1";
    } else if (marketplace.programId === VARIANT2_PROGRAM_ID) {
      this.variant = "variant2";
    } else if (marketplace.programId === VARIANT3_PROGRAM_ID) {
      this.variant = "variant3";
    } else if (marketplace.programId === VARIANT4_PROGRAM_ID) {
      this.variant = "variant4";
    } else {
      throw new Error(`Unknown program ID: ${marketplace.programId}`);
    }

    this.programId = new PublicKey(marketplace.programId);

    // Load the keypair
    let keypair: Keypair;
    try {
      if (
        marketplace.keypair.startsWith("/") ||
        marketplace.keypair.startsWith("~")
      ) {
        // It's a file path
        const resolvedPath = marketplace.keypair.startsWith("~")
          ? join(homedir(), marketplace.keypair.slice(1))
          : marketplace.keypair;

        const keypairData = JSON.parse(readFileSync(resolvedPath, "utf8"));
        keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
      } else {
        // It's a base58 string
        const bs58 = require("bs58");
        keypair = Keypair.fromSecretKey(bs58.decode(marketplace.keypair));
      }
    } catch (error) {
      console.error("Error loading keypair:", error);
      throw new Error("Failed to load keypair");
    }

    this.wallet = new Wallet(keypair);
    this.provider = new AnchorProvider(this.connection, this.wallet, {
      preflightCommitment: "processed",
    });

    // If an authority keypair is provided, load it as well
    if (marketplace.authorityKeypair) {
      try {
        const resolvedPath = marketplace.authorityKeypair.startsWith("~")
          ? join(homedir(), marketplace.authorityKeypair.slice(1))
          : marketplace.authorityKeypair;

        const authorityKeypairData = JSON.parse(
          readFileSync(resolvedPath, "utf8")
        );
        const authorityKeypair = Keypair.fromSecretKey(
          new Uint8Array(authorityKeypairData)
        );
        this.authorityWallet = new Wallet(authorityKeypair);
        console.log(
          `   Authority Wallet: ${this.authorityWallet.publicKey.toString()}`
        );
      } catch (error) {
        console.warn("Warning: Could not load authority keypair:", error);
        this.authorityWallet = null;
      }
    }

    // Initialize the program with the correct IDL - loading it dynamically
    this.initializeProgram();

    // Get the betting pools PDA
    this.bettingPoolsPDA = this.findBettingPoolsPDA();

    console.log(`📋 SolanaPoolManager initialized`);
    console.log(`   Variant: ${this.variant}`);
    console.log(`   Program ID: ${marketplace.programId}`);
    console.log(`   Wallet: ${this.wallet.publicKey.toString()}`);
    console.log(`   Betting Pools PDA: ${this.bettingPoolsPDA.toString()}`);
  }

  /**
   * Initialize the program with proper IDL loading
   */
  private initializeProgram(): void {
    try {
      // Load the IDL JSON file
      const idlPath =
        this.variant === "variant1"
          ? "../artifacts/variant1_betting_pools_2.json"
          : this.variant === "variant2"
            ? "../artifacts/variant2_betting_pools_2.json"
            : this.variant === "variant3"
              ? "../artifacts/variant3_betting_pools_2.json"
              : "../artifacts/variant4_betting_pools_2.json";

      const idlString = readFileSync(join(__dirname, idlPath), "utf8");
      const idl = JSON.parse(idlString);

      // Create program with correct parameter order and types
      if (this.variant === "variant1") {
        this.program = new Program<Variant1IDL>(idl, this.provider);
      } else if (this.variant === "variant2") {
        this.program = new Program<Variant2IDL>(idl, this.provider);
      } else if (this.variant === "variant3") {
        this.program = new Program<Variant3IDL>(idl, this.provider);
      } else if (this.variant === "variant4") {
        this.program = new Program<Variant4IDL>(idl, this.provider);
      }
    } catch (error) {
      console.error("Failed to initialize program:", error);
      throw new Error("Program initialization failed");
    }
  }

  /**
   * Creates a new betting pool on Solana
   * @param args - The pool creation arguments
   * @returns Promise<{poolId: string, pdas: PoolPDAs}>
   */
  async createPool(
    args: CreatePoolArgs
  ): Promise<{ poolId: number; pdas: PoolPDAs }> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    try {
      console.log(
        `🏗️  Creating pool for "${args.question}" on ${this.marketplace.name}...`
      );

      // Get the current betting pools state to get the next pool ID
      const bettingPoolsState =
        await this.program.account.bettingPoolsState.fetch(
          this.bettingPoolsPDA
        );
      const nextPoolId = bettingPoolsState.nextPoolId;

      // Generate all required PDAs
      const pdas = await this.generatePoolPDAs(nextPoolId);

      // Prepare the pool creation parameters
      const poolParams = {
        question: args.question,
        options: args.outcomes,
        betsCloseAt: new BN(new Date(args.endDate).getTime() / 1000),
        mediaUrl: args.imageUrl || "",
        mediaType: this.getMediaTypeAnchorFormat(args.mediaType),
        category: args.category,
        creatorName: this.wallet.publicKey.toString(),
        creatorId: this.wallet.publicKey.toString(),
        closureCriteria: args.question,
        closureInstructions:
          "Resolve based on the market question and criteria.",
      };

      // Generate metadata PDAs
      const metadataYesUsdcPDA = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          pdas.yesUsdcMint.toBuffer(),
        ],
        MPL_TOKEN_METADATA_PROGRAM_ID
      )[0];

      const metadataNoUsdcPDA = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          pdas.noUsdcMint.toBuffer(),
        ],
        MPL_TOKEN_METADATA_PROGRAM_ID
      )[0];

      const metadataYesPointsPDA = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          pdas.yesPointsMint.toBuffer(),
        ],
        MPL_TOKEN_METADATA_PROGRAM_ID
      )[0];

      const metadataNoPointsPDA = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          pdas.noPointsMint.toBuffer(),
        ],
        MPL_TOKEN_METADATA_PROGRAM_ID
      )[0];

      console.log(`📝 Pool parameters:`, {
        question: poolParams.question,
        options: poolParams.options,
        category: poolParams.category,
        creator: poolParams.creatorName,
        variant: this.variant,
        programId: this.marketplace.programId,
        nextPoolId: nextPoolId.toString(),
      });

      // Set compute unit limit and priority fee
      const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 500000,
      });
      const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1, // A nominal fee
      });

      // Create the pool instruction
      const createPoolIx = await this.program.methods
        .createPool(
          poolParams.question,
          poolParams.options,
          poolParams.betsCloseAt,
          poolParams.mediaUrl,
          poolParams.mediaType,
          poolParams.category,
          poolParams.creatorName,
          poolParams.creatorId,
          poolParams.closureCriteria,
          poolParams.closureInstructions
        )
        .accountsPartial({
          bettingPools: this.bettingPoolsPDA,
          pool: pdas.pool,
          authority: this.wallet.publicKey,
          yesUsdc: pdas.yesUsdcMint,
          noUsdc: pdas.noUsdcMint,
          yesPoints: pdas.yesPointsMint,
          noPoints: pdas.noPointsMint,
          metadataYesUsdc: metadataYesUsdcPDA,
          metadataNoUsdc: metadataNoUsdcPDA,
          metadataYesPoints: metadataYesPointsPDA,
          metadataNoPoints: metadataNoPointsPDA,
          mplTokenMetadata: MPL_TOKEN_METADATA_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .instruction();

      // Create and send transaction
      const transaction = new Transaction()
        .add(computeBudgetIx)
        .add(priorityFeeIx)
        .add(createPoolIx);
      const tx = await this.provider.sendAndConfirm(transaction);

      const poolId = parseInt(nextPoolId.toString());

      console.log(`✅ Pool created successfully: ${poolId}`);
      console.log(`   Transaction: ${tx}`);
      console.log(`   Betting Pools PDA: ${pdas.bettingPoolsState.toString()}`);
      console.log(`   Pool PDA: ${pdas.pool.toString()}`);

      return { poolId, pdas };
    } catch (error) {
      console.error(`❌ Failed to create pool for ${args.question}:`, error);
      throw error;
    }
  }

  /**
   * Places bets on a pool to seed it with liquidity
   * @param poolId - The pool ID
   * @param oddsCalculation - The odds calculation from Polymarket
   * @param pdas - The pool PDAs
   * @returns Promise<{yesTransactionId: string, noTransactionId: string}>
   */
  async placeBets(
    poolId: number,
    oddsCalculation: OddsCalculation,
    pdas: PoolPDAs
  ): Promise<{ yesTransactionId: string; noTransactionId: string }> {
    try {
      console.log(
        `💰 Placing bets on pool ${poolId} with ${this.marketplace.betAmountUsdc} USDC...`
      );

      const bettingParams = this.calculateBettingParams(oddsCalculation);

      console.log(`📊 Betting breakdown:`);
      console.log(
        `   Yes: ${bettingParams.yesAmount} USDC (${(
          bettingParams.yesPrice * 100
        ).toFixed(1)}%)`
      );
      console.log(
        `   No: ${bettingParams.noAmount} USDC (${(
          bettingParams.noPrice * 100
        ).toFixed(1)}%)`
      );
      console.log(`   Variance: ${(bettingParams.variance * 100).toFixed(1)}%`);

      // Place Yes bet
      const yesTransactionId = await this.placeBet(
        poolId,
        0, // Yes option
        bettingParams.yesAmount,
        TokenType.Usdc,
        pdas.yesUsdcMint,
        pdas
      );

      // Place No bet
      const noTransactionId = await this.placeBet(
        poolId,
        1, // No option
        bettingParams.noAmount,
        TokenType.Usdc,
        pdas.noUsdcMint,
        pdas
      );

      console.log(`✅ Bets placed successfully!`);
      console.log(`   Yes bet TX: ${yesTransactionId}`);
      console.log(`   No bet TX: ${noTransactionId}`);

      return {
        yesTransactionId,
        noTransactionId,
      };
    } catch (error) {
      console.error(`❌ Failed to place bets on pool ${poolId}:`, error);
      throw error;
    }
  }

  /**
   * Places a single bet on a pool
   * @param poolId - The pool ID
   * @param optionIndex - The option index (0 for Yes, 1 for No)
   * @param amount - The bet amount in USDC
   * @param tokenType - The token type (USDC or Points)
   * @param targetPoolMint - The target pool mint address
   * @param pdas - The pool PDAs
   * @returns Promise<string> - Transaction ID
   */
  private async placeBet(
    poolId: number,
    optionIndex: number,
    amount: number,
    tokenType: TokenType,
    targetPoolMint: PublicKey,
    pdas: PoolPDAs
  ): Promise<string> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    const betAmount = this.tokensToLamports(amount);
    const bettingPoolsState =
      await this.program.account.bettingPoolsState.fetch(this.bettingPoolsPDA);

    const paymentMint =
      tokenType === TokenType.Usdc
        ? bettingPoolsState.usdcMint
        : bettingPoolsState.betPointsMint;

    const minOutputAmount = new BN(1); // Minimum output amount

    // Get current betting pools state for next bet ID
    const nextBetId = bettingPoolsState.nextBetId;

    // Generate bet PDA
    const poolIdNum = poolId;
    const [betPda] = PublicKey.findProgramAddressSync(
      [
        BET_SEED,
        new BN(poolIdNum).toArrayLike(Buffer, "le", 8),
        new BN(nextBetId).toArrayLike(Buffer, "le", 8),
      ],
      this.programId
    );

    // Get token accounts
    const bettorPaymentTokenAccount = getAssociatedTokenAddressSync(
      paymentMint,
      this.wallet.publicKey
    );

    const poolPaymentTokenAccount = getAssociatedTokenAddressSync(
      paymentMint,
      pdas.pool,
      true
    );

    const authorityTokenAccount = getAssociatedTokenAddressSync(
      paymentMint,
      bettingPoolsState.authority
    );

    const bettorTargetTokenAccount = getAssociatedTokenAddressSync(
      targetPoolMint,
      this.wallet.publicKey
    );

    // Set compute unit limit and priority fee
    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 500000,
    });
    const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1, // A nominal fee
    });

    // Create the bet instruction
    const placeBetIx = await this.program.methods
      .placeBet(
        new BN(optionIndex),
        betAmount,
        minOutputAmount,
        tokenType === TokenType.Usdc ? { usdc: {} } : { points: {} }
      )
      .accountsPartial({
        bettor: this.wallet.publicKey,
        pool: pdas.pool,
        bettingPools: this.bettingPoolsPDA,
        authority: bettingPoolsState.authority,
        paymentMint: paymentMint,
        bettorPaymentTokenAccount: bettorPaymentTokenAccount,
        poolPaymentTokenAccount: poolPaymentTokenAccount,
        authorityTokenAccount: authorityTokenAccount,
        targetPoolMint: targetPoolMint,
        bettorTargetTokenAccount: bettorTargetTokenAccount,
        yesUsdcMint: pdas.yesUsdcMint,
        noUsdcMint: pdas.noUsdcMint,
        yesPointsMint: pdas.yesPointsMint,
        noPointsMint: pdas.noPointsMint,
        bet: betPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .instruction();

    // Create and send transaction
    const transaction = new Transaction()
      .add(computeBudgetIx)
      .add(priorityFeeIx)
      .add(placeBetIx);
    const tx = await this.provider.sendAndConfirm(transaction);

    console.log(`💸 Bet placed: ${amount} USDC on option ${optionIndex}`);
    console.log(`📄 Transaction: ${tx}`);

    return tx;
  }

  /**
   * Calculates betting parameters based on Polymarket odds
   * @param oddsCalculation - The odds from Polymarket
   * @returns BettingParams
   */
  private calculateBettingParams(
    oddsCalculation: OddsCalculation
  ): BettingParams {
    const totalAmount = this.marketplace.betAmountUsdc;
    const [minVariance, maxVariance] = this.marketplace.oddsVarianceRange;

    // Generate random variance within the specified range
    const variance = minVariance + Math.random() * (maxVariance - minVariance);

    // Apply variance to the original probabilities
    let adjustedYesPrice = oddsCalculation.normalizedYes;
    let adjustedNoPrice = oddsCalculation.normalizedNo;

    // Add some random variance (can be positive or negative)
    const varianceDirection = Math.random() < 0.5 ? 1 : -1;
    const actualVariance = variance * varianceDirection;

    adjustedYesPrice += actualVariance;
    adjustedNoPrice -= actualVariance;

    // Ensure probabilities stay within valid bounds
    adjustedYesPrice = Math.max(0.05, Math.min(0.95, adjustedYesPrice));
    adjustedNoPrice = Math.max(0.05, Math.min(0.95, adjustedNoPrice));

    // Normalize to sum to 1
    const total = adjustedYesPrice + adjustedNoPrice;
    adjustedYesPrice /= total;
    adjustedNoPrice /= total;

    // Calculate bet amounts based on adjusted probabilities
    const yesAmount = Math.round(totalAmount * adjustedYesPrice);
    const noAmount = totalAmount - yesAmount;

    return {
      yesAmount,
      noAmount,
      totalAmount,
      yesPrice: adjustedYesPrice,
      noPrice: adjustedNoPrice,
      variance: Math.abs(actualVariance),
    };
  }

  /**
   * Generates all PDAs for a pool
   * @param poolId - The pool ID (number)
   * @returns Object with all PDAs
   */
  private async generatePoolPDAs(poolId: BN): Promise<PoolPDAs> {
    try {
      const poolIdBytes = poolId.toArrayLike(Buffer, "le", 8);

      // Generate pool PDA
      const [poolPda] = PublicKey.findProgramAddressSync(
        [POOL_SEED, poolIdBytes],
        this.programId
      );

      // Generate token mint PDAs
      const [yesUsdcMint] = PublicKey.findProgramAddressSync(
        [YES_USDC_MINT_SEED, poolIdBytes],
        this.programId
      );

      const [noUsdcMint] = PublicKey.findProgramAddressSync(
        [NO_USDC_MINT_SEED, poolIdBytes],
        this.programId
      );

      const [yesPointsMint] = PublicKey.findProgramAddressSync(
        [YES_POINTS_MINT_SEED, poolIdBytes],
        this.programId
      );

      const [noPointsMint] = PublicKey.findProgramAddressSync(
        [NO_POINTS_MINT_SEED, poolIdBytes],
        this.programId
      );

      return {
        bettingPoolsState: this.bettingPoolsPDA,
        pool: poolPda,
        yesTokenMint: yesUsdcMint,
        noTokenMint: noUsdcMint,
        yesUsdcMint: yesUsdcMint,
        noUsdcMint: noUsdcMint,
        yesPointsMint: yesPointsMint,
        noPointsMint: noPointsMint,
        yesVault: poolPda, // In this program, the pool PDA handles vaults
        noVault: poolPda,
      };
    } catch (error) {
      console.error("Error generating PDAs:", error);
      throw error;
    }
  }

  /**
   * Gets the betting pools state PDA
   */
  private findBettingPoolsPDA(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [BETTING_POOLS_SEED],
      this.programId
    );
    return pda;
  }

  /**
   * Helper to convert MediaType to Anchor enum format
   */
  private getMediaTypeAnchorFormat(mediaType: string) {
    switch (mediaType.toLowerCase()) {
      case "x":
        return { x: {} };
      case "tiktok":
        return { tikTok: {} };
      case "instagram":
        return { instagram: {} };
      case "facebook":
        return { facebook: {} };
      case "image":
        return { image: {} };
      case "video":
        return { video: {} };
      case "text":
      case "externallink":
        return { externalLink: {} };
      default:
        return { image: {} };
    }
  }

  /**
   * Converts tokens to lamports
   * @param tokens - Token amount
   * @returns BN - Lamports amount
   */
  private tokensToLamports(tokens: number): BN {
    return new BN(tokens * 1e6); // Assuming 6 decimal places for USDC
  }

  /**
   * Converts lamports to tokens
   * @param lamports - Lamports amount
   * @returns number - Token amount
   */
  private lamportsToTokens(lamports: BN): number {
    return lamports.toNumber() / 1e6;
  }

  /**
   * Validates marketplace configuration
   * @returns boolean - Whether the marketplace is valid
   */
  async validateMarketplace(): Promise<boolean> {
    try {
      // Check if the program ID matches one of our known variants
      const isValidProgram =
        this.marketplace.programId === VARIANT1_PROGRAM_ID ||
        this.marketplace.programId === VARIANT2_PROGRAM_ID ||
        this.marketplace.programId === VARIANT3_PROGRAM_ID ||
        this.marketplace.programId === VARIANT4_PROGRAM_ID;

      if (!isValidProgram) {
        console.error(`Invalid program ID: ${this.marketplace.programId}`);
        return false;
      }

      // Test connection
      const latestBlockHash = await this.connection.getLatestBlockhash();
      if (!latestBlockHash) {
        console.error("Cannot connect to Solana RPC");
        return false;
      }

      if (!this.program) {
        console.error("Program not initialized");
        return false;
      }

      // Test if we can fetch the betting pools state
      try {
        const bettingPoolsState =
          await this.program.account.bettingPoolsState.fetch(
            this.bettingPoolsPDA
          );
        console.log(
          `✅ Marketplace ${this.marketplace.name} validated successfully`
        );
        console.log(
          `   Program ID: ${this.marketplace.programId} (${this.variant})`
        );
        console.log(`   Betting Pools PDA: ${this.bettingPoolsPDA.toString()}`);
        console.log(`   Wallet: ${this.wallet.publicKey.toString()}`);
        console.log(
          `   Next Pool ID: ${bettingPoolsState.nextPoolId.toString()}`
        );
        console.log(`   Authority: ${bettingPoolsState.authority.toString()}`);
        console.log(`   USDC Mint: ${bettingPoolsState.usdcMint.toString()}`);

        return true;
      } catch (error) {
        console.error("Cannot fetch betting pools state:", error);
        return false;
      }
    } catch (error) {
      console.error(`Marketplace validation failed:`, error);
      return false;
    }
  }

  /**
   * Get the variant being used
   */
  getVariant(): "variant1" | "variant2" | "variant3" | "variant4" {
    return this.variant;
  }

  /**
   * Get the program ID
   */
  getProgramId(): string {
    return this.marketplace.programId;
  }

  /**
   * Gets the authority of the betting pools.
   * This is likely the authorized migrator.
   * @returns Promise<string>
   */
  async getAuthority(): Promise<string> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }
    try {
      const bettingPoolsState =
        await this.program.account.bettingPoolsState.fetch(
          this.bettingPoolsPDA
        );
      return bettingPoolsState.authority.toString();
    } catch (error) {
      console.error("Failed to fetch authority:", error);
      throw new Error(
        "Could not fetch authority. Is the program initialized and the PDA correct?"
      );
    }
  }

  /**
   * Migrates a pool to the LMSR model after initial seeding.
   * @param poolId - The pool ID
   * @param pdas - The pool PDAs
   * @returns Promise<string> - Transaction ID
   */
  async migrateToLmsr(poolId: number, pdas: PoolPDAs): Promise<string> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    // Use the authority wallet if available, otherwise default to the main wallet
    const migrationWallet = this.authorityWallet || this.wallet;
    const migrationProvider =
      this.authorityWallet &&
      this.authorityWallet.publicKey.toBase58() !==
        this.wallet.publicKey.toBase58()
        ? new AnchorProvider(this.connection, migrationWallet, {
            preflightCommitment: "processed",
          })
        : this.provider;

    const programForMigration =
      this.authorityWallet &&
      this.authorityWallet.publicKey.toBase58() !==
        this.wallet.publicKey.toBase58()
        ? new Program<Variant1IDL | Variant2IDL | Variant3IDL | Variant4IDL>(
            this.program.idl,
            migrationProvider
          )
        : this.program;

    try {
      console.log(`🕊️  Migrating pool ${poolId} to LMSR...`);
      console.log(`   Using migrator: ${migrationWallet.publicKey.toString()}`);

      const poolIdBN = new BN(poolId);
      const poolIdBytes = poolIdBN.toBuffer("le", 8);

      const [lmsrPoolAddress] = PublicKey.findProgramAddressSync(
        [LMSR_POOL_SEED, poolIdBytes],
        this.program.programId
      );

      const [yesLmsrUsdcMint] = PublicKey.findProgramAddressSync(
        [YES_LMSR_USDC_MINT_SEED, poolIdBytes],
        this.program.programId
      );
      const [noLmsrUsdcMint] = PublicKey.findProgramAddressSync(
        [NO_LMSR_USDC_MINT_SEED, poolIdBytes],
        this.program.programId
      );
      const [yesLmsrPointsMint] = PublicKey.findProgramAddressSync(
        [YES_LMSR_POINTS_MINT_SEED, poolIdBytes],
        this.program.programId
      );
      const [noLmsrPointsMint] = PublicKey.findProgramAddressSync(
        [NO_LMSR_POINTS_MINT_SEED, poolIdBytes],
        this.program.programId
      );

      const bettingPoolsState =
        await programForMigration.account.bettingPoolsState.fetch(
          this.bettingPoolsPDA
        );
      const betPointsMint = bettingPoolsState.betPointsMint;

      const migratorPointsTokenAccount = getAssociatedTokenAddressSync(
        betPointsMint,
        migrationWallet.publicKey,
        true
      );
      const lmsrPoolPointsTokenAccount = getAssociatedTokenAddressSync(
        betPointsMint,
        lmsrPoolAddress,
        true
      );

      const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 400000,
      });
      const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000,
      });

      const migrateIx = await programForMigration.methods
        .migrateToLmsrPool()
        .accountsPartial({
          bettingPools: this.bettingPoolsPDA,
          migrator: migrationWallet.publicKey,
          originalPool: pdas.pool,
          lmsrPool: lmsrPoolAddress,
          yesLmsrUsdcMint,
          noLmsrUsdcMint,
          yesLmsrPointsMint,
          noLmsrPointsMint,
          betPoints: betPointsMint,
          migratorPointsTokenAccount,
          lmsrPoolPointsTokenAccount,
        })
        .instruction();

      const transaction = new Transaction()
        .add(computeBudgetIx)
        .add(priorityFeeIx)
        .add(migrateIx);
      const tx = await migrationProvider.sendAndConfirm(transaction);

      console.log(`✅ Pool migrated to LMSR successfully: ${poolId}`);
      console.log(`   Transaction: ${tx}`);
      console.log(`   LMSR Pool PDA: ${lmsrPoolAddress.toString()}`);

      return tx;
    } catch (error) {
      console.error(`❌ Failed to migrate pool ${poolId} to LMSR:`, error);
      throw error;
    }
  }

  async buyLmsrShares(
    poolId: number,
    optionIndex: number,
    amount: number, // in USDC or points
    tokenType: TokenType
  ): Promise<string> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    console.log(
      `💸 Buying ${amount} ${tokenType} of LMSR shares for option ${optionIndex} in pool ${poolId}`
    );

    const poolIdBN = new BN(poolId);
    const poolIdBytes = poolIdBN.toBuffer("le", 8);

    const [lmsrPoolPda] = PublicKey.findProgramAddressSync(
      [LMSR_POOL_SEED, poolIdBytes],
      this.program.programId
    );

    const bettingPoolsState =
      await this.program.account.bettingPoolsState.fetch(this.bettingPoolsPDA);
    const inputCollateralMint =
      tokenType === TokenType.Usdc
        ? bettingPoolsState.usdcMint
        : bettingPoolsState.betPointsMint;

    const [yesLmsrMint, noLmsrMint] =
      tokenType === TokenType.Usdc
        ? [
            PublicKey.findProgramAddressSync(
              [YES_LMSR_USDC_MINT_SEED, poolIdBytes],
              this.program.programId
            )[0],
            PublicKey.findProgramAddressSync(
              [NO_LMSR_USDC_MINT_SEED, poolIdBytes],
              this.program.programId
            )[0],
          ]
        : [
            PublicKey.findProgramAddressSync(
              [YES_LMSR_POINTS_MINT_SEED, poolIdBytes],
              this.program.programId
            )[0],
            PublicKey.findProgramAddressSync(
              [NO_LMSR_POINTS_MINT_SEED, poolIdBytes],
              this.program.programId
            )[0],
          ];

    const lmsrOutcomeTokenMint = optionIndex === 0 ? yesLmsrMint : noLmsrMint;
    if (!lmsrOutcomeTokenMint) {
      throw new Error("Could not determine LMSR outcome token mint.");
    }

    const betAmountInPaymentUnits = this.tokensToLamports(amount);
    const tokenTypeSolanaEnum =
      tokenType === TokenType.Usdc ? { usdc: {} } : { points: {} };

    const ix = await this.program.methods
      .buyLmsrTokens(
        betAmountInPaymentUnits,
        new BN(optionIndex),
        tokenTypeSolanaEnum,
        new BN(1) // minTokensToReceive
      )
      .accounts({
        buyer: this.wallet.publicKey,
        lmsrOutcomeTokenMint: lmsrOutcomeTokenMint,
        lmsrPool: lmsrPoolPda,
        inputCollateralMint: inputCollateralMint,
      })
      .instruction();

    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 500_000,
    });
    const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1000,
    });

    const transaction = new Transaction()
      .add(computeBudgetIx)
      .add(priorityFeeIx)
      .add(ix);
    const tx = await this.provider.sendAndConfirm(transaction);

    console.log(`✅ Successfully bought LMSR shares. Transaction: ${tx}`);
    return tx;
  }

  async sellLmsrShares(
    poolId: number,
    optionIndex: number,
    amount: number, // in LMSR shares
    tokenType: TokenType
  ): Promise<string> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    const poolIdBN = new BN(poolId);
    const poolIdBytes = poolIdBN.toBuffer("le", 8);

    const [lmsrPoolPda] = PublicKey.findProgramAddressSync(
      [LMSR_POOL_SEED, poolIdBytes],
      this.program.programId
    );

    const poolState = await this.getLmsrPoolState(lmsrPoolPda);
    if (!poolState) {
      throw new Error(`LMSR pool not found for ID: ${poolId}`);
    }

    console.log(
      `💸 Selling ${amount} of LMSR shares for option ${optionIndex} in pool ${poolId}`
    );

    const bettingPoolsState =
      await this.program.account.bettingPoolsState.fetch(this.bettingPoolsPDA);
    const collateralPayoutMint =
      tokenType === TokenType.Usdc
        ? bettingPoolsState.usdcMint
        : bettingPoolsState.betPointsMint;

    const [yesLmsrMint, noLmsrMint] =
      tokenType === TokenType.Usdc
        ? [
            PublicKey.findProgramAddressSync(
              [YES_LMSR_USDC_MINT_SEED, poolIdBytes],
              this.program.programId
            )[0],
            PublicKey.findProgramAddressSync(
              [NO_LMSR_USDC_MINT_SEED, poolIdBytes],
              this.program.programId
            )[0],
          ]
        : [
            PublicKey.findProgramAddressSync(
              [YES_LMSR_POINTS_MINT_SEED, poolIdBytes],
              this.program.programId
            )[0],
            PublicKey.findProgramAddressSync(
              [NO_LMSR_POINTS_MINT_SEED, poolIdBytes],
              this.program.programId
            )[0],
          ];

    const lmsrOutcomeTokenMint = optionIndex === 0 ? yesLmsrMint : noLmsrMint;
    if (!lmsrOutcomeTokenMint) {
      throw new Error("Could not determine LMSR outcome token mint.");
    }

    const lmsrTokensToSell = this.tokensToLamports(amount); // Assuming same decimals
    const tokenTypeSolanaEnum =
      tokenType === TokenType.Usdc ? { usdc: {} } : { points: {} };

    const userLmsrTokenAccount = getAssociatedTokenAddressSync(
      lmsrOutcomeTokenMint,
      this.wallet.publicKey
    );
    const userCollateralTokenAccount = getAssociatedTokenAddressSync(
      collateralPayoutMint,
      this.wallet.publicKey
    );

    const ix = await this.program.methods
      .sellLmsrTokens(
        lmsrTokensToSell,
        new BN(optionIndex),
        tokenTypeSolanaEnum,
        new BN(1) // minPaymentTokensToReceive
      )
      .accountsPartial({
        seller: this.wallet.publicKey,
        lmsrPool: lmsrPoolPda,
        collateralPayoutMint: collateralPayoutMint,
        lmsrOutcomeTokenMint: lmsrOutcomeTokenMint,
        userLmsrTokenAccount: userLmsrTokenAccount,
        userCollateralTokenAccount: userCollateralTokenAccount,
      })
      .instruction();

    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 500_000,
    });
    const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1000,
    });

    const transaction = new Transaction()
      .add(computeBudgetIx)
      .add(priorityFeeIx)
      .add(ix);
    const tx = await this.provider.sendAndConfirm(transaction);

    console.log(`✅ Successfully sold LMSR shares. Transaction: ${tx}`);
    return tx;
  }

  async getLmsrPoolState(poolPk: PublicKey): Promise<LmsrPool | null> {
    if (!this.program) {
      console.warn("Program not initialized, cannot fetch LMSR pool state.");
      return null;
    }
    try {
      const poolState = await this.program.account.lmsrPool.fetch(poolPk);
      return poolState;
    } catch (error) {
      console.error("Failed to fetch LMSR pool state:", error);
      return null;
    }
  }
}
