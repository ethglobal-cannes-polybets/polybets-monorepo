import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, pad, Hex } from "viem";
import { toast } from "sonner";
import { polybetsContractAddress } from "polybets-common";
import { polyBetAbi } from "@/lib/abi/polyBet";
import { useRef } from "react";
import { readContract, waitForTransactionReceipt, writeContract as writeContractAction } from "wagmi/actions";
import { erc20Abi } from "viem";
import { wagmiAdapter } from "@/lib/wagmi";
import { useAccount } from "wagmi";
import { useMutation } from "@tanstack/react-query";

export interface Market {
  id: number;
  marketplaceId: string;
  platform: string;
  title: string;
  yesPrice: number;
  noPrice: number;
  liquidity: number;
  selected: boolean;
}

export interface PlaceBetParams {
  amount: number;
  outcome: "yes" | "no";
  strategy: "maximize-shares" | "maximize-privacy";
  markets: Market[];
  marketplaceId: string;
  marketId: string;
  autoArbitrage: boolean;
}

export interface UsePlaceBetOptions {
  onError?: (error: Error) => void;
}

// Minimal ABI to read the MUSDC token address from the PolyBet contract
const polyBetReadAbi = [
  {
    name: "musdcToken",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

export function usePlaceBet({ onError }: UsePlaceBetOptions = {}) {
  const successToastShown = useRef(false);
  const { address } = useAccount();

  // Wagmi hooks for contract interaction
  const {
    data: txHash,
    isPending: isWritePending,
    writeContract,
  } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        toast.success("Transaction Submitted", {
          description: `Transaction hash: ${hash}`,
        });
      },
      onError: (error) => {
        toast.error("Transaction Failed", {
          description: error.message,
        });
        onError?.(error);
      },
    },
  });

  const { isLoading: isTxConfirming, isSuccess: isTxConfirmed, data: txReceipt } =
    useWaitForTransactionReceipt({
      hash: txHash,
      onReplaced: (replacement) => {
        console.error("Transaction Replaced", replacement);
        toast.error("Transaction Replaced", {
          description: `Transaction was ${replacement.reason}`,
        });
      },
    });

  // Show success toast when transaction is confirmed (only once)
  if (isTxConfirmed && txReceipt && !successToastShown.current) {
    console.log("Transaction Confirmed", txReceipt);
    successToastShown.current = true;
    toast.success("Transaction Confirmed", {
      description: `Your bet has been placed successfully! Block: ${txReceipt.blockNumber}`,
    });
  }

  // Reset the success toast flag when a new transaction starts
  if (txHash && !isTxConfirmed && successToastShown.current) {
    successToastShown.current = false;
  }

  /* ----------------------------------------------------------------------
   * Approval mutation – checks allowance and sends approve tx if needed
   * -------------------------------------------------------------------- */

  const approveMutation = useMutation({
    mutationFn: async (totalCollateralAmount: bigint) => {
      if (!address) throw new Error("Wallet not connected");

      // 1. Fetch MUSDC address held in PolyBet
      const musdcTokenAddress = (await readContract(wagmiAdapter.wagmiConfig, {
        address: polybetsContractAddress as `0x${string}`,
        abi: polyBetReadAbi,
        functionName: "musdcToken",
      })) as `0x${string}`;

      if (musdcTokenAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("MUSDC token not set in PolyBet contract");
      }

      // 2. Current allowance
      const currentAllowance = (await readContract(wagmiAdapter.wagmiConfig, {
        address: musdcTokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address as `0x${string}`, polybetsContractAddress as `0x${string}`],
      })) as bigint;

      if (currentAllowance >= totalCollateralAmount) return; // already approved

      toast.info("Approving mUSDC spend", {
        description: "Confirm the approval transaction in your wallet.",
      });

      const approveHash = (await writeContractAction(wagmiAdapter.wagmiConfig, {
        address: musdcTokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          polybetsContractAddress as `0x${string}`,
          BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        ],
      })) as `0x${string}`;

      await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
        hash: approveHash,
      });

      toast.success("Token approved", {
        description: "mUSDC approval confirmed.",
      });
    },
    onError: (error: Error) => {
      toast.error("Approval failed", { description: error.message });
    },
  });

  // Derive loading state (includes approval mutation)
  const isPlacingBet = approveMutation.isPending || isWritePending || isTxConfirming;

  // Helper to encode number/string to bytes32 (left-padded)
  const toBytes32 = (value: number | bigint | string): Hex => {
    const numeric =
      typeof value === "string" && value.startsWith("0x")
        ? (value as Hex)
        : (`0x${BigInt(value).toString(16)}` as Hex);
    return pad(numeric, { size: 32 });
  };

  // Helper to safely convert marketplaceId to BigInt
  const marketplaceIdToBigInt = (marketplaceId: string): bigint => {
    // If it's already a numeric string, convert directly
    if (/^\d+$/.test(marketplaceId)) {
      return BigInt(marketplaceId);
    }
    
    // For string identifiers like "Polybet", we need to hash them or use a mapping
    // For now, let's create a simple hash of the string
    let hash = 0;
    for (let i = 0; i < marketplaceId.length; i++) {
      const char = marketplaceId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return BigInt(Math.abs(hash));
  };

  const placeBet = async (betData: PlaceBetParams) => {
    const { amount, strategy, markets } = betData;

    if (!amount || markets.length === 0) {
      const error = new Error(
        "Please enter an amount and select at least one market."
      );
      toast.error("Invalid bet", {
        description: error.message,
      });
      onError?.(error);
      return;
    }

    try {
      /* -------------------- Default on-chain implementation -------------------- */

      const strategyEnum = strategy === "maximize-shares" ? 0 : 1;
      const totalCollateralAmount = parseUnits(amount.toString(), 6); // USDC has 6 decimals

      const marketplaceIds = markets.map((m) =>
        toBytes32(marketplaceIdToBigInt(m.marketplaceId))
      );
      const marketIds = markets.map((m) => toBytes32(BigInt(m.id)));

      // Ensure allowance – will approve if needed
      await approveMutation.mutateAsync(totalCollateralAmount);

      // -----------------------------------------------------------------------
      // Place bet now that allowance is sufficient
      // -----------------------------------------------------------------------

      writeContract({
        address: polybetsContractAddress,
        abi: polyBetAbi,
        functionName: "placeBet",
        args: [
          strategyEnum,
          totalCollateralAmount,
          marketplaceIds,
          marketIds,
        ],
      });
    } catch (error) {
      console.log("Error", error);

      const err =
        error instanceof Error ? error : new Error("Failed to place bet");
      toast.error("Error", {
        description: err.message,
      });
      onError?.(err);
    }
  };

  return {
    placeBet,
    isPlacingBet,
    txHash,
    isTxConfirmed,
  };
}
