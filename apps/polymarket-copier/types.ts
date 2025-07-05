import type {
  MarketplaceConfig,
  OddsCalculation,
} from "polybets-common/src/types";
import { z } from "zod";

// Polymarket API types
export interface PolymarketEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  openInterest: number;
  sortBy: string;
  category: string;
  published_at: string;
  createdAt: string;
  updatedAt: string;
  competitive: number;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  volume1yr: number;
  liquidityAmm: number;
  liquidityClob: number;
  commentCount: number;
  cyom: boolean;
  closedTime: string;
  showAllOutcomes: boolean;
  showMarketImages: boolean;
  enableNegRisk: boolean;
  negRiskAugmented: boolean;
  pendingDeployment: boolean;
  deploying: boolean;
}

export interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  twitterCardImage?: string;
  endDate: string;
  category: string;
  liquidity: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string; // JSON array string
  outcomePrices: string; // JSON array string
  volume: string;
  active: boolean;
  marketType: string;
  closed: boolean;
  marketMakerAddress: string;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
  closedTime?: string;
  mailchimpTag?: string;
  archived: boolean;
  restricted: boolean;
  volumeNum: number;
  liquidityNum: number;
  endDateIso: string;
  hasReviewedDates: boolean;
  readyForCron?: boolean;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  volume1yr: number;
  clobTokenIds: string;
  fpmmLive?: boolean;
  volume1wkAmm?: number;
  volume1moAmm?: number;
  volume1yrAmm?: number;
  volume1wkClob?: number;
  volume1moClob?: number;
  volume1yrClob?: number;
  events: PolymarketEvent[];
  creator: string;
  ready: boolean;
  funded: boolean;
  cyom: boolean;
  competitive: number;
  pagerDutyNotificationEnabled: boolean;
  approved: boolean;
  rewardsMinSize: number;
  rewardsMaxSpread: number;
  spread: number;
  oneDayPriceChange: number;
  oneHourPriceChange: number;
  oneWeekPriceChange: number;
  oneMonthPriceChange: number;
  oneYearPriceChange: number;
  lastTradePrice: number;
  bestBid: number;
  bestAsk: number;
  clearBookOnStart: boolean;
  manualActivation: boolean;
  negRiskOther: boolean;
  umaResolutionStatuses: string;
  pendingDeployment: boolean;
  deploying: boolean;
  rfqEnabled: boolean;
}

// Structured output schema for LangChain
export const RephrasedMarketSchema = z.object({
  question: z.string().describe("The rephrased market question"),
  description: z.string().describe("The rephrased market description"),
  outcomes: z.array(z.string()).describe("The rephrased outcome options"),
  category: z.string().describe("The appropriate category for this market"),
  mediaType: z
    .enum(["image", "video", "text"])
    .describe("The type of media for this market"),
  reasoning: z
    .string()
    .describe("Brief explanation of the rephrasing choices made"),
});

export type RephrasedMarket = z.infer<typeof RephrasedMarketSchema>;

export interface SuccessfulPoolInfo {
  marketId: string;
  marketplaceName: string;
  poolId: string;
  timestamp: Date;
  rephrasedMarket: RephrasedMarket;
  programId: string;
}

// Application state
export interface AppState {
  marketplaces: MarketplaceConfig[];
  processedMarkets: Set<string>;
  errors: Array<{ marketId: string; error: string; timestamp: Date }>;
  successfulPools: SuccessfulPoolInfo[];
}

export interface PoolCreationParams {
  question: string;
  options: string[];
  betsCloseAt: Date;
  mediaUrl: string;
  mediaType: { [key: string]: {} };
  category: string;
  creatorName: string;
  creatorId: string;
  closureCriteria: string;
  closureInstructions: string;
}

export interface ProcessingResult {
  success: boolean;
  marketId: string;
  marketplaceName: string;
  poolId?: string;
  rephrasedMarket?: RephrasedMarket;
  oddsCalculation?: OddsCalculation;
  error?: string;
}

export interface MarketOdds {
  yesPrice: number;
  noPrice: number;
  yesProbability: number;
  noProbability: number;
  normalizedYes: number;
  normalizedNo: number;
  yesOutcome: string;
  noOutcome: string;
  spread: number;
  volume24hr: number;
  liquidity: number;
}
