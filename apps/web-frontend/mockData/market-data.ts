import type { Database } from "polybets-common";

/**
 * Types that originate from the generated Supabase schema.
 * We reference them here to ensure our frontend mock data stays
 * in-sync with the database contract. Do NOT widen these types –
 * always derive from the generated schema when adding new fields.
 */

// Row returned by the `get_all_pool_details` Postgres function
// (single element – we'll use it to type-check core market fields).
type PoolDetails =
  Database["public"]["Functions"]["get_all_pool_details"]["Returns"][number];

export interface MarketPlatform {
  id: string;
  platform: string;
  title: string;
  yesPrice: number;
  noPrice: number;
  volume24h: number;
  liquidity: number;
  lastUpdated: number;
  change24h: number;
}

// Front-end facing market type – database driven core fields + UI extras
export interface MarketData extends Pick<PoolDetails, "question" | "category"> {
  /**
   * When bets close for this pool – mirrors `bets_close_at` in DB. Epoch ms.
   */
  bets_close_at: number;
  /**
   * Optional longer copy for the UI; not stored on-chain / in DB.
   */
  description?: string;
  /**
   * Aggregated liquidity/price info coming from external platforms.
   */
  platforms: MarketPlatform[];
}

export const mockBinaryMarketData: Record<string, MarketData> = {
  "will-ethereum-reach-5000-by-the-end-of-q3": {
    question: "Will Ethereum reach $5,000 by the end of Q3?",
    description:
      "Market resolves to YES if ETH price is at or above $5,000 on major exchanges at end of quarter.",
    category: "Crypto",
    // 2024-09-30T00:00:00.000Z
    bets_close_at: new Date("2024-09-30T00:00:00Z").getTime(),
    platforms: [
      {
        id: "1",
        platform: "Polymarket",
        title: "ETH > $5k by Q3 end?",
        yesPrice: 0.698,
        noPrice: 0.302,
        volume24h: 125_000,
        liquidity: 450_000,
        lastUpdated: Date.now() - 300_000,
        change24h: 3.2,
      },
      {
        id: "2",
        platform: "Limitless",
        title: "Ethereum price at end of Q3 '24",
        yesPrice: 0.712,
        noPrice: 0.288,
        volume24h: 89_000,
        liquidity: 320_000,
        lastUpdated: Date.now() - 180_000,
        change24h: 2.8,
      },
    ],
  },
  "who-will-win-the-2028-us-presidential-election": {
    question: "Who will win the 2028 US Presidential Election?",
    description:
      "Market resolves to the winner of the 2028 US Presidential Election.",
    category: "Politics",
    bets_close_at: new Date("2028-11-07T00:00:00Z").getTime(),
    platforms: [
      {
        id: "1",
        platform: "Polymarket",
        title: "2028 US Election Winner",
        yesPrice: 0.42,
        noPrice: 0.58,
        volume24h: 10_500_000,
        liquidity: 25_000_000,
        lastUpdated: Date.now() - 60_000,
        change24h: -1.1,
      },
    ],
  },
  "will-ai-achieve-agi-by-2030": {
    question: "Will AI achieve AGI by 2030?",
    description:
      "Market resolves to YES if a consensus of experts agrees AGI has been demonstrated.",
    category: "Technology",
    bets_close_at: new Date("2030-12-31T00:00:00Z").getTime(),
    platforms: [
      {
        id: "1",
        platform: "Polymarket",
        title: "AGI by 2030?",
        yesPrice: 0.19,
        noPrice: 0.81,
        volume24h: 500_000,
        liquidity: 1_200_000,
        lastUpdated: Date.now() - 150_000,
        change24h: 2.5,
      },
      {
        id: "2",
        platform: "Limitless",
        title: "Artificial General Intelligence by 2030",
        yesPrice: 0.17,
        noPrice: 0.83,
        volume24h: 350_000,
        liquidity: 900_000,
        lastUpdated: Date.now() - 300_000,
        change24h: 2.1,
      },
    ],
  },
  "israel-x-hamas-ceasefire-by-july-15": {
    question: "Israel × Hamas ceasefire by July 15?",
    description:
      "Resolves YES if an internationally-brokered ceasefire between Israel and Hamas is in effect for 48 consecutive hours by July 15 UTC.",
    category: "Geopolitics",
    bets_close_at: new Date("2024-07-15T00:00:00Z").getTime(),
    platforms: [
      {
        id: "1",
        platform: "Polymarket",
        title: "Israel-Hamas ceasefire by 15 Jul",
        yesPrice: 0.34,
        noPrice: 0.66,
        volume24h: 220_000,
        liquidity: 800_000,
        lastUpdated: Date.now() - 120_000,
        change24h: 1.8,
      },
    ],
  },
  "will-zohran-mamdani-win-the-nyc-mayoral-election": {
    question: "Will Zohran Mamdani win the NYC Mayoral Election?",
    description:
      "Market resolves YES if Zohran Mamdani is officially declared the winner of the next New York City mayoral election.",
    category: "Politics",
    bets_close_at: new Date("2025-11-04T00:00:00Z").getTime(),
    platforms: [
      {
        id: "1",
        platform: "Limitless",
        title: "Zohran Mamdani elected NYC Mayor",
        yesPrice: 0.7,
        noPrice: 0.3,
        volume24h: 180_000,
        liquidity: 1_200_000,
        lastUpdated: Date.now() - 240_000,
        change24h: 2.4,
      },
      {
        id: "2",
        platform: "Polymarket",
        title: "NYC Mayor 2025 – Mamdani",
        yesPrice: 0.68,
        noPrice: 0.32,
        volume24h: 150_000,
        liquidity: 950_000,
        lastUpdated: Date.now() - 300_000,
        change24h: 2.0,
      },
    ],
  },
  "lakers-to-win-the-2025-nba-championship": {
    question: "Lakers to win the 2025 NBA Championship?",
    description:
      "Resolves YES if the Los Angeles Lakers win the NBA Finals in the 2024-25 season.",
    category: "Sports",
    bets_close_at: new Date("2025-06-30T00:00:00Z").getTime(),
    platforms: [
      {
        id: "1",
        platform: "Kalshi",
        title: "LAL2025 champions",
        yesPrice: 0.2,
        noPrice: 0.8,
        volume24h: 500_000,
        liquidity: 2_000_000,
        lastUpdated: Date.now() - 90_000,
        change24h: -0.5,
      },
      {
        id: "2",
        platform: "Polymarket",
        title: "Lakers win 2025 title",
        yesPrice: 0.21,
        noPrice: 0.79,
        volume24h: 430_000,
        liquidity: 1_750_000,
        lastUpdated: Date.now() - 200_000,
        change24h: -0.7,
      },
    ],
  },
  "will-bitcoin-reach-70k-by-end-of-june": {
    question: "Will Bitcoin reach $70k by end of June?",
    description:
      "Resolves YES if the BTC/USD price on major exchanges is ≥ $70,000 at 23:59 UTC on 30 Jun.",
    category: "Crypto",
    bets_close_at: new Date("2024-06-30T23:59:00Z").getTime(),
    platforms: [
      {
        id: "1",
        platform: "Polymarket",
        title: "BTC > 70k by 30 Jun",
        yesPrice: 0.15,
        noPrice: 0.85,
        volume24h: 1_100_000,
        liquidity: 3_400_000,
        lastUpdated: Date.now() - 60_000,
        change24h: 0.9,
      },
    ],
  },
  "will-furiosa-gross-over-100m-domestic-opening-weekend": {
    question: "Will 'Furiosa' gross over $100M domestic opening weekend?",
    description:
      "Resolves YES if 'Furiosa' grosses more than $100 million at the domestic box office during its opening weekend (Fri–Sun).",
    category: "Movies",
    bets_close_at: new Date("2024-12-15T00:00:00Z").getTime(),
    platforms: [
      {
        id: "1",
        platform: "Polymarket",
        title: "'Furiosa' >$100M opening",
        yesPrice: 0.4,
        noPrice: 0.6,
        volume24h: 95_000,
        liquidity: 300_000,
        lastUpdated: Date.now() - 180_000,
        change24h: 3.5,
      },
    ],
  },
} as const;

export const mockPriceData = Array.from({ length: 50 }, (_, i) => ({
  timestamp: Date.now() - (50 - i) * 60_000,
  yesPrice: 0.65 + Math.sin(i * 0.1) * 0.1 + Math.random() * 0.05,
  noPrice: 0.35 - Math.sin(i * 0.1) * 0.1 + Math.random() * 0.05,
  volume: Math.random() * 10_000 + 5_000,
}));
