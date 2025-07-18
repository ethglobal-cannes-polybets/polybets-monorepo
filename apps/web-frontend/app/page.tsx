import HomeClient from "@/components/home-client";
import { Icons } from "@/components/icons";
import type { MarketCardMarket, Platform } from "@/components/market-card";
import {
  degenExecutionChamberClient,
  nihilisticProphetSyndicateClient,
  slaughterhouseClient,
  terminalDegenClient,
} from "@/lib/marketplaceClient";
import type { GroupedMarket } from "@/types/markets";
import { formatUnits } from "viem";
import type { Database } from "../../../packages/common/src/lib/__generated__/database.types";

export const revalidate = 60; // ISR every 60 seconds

const marketplaceConfig = {
  "slaughterhouse predictions": {
    icon: <Icons.slaughterhousePredictions />,
    color: "bg-rose-700",
    client: slaughterhouseClient,
  },
  "terminal degeneracy labs": {
    icon: <Icons.terminalDegeneracyLabs />,
    color: "bg-amber-500",
    client: terminalDegenClient,
  },
  "degen execution chamber": {
    icon: <Icons.degenExecutionChamber />,
    color: "bg-fuchsia-600",
    client: degenExecutionChamberClient,
  },
  "nihilistic prophet syndicate": {
    icon: <Icons.nihilisticProphetSyndicate />,
    color: "bg-teal-600",
    client: nihilisticProphetSyndicateClient,
  },
} as const;

type SupportedMarketplaceName = keyof typeof marketplaceConfig;

// Row types for Supabase tables we need
type MarketRow = Database["public"]["Tables"]["markets"]["Row"];
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
  const { data: marketData, error: marketError } = await supabase
    .from("markets")
    .select(
      `
        *,
        external_markets!inner (
          id,
          marketplace_id,
          price_lookup_params,
          price_lookup_method,
          question,
          parent_market,
          marketplaces!inner (
            id,
            active,
            name,
            chain_family,
            marketplace_proxy,
            address,
            price_strategy
          )
        )
      `
    )
    // Keep only rows where the joined marketplace row is active.
    .eq("external_markets.marketplaces.active", true)
    .limit(200);

  if (marketError) throw new Error(marketError.message);
  const { data: marketplacesData, error: marketplacesError } = await supabase
    .from("marketplaces")
    .select("*")
    .eq("active", true);
  if (marketplacesError) throw new Error(marketplacesError.message);

  const markets = marketData ?? [];

  if (markets.length === 0) return [];

  // All the data we need is in `markets`.
  // We can derive `externalMarkets`, and `marketplaceById` from it
  // without any more network requests.
  const externalMarkets = markets.flatMap((m) => m.external_markets);
  const marketplaceById = marketplacesData.reduce(
    (acc, mp) => {
      acc[mp.id] = mp;
      return acc;
    },
    {} as Record<number, MarketplaceRow>
  );

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

    const mpRow = marketplaceById[params.marketplaceId];
    if (!mpRow) {
      return [ext.id, null] as const;
    }

    const { client } =
      marketplaceConfig[mpRow.name.toLowerCase() as SupportedMarketplaceName];

    if (!client) {
      return [ext.id, null] as const; // Unsupported marketplace – skip
    }

    try {
      const res = await client["get-prices"].$post({
        json: { marketId: Number(params.marketId) },
      });

      if (!res.ok) {
        return [ext.id, null] as const;
      }
      const data = (await res.json()) as [number, number];

      return [ext.id, data] as const;
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

    // The `payment_amount` values are denominated in USDC's smallest unit (6-decimals).
    // Use viem's `formatUnits` to safely convert micro-USDC (BigInt) to a human-readable
    // floating-point USD amount while preserving precision.
    const sumMicro = (rows: { payment_amount: number | null }[] | null) =>
      (rows ?? []).reduce((acc, row) => acc + (row.payment_amount ?? 0), 0);

    const totalMicro = sumMicro(buyRows) + sumMicro(sellRows);
    // Ensure we work with BigInt as required by viem utilities.
    const totalMicroBigInt = BigInt(Math.round(totalMicro));
    return Number(formatUnits(totalMicroBigInt, 6));
  }

  type VolumeResult = readonly [number, number]; // [externalMarketId, volumeUSD]

  const volumePromises: Promise<VolumeResult>[] = externalMarkets.map(
    async (ext) => {
      const params = ext.price_lookup_params as {
        marketplaceId: number;
        marketId: number;
      };

      // Validate presence of pool id
      if (
        !params ||
        params.marketId == null ||
        Number.isNaN(Number(params.marketId))
      ) {
        return [ext.id, 0] as const;
      }

      try {
        const volume = await fetchPoolVolume(Number(params.marketId));
        return [ext.id, volume] as const;
      } catch (error) {
        console.error(
          "Failed to fetch volume for external market",
          ext.id,
          error
        );
        return [ext.id, 0] as const;
      }
    }
  );

  const volumeByExternalId = new Map<number, number>(
    await Promise.all(volumePromises)
  );

  // Debug logs can be re-enabled during development if needed

  const groupedMarkets: GroupedMarket[] = markets.map((marketRow) => {
    const relatedExternal = externalMarkets.filter((ext) => {
      return ext.parent_market === marketRow.id;
    });

    // Build Market[] list with each external market entry
    const marketEntries: MarketCardMarket[] = [];

    relatedExternal.forEach((ext) => {
      let platform: Platform | undefined;

      // Determine platform via marketplace metadata, else fallback
      const params = ext.price_lookup_params as {
        marketplaceId?: number;
        marketId?: number;
      };

      if (
        params &&
        typeof params === "object" &&
        params.marketplaceId != null
      ) {
        const mpRow = marketplaceById[params.marketplaceId];
        if (mpRow) {
          const key = mpRow.name.toLowerCase();
          const config = marketplaceConfig[key as SupportedMarketplaceName];
          if (config) {
            platform = {
              name: mpRow.name,
              icon: config.icon ?? <Icons.logo />,
              color: config.color ?? "bg-gray-500",
            };
          }
        }
      }

      if (!platform) {
        throw new Error("Get fucked");
        // platform = aggregatorPlatform;
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
        marketplaceId: params?.marketplaceId ?? 0,
        theActualExternalMarketMarketId: params?.marketId ?? 0,
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
      externalMarkets: marketEntries,
    } satisfies GroupedMarket;
  });

  return groupedMarkets;
}

export default async function Page() {
  const groupedMarkets = await fetchMarkets();

  return <HomeClient groupedMarkets={groupedMarkets} />;
}
