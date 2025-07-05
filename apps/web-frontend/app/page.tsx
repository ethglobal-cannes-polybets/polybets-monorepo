import HomeClient from "@/components/home-client";
import { Icons } from "@/components/icons";
import type { Market, Platform } from "@/components/market-card";
import type { GroupedMarket } from "@/types/markets";
import type { Database } from "polybets-common";
import type React from "react";
import { slaughterhouseClient, terminalDegenClient } from "@/lib/marketplaceClient";

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

  // Fetch markets that have at least one *active* external market.
  // The query performs two inner joins:
  //   1. markets  -> external_markets (parent_market FK)
  //   2. external_markets -> marketplaces (marketplace_id FK)
  // and filters for marketplaces.active === true. Thanks to the `!inner`
  // modifier every join acts as an `EXISTS(...)` in SQL, mirroring the
  // original requirement:
  //   SELECT *
  //   FROM markets
  //   WHERE EXISTS (
  //     SELECT 1
  //     FROM external_markets
  //     JOIN marketplaces ON marketplaces.id = external_markets.marketplace_id
  //     WHERE external_markets.parent_market = markets.id
  //       AND marketplaces.active = TRUE
  //   );
  const { data: marketData, error: marketError } = await supabase
    .from("markets")
    .select(
      `
        *,
        external_markets!inner (
          id,
          marketplace_id,
          marketplaces!inner (
            id,
            active
          )
        )
      `
    )
    // Keep only rows where the joined marketplace row is active.
    .eq("external_markets.marketplaces.active", true)
    .limit(200);

  if (marketError) throw new Error(marketError.message);

  const markets = (marketData ?? []) as MarketRow[];

  if (markets.length === 0) return [];

  // Fetch all external markets that reference the above IDs in one round-trip
  const { data: extData, error: extError } = await supabase
    .from("external_markets")
    .select(
      `
        *,
        marketplaces!inner (
          id,
          active
        )
      `
    )
    // Only keep external markets whose linked marketplace is active
    .eq("marketplaces.active", true)
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
  const marketplaceById = new Map<number, MarketplaceRow>();
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

  // --- Fetch live prices for external markets in parallel ---
  const pricePromises = externalMarkets.map(async (ext) => {
    const params = ext.price_lookup_params as
      | { marketplaceId?: number | null; marketId?: number | null }
      | null
      | undefined;

    // Validate required params
    if (
      !params ||
      params.marketplaceId == null ||
      params.marketId == null ||
      Number.isNaN(Number(params.marketId))
    ) {
      return [ext.id, null] as const;
    }

    const mpRow = marketplaceById.get(params.marketplaceId);
    if (!mpRow) {
      return [ext.id, null] as const;
    }

    try {
      if (mpRow.name === "Slaughterhouse Predictions") {
        const res = await slaughterhouseClient["get-prices"].$post({
          json: { marketId: Number(params.marketId) },
        });

        if (!res.ok) {
          return [ext.id, null] as const;
        }
        const data = (await res.json()) as [number, number];
        return [ext.id, data] as const;
      }

      if (mpRow.name === "Terminal Degeneracy Labs") {
        const res = await terminalDegenClient["get-prices"].$post({
          json: { marketId: Number(params.marketId) },
        });

        if (!res.ok) {
          return [ext.id, null] as const;
        }
        const data = (await res.json()) as [number, number];
        return [ext.id, data] as const;
      }

      // Unsupported marketplace – skip
      return [ext.id, null] as const;
    } catch (error) {
      console.error("Failed to fetch price for external market", ext.id, error);
      return [ext.id, null] as const;
    }
  });

  const priceByExternalId = new Map<number, [number, number] | null>(
    await Promise.all(pricePromises)
  );

  // --- Fetch trading volume for each external market (pool) in parallel ---
  // For LMSR-based Solana markets the `marketId` field inside price_lookup_params corresponds
  // to the on-chain pool_id that is also referenced by the `shares_*_all` views. We can therefore
  // derive the 24h volume by summing the `payment_amount` column across both the
  // `shares_bought_all` and `shares_sold_all` views for the given pool.
  async function fetchPoolVolume(poolId: number): Promise<number> {
    // Fetch buy-side volume
    const { data: buyRows, error: buyErr } = await supabase
      .from("shares_bought_all")
      .select("payment_amount")
      .eq("pool_id", poolId);

    if (buyErr) throw new Error(buyErr.message);

    // Fetch sell-side volume
    const { data: sellRows, error: sellErr } = await supabase
      .from("shares_sold_all")
      .select("payment_amount")
      .eq("pool_id", poolId);

    if (sellErr) throw new Error(sellErr.message);

    const sum = (rows: { payment_amount: number | null }[] | null) =>
      (rows ?? []).reduce((acc, row) => acc + (row.payment_amount ?? 0), 0);

    return sum(buyRows) + sum(sellRows);
  }

  type VolumeResult = readonly [number, number]; // [externalMarketId, volumeUSD]

  const volumePromises: Promise<VolumeResult>[] = externalMarkets.map(async (ext) => {
    const params = ext.price_lookup_params as
      | { marketplaceId?: number | null; marketId?: number | null }
      | null
      | undefined;

    // Validate presence of pool id
    if (!params || params.marketId == null || Number.isNaN(Number(params.marketId))) {
      return [ext.id, 0] as const;
    }

    try {
      const volume = await fetchPoolVolume(Number(params.marketId));
      return [ext.id, volume] as const;
    } catch (error) {
      console.error("Failed to fetch volume for external market", ext.id, error);
      return [ext.id, 0] as const;
    }
  });

  const volumeByExternalId = new Map<number, number>(
    await Promise.all(volumePromises)
  );

  // Debug logs can be re-enabled during development if needed

  const groupedMarkets: GroupedMarket[] = markets.map((marketRow) => {
    const relatedExternal = externalMarkets.filter(
      (ext) => ext.parent_market === marketRow.id
    );

    // Build Market[] list with each external market entry
    const marketEntries: Market[] = [];

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

      // Determine probability using fetched prices if available
      const prices = priceByExternalId.get(ext.id) ?? null;
      let yesPercentage = 50;
      if (prices && prices[0] + prices[1] > 0) {
        yesPercentage =
          Math.round((prices[0] / (prices[0] + prices[1])) * 100 * 10) / 10; // round to 1 decimal
      }

      const volumeNumeric = volumeByExternalId.get(ext.id) ?? 0;

      marketEntries.push({
        platform,
        title: ext.question,
        percentage: yesPercentage,
        volume: formatUsd(volumeNumeric),
      });
    });

    return {
      id: marketRow.id,
      groupedTitle: marketRow.common_question,
      icon: undefined,
      aggregatedPercentage:
        marketEntries.length > 0
          ? Math.round(
              (marketEntries.reduce((sum, m) => sum + m.percentage, 0) /
                marketEntries.length) *
                10
            ) / 10
          : 50,
      totalVolume: formatUsd(
        marketEntries.reduce((sum, m) => {
          // Extract numeric value back from formatted string is error-prone; instead we use
          // the `volumeByExternalId` map that holds the raw numbers.
          return (
            sum +
            (volumeByExternalId.get(
              relatedExternal.find((ext) => ext.question === m.title)?.id ?? 0
            ) ?? 0)
          );
        }, 0)
      ),
      category: "General", // TODO(fake): replace with real category once available
      markets: marketEntries,
    } satisfies GroupedMarket;
  });

  return groupedMarkets;
}

export default async function Page() {
  const groupedMarkets = await fetchMarkets();

  return <HomeClient groupedMarkets={groupedMarkets} />;
}
