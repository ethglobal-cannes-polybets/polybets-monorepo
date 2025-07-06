"use client";

import { polyBetAbi } from "@/lib/abi/polyBet";
import { useSession } from "next-auth/react";
import { polybetsContractAddress } from "polybets-common/src/config";
import { useMemo } from "react";
import { Abi } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "polybets-common/src/lib/__generated__/database.types";

/**
 * Hook fetching the current user's active betslips from the PolyBet contract.
 * It first retrieves the bet-slip IDs with `getUserActiveBetslips` and then
 * fetches each bet slip via `getBetSlip`.
 *
 * When the user is not authenticated (no authToken in the session) we fall back
 * to the overload of `getUserActiveBetslips` that takes **no** arguments. This
 * variant relies on `msg.sender` and therefore still works for EOA wallets even
 * without the auth-token based flow.
 */
export function useActiveBetSlips() {
  const { data: session } = useSession();
  const authToken = session?.authToken as `0x${string}` | undefined;

  console.log("234", authToken);

  /* --------------------------------------------------
   * 1) Fetch bet-slip IDs for the authenticated user
   * -------------------------------------------------- */
  const {
    data: betSlipIds,
    isLoading: isIdsLoading,
    error: idsError,
  } = useReadContract({
    abi: polyBetAbi,
    address: polybetsContractAddress as `0x${string}`,
    functionName: "getUserActiveBetslips",
    // If we have an authToken use the corresponding overload, otherwise call
    // the zero-argument variant.
    ...(authToken ? { args: [authToken] as [`0x${string}`] } : {}),
  });

  console.log("betSlipIds", betSlipIds);

  // Ensure we have a strongly-typed array of bet slip IDs to work with
  const ids = Array.isArray(betSlipIds)
    ? (betSlipIds as readonly bigint[])
    : [];

  /* --------------------------------------------------
   * 2) Fetch BetSlip structs for each returned ID
   * -------------------------------------------------- */
  const {
    data: betSlipResults,
    isLoading: areSlipsLoading,
    error: slipsError,
  } = useReadContracts({
    allowFailure: true,
    query: {
      enabled: ids.length > 0,
    },
    contracts: ids.map((id) => ({
      address: polybetsContractAddress as `0x${string}`,
      abi: polyBetAbi as Abi,
      functionName: "getBetSlip" as const,
      args: [id as bigint],
    })),
  });

  /* --------------------------------------------------
   * 3) Combine ID + struct into a richer object array
   * -------------------------------------------------- */
  const betSlips = useMemo(() => {
    if (!betSlipResults || ids.length === 0) return [];

    const combined = betSlipResults.flatMap((result, idx) => {
      if (result.status !== "success") return [];
      return [
        {
          id: ids[idx],
          ...(result.result as Record<string, unknown>),
        },
      ];
    });

    // Sort bet slips by ascending ID so that the oldest appears first
    return combined.sort((a, b) => {
      if (a.id === b.id) return 0;
      return a.id < b.id ? -1 : 1;
    });
  }, [betSlipResults, ids]);

  /* --------------------------------------------------
   * 4)   Fetch Supabase metadata for first marketId of each betslip
   * -------------------------------------------------- */

  // Collect unique parentMarketIds (decoded from marketIds)
  const parentMarketIds = useMemo(() => {
    const set = new Set<number>();
    betSlips.forEach((bs) => {
      const mkIds = (bs as { marketIds?: string[] }).marketIds ?? [];
      mkIds.forEach((hex) => {
        const idNum = bytes32ToNumber(hex);
        if (!Number.isNaN(idNum)) set.add(idNum);
      });
    });
    return Array.from(set);
  }, [betSlips]);

  const {
    data: marketsData,
    isLoading: areMarketsLoading,
    error: marketsError,
  } = useQuery({
    queryKey: ["markets", parentMarketIds],
    enabled: parentMarketIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("markets")
        .select(
          `
            *,
            external_markets (
              marketplace_id,
              question,
              marketplaces!inner(id,name,active)
            )
          `
        )
        .in("id", parentMarketIds);

      if (error) throw new Error(error.message);

      return (data ?? []) as MarketJoinRow[];
    },
  });

  console.log("marketsData", marketsData);

  // Build lookup map keyed by "marketplaceId-marketId" to parent market & marketplace row
  const metaByPairKey = useMemo(() => {
    const map = new Map<
      string,
      {
        market: MarketRow;
        marketplace: Database["public"]["Tables"]["marketplaces"]["Row"] | null;
        question: string | null;
      }
    >();
    (marketsData ?? []).forEach((m) => {
      const extArray = (m as MarketJoinRow).external_markets ?? [];
      extArray.forEach((ext) => {
        if (ext.marketplace_id == null) return;
        const key = `${ext.marketplace_id}-${m.id}`; // parent market id
        map.set(key, {
          market: m,
          marketplace: ext.marketplaces || null,
          question: ext.question,
        });
      });
    });
    return map;
  }, [marketsData]);

  /* --------------------------------------------------
   * 5)   Enrich bet-slips with market metadata
   * -------------------------------------------------- */

  const enrichedBetSlips = useMemo(() => {
    if (betSlips.length === 0) return betSlips;

    return betSlips.map((bs) => {
      const mpIds = (bs as { marketplaceIds?: string[] }).marketplaceIds ?? [];
      const mkIds = (bs as { marketIds?: string[] }).marketIds ?? [];
      const pairMeta: PairMeta[] = [];
      const len = Math.min(mpIds.length, mkIds.length);

      for (let i = 0; i < len; i++) {
        const mp = bytes32ToNumber(mpIds[i]);
        const mk = bytes32ToNumber(mkIds[i]);
        const key = `${mp}-${mk}`; // mk is parent market id
        const meta = metaByPairKey.get(key);
        if (meta) pairMeta.push(meta);
      }

      const firstMeta = pairMeta[0] ?? null;

      return {
        ...bs,
        marketsMeta: pairMeta,
        parentMarket: firstMeta?.market ?? null,
        marketplace: firstMeta?.marketplace ?? null,
      } as const;
    });
  }, [betSlips, metaByPairKey]);

  console.log("enrichedBetSlips", enrichedBetSlips);

  return {
    betSlips: enrichedBetSlips,
    isLoading: isIdsLoading || areSlipsLoading || areMarketsLoading,
    error: idsError ?? slipsError ?? marketsError ?? undefined,
  } as const;
}

// Helper: bytes32 (0x…) → numeric ID used in Supabase
const bytes32ToNumber = (hex: string): number => {
  try {
    return Number(BigInt(hex));
  } catch {
    return NaN;
  }
};

// ---- Supabase row helpers ----
type MarketRow = Database["public"]["Tables"]["markets"]["Row"];
type MarketplaceRow = Database["public"]["Tables"]["marketplaces"]["Row"];

interface ExternalMarketJoin {
  marketplace_id: number | null;
  question: string | null;
  price_lookup_params: Record<string, unknown> | null;
  marketplaces: MarketplaceRow | null;
}

type MarketJoinRow = MarketRow & { external_markets: ExternalMarketJoin[] };

interface PairMeta {
  market: MarketRow;
  marketplace: MarketplaceRow | null;
  question: string | null;
}
