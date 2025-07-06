import type { MarketCardMarket } from "@/components/market-card";
import type React from "react";

export interface GroupedMarket {
  id: number;
  groupedTitle: string;
  icon?: React.ReactNode;
  aggregatedPercentage: number;
  totalVolume: string;
  externalMarkets: MarketCardMarket[];
  category: string;
}
