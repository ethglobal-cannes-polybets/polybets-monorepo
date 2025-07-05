"use client";

import * as React from "react";
import { TrendingUp, Shield, Info, Zap, X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

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

interface BettingSidebarProps {
  currentMarket: {
    title: string;
    yesPrice: number;
    noPrice: number;
    platform: string;
  };
  initialOutcome: "yes" | "no";
  relatedMarkets: Market[];
  onPlaceBet: (betData: {
    amount: number;
    outcome: "yes" | "no";
    strategy: string;
    markets: Market[];
    marketplaceId: string;
    marketId: string;
    autoArbitrage: boolean;
  }) => Promise<void>;
  onClose?: () => void;
  isSticky?: boolean;
  isOpen?: boolean;
}

interface BetCalculations {
  totalShares: number;
  potentialWinnings: number;
  breakdown: Array<{
    platform: string;
    allocatedAmount: number;
    price: number;
    shares: number;
    potentialWinnings: number;
  }>;
}

// Header Component
const SidebarHeader: React.FC<{
  title: string;
  onClose?: () => void;
  isSticky: boolean;
}> = ({ title, onClose, isSticky }) => (
  <div className="mb-5">
    <div className="flex items-start justify-between">
      {!isSticky && (
        <h3 className="font-bold text-lg uppercase font-heading leading-tight pr-4">
          {title}
        </h3>
      )}
      {onClose && !isSticky && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="-mr-2 -mt-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      )}
    </div>
  </div>
);

// Position Selection Component
const PositionSelector: React.FC<{
  outcome: "yes" | "no";
  onOutcomeChange: (outcome: "yes" | "no") => void;
  yesPrice: number;
  noPrice: number;
}> = ({ outcome, onOutcomeChange, yesPrice, noPrice }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium">Position</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Info className="h-4 w-4" />
              <span className="sr-only">Price info</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Price represents the cost per share. If your position wins, each
              share pays $1.00.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant={outcome === "yes" ? "default" : "outline"}
        onClick={() => onOutcomeChange("yes")}
        className={cn(
          "flex flex-col items-center py-2 px-3 h-auto bg-transparent text-sm",
          outcome === "yes" && "bg-green-600 hover:bg-green-700 text-white"
        )}
      >
        <span className="font-semibold">Yes</span>
        <span className="text-xs opacity-90">
          {(yesPrice * 100).toFixed(1)}¢
        </span>
      </Button>
      <Button
        variant={outcome === "no" ? "default" : "outline"}
        onClick={() => onOutcomeChange("no")}
        className={cn(
          "flex flex-col items-center py-2 px-3 h-auto bg-transparent text-sm",
          outcome === "no" && "bg-red-600 hover:bg-red-700 text-white"
        )}
      >
        <span className="font-semibold">No</span>
        <span className="text-xs opacity-90">
          {(noPrice * 100).toFixed(1)}¢
        </span>
      </Button>
    </div>
  </div>
);

// Amount Input Component
const AmountInput: React.FC<{
  amount: string;
  onAmountChange: (amount: string) => void;
  calculations: BetCalculations;
  outcome: "yes" | "no";
  hasSelectedMarkets: boolean;
}> = ({
  amount,
  onAmountChange,
  calculations,
  outcome,
  hasSelectedMarkets,
}) => (
  <div className="space-y-2">
    <Label htmlFor="amount" className="text-sm font-medium">
      Amount
    </Label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        $
      </span>
      <Input
        id="amount"
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        className="pl-8 h-9"
      />
    </div>
    <div className="flex gap-2">
      {[10, 25, 50, 100].map((preset) => (
        <Button
          key={preset}
          variant="outline"
          size="sm"
          onClick={() => onAmountChange(preset.toString())}
          className="flex-1 bg-transparent h-7 text-xs"
        >
          ${preset}
        </Button>
      ))}
    </div>
    {amount && hasSelectedMarkets && (
      <BetCalculationCard
        calculations={calculations}
        outcome={outcome}
        amount={amount}
      />
    )}
  </div>
);

// Bet Calculation Card Component
const BetCalculationCard: React.FC<{
  calculations: BetCalculations;
  outcome: "yes" | "no";
  amount: string;
}> = ({ calculations, outcome, amount }) => {
  const profit = calculations.potentialWinnings - Number.parseFloat(amount);

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardContent className="p-3">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between items-center">
            <span>Shares:</span>
            <span className="text-primary font-heading font-semibold">
              {calculations.totalShares.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>If {outcome.toUpperCase()} wins:</span>
            <span className="font-semibold text-green-600 font-heading">
              ${calculations.potentialWinnings.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Profit:</span>
            <span
              className={cn(
                "font-semibold font-heading",
                profit > 0 ? "text-green-600" : "text-red-600"
              )}
            >
              ${profit.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Auto-Arbitrage Toggle Component
const AutoArbitrageToggle: React.FC<{
  autoArbitrage: boolean;
  onToggle: (enabled: boolean) => void;
}> = ({ autoArbitrage, onToggle }) => (
  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-lg">
    <div className="flex items-center gap-2">
      <Zap className="h-4 w-4 text-amber-600" />
      <Label
        htmlFor="auto-arbitrage"
        className="text-sm font-semibold text-amber-900 cursor-pointer"
      >
        Auto-Arbitrage
      </Label>
    </div>
    <Switch
      id="auto-arbitrage"
      checked={autoArbitrage}
      onCheckedChange={onToggle}
      className="data-[state=checked]:bg-amber-500"
    />
  </div>
);

// Strategy Selection Component
const StrategySelector: React.FC<{
  strategy: string;
  onStrategyChange: (strategy: string) => void;
}> = ({ strategy, onStrategyChange }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">Strategy</Label>
    <RadioGroup value={strategy} onValueChange={onStrategyChange}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="maximize-shares" id="maximize-shares" />
        <Label
          htmlFor="maximize-shares"
          className="flex items-center gap-2 text-sm"
        >
          <TrendingUp className="h-4 w-4" />
          Maximize Shares
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem
          value="maximize-privacy"
          id="maximize-privacy"
          disabled
        />
        <Label
          htmlFor="maximize-privacy"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Shield className="h-4 w-4" />
          Maximize Privacy
          <Badge variant="outline" className="text-xs">
            Soon
          </Badge>
        </Label>
      </div>
    </RadioGroup>
  </div>
);

// Market Selection Component
const MarketSelector: React.FC<{
  markets: Market[];
  selectedMarkets: Market[];
  onMarketToggle: (market: Market, checked: boolean) => void;
  outcome: "yes" | "no";
  averagePrice: number;
}> = ({ markets, selectedMarkets, onMarketToggle, outcome, averagePrice }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium">Cross-Platform Markets</Label>
      <Badge variant="outline" className="text-xs">
        Avg: {(averagePrice * 100).toFixed(1)}¢
      </Badge>
    </div>
    <div className="text-xs text-muted-foreground mb-2">
      Select platforms to distribute your bet
    </div>
    <div className="space-y-2">
      {markets.map((market) => {
        return (
          <MarketCard
            key={`${market.id}-${market.marketplaceId}`}
            market={market}
            isSelected={selectedMarkets.some(
              (m) => m.id === market.id && m.marketplaceId === market.marketplaceId
            )}
            onToggle={(checked) => onMarketToggle(market, checked)}
            outcome={outcome}
          />
        );
      })}
    </div>
  </div>
);

// Individual Market Card Component
const MarketCard: React.FC<{
  market: Market;
  isSelected: boolean;
  onToggle: (checked: boolean) => void;
  outcome: "yes" | "no";
}> = ({ market, isSelected, onToggle, outcome }) => (
  <Card className="p-2.5 bg-accent/30 border-foreground/10">
    <div className="flex items-start space-x-2">
      <Checkbox
        id={`${market.id}-${market.marketplaceId}`}
        checked={isSelected}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={`${market.id}-${market.marketplaceId}`}
            className="text-sm font-medium cursor-pointer"
          >
            {market.platform}
          </Label>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs px-2 py-0.5",
              outcome === "yes"
                ? "bg-green-600/15 text-green-700"
                : "bg-red-600/15 text-red-700"
            )}
          >
            {outcome === "yes"
              ? `${(market.yesPrice * 100).toFixed(1)}¢`
              : `${(market.noPrice * 100).toFixed(1)}¢`}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {market.title}
        </p>
      </div>
    </div>
  </Card>
);

// Place Bet Button Component
const PlaceBetButton: React.FC<{
  onPlaceBet: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  outcome: "yes" | "no";
  amount: string;
}> = ({ onPlaceBet, isDisabled, isLoading, outcome, amount }) => (
  <div className="pt-4 border-t border-foreground/10 space-y-3">
    <Button
      onClick={onPlaceBet}
      disabled={isDisabled}
      className={cn(
        "w-full h-11",
        outcome === "yes"
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-red-600 hover:bg-red-700 text-white"
      )}
    >
      {isLoading
        ? "Placing Bet..."
        : `Buy ${outcome.toUpperCase()} - $${amount || "0.00"}`}
    </Button>
    <p className="text-xs text-muted-foreground text-center leading-tight">
      Bets processed through Oasis Network for privacy
    </p>
  </div>
);

// Main Betting Sidebar Component
export function BettingSidebar({
  currentMarket,
  initialOutcome,
  relatedMarkets,
  onPlaceBet,
  onClose,
  isSticky = false,
  isOpen = true,
}: BettingSidebarProps) {
  const { toast } = useToast();
  const [amount, setAmount] = React.useState("");
  const [outcome, setOutcome] = React.useState<"yes" | "no">(initialOutcome);
  const [strategy, setStrategy] = React.useState("maximize-shares");
  const [selectedMarkets, setSelectedMarkets] = React.useState<Market[]>([]);
  const [isPlacingBet, setIsPlacingBet] = React.useState(false);
  const [autoArbitrage, setAutoArbitrage] = React.useState(true);

  // Initialize state
  React.useEffect(() => {
    setOutcome(initialOutcome);
  }, [initialOutcome]);

  React.useEffect(() => {
    setSelectedMarkets(relatedMarkets);
  }, [relatedMarkets]);

  // Event handlers
  const handleMarketToggle = (market: Market, checked: boolean) => {
    setSelectedMarkets((prev) => {
      if (checked) {
        // Add market only if it is not already selected, identified by both id and marketplaceId
        if (
          prev.some(
            (m) =>
              m.id === market.id && m.marketplaceId === market.marketplaceId
          )
        ) {
          return prev;
        }
        return [...prev, market];
      }

      // Remove market based on both id and marketplaceId
      return prev.filter(
        (m) =>
          !(m.id === market.id && m.marketplaceId === market.marketplaceId)
      );
    });
  };

  const handlePlaceBet = async () => {
    if (!amount || selectedMarkets.length === 0) {
      toast({
        title: "Invalid bet",
        description: "Please enter an amount and select at least one market.",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingBet(true);
    try {
      await onPlaceBet({
        amount: Number.parseFloat(amount),
        outcome,
        strategy,
        markets: selectedMarkets,
        marketplaceId: "polymarket",
        marketId: "nyc-mayor-2024",
        autoArbitrage,
      });

      toast({
        title: "Bet placed successfully",
        description: `Your ${outcome.toUpperCase()} bet is being processed through the Oasis network.`,
      });

      setAmount("");
      if (onClose && !isSticky) {
        onClose();
      }
    } catch {
      toast({
        title: "Bet failed",
        description: "There was an error placing your bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Calculations
  const shareCalculations = React.useMemo((): BetCalculations => {
    if (!amount || selectedMarkets.length === 0) {
      return { totalShares: 0, potentialWinnings: 0, breakdown: [] };
    }

    const amountNum = Number.parseFloat(amount);
    const breakdown = selectedMarkets.map((market) => {
      const allocatedAmount = amountNum / selectedMarkets.length;
      const price = outcome === "yes" ? market.yesPrice : market.noPrice;
      const shares = allocatedAmount / price;
      const potentialWinnings = shares * 1.0;
      return {
        platform: market.platform,
        allocatedAmount,
        price,
        shares,
        potentialWinnings,
      };
    });

    const totalShares = breakdown.reduce((sum, item) => sum + item.shares, 0);
    const potentialWinnings = breakdown.reduce(
      (sum, item) => sum + item.potentialWinnings,
      0
    );

    return { totalShares, potentialWinnings, breakdown };
  }, [amount, selectedMarkets, outcome]);

  const averagePrice = React.useMemo(() => {
    if (selectedMarkets.length === 0) return 0;
    const totalPrice = selectedMarkets.reduce(
      (sum, market) =>
        sum + (outcome === "yes" ? market.yesPrice : market.noPrice),
      0
    );
    return totalPrice / selectedMarkets.length;
  }, [selectedMarkets, outcome]);

  if (!isOpen) return null;

  const sidebarClasses = cn(
    "w-[420px] border-l border-foreground/10 bg-background",
    isSticky ? "" : "fixed right-0 top-0 z-50 shadow-2xl h-screen"
  );

  const contentClasses = cn(
    "pl-5 pr-0",
    !isSticky && "p-5 h-full overflow-y-auto"
  );

  return (
    <motion.div
      className={sidebarClasses}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
    >
      <div className={contentClasses}>
        <SidebarHeader
          title={currentMarket.title}
          onClose={onClose}
          isSticky={isSticky}
        />

        <div className="space-y-4">
          <PositionSelector
            outcome={outcome}
            onOutcomeChange={setOutcome}
            yesPrice={currentMarket.yesPrice}
            noPrice={currentMarket.noPrice}
          />

          <Separator />

          <AmountInput
            amount={amount}
            onAmountChange={setAmount}
            calculations={shareCalculations}
            outcome={outcome}
            hasSelectedMarkets={selectedMarkets.length > 0}
          />

          <AutoArbitrageToggle
            autoArbitrage={autoArbitrage}
            onToggle={setAutoArbitrage}
          />

          <StrategySelector
            strategy={strategy}
            onStrategyChange={setStrategy}
          />

          <Separator />

          <MarketSelector
            markets={relatedMarkets}
            selectedMarkets={selectedMarkets}
            onMarketToggle={handleMarketToggle}
            outcome={outcome}
            averagePrice={averagePrice}
          />

          <PlaceBetButton
            onPlaceBet={handlePlaceBet}
            isDisabled={!amount || selectedMarkets.length === 0 || isPlacingBet}
            isLoading={isPlacingBet}
            outcome={outcome}
            amount={amount}
          />
        </div>
      </div>
    </motion.div>
  );
}
