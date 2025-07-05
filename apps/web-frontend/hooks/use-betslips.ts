"use client";

import { useSession } from "next-auth/react";
import { useReadContract, useReadContracts } from "wagmi";
import { useMemo } from "react";
import { polybetsContractAddress } from "polybets-common";
import { PolyBet__factory } from "../../../contracts/typechain-types/factories/contracts/polybet.sol/PolyBet__factory";

/**
 * Hook fetching the current user's active betslips from the PolyBet contract.
 * It first retrieves the bet-slip IDs with `getUserActiveBetslips` and then
 * fetches each bet slip via `getBetSlip`.
 *
 * When the user is not authenticated (no authToken in the session) the query is
 * disabled and the hook returns an empty array.
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
    abi: PolyBet__factory.abi,
    address: polybetsContractAddress as `0x${string}`,
    functionName: "getUserActiveBetslips",
    // Overload selection: when we have authToken, we call the variant that
    // requires an argument. Otherwise the hook is disabled altogether.
    ...(authToken ? { args: [authToken] as [`0x${string}`] } : {}),
    // `query.enabled` ensures the hook runs only when we have an authToken
    query: { enabled: !!authToken },
  });

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
      enabled: Array.isArray(betSlipIds) && betSlipIds.length > 0,
    },
    contracts: (Array.isArray(betSlipIds) ? betSlipIds : []).map((id) => ({
      address: polybetsContractAddress as `0x${string}`,
      abi: PolyBet__factory.abi,
      functionName: "getBetSlip" as const,
      args: [id as bigint],
    })),
  });

  /* --------------------------------------------------
   * 3) Combine ID + struct into a richer object array
   * -------------------------------------------------- */
  const betSlips = useMemo(() => {
    if (!betSlipResults || !Array.isArray(betSlipIds)) return [];

    return betSlipResults.flatMap((result, idx) => {
      if (result.status !== "success") return [];
      return [
        {
          id: betSlipIds[idx],
          ...result.result,
        },
      ];
    });
  }, [betSlipResults, betSlipIds]);

  return {
    betSlips,
    isLoading: isIdsLoading || areSlipsLoading,
    error: idsError ?? slipsError,
  } as const;
} 