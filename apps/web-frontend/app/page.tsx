import HomeClient from "@/components/home-client";
import { Icons } from "@/components/icons";
import type { Market, Platform } from "@/components/market-card";
import type { GroupedMarket } from "@/types/markets";
import type { Database } from "polybets-common";
import type React from "react";

export const revalidate = 60; // ISR every 60 seconds

// Row types for Supabase tables we need
type MarketRow = Database["public"]["Tables"]["markets"]["Row"];
type ExternalMarketRow =
  Database["public"]["Tables"]["external_markets"]["Row"];
type MarketplaceRow = Database["public"]["Tables"]["marketplaces"]["Row"];

// Reusable formatters – creating them once is more performant than instantiating
// a new `Intl.NumberFormat` for every call.
const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCompactFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatUsd(amount: number): string {
  // Below 1,000 show the full value (e.g. $987)
  if (amount < 1_000) return usdFormatter.format(amount);

  // 1,000 and above – use compact notation (e.g. $1.2K, $3.4M)
  return usdCompactFormatter.format(amount);
}

const aggregatorPlatform: Platform = {
  name: "Polybet",
  icon: <Icons.poly />,
  color: "bg-blue-500",
};

async function getSupabaseClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

async function fetchMarkets(): Promise<GroupedMarket[]> {
  const supabase = await getSupabaseClient();

  // Fetch top-level markets
  const { data: marketData, error: marketError } = await supabase
    .from("markets")
    .select("*")
    .limit(200);

  if (marketError) throw new Error(marketError.message);

  const markets = (marketData ?? []) as MarketRow[];

  if (markets.length === 0) return [];

  // Fetch all external markets that reference the above IDs in one round-trip
  const { data: extData, error: extError } = await supabase
    .from("external_markets")
    .select("*")
    .in(
      "parent_market",
      markets.map((m) => m.id)
    );

  if (extError) throw new Error(extError.message);

  const externalMarkets = (extData ?? []) as ExternalMarketRow[];

  // Collect all referenced marketplaceIds from price_lookup_params
  const marketplaceIdSet = new Set<number>();
  externalMarkets.forEach((ext) => {
    const params = ext.price_lookup_params as
      | { marketplaceId?: number | null }
      | null
      | undefined;
    if (params && typeof params === "object" && params.marketplaceId != null) {
      marketplaceIdSet.add(params.marketplaceId as number);
    }
  });

  // Fetch metadata for referenced marketplaces
  let marketplaceById = new Map<number, MarketplaceRow>();
  if (marketplaceIdSet.size > 0) {
    const { data: mpData, error: mpError } = await supabase
      .from("marketplaces")
      .select("*")
      .in("id", Array.from(marketplaceIdSet));

    if (mpError) throw new Error(mpError.message);

    (mpData ?? []).forEach((row) =>
      marketplaceById.set(row.id, row as MarketplaceRow)
    );
  }

  // Helper maps for icons & colors derived from marketplace name (lowercased)
  const iconMap: Record<string, React.ReactNode> = {
    polymarket: <Icons.poly />,
    limitless: <Icons.limitless />,
    kalshi: <Icons.kalshi />,
  };

  const colorMap: Record<string, string> = {
    polymarket: "bg-purple-600",
    limitless: "bg-green-600",
    kalshi: "bg-indigo-600",
  };

  // Fallback platform map based on price_lookup_method when marketplace metadata missing
  const methodFallbackMap: Record<string, Platform> = {
    "polymarket-orderbook": {
      name: "Polymarket",
      icon: iconMap["polymarket"],
      color: colorMap["polymarket"],
    },
    "limitless-orderbook": {
      name: "Limitless",
      icon: iconMap["limitless"],
      color: colorMap["limitless"],
    },
    "canibeton-lmsr": {
      name: "CanIBetOn",
      icon: iconMap["kalshi"],
      color: colorMap["kalshi"],
    },
  };

  const groupedMarkets: GroupedMarket[] = markets.map((marketRow) => {
    const relatedExternal = externalMarkets.filter(
      (ext) => ext.parent_market === marketRow.id
    );

    // Build Market[] list starting with aggregated view, then each external
    const marketEntries: Market[] = [];

    // Aggregated placeholder entry – percentage & volume are fake defaults
    marketEntries.push({
      platform: aggregatorPlatform,
      title: marketRow.common_question,
      percentage: 50, // TODO(fake): replace with aggregated probability
      volume: formatUsd(0), // TODO(fake): replace with aggregated volume
    });

    // External markets entries
    relatedExternal.forEach((ext) => {
      let platform: Platform | undefined;

      // Determine platform via marketplace metadata, else fallback
      const params = ext.price_lookup_params as
        | { marketplaceId?: number | null }
        | null
        | undefined;
      if (
        params &&
        typeof params === "object" &&
        params.marketplaceId != null
      ) {
        const mpRow = marketplaceById.get(params.marketplaceId);
        if (mpRow) {
          const key = mpRow.name.toLowerCase();
          platform = {
            name: mpRow.name,
            icon: iconMap[key] ?? <Icons.logo />,
            color: colorMap[key] ?? "bg-gray-500",
          };
        }
      }

      if (!platform) {
        platform =
          methodFallbackMap[ext.price_lookup_method ?? ""] ??
          aggregatorPlatform;
      }
      marketEntries.push({
        platform,
        title: ext.question,
        percentage: 50, // TODO(fake): replace with real probability
        volume: formatUsd(0), // TODO(fake): replace with real volume
      });
    });

    console.log("relatedExternal", relatedExternal);

    return {
      id: marketRow.id,
      groupedTitle: marketRow.common_question,
      icon: undefined,
      aggregatedPercentage: 50, // TODO(fake): replace with aggregated probability
      totalVolume: formatUsd(0), // TODO(fake): replace with aggregated volume
      category: "General", // TODO(fake): replace with real category once available
      markets: marketEntries,
    } satisfies GroupedMarket;
  });

  console.log("groupedMarkets", groupedMarkets);

  return groupedMarkets;
}

export default async function Page() {
  const groupedMarkets = await fetchMarkets();

  return <HomeClient groupedMarkets={groupedMarkets} />;
}
