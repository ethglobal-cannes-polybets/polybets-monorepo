"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Loader2,
  Droplets,
  Trophy,
  Zap,
  ArrowRight,
  Scale,
  ShieldCheck,
  ShoppingBasketIcon as Basketball,
  PlusCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useActiveBetSlips } from "@/hooks/use-betslips";
import type { LucideIcon } from "lucide-react";
import { formatUnits } from "viem";

// Mock data for betslips - updated with higher incremental returns
const mockBetSlips = {
  processing: [
    {
      id: "bs-001",
      market: "Israel x Hamas ceasefire by July 15?",
      category: "Geopolitics",
      icon: ShieldCheck,
      position: "Yes",
      totalCost: 250,
      totalShares: 735.29,
      avgPrice: 34.0,
      autoArbitrage: false,
      createdAt: "2024-07-02T10:30:00Z",
    },
  ],
  open: [
    {
      id: "bs-003",
      market: "Will Zohran Mamdani win the NYC Mayoral Election?",
      category: "Politics",
      icon: Trophy,
      position: "Yes",
      totalCost: 100,
      totalShares: 142.15,
      avgPrice: 70.4,
      autoArbitrage: true,
      arbitrageHistory: [
        {
          timestamp: "2024-07-01T14:00:00Z",
          cause: "Manifold resolved YES",
          action:
            "Increased exposure on Limitless, acquiring 50 shares at an average of 65¢.",
          incrementalReturn: 17.5, // (100 - 65) * 50 shares
        },
      ],
      bets: [
        {
          platform: "Polymarket",
          marketTitle: "NYC Mayor 2024 - Zohran Mamdani to win",
          cost: 35.71,
          price: 69.8,
          shares: 51.16,
        },
        {
          platform: "Limitless",
          marketTitle: "New York City Mayor Election - Mamdani Victory",
          cost: 35.71,
          price: 71.2,
          shares: 50.15,
        },
        {
          platform: "Manifold",
          marketTitle: "Will Zohran Mamdani become NYC Mayor?",
          cost: 28.57,
          price: 68.5,
          shares: 41.71,
        },
      ],
      createdAt: "2024-06-28T09:15:00Z",
    },
    {
      id: "bs-006",
      market: "Lakers to win the 2025 NBA Championship?",
      category: "Sports",
      icon: Basketball,
      position: "Yes",
      totalCost: 500,
      totalShares: 2500,
      avgPrice: 20.0,
      autoArbitrage: true,
      arbitrageHistory: [
        {
          timestamp: "2024-07-03T10:00:00Z",
          cause: "Kalshi resolved YES",
          action:
            "Increased exposure on Polymarket, acquiring 100 shares at an average of 60¢.",
          incrementalReturn: 40.0,
        },
      ],
      bets: [
        {
          platform: "Polymarket",
          marketTitle: "Lakers win 2025 title",
          cost: 200,
          price: 20,
          shares: 1000,
        },
        {
          platform: "Kalshi",
          marketTitle: "LAL2025",
          cost: 300,
          price: 20,
          shares: 1500,
        },
      ],
      createdAt: "2024-06-25T11:00:00Z",
    },
  ],
  closed: [
    {
      id: "bs-004",
      market: "Will Bitcoin reach $70k by end of June?",
      category: "Crypto",
      icon: Zap,
      position: "Yes",
      totalCost: 400,
      totalShares: 615.38,
      avgPrice: 65.0,
      finalValue: 0,
      profit: -400,
      autoArbitrage: false,
      createdAt: "2024-06-01T12:00:00Z",
      closedAt: "2024-06-30T23:59:00Z",
    },
    {
      id: "bs-005",
      market: "Will 'Furiosa' gross over $100M domestic opening weekend?",
      category: "Movies",
      icon: Droplets,
      position: "Yes",
      totalCost: 200,
      totalShares: 500,
      avgPrice: 40.0,
      finalValue: 500,
      profit: 300,
      autoArbitrage: true,
      arbitrageHistory: [
        {
          timestamp: "2024-05-27T11:00:00Z",
          cause: "Kalshi resolved YES",
          action:
            "Increased exposure on Polymarket, acquiring 52 shares at an average of 70¢.",
          incrementalReturn: 15.6,
        },
      ],
      bets: [
        {
          platform: "Polymarket",
          marketTitle: "'Furiosa' Opening Weekend > $100M",
          cost: 120,
          price: 42.0,
          shares: 285.71,
          status: "won",
        },
        {
          platform: "Kalshi",
          marketTitle: "FURDOMBOX > 100",
          cost: 80,
          price: 38.0,
          shares: 210.53,
          status: "won",
        },
      ],
      createdAt: "2024-05-15T14:20:00Z",
      closedAt: "2024-05-27T18:30:00Z",
    },
  ],
};

const statusConfig = {
  processing: {
    label: "Processing",
    icon: Loader2,
    color: "bg-yellow-500",
    description: "Your bets are currently being routed to the platforms.",
  },
  open: {
    label: "Open",
    icon: Clock,
    color: "bg-blue-500",
    description: "These markets are live and have not yet resolved.",
  },
  closed: {
    label: "Closed",
    icon: CheckCircle,
    color: "bg-gray-500",
    description: "These markets have resolved and are final.",
  },
};

// -----------------------------
// Types
// -----------------------------

interface Bet {
  platform: string;
  marketTitle: string;
  cost: number;
  price: number;
  shares: number;
  status?: string;
}

interface ArbitrageEvent {
  timestamp: string;
  cause: string;
  action: string;
  incrementalReturn: number;
}

interface BetSlipMock {
  id: string;
  market: string;
  category: string;
  icon: LucideIcon;
  position: string;
  totalCost: number;
  totalShares: number;
  avgPrice: number;
  autoArbitrage: boolean;
  arbitrageHistory?: ArbitrageEvent[];
  bets?: Bet[];
  profit?: number;
  finalValue?: number;
  createdAt: string;
  closedAt?: string;
}

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState("open");

  // Fetch on-chain betslips for the authenticated user (PolyBet contract)
  const { betSlips: onChainBetSlips, error: betSlipsError } =
    useActiveBetSlips();

  // For now we simply log the results – UI mapping will follow once the
  // contract data schema is finalised.
  useEffect(() => {
    if (onChainBetSlips.length > 0) {
      console.log("onChainBetSlips", onChainBetSlips);
      console.table(onChainBetSlips as ReadonlyArray<unknown>);
    }
    if (betSlipsError) {
      // eslint-disable-next-line no-console
      console.error("Failed to load betSlips", betSlipsError);
    }
  }, [onChainBetSlips, betSlipsError]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "geopolitics":
        return "text-red-600";
      case "sports":
        return "text-orange-600";
      case "politics":
        return "text-blue-600";
      case "crypto":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const renderBetSlip = (betSlip: BetSlipMock, status: string) => {
    const CategoryIcon = betSlip.icon;
    const bets = betSlip.bets ?? [];
    const isProfitable = (betSlip.profit ?? 0) > 0;

    return (
      <Card key={betSlip.id} className="mb-6 border-foreground/10">
        <CardHeader className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-xs border-foreground/20 uppercase"
                >
                  <CategoryIcon
                    className={`w-4 h-4 mr-1.5 ${getCategoryColor(betSlip.category)}`}
                  />
                  {betSlip.category}
                </Badge>
                {betSlip.autoArbitrage && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-primary/10 text-primary border-primary/20 uppercase"
                  >
                    <Scale className="w-4 h-4 mr-1.5" />
                    Auto-Arbitrage On
                  </Badge>
                )}
              </div>
              <Link href={`/market/${slugify(betSlip.market)}`} passHref>
                <CardTitle className="text-lg font-bold uppercase font-sans hover:underline">
                  {betSlip.market}
                </CardTitle>
              </Link>
              <div className="text-sm text-muted-foreground">
                Position:{" "}
                <span
                  className={`font-bold ${betSlip.position === "Yes" ? "text-green-600" : "text-red-600"}`}
                >
                  {betSlip.position.toUpperCase()}
                </span>
                <span className="ml-2 font-heading">
                  @{betSlip.avgPrice.toFixed(1)}¢ avg.
                </span>
              </div>
            </div>
            <div className="text-right pl-4">
              <div className="text-sm text-muted-foreground uppercase">
                Total Cost
              </div>
              <div className="font-bold text-lg font-heading">
                {formatCurrency(betSlip.totalCost)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-3">
            {bets.map((bet: Bet, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-accent/50 border border-foreground/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-primary">
                    {bet.platform.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{bet.platform}</div>
                    <div className="text-sm text-muted-foreground">
                      {bet.marketTitle}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-heading">
                    {bet.shares.toFixed(2)} shares
                  </div>
                  <div className="text-sm text-muted-foreground font-heading">
                    @ {bet.price.toFixed(1)}¢
                  </div>
                </div>
              </div>
            ))}
          </div>
          {betSlip.autoArbitrage &&
            (betSlip.arbitrageHistory?.length ?? 0) > 0 && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-foreground/10">
                  <AccordionTrigger className="text-sm font-bold text-primary hover:no-underline uppercase">
                    Show Arbitrage History (
                    {betSlip.arbitrageHistory?.length ?? 0})
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-3">
                      {(betSlip.arbitrageHistory ?? []).map(
                        (event: ArbitrageEvent, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 text-sm p-4 bg-accent/50 border border-foreground/10"
                          >
                            <Scale className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <p className="font-medium text-foreground leading-relaxed">
                                {event.cause} → {event.action}
                              </p>
                              <div className="flex items-center gap-3 pt-3 mt-3 border-t border-foreground/10">
                                <PlusCircle className="w-5 h-5 text-green-600" />
                                <div>
                                  <p className="font-bold text-foreground font-heading">
                                    +{formatCurrency(event.incrementalReturn)}{" "}
                                    Incremental Return
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Potential profit to be realized upon final
                                    resolution.
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground text-right pt-1">
                                {formatDate(event.timestamp)}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground uppercase">
              {status === "closed" ? "Result" : "Potential Payout"}
            </div>
            {status === "closed" ? (
              <div
                className={`font-bold flex items-center gap-1 font-heading ${
                  isProfitable ? "text-green-600" : "text-red-600"
                }`}
              >
                {isProfitable ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {isProfitable ? "+" : ""}
                {formatCurrency(betSlip.profit ?? 0)}
              </div>
            ) : (
              <div className="font-bold text-primary font-heading">
                {formatCurrency(betSlip.totalShares)}
              </div>
            )}
          </div>
        </CardContent>
        {(status === "open" || (status === "closed" && isProfitable)) && (
          <CardFooter className="px-5 py-4 border-t border-foreground/10">
            <div className="flex items-center justify-end w-full gap-3">
              {status === "open" && (
                <>
                  <Button
                    variant="outline"
                    className="bg-transparent uppercase"
                  >
                    Sell Shares
                  </Button>
                  <Button className="uppercase">Buy More</Button>
                </>
              )}
              {status === "closed" && isProfitable && (
                <Button className="w-full bg-green-600 text-white hover:bg-green-700 uppercase">
                  Redeem Winnings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    );
  };

  /* --------------------------------------------------
   * Merge on-chain betslips into the display data
   * -------------------------------------------------- */
  const onChainDisplaySlips: BetSlipMock[] = onChainBetSlips.map((slip) => {
    // `initialCollateral` and `status` are the only reliable fields for now
    // The rest is placeholder data so the card component can render.
    return {
      id: slip.id.toString(),
      market: `On-chain BetSlip #${slip.id.toString()}`,
      category: "On-chain",
      icon: ShieldCheck,
      position: "Yes",
      totalCost: Number(formatUnits(slip.initialCollateral, 6)),
      totalShares: Number(formatUnits(slip.initialCollateral, 6)),
      avgPrice: 100,
      autoArbitrage: false,
      createdAt: new Date().toISOString(),
    } satisfies BetSlipMock;
  });

  const combinedBetSlips = {
    ...mockBetSlips,
    open: [...onChainDisplaySlips, ...mockBetSlips.open] as BetSlipMock[],
  } as typeof mockBetSlips & { open: BetSlipMock[] };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      {/* Profile Header */}
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="w-16 h-16 border-2 border-foreground/10">
          <AvatarImage src="/placeholder.svg?height=64&width=64" />
          <AvatarFallback className="bg-primary text-primary-foreground font-heading">
            JD
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading uppercase">
            John Doe
          </h1>
          <p className="text-muted-foreground">Member since Jan 2024</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-foreground/10 p-5">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
            P&L
          </CardTitle>
          <p className="text-2xl font-bold text-green-600 font-heading">
            +{formatCurrency(1280)}
          </p>
        </Card>
        <Card className="border-foreground/10 p-5">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
            Volume
          </CardTitle>
          <p className="text-2xl font-bold font-heading">
            {formatCurrency(12450)}
          </p>
        </Card>
        <Card className="border-foreground/10 p-5 col-span-2 md:col-span-1">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
            Open Positions
          </CardTitle>
          <p className="text-2xl font-bold font-heading">
            {combinedBetSlips.open.length}
          </p>
        </Card>
      </div>

      {/* BetSlips Section */}
      <div>
        <h2 className="text-xl font-bold mb-4 px-2 font-heading uppercase">
          Your Betslips
        </h2>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-accent border border-foreground/10 p-1 mb-6">
            {Object.entries(statusConfig).map(([key, config]) => {
              const count =
                combinedBetSlips[key as keyof typeof combinedBetSlips].length;
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold flex items-center gap-2 uppercase"
                >
                  <config.icon
                    className={`w-4 h-4 ${key === "processing" && activeTab === key ? "animate-spin" : ""}`}
                  />
                  {config.label}
                  <span className="text-xs font-normal bg-background text-muted-foreground w-5 h-5 flex items-center justify-center rounded-full font-heading">
                    {count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {Object.entries(statusConfig).map(([key]) => (
            <TabsContent key={key} value={key}>
              {combinedBetSlips[key as keyof typeof combinedBetSlips].length ===
              0 ? (
                <div className="text-center py-16">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-bold mb-2 uppercase">
                    No {key} betslips
                  </h3>
                  <p className="text-muted-foreground">
                    Your {key} positions will appear here.
                  </p>
                </div>
              ) : (
                <div>
                  {(
                    combinedBetSlips[
                      key as keyof typeof combinedBetSlips
                    ] as BetSlipMock[]
                  ).map((betSlip) => renderBetSlip(betSlip, key))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
