"use client";

import { polyBetAbi } from "@/lib/abi/polyBet";
import { useSession } from "next-auth/react";
import { polybetsContractAddress } from "polybets-common/src/config";
import { useMemo } from "react";
import { Abi } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

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

    return betSlipResults.flatMap((result, idx) => {
      if (result.status !== "success") return [];
      return [
        {
          id: ids[idx],
          ...(result.result as Record<string, unknown>),
        },
      ];
    });
  }, [betSlipResults, ids]);

  return {
    betSlips,
    isLoading: isIdsLoading || areSlipsLoading,
    error: idsError ?? slipsError,
  } as const;
}
