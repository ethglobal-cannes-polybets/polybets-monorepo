"use client";

import { usePlaceBet, type SidebarMarket } from "@/hooks/use-place-bet";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import * as React from "react";
import { toast } from "sonner";
import {
  BettingSidebarProvider,
  useBettingSidebar,
} from "./betting-sidebar-context";
import { BettingFormView } from "./views/betting-form-view";
import { SuccessView } from "./views/success-view";
import { TransactionStateView } from "./views/transaction-state-view";

// ---------------------------------------------------------------------------
interface BettingSidebarProps {
  currentMarket: {
    marketsTableIdNotToBeConfusedWithTheActualExternalMarketMarketIdAkaTheParentMarketId: number;
    title: string;
    yesPrice: number;
    noPrice: number;
    platform: string;
  };
  initialOutcome: "yes" | "no";
  relatedMarkets: SidebarMarket[];
  onPlaceBet?: (betData: {
    amount: number;
    outcomeIndex: 0 | 1;
    strategy: string;
    markets: SidebarMarket[];
    marketplaceId: string;
    marketId: string;
    autoArbitrage: boolean;
  }) => Promise<void>;
  onClose?: () => void;
  isSticky?: boolean;
  isOpen?: boolean;
}

// ---------------------------------------------------------------------------
function BettingSidebarInner(props: BettingSidebarProps) {
  const {
    currentMarket,
    initialOutcome,
    relatedMarkets,
    onPlaceBet: onPlaceBetProp,
    onClose,
    isSticky = false,
    isOpen = true,
  } = props;

  // Local state -------------------------------------------------------------
  const [amount, setAmount] = React.useState("");
  const [outcome, setOutcome] = React.useState<"yes" | "no">(initialOutcome);
  const [strategy, setStrategy] = React.useState<
    "maximize-shares" | "maximize-privacy"
  >("maximize-shares");
  const [selectedMarkets, setSelectedMarkets] = React.useState<SidebarMarket[]>(
    []
  );
  const [autoArbitrage, setAutoArbitrage] = React.useState(true);

  // State Machine -----------------------------------------------------------
  const machine = useBettingSidebar();

  // usePlaceBet hook --------------------------------------------------------
  const { placeBet, isPlacingBet, isApproving, isSigning, isTxFailed } =
    usePlaceBet({
      onError: (error) => {
        machine.dispatch({ type: "PLACE_ERROR", error: error.message });
      },
      onSuccess: (transactionHash: string) => {
        machine.dispatch({ type: "PLACE_SUCCESS", transactionHash });
      },
    });

  // Sync transaction states with state machine -----------------------------
  React.useEffect(() => {
    if (isApproving && machine.state.state === "approving") {
      // Already in approving state, no action needed
      return;
    }
    if (isApproving && machine.canTransition("APPROVE_START")) {
      machine.dispatch({ type: "APPROVE_START" });
    }
    if (!isApproving && machine.state.state === "approving") {
      // Approval finished, move to signing
      machine.dispatch({ type: "APPROVE_SUCCESS" });
    }
  }, [isApproving, machine]);

  React.useEffect(() => {
    if (isSigning && machine.state.state === "signing") {
      // Already in signing state, no action needed
      return;
    }
    if (isSigning && machine.canTransition("SIGN_START")) {
      machine.dispatch({ type: "SIGN_START" });
    }
    if (!isSigning && machine.state.state === "signing") {
      // Signing finished, move to placing
      machine.dispatch({ type: "SIGN_SUCCESS" });
    }
  }, [isSigning, machine]);

  React.useEffect(() => {
    if (
      isPlacingBet &&
      !isApproving &&
      !isSigning &&
      machine.state.state === "placing"
    ) {
      // Already in placing state, no action needed
      return;
    }
    if (
      isPlacingBet &&
      !isApproving &&
      !isSigning &&
      machine.canTransition("PLACE_START")
    ) {
      machine.dispatch({ type: "PLACE_START" });
    }
  }, [isPlacingBet, isApproving, isSigning, machine]);

  // Handle transaction failures
  React.useEffect(() => {
    if (isTxFailed && machine.canTransition("PLACE_ERROR")) {
      console.log("Transaction failed, transitioning to error state");
      machine.dispatch({
        type: "PLACE_ERROR",
        error: "Transaction failed or was reverted",
      });
    }
  }, [isTxFailed, machine]);

  // Sync initial data -------------------------------------------------------
  React.useEffect(() => setOutcome(initialOutcome), [initialOutcome]);
  React.useEffect(() => setSelectedMarkets(relatedMarkets), [relatedMarkets]);

  // Calculations ------------------------------------------------------------
  const shareCalculations = React.useMemo(() => {
    if (!amount || selectedMarkets.length === 0)
      return { totalShares: 0, potentialWinnings: 0, breakdown: [] };

    const amountNum = Number.parseFloat(amount);
    const breakdown = selectedMarkets.map((m) => {
      const allocatedAmount = amountNum / selectedMarkets.length;
      const price = outcome === "yes" ? m.yesPrice : m.noPrice;
      const shares = allocatedAmount / price;
      return {
        platform: m.platform,
        allocatedAmount,
        price,
        shares,
        potentialWinnings: shares * 1,
      };
    });

    const totalShares = breakdown.reduce((s, b) => s + b.shares, 0);
    const potentialWinnings = breakdown.reduce(
      (s, b) => s + b.potentialWinnings,
      0
    );
    return { totalShares, potentialWinnings, breakdown };
  }, [amount, selectedMarkets, outcome]);

  const averagePrice = React.useMemo(() => {
    if (selectedMarkets.length === 0) return 0;
    const total = selectedMarkets.reduce(
      (s, m) => s + (outcome === "yes" ? m.yesPrice : m.noPrice),
      0
    );
    return total / selectedMarkets.length;
  }, [selectedMarkets, outcome]);

  // Handlers ----------------------------------------------------------------
  const handlePlaceBet = async () => {
    if (!amount || selectedMarkets.length === 0) {
      toast.error("Invalid bet", {
        description: "Please enter an amount and select at least one market.",
      });
      return;
    }

    if (!machine.canTransition("START_BET")) {
      toast.error("Cannot place bet", {
        description: "A bet is already in progress.",
      });
      return;
    }

    try {
      // Start the betting process
      machine.dispatch({ type: "START_BET" });

      // Map the textual outcome ("yes" | "no") to the numeric index expected by the contract
      const outcomeIndex: 0 | 1 = outcome === "yes" ? 0 : 1;

      const betData = {
        amount: Number.parseFloat(amount),
        outcomeIndex,
        strategy,
        markets: selectedMarkets,
        parentMarketId:
          currentMarket.marketsTableIdNotToBeConfusedWithTheActualExternalMarketMarketIdAkaTheParentMarketId,
        autoArbitrage,
        marketplaceId: "polybet",
        marketId: "nyc-mayor-2024",
      };

      await placeBet(betData);
      if (onPlaceBetProp) await onPlaceBetProp(betData);

      // Clear the form on success
      setAmount("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to place bet";
      machine.dispatch({ type: "PLACE_ERROR", error: errorMessage });
      toast.error("Bet failed", { description: errorMessage });
    }
  };

  // Render ------------------------------------------------------------------
  if (!isOpen) return null;

  const sidebarClasses = cn(
    "w-[420px] border-l border-foreground/10 bg-background",
    isSticky ? "" : "fixed right-0 top-0 z-50 shadow-2xl h-screen"
  );
  const contentClasses = cn(
    "pl-5 pr-0",
    !isSticky && "p-5 h-full overflow-y-auto"
  );

  const view = (() => {
    switch (machine.state.state) {
      case "approving":
        return <TransactionStateView state="approving" />;
      case "signing":
        return <TransactionStateView state="signing" />;
      case "placing":
        return <TransactionStateView state="placing" />;
      case "success":
        return machine.state.transactionHash ? (
          <SuccessView
            txHash={machine.state.transactionHash}
            onDismiss={machine.reset}
            onClose={onClose}
            isSticky={isSticky}
          />
        ) : null;
      case "error":
        return (
          <BettingFormView
            currentMarket={currentMarket}
            amount={amount}
            setAmount={setAmount}
            outcome={outcome}
            setOutcome={setOutcome}
            strategy={strategy}
            setStrategy={setStrategy}
            selectedMarkets={selectedMarkets}
            setSelectedMarkets={setSelectedMarkets}
            relatedMarkets={relatedMarkets}
            autoArbitrage={autoArbitrage}
            setAutoArbitrage={setAutoArbitrage}
            shareCalculations={shareCalculations}
            averagePrice={averagePrice}
            onPlaceBet={handlePlaceBet}
            isPlacingBet={false}
            isSticky={isSticky}
            onClose={onClose}
            error={machine.state.error}
          />
        );
      case "idle":
      default:
        return (
          <BettingFormView
            currentMarket={currentMarket}
            amount={amount}
            setAmount={setAmount}
            outcome={outcome}
            setOutcome={setOutcome}
            strategy={strategy}
            setStrategy={setStrategy}
            selectedMarkets={selectedMarkets}
            setSelectedMarkets={setSelectedMarkets}
            relatedMarkets={relatedMarkets}
            autoArbitrage={autoArbitrage}
            setAutoArbitrage={setAutoArbitrage}
            shareCalculations={shareCalculations}
            averagePrice={averagePrice}
            onPlaceBet={handlePlaceBet}
            isPlacingBet={machine.isProcessing()}
            isSticky={isSticky}
            onClose={onClose}
          />
        );
    }
  })();

  return (
    <motion.div
      className={sidebarClasses}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
    >
      <div className={contentClasses}>{view}</div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
export function BettingSidebar(props: BettingSidebarProps) {
  return (
    <BettingSidebarProvider>
      <BettingSidebarInner {...props} />
    </BettingSidebarProvider>
  );
}
