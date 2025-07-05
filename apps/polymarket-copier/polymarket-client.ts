import axios, { AxiosError } from "axios";
import type { MarketOdds, PolymarketMarket } from "./types";

export class PolymarketClient {
  private static readonly BASE_URL = "https://gamma-api.polymarket.com";
  private static readonly RETRY_COUNT = 3;
  private static readonly RETRY_DELAY = 1000;

  constructor(private readonly rateLimitDelay: number = 100) {}

  /**
   * Fetches markets from Polymarket API with sorting and filtering
   * @param options - Query options for markets
   * @returns Promise<PolymarketMarket[]>
   */
  async getMarkets(
    options: {
      limit?: number;
      closed?: boolean;
      active?: boolean;
      sortBy?: "volume" | "liquidity" | "created" | "updated" | "id";
      sortOrder?: "asc" | "desc";
    } = {}
  ): Promise<PolymarketMarket[]> {
    const {
      limit = 100,
      closed = false,
      active = true,
      sortBy = "id",
      sortOrder = "desc",
    } = options;

    try {
      const response = await this.makeRequest<PolymarketMarket[]>("/markets", {
        limit,
        closed,
        active,
      });

      let markets = response.data;

      // Sort markets to make sure we process them in the desired order
      markets = this.sortMarkets(markets, sortBy, sortOrder);

      const validMarkets = [];
      // Find the first valid market
      for (const market of markets) {
        const hasRecentActivity =
          (market.volume24hr || 0) > 0 || (market.volume1wk || 0) > 0;
        const prices = this.parseOutcomePrices(market);
        const hasValidPrices =
          prices.length === 2 &&
          prices.every((price) => price > 0 && price < 1);
        const isNotExpired = new Date(market.endDate) > new Date();

        if (
          hasRecentActivity &&
          hasValidPrices &&
          isNotExpired &&
          !market.archived &&
          !market.closed
        ) {
          validMarkets.push(market);
        }
      }

      if (validMarkets.length === 0) {
        console.log(
          `❌ No valid markets found after checking ${markets.length} markets with sort by '${sortBy}'.`
        );
      } else {
        console.log(
          `✅ Found ${validMarkets.length} valid markets out of ${markets.length} total.`
        );
      }
      return validMarkets;
    } catch (error) {
      console.error("❌ Failed to fetch markets from Polymarket:", error);
      throw error;
    }
  }

  /**
   * Gets a specific market by ID
   * @param marketId - The market ID
   * @returns Promise<PolymarketMarket>
   */
  async getMarket(marketId: string): Promise<PolymarketMarket> {
    try {
      const response = await this.makeRequest<PolymarketMarket>(
        `/markets/${marketId}`
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch market ${marketId}:`, error);
      throw error;
    }
  }

  /**
   * Parses outcome prices from string format to number array
   * @param market - The market object
   * @returns number[] - Array of prices
   */
  parseOutcomePrices(market: PolymarketMarket): number[] {
    try {
      if (!market.outcomePrices) {
        return [0, 0];
      }
      const prices = JSON.parse(market.outcomePrices);
      return prices.map((price: string) => parseFloat(price));
    } catch (error) {
      console.error(
        `❌ Failed to parse outcome prices for market ${market.id}:`,
        error
      );
      return [0, 0]; // Default fallback
    }
  }

  /**
   * Parses outcomes from string format to string array
   * @param market - The market object
   * @returns string[] - Array of outcomes
   */
  parseOutcomes(market: PolymarketMarket): string[] {
    try {
      return JSON.parse(market.outcomes);
    } catch (error) {
      console.error(
        `❌ Failed to parse outcomes for market ${market.id}:`,
        error
      );
      return ["Yes", "No"]; // Default fallback
    }
  }

  /**
   * Calculates market odds and probabilities
   * @param market - The market object
   * @returns Object with odds information
   */
  calculateOdds(market: PolymarketMarket): MarketOdds {
    const prices = this.parseOutcomePrices(market);
    const outcomes = this.parseOutcomes(market);

    if (prices.length !== 2 || outcomes.length !== 2) {
      throw new Error(`Market ${market.id} is not a binary market`);
    }

    const [yesPrice, noPrice] = prices;
    const [yesOutcome, noOutcome] = outcomes;

    // Ensure prices are valid numbers
    if (
      yesPrice === undefined ||
      noPrice === undefined ||
      yesOutcome === undefined ||
      noOutcome === undefined
    ) {
      throw new Error(`Market ${market.id} has invalid price or outcome data`);
    }

    // Polymarket prices are probabilities (0-1)
    const yesProbability = yesPrice;
    const noProbability = noPrice;
    const totalProbability = yesProbability + noProbability;

    // Normalize if they don't sum to 1 (due to spread)
    const normalizedYes = yesProbability / totalProbability;
    const normalizedNo = noProbability / totalProbability;

    return {
      yesPrice,
      noPrice,
      yesProbability,
      noProbability,
      normalizedYes,
      normalizedNo,
      yesOutcome,
      noOutcome,
      spread: Math.abs(1 - totalProbability),
      volume24hr: market.volume24hr,
      liquidity: market.liquidityNum,
    };
  }

  /**
   * Validates if a market is suitable for copying
   * @param market - The market to validate
   * @returns boolean - Whether the market is valid
   */
  isValidMarket(market: PolymarketMarket): boolean {
    try {
      const prices = this.parseOutcomePrices(market);
      const outcomes = this.parseOutcomes(market);

      // Check if it's a binary market
      if (prices.length !== 2 || outcomes.length !== 2) {
        return false;
      }

      // Check if prices are valid (between 0 and 1)
      if (prices.some((price) => price <= 0 || price >= 1)) {
        return false;
      }

      // Check if market is not expired
      if (new Date(market.endDate) <= new Date()) {
        return false;
      }

      // Check if market has sufficient liquidity/volume
      const hasActivity = market.volume24hr > 100 || market.liquidityNum > 500;

      return hasActivity && !market.archived && !market.closed;
    } catch (error) {
      console.error(`❌ Error validating market ${market.id}:`, error);
      return false;
    }
  }

  /**
   * Sorts markets based on criteria
   * @param markets - Array of markets to sort
   * @param sortBy - Sort criteria
   * @param sortOrder - Sort order
   * @returns Sorted array of markets
   */
  private sortMarkets(
    markets: PolymarketMarket[],
    sortBy: "volume" | "liquidity" | "created" | "updated" | "id",
    sortOrder: "asc" | "desc"
  ): PolymarketMarket[] {
    return markets.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case "id":
          aValue = parseInt(a.id, 10);
          bValue = parseInt(b.id, 10);
          break;
        case "volume":
          aValue = a.volume24hr || a.volumeNum;
          bValue = b.volume24hr || b.volumeNum;
          break;
        case "liquidity":
          aValue = a.liquidityNum;
          bValue = b.liquidityNum;
          break;
        case "created":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "updated":
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          aValue = a.volumeNum;
          bValue = b.volumeNum;
      }

      if (sortOrder === "desc") {
        return bValue - aValue;
      }
      return aValue - bValue;
    });
  }

  /**
   * Makes HTTP request with retry logic
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns Promise with response data
   */
  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<{ data: T }> {
    const url = `${PolymarketClient.BASE_URL}${endpoint}`;

    for (let attempt = 1; attempt <= PolymarketClient.RETRY_COUNT; attempt++) {
      try {
        // Rate limiting
        await this.delay(this.rateLimitDelay);

        const response = await axios.get<T>(url, {
          params,
          timeout: 10000,
          headers: {
            "User-Agent": "polymarket-copier/1.0.0",
            Accept: "application/json",
          },
        });

        return { data: response.data };
      } catch (error) {
        const axiosError = error as AxiosError;

        if (attempt === PolymarketClient.RETRY_COUNT) {
          throw new Error(
            `Failed to fetch ${endpoint} after ${PolymarketClient.RETRY_COUNT} attempts: ${axiosError.message}`
          );
        }

        // Exponential backoff
        const delay = PolymarketClient.RETRY_DELAY * Math.pow(2, attempt - 1);
        console.warn(
          `⚠️  Attempt ${attempt} failed, retrying in ${delay}ms...`
        );
        await this.delay(delay);
      }
    }

    throw new Error("Unexpected error in makeRequest");
  }

  /**
   * Utility function for delays
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
