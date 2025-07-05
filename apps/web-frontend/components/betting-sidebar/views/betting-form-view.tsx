"use client";

import * as React from "react";
import { TrendingUp, Shield, Info, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { type Market } from "@/hooks/use-place-bet";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CalculatedBreakdown {
  platform: string;
  allocatedAmount: number;
  price: number;
  shares: number;
  potentialWinnings: number;
}

interface ShareCalculations {
  totalShares: number;
  potentialWinnings: number;
  breakdown: CalculatedBreakdown[];
}

interface BettingFormViewProps {
  currentMarket: {
    title: string;
    yesPrice: number;
    noPrice: number;
    platform: string;
  };
  amount: string;
  setAmount: (amt: string) => void;
  outcome: "yes" | "no";
  setOutcome: (o: "yes" | "no") => void;
  strategy: "maximize-shares" | "maximize-privacy";
  setStrategy: (strategy: "maximize-shares" | "maximize-privacy") => void;
  selectedMarkets: Market[];
  setSelectedMarkets: React.Dispatch<React.SetStateAction<Market[]>>;
  relatedMarkets: Market[];
  autoArbitrage: boolean;
  setAutoArbitrage: (enabled: boolean) => void;
  shareCalculations: ShareCalculations;
  averagePrice: number;
  onPlaceBet: () => void;
  isPlacingBet: boolean;
  isSticky: boolean;
  onClose?: () => void;
  error?: string | null;
}

// ---------------------------------------------------------------------------
// Component helpers
// ---------------------------------------------------------------------------
const SidebarHeader: React.FC<{ title: string; onClose?: () => void; isSticky: boolean }> = ({ title, onClose, isSticky }) => (
  <div className="mb-5">
    <div className="flex items-start justify-between">
      {!isSticky && (
        <h3 className="font-bold text-lg uppercase font-heading leading-tight pr-4">{title}</h3>
      )}
      {onClose && !isSticky && (
        <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2 -mt-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      )}
    </div>
  </div>
);

const PositionSelector: React.FC<{ outcome: "yes" | "no"; setOutcome: (o: "yes" | "no") => void; yesPrice: number; noPrice: number }> = ({ outcome, setOutcome, yesPrice, noPrice }) => (
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
            <p>Price represents the cost per share. If your position wins, each share pays $1.00.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant={outcome === "yes" ? "default" : "outline"}
        onClick={() => setOutcome("yes")}
        className={cn("flex flex-col items-center py-2 px-3 h-auto bg-transparent text-sm", outcome === "yes" && "bg-green-600 hover:bg-green-700 text-white")}
      >
        <span className="font-semibold">Yes</span>
        <span className="text-xs opacity-90">{(yesPrice * 100).toFixed(1)}¢</span>
      </Button>
      <Button
        variant={outcome === "no" ? "default" : "outline"}
        onClick={() => setOutcome("no")}
        className={cn("flex flex-col items-center py-2 px-3 h-auto bg-transparent text-sm", outcome === "no" && "bg-red-600 hover:bg-red-700 text-white")}
      >
        <span className="font-semibold">No</span>
        <span className="text-xs opacity-90">{(noPrice * 100).toFixed(1)}¢</span>
      </Button>
    </div>
  </div>
);

const BetCalculationCard: React.FC<{ calc: ShareCalculations; outcome: "yes" | "no"; amount: string }> = ({ calc, outcome, amount }) => {
  const profit = calc.potentialWinnings - Number.parseFloat(amount);
  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardContent className="p-3">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between items-center">
            <span>Shares:</span>
            <span className="text-primary font-heading font-semibold">{calc.totalShares.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>If {outcome.toUpperCase()} wins:</span>
            <span className="font-semibold text-green-600 font-heading">${calc.potentialWinnings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Profit:</span>
            <span className={cn("font-semibold font-heading", profit > 0 ? "text-green-600" : "text-red-600")}>${profit.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AmountInput: React.FC<{ amount: string; setAmount: (v: string) => void; calc: ShareCalculations; outcome: "yes" | "no"; hasSelectedMarkets: boolean }> = ({ amount, setAmount, calc, outcome, hasSelectedMarkets }) => (
  <div className="space-y-2">
    <Label htmlFor="amount" className="text-sm font-medium">
      Amount
    </Label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
      <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-8 h-9" />
    </div>
    <div className="flex gap-2">
      {[10, 25, 50, 100].map((preset) => (
        <Button key={preset} variant="outline" size="sm" onClick={() => setAmount(preset.toString())} className="flex-1 bg-transparent h-7 text-xs">
          ${preset}
        </Button>
      ))}
    </div>
    {amount && hasSelectedMarkets && <BetCalculationCard calc={calc} outcome={outcome} amount={amount} />}
  </div>
);

const AutoArbitrageToggle: React.FC<{ autoArbitrage: boolean; setAutoArbitrage: (v: boolean) => void }> = ({ autoArbitrage, setAutoArbitrage }) => (
  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-lg">
    <div className="flex items-center gap-2">
      <Zap className="h-4 w-4 text-amber-600" />
      <Label htmlFor="auto-arbitrage" className="text-sm font-semibold text-amber-900 cursor-pointer">
        Auto-Arbitrage
      </Label>
    </div>
    <Switch id="auto-arbitrage" checked={autoArbitrage} onCheckedChange={setAutoArbitrage} className="data-[state=checked]:bg-amber-500" />
  </div>
);

const StrategySelector: React.FC<{ strategy: "maximize-shares" | "maximize-privacy"; setStrategy: (s: "maximize-shares" | "maximize-privacy") => void }> = ({ strategy, setStrategy }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">Strategy</Label>
    <RadioGroup value={strategy} onValueChange={(v) => setStrategy(v as "maximize-shares" | "maximize-privacy")}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="maximize-shares" id="maximize-shares" />
        <Label htmlFor="maximize-shares" className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4" />
          Maximize Shares
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="maximize-privacy" id="maximize-privacy" disabled />
        <Label htmlFor="maximize-privacy" className="flex items-center gap-2 text-sm text-muted-foreground">
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

const MarketCard: React.FC<{ market: Market; isSelected: boolean; onToggle: (checked: boolean) => void; outcome: "yes" | "no" }> = ({ market, isSelected, onToggle, outcome }) => (
  <Card className="p-2.5 bg-accent/30 border-foreground/10">
    <div className="flex items-start space-x-2">
      <Checkbox id={`${market.id}-${market.marketplaceId}`} checked={isSelected} onCheckedChange={onToggle} className="mt-0.5" />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${market.id}-${market.marketplaceId}`} className="text-sm font-medium cursor-pointer">
            {market.platform}
          </Label>
          <Badge
            variant="secondary"
            className={cn("text-xs px-2 py-0.5", outcome === "yes" ? "bg-green-600/15 text-green-700" : "bg-red-600/15 text-red-700")}
          >
            {outcome === "yes" ? `${(market.yesPrice * 100).toFixed(1)}¢` : `${(market.noPrice * 100).toFixed(1)}¢`}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1">{market.title}</p>
      </div>
    </div>
  </Card>
);

const MarketSelector: React.FC<{ markets: Market[]; selectedMarkets: Market[]; onToggle: (market: Market, checked: boolean) => void; outcome: "yes" | "no"; averagePrice: number }> = ({ markets, selectedMarkets, onToggle, outcome, averagePrice }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium">Cross-Platform Markets</Label>
      <Badge variant="outline" className="text-xs">
        Avg: {(averagePrice * 100).toFixed(1)}¢
      </Badge>
    </div>
    <div className="text-xs text-muted-foreground mb-2">Select platforms to distribute your bet</div>
    <div className="space-y-2">
      {markets.map((market) => (
        <MarketCard
          key={`${market.id}-${market.marketplaceId}`}
          market={market}
          isSelected={selectedMarkets.some((m) => m.id === market.id && m.marketplaceId === market.marketplaceId)}
          onToggle={(checked) => onToggle(market, checked)}
          outcome={outcome}
        />
      ))}
    </div>
  </div>
);

const PlaceBetButton: React.FC<{ onPlaceBet: () => void; isDisabled: boolean; isLoading: boolean; outcome: "yes" | "no"; amount: string }> = ({ onPlaceBet, isDisabled, isLoading, outcome, amount }) => (
  <div className="pt-4 border-t border-foreground/10 space-y-3">
    <Button onClick={onPlaceBet} disabled={isDisabled} className={cn("w-full h-11", outcome === "yes" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white")}>
      {isLoading ? "Placing Bet..." : `Buy ${outcome.toUpperCase()} - $${amount || "0.00"}`}
    </Button>
    <p className="text-xs text-muted-foreground text-center leading-tight">Bets processed through Oasis Network for privacy</p>
  </div>
);

// ---------------------------------------------------------------------------
// Main BettingFormView component
// ---------------------------------------------------------------------------
export const BettingFormView: React.FC<BettingFormViewProps> = (props) => {
  const {
    currentMarket,
    amount,
    setAmount,
    outcome,
    setOutcome,
    strategy,
    setStrategy,
    selectedMarkets,
    setSelectedMarkets,
    relatedMarkets,
    autoArbitrage,
    setAutoArbitrage,
    shareCalculations,
    averagePrice,
    onPlaceBet,
    isPlacingBet,
    isSticky,
    onClose,
    error,
  } = props;

  // Handlers ---------------------------------------------------------------
  const handleMarketToggle = (market: Market, checked: boolean) => {
    setSelectedMarkets((prev) => {
      if (checked) {
        if (prev.some((m) => m.id === market.id && m.marketplaceId === market.marketplaceId)) {
          return prev;
        }
        return [...prev, market];
      }
      return prev.filter((m) => !(m.id === market.id && m.marketplaceId === market.marketplaceId));
    });
  };

  return (
    <>
      <SidebarHeader title={currentMarket.title} onClose={onClose} isSticky={isSticky} />

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <PositionSelector outcome={outcome} setOutcome={setOutcome} yesPrice={currentMarket.yesPrice} noPrice={currentMarket.noPrice} />

        <Separator />

        <AmountInput amount={amount} setAmount={setAmount} calc={shareCalculations} outcome={outcome} hasSelectedMarkets={selectedMarkets.length > 0} />

        <AutoArbitrageToggle autoArbitrage={autoArbitrage} setAutoArbitrage={setAutoArbitrage} />

        <StrategySelector strategy={strategy} setStrategy={setStrategy} />

        <Separator />

        <MarketSelector markets={relatedMarkets} selectedMarkets={selectedMarkets} onToggle={handleMarketToggle} outcome={outcome} averagePrice={averagePrice} />

        <PlaceBetButton onPlaceBet={onPlaceBet} isDisabled={!amount || selectedMarkets.length === 0 || isPlacingBet} isLoading={isPlacingBet} outcome={outcome} amount={amount} />
      </div>
    </>
  );
}; 