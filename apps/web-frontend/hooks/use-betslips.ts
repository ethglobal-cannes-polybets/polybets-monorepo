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

    // Sort bet slips by descending ID so that the newest appears first
    return combined.sort((a, b) => {
      if (a.id === b.id) return 0;
      return a.id > b.id ? -1 : 1;
    });
  }, [betSlipResults, ids]);

  /* --------------------------------------------------
   * 4) Fetch proxied bets data for each bet slip
   * -------------------------------------------------- */

  // Collect all proxied bet IDs from all bet slips
  const proxiedBetIds = useMemo(() => {
    const allIds: `0x${string}`[] = [];
    betSlips.forEach((bs) => {
      const proxiedBets =
        (bs as { proxiedBets?: readonly string[] }).proxiedBets ?? [];
      proxiedBets.forEach((id) => {
        if (id && typeof id === "string") {
          allIds.push(id as `0x${string}`);
        }
      });
    });
    return allIds;
  }, [betSlips]);

  const {
    data: proxiedBetsResults,
    isLoading: areProxiedBetsLoading,
    error: proxiedBetsError,
  } = useReadContracts({
    allowFailure: true,
    query: {
      enabled: proxiedBetIds.length > 0,
    },
    contracts: proxiedBetIds.map((id) => ({
      address: polybetsContractAddress as `0x${string}`,
      abi: polyBetAbi as Abi,
      functionName: "getProxiedBet" as const,
      args: [id],
    })),
  });

  // Build a map of proxied bet ID to proxied bet data
  const proxiedBetsMap = useMemo(() => {
    const map = new Map<string, ProxiedBetData>();
    if (!proxiedBetsResults) return map;

    proxiedBetsResults.forEach((result, idx) => {
      if (result.status === "success" && result.result) {
        const proxiedBetId = proxiedBetIds[idx];
        map.set(proxiedBetId, result.result as ProxiedBetData);
      }
    });

    return map;
  }, [proxiedBetsResults, proxiedBetIds]);

  /* --------------------------------------------------
   * 5) Fetch Supabase metadata for first marketId of each betslip
   * -------------------------------------------------- */

  // Collect unique parentMarketIds from betslip.parentId
  const parentMarketIds = useMemo(() => {
    const set = new Set<number>();

    console.log("betSlips2", betSlips);
    betSlips.forEach((bs) => {
      const parentId = Number((bs as { parentId?: bigint }).parentId ?? 0);
      if (parentId > 0) {
        set.add(parentId);
      }
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
              price_lookup_params,
              price_lookup_method,
              marketplaces!inner(id,name,active)
            )
          `
        )
        .in("id", parentMarketIds);

      if (error) throw new Error(error.message);

      return (data ?? []) as MarketJoinRow[];
    },
  });

  // Build lookup map keyed by parentId to parent market & marketplace row
  const metaByParentId = useMemo(() => {
    const map = new Map<
      number,
      {
        market: MarketRow;
        marketplace: Database["public"]["Tables"]["marketplaces"]["Row"] | null;
        question: string | null;
      }[]
    >();
    (marketsData ?? []).forEach((m) => {
      const extArray = (m as MarketJoinRow).external_markets ?? [];
      const marketplaces = extArray.map((ext) => ({
        market: m,
        marketplace: ext.marketplaces || null,
        question: ext.question,
      }));
      map.set(m.id, marketplaces);
    });
    return map;
  }, [marketsData]);

  /* --------------------------------------------------
   * 6) Enrich bet-slips with market metadata and proxied bets
   * -------------------------------------------------- */

  const enrichedBetSlips = useMemo(() => {
    if (betSlips.length === 0) return betSlips;

    return betSlips.map((bs) => {
      const parentId = Number((bs as { parentId?: bigint }).parentId ?? 0);
      const pairMeta: PairMeta[] = metaByParentId.get(parentId) ?? [];
      const firstMeta = pairMeta[0] ?? null;

      // Get proxied bets for this bet slip
      const proxiedBetIds =
        (bs as { proxiedBets?: readonly string[] }).proxiedBets ?? [];
      const proxiedBetsData = proxiedBetIds
        .map((id) => {
          const proxiedBet = proxiedBetsMap.get(id);
          return proxiedBet ? proxiedBet : null;
        })
        .filter((bet): bet is NonNullable<typeof bet> => bet !== null);

      return {
        ...bs,
        marketsMeta: pairMeta,
        parentMarket: firstMeta?.market ?? null,
        marketplace: firstMeta?.marketplace ?? null,
        proxiedBetsData,
      } as const;
    });
  }, [betSlips, metaByParentId, proxiedBetsMap]);

  console.log("enrichedBetSlips", enrichedBetSlips);

  return {
    betSlips: enrichedBetSlips,
    isLoading:
      isIdsLoading ||
      areSlipsLoading ||
      areMarketsLoading ||
      areProxiedBetsLoading,
    error:
      idsError ?? slipsError ?? marketsError ?? proxiedBetsError ?? undefined,
  } as const;
}

// ---- Type definitions ----

// ProxiedBet data structure based on the contract ABI
interface ProxiedBetData {
  id: string;
  betSlipId: bigint;
  marketplaceId: bigint;
  marketId: bigint;
  optionIndex: bigint;
  minimumShares: bigint;
  blockTimestamp: bigint;
  originalCollateralAmount: bigint;
  finalCollateralAmount: bigint;
  sharesBought: bigint;
  sharesSold: bigint;
  outcome: bigint;
  failureReason: string;
}

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
