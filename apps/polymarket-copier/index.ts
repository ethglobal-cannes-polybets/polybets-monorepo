import "dotenv/config";
// TODO: Fix this Supabase import after refactoring the common package
import type { MarketplaceConfig, OddsCalculation } from "polybets-common";
import {
  loadMarketplaceConfigs,
  SolanaPoolManager,
  supabase,
  TokenType,
} from "polybets-common";
import { MarketRephraser } from "./market-rephraser";
import { PolymarketClient } from "./polymarket-client";
import type {
  AppState,
  MarketOdds,
  PolymarketMarket,
  ProcessingResult,
  RephrasedMarket,
} from "./types";

/**
 * Main application class that orchestrates the entire process
 */
export class PolymarketCopier {
  private polymarketClient: PolymarketClient;
  private marketRephraser: MarketRephraser;
  private appState: AppState;

  constructor() {
    // Initialize clients
    this.polymarketClient = new PolymarketClient(100); // 100ms rate limit delay

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }

    this.marketRephraser = new MarketRephraser(openRouterApiKey);

    // Initialize application state
    this.appState = {
      marketplaces: loadMarketplaceConfigs(),
      processedMarkets: new Set(),
      errors: [],
      successfulPools: [],
    };
  }

  /**
   * Main execution method
   */
  async run(): Promise<void> {
    try {
      console.log("🚀 Starting Polymarket Copier...");

      // Validate all marketplaces
      await this.validateMarketplaces();

      // Fetch markets from Polymarket
      const markets = await this.fetchPolymarkets();

      if (markets.length === 0) {
        console.log("❌ No valid markets found to process");
        return;
      }

      console.log(
        `📊 Processing ${markets.length} markets across ${this.appState.marketplaces.length} marketplaces...`
      );

      // Process each market across all marketplaces
      for (const market of markets) {
        if (this.appState.processedMarkets.has(market.id)) {
          console.log(
            `⏭️  Skipping already processed market: ${market.question}`
          );
          continue;
        }

        console.log(`\n🎯 Processing market: "${market.question}"`);
        await this.processMarket(market);

        const successfulCreations = this.appState.successfulPools.filter(
          (p) => p.marketId === market.id
        );

        if (successfulCreations.length > 0) {
          console.log(`✍️  Adding market to database: "${market.question}"`);

          try {
            // 1. Insert into markets table
            const { data: marketData, error: marketError } = await supabase
              .from("markets")
              .insert({
                common_question: market.question,
                options: JSON.parse(market.outcomes),
                // TODO Add url here, should be the url to OUR app
              })
              .select()
              .single();

            if (marketError) {
              throw new Error(
                `Supabase market insert error: ${marketError.message}`
              );
            }

            const parentMarketId = marketData.id;
            console.log(
              `✅ Successfully added parent market with ID: ${parentMarketId}`
            );

            // 2. Insert into external_markets for each successful creation
            for (const creation of successfulCreations) {
              try {
                // Look up marketplace id
                const { data: marketplaceData, error: marketplaceError } =
                  await supabase
                    .from("marketplaces")
                    .select("id")
                    .eq("address", creation.programId)
                    .single();

                if (marketplaceError || !marketplaceData) {
                  throw new Error(
                    `Supabase marketplace fetch error for ${creation.marketplaceName}: ${marketplaceError?.message}`
                  );
                }
                const marketplaceId = marketplaceData.id;

                const { error: externalMarketError } = await supabase
                  .from("external_markets")
                  .insert({
                    parent_market: parentMarketId,
                    question: creation.rephrasedMarket.question,
                    price_lookup_method: "canibeton-lmsr",
                    price_lookup_params: {
                      marketplaceId: marketplaceId,
                      marketId: creation.poolId,
                    },
                    // URL will be for the external market, see notes, only Polymarket is going to be tricky
                  });

                if (externalMarketError) {
                  throw new Error(
                    `Supabase external_market insert error for ${creation.marketplaceName}: ${externalMarketError.message}`
                  );
                }

                console.log(
                  `✅ Successfully added external market for ${creation.marketplaceName}`
                );
              } catch (error) {
                const errorMessage =
                  error instanceof Error ? error.message : "Unknown error";
                this.appState.errors.push({
                  marketId: market.id,
                  error: errorMessage,
                  timestamp: new Date(),
                });
                console.error(
                  `❌ Error processing database insertion for ${creation.marketplaceName}:`,
                  error
                );
              }
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            this.appState.errors.push({
              marketId: market.id,
              error: errorMessage,
              timestamp: new Date(),
            });
            console.error(`❌ Error inserting market to database:`, error);
          }
        }

        // Mark as processed
        this.appState.processedMarkets.add(market.id);

        // Add delay between markets to be respectful
        await this.delay(2000);
      }

      // Print summary
      this.printSummary();
    } catch (error) {
      console.error("❌ Fatal error in main execution:", error);
      throw error;
    }
  }

  /**
   * Processes a single market across all marketplaces
   * @param market - The Polymarket market to process
   */
  private async processMarket(market: PolymarketMarket): Promise<void> {
    try {
      // Calculate original odds
      const originalOdds = this.polymarketClient.calculateOdds(market);
      console.log(
        `📈 Original odds: Yes ${(originalOdds.yesProbability * 100).toFixed(
          1
        )}%, No ${(originalOdds.noProbability * 100).toFixed(1)}%`
      );

      // Step 1: Rephrase the market for all marketplaces at once
      console.log(
        `🔄 Rephrasing market for ${this.appState.marketplaces.length} marketplaces...`
      );

      if (this.appState.marketplaces.length === 0) {
        console.log("No marketplaces configured. Skipping rephrasing.");
        return;
      }

      const firstMarketplace = this.appState.marketplaces[0];
      if (!firstMarketplace) {
        console.log("Marketplace configuration is invalid.");
        return;
      }

      const rephrasedMarkets = await this.marketRephraser.rephraseMarket(
        market,
        firstMarketplace, // Use first marketplace as a template
        this.appState.marketplaces.length
      );

      if (rephrasedMarkets.length === 0) {
        console.log("❌ No valid rephrased markets were generated.");
        return;
      }

      // Process for each marketplace
      for (const [index, marketplace] of this.appState.marketplaces.entries()) {
        try {
          console.log(`\n🏭 Processing for marketplace: ${marketplace.name}`);

          // Assign a rephrased market, looping if necessary
          const rephrasedMarket =
            rephrasedMarkets[index % rephrasedMarkets.length];

          if (!rephrasedMarket) {
            console.log(
              `No rephrased market available for ${marketplace.name}`
            );
            continue;
          }

          const result = await this.processMarketForMarketplace(
            market,
            marketplace,
            originalOdds,
            rephrasedMarket
          );

          if (result.success) {
            this.appState.successfulPools.push({
              marketId: market.id,
              marketplaceName: marketplace.name,
              poolId: result.poolId!,
              timestamp: new Date(),
              rephrasedMarket: result.rephrasedMarket!,
              programId: marketplace.programId,
            });
            console.log(
              `✅ Successfully processed market for ${marketplace.name}`
            );
          } else {
            this.appState.errors.push({
              marketId: market.id,
              error: `${marketplace.name}: ${result.error}`,
              timestamp: new Date(),
            });
            console.log(
              `❌ Failed to process market for ${marketplace.name}: ${result.error}`
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          this.appState.errors.push({
            marketId: market.id,
            error: `${marketplace.name}: ${errorMessage}`,
            timestamp: new Date(),
          });
          console.error(
            `❌ Error processing market for ${marketplace.name}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error(`❌ Error processing market ${market.id}:`, error);
    }
  }

  /**
   * Processes a market for a specific marketplace
   * @param market - The original market
   * @param marketplace - The target marketplace
   * @param originalOdds - The original odds calculation
   * @param rephrasedMarket - The rephrased market
   * @returns ProcessingResult
   */
  private async processMarketForMarketplace(
    market: PolymarketMarket,
    marketplace: MarketplaceConfig,
    originalOdds: MarketOdds,
    rephrasedMarket: RephrasedMarket
  ): Promise<ProcessingResult> {
    try {
      // Step 1: Validate the rephrased market
      console.log(`📝 Using rephrased question: "${rephrasedMarket.question}"`);
      if (!this.marketRephraser.validateRephrasedMarket(rephrasedMarket)) {
        return {
          success: false,
          marketId: market.id,
          marketplaceName: marketplace.name,
          error: "Rephrased market failed validation",
        };
      }

      // Step 2: Create the pool
      console.log(`🏗️  Creating pool on ${marketplace.name}...`);
      const poolManager = new SolanaPoolManager(marketplace);
      const { poolId, pdas } = await poolManager.createPool({
        question: rephrasedMarket.question,
        outcomes: rephrasedMarket.outcomes,
        endDate: new Date(market.endDate),
        imageUrl: market.image || "",
        mediaType: rephrasedMarket.mediaType,
        category: rephrasedMarket.category,
      });

      // Step 3: Calculate adjusted odds for this marketplace
      const oddsCalculation: OddsCalculation = this.calculateOddsWithVariance(
        originalOdds,
        marketplace
      );

      // Step 4: Place bets to seed the pool
      console.log(`💰 Seeding pool with bets...`);
      await poolManager.placeBets(poolId, oddsCalculation, pdas);

      // Step 5: Migrate to LMSR if liquidity is sufficient
      if (marketplace.betAmountUsdc > 100) {
        console.log(`🕊️  Migrating pool ${poolId} to LMSR...`);
        await poolManager.migrateToLmsr(poolId, pdas);

        // Step 5.1: Buy shares to add liquidity after LMSR migration
        console.log(`\n💰 Buying shares after LMSR migration...`);
        const additionalBuyAmount = 10; // Total USDC to spend
        const yesBuyAmount = Math.round(
          additionalBuyAmount * oddsCalculation.yesProbability
        );
        const noBuyAmount = additionalBuyAmount - yesBuyAmount;

        console.log(`   Betting breakdown:`);
        console.log(
          `   Yes: ${yesBuyAmount} USDC (${(
            oddsCalculation.yesProbability * 100
          ).toFixed(1)}%)`
        );
        console.log(
          `   No: ${noBuyAmount} USDC (${(
            oddsCalculation.noProbability * 100
          ).toFixed(1)}%)`
        );

        if (yesBuyAmount > 0) {
          try {
            console.log(
              `💸 Buying ${yesBuyAmount} usdc of LMSR shares for option 0 in pool ${poolId}`
            );
            const buyYesTx = await poolManager.buyLmsrShares(
              poolId,
              0,
              yesBuyAmount,
              TokenType.Usdc
            );
            console.log(
              `  - Bought ${yesBuyAmount} USDC of YES shares. Tx: ${buyYesTx}`
            );
            await this.delay(500);
          } catch (e) {
            console.error(`   - Failed to buy YES shares:`, e);
          }
        }

        if (noBuyAmount > 0) {
          try {
            console.log(
              `💸 Buying ${noBuyAmount} usdc of LMSR shares for option 1 in pool ${poolId}`
            );
            const buyNoTx = await poolManager.buyLmsrShares(
              poolId,
              1,
              noBuyAmount,
              TokenType.Usdc
            );
            console.log(
              `  - Bought ${noBuyAmount} USDC of NO shares. Tx: ${buyNoTx}`
            );
            await this.delay(500);
          } catch (e) {
            console.error(`   - Failed to buy NO shares:`, e);
          }
        }

        // Step 5.2: Sell some shares to test that functionality
        const sharesToSell = 4;
        console.log(`\n💰 Selling ${sharesToSell} shares...`);

        try {
          console.log(
            `💸 Selling ${sharesToSell} of LMSR shares for option 1 in pool ${poolId}`
          );
          const sellTx = await poolManager.sellLmsrShares(
            poolId,
            1, // Sell NO shares
            sharesToSell,
            TokenType.Usdc
          );
          console.log(`  - Sold ${sharesToSell} NO shares. Tx: ${sellTx}`);
        } catch (e) {
          console.error(`   - Failed to sell NO shares:`, e);
        }
      }

      return {
        success: true,
        marketId: market.id,
        marketplaceName: marketplace.name,
        poolId,
        rephrasedMarket,
        oddsCalculation,
      };
    } catch (error) {
      return {
        success: false,
        marketId: market.id,
        marketplaceName: marketplace.name,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Calculates odds with variance for a specific marketplace
   * @param originalOdds - The original odds from Polymarket
   * @param marketplace - The marketplace configuration
   * @returns OddsCalculation
   */
  private calculateOddsWithVariance(
    originalOdds: MarketOdds,
    marketplace: MarketplaceConfig
  ): OddsCalculation {
    const [minVariance, maxVariance] = marketplace.oddsVarianceRange;
    const variance = minVariance + Math.random() * (maxVariance - minVariance);
    const varianceDirection = Math.random() < 0.5 ? 1 : -1;
    const actualVariance = variance * varianceDirection;

    let adjustedYes = originalOdds.normalizedYes + actualVariance;
    let adjustedNo = originalOdds.normalizedNo - actualVariance;

    // Ensure valid bounds
    adjustedYes = Math.max(0.05, Math.min(0.95, adjustedYes));
    adjustedNo = Math.max(0.05, Math.min(0.95, adjustedNo));

    // Normalize
    const total = adjustedYes + adjustedNo;
    adjustedYes /= total;
    adjustedNo /= total;

    return {
      originalYesPrice: originalOdds.yesPrice,
      originalNoPrice: originalOdds.noPrice,
      adjustedYesPrice: adjustedYes,
      adjustedNoPrice: adjustedNo,
      normalizedYes: adjustedYes,
      normalizedNo: adjustedNo,
      yesProbability: adjustedYes,
      noProbability: adjustedNo,
      yesAmount: Math.round(marketplace.betAmountUsdc * adjustedYes),
      noAmount: Math.round(marketplace.betAmountUsdc * adjustedNo),
      totalAmount: marketplace.betAmountUsdc,
      variance: Math.abs(actualVariance),
    };
  }

  /**
   * Fetches valid markets from Polymarket API
   * @returns Array of PolymarketMarket
   */
  private async fetchPolymarkets(): Promise<PolymarketMarket[]> {
    console.log("🔍 Fetching active markets from Polymarket...");
    const allMarkets = await this.polymarketClient.getMarkets();
    console.log(`- Found ${allMarkets.length} total active markets`);

    const validMarkets = allMarkets.filter((market: PolymarketMarket) => {
      if (this.appState.processedMarkets.has(market.id)) {
        return false;
      }
      if (market.closed) {
        return false;
      }
      try {
        const outcomes = JSON.parse(market.outcomes);
        return (
          outcomes.length === 2 &&
          outcomes.includes("Yes") &&
          outcomes.includes("No")
        );
      } catch (error) {
        return false;
      }
    });

    console.log(`- Found ${validMarkets.length} new, valid, binary markets`);

    // Sort by creation date (newest first) and take the top 50
    const sortedMarkets = validMarkets.sort(
      (a: PolymarketMarket, b: PolymarketMarket) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const limitedMarkets = sortedMarkets.slice(0, 50);

    console.log(
      `- Processing the top ${limitedMarkets.length} most recent markets`
    );

    return limitedMarkets;
  }

  /**
   * Validates all marketplace configurations
   */
  private async validateMarketplaces(): Promise<void> {
    console.log("🔍 Validating marketplace configurations...");

    for (const marketplace of this.appState.marketplaces) {
      try {
        const poolManager = new SolanaPoolManager(marketplace);
        const isValid = await poolManager.validateMarketplace();

        if (!isValid) {
          throw new Error(`Marketplace ${marketplace.name} failed validation`);
        }
      } catch (error) {
        console.error(
          `❌ Marketplace ${marketplace.name} validation failed:`,
          error
        );
        throw error;
      }
    }

    console.log(
      `✅ All ${this.appState.marketplaces.length} marketplaces validated successfully`
    );
  }

  /**
   * Prints execution summary
   */
  private printSummary(): void {
    console.log("\n" + "=".repeat(60));
    console.log("📊 EXECUTION SUMMARY");
    console.log("=".repeat(60));

    console.log(
      `✅ Successful pools created: ${this.appState.successfulPools.length}`
    );
    console.log(`❌ Errors encountered: ${this.appState.errors.length}`);
    console.log(`📈 Markets processed: ${this.appState.processedMarkets.size}`);

    if (this.appState.successfulPools.length > 0) {
      console.log("\n🎉 SUCCESSFUL POOLS:");
      this.appState.successfulPools.forEach((pool) => {
        console.log(
          `   • ${pool.marketplaceName}: Pool ${pool.poolId} (Market ${pool.marketId})`
        );
      });
    }

    if (this.appState.errors.length > 0) {
      console.log("\n⚠️  ERRORS:");
      this.appState.errors.forEach((error) => {
        console.log(`   • ${error.error} (Market ${error.marketId})`);
      });
    }

    console.log("\n🏁 Execution completed!");
  }

  /**
   * Utility function for delays
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    const copier = new PolymarketCopier();
    await copier.run();
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
}

// Run the application if this file is executed directly
if (require.main === module) {
  main();
}

export default PolymarketCopier;
