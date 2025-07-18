"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, Loader2 } from "lucide-react";
import { useActiveBetSlips } from "@/hooks/use-betslips";

// BetSlipStatus enum matching the smart contract
enum BetSlipStatus {
  Pending = 0,
  Processing = 1,
  Placed = 2,
  Selling = 3,
  Failed = 4,
  Closed = 5,
}

const statusConfig = {
  processing: {
    label: "Processing",
    icon: Loader2,
  },
  open: {
    label: "Open",
    icon: Clock,
  },
  closed: {
    label: "Closed",
    icon: CheckCircle,
  },
} as const;

/* ---------------------------------------------
 * Types derived from on-chain BetSlip
 * -------------------------------------------*/

type OnChainSlip = ReturnType<typeof useActiveBetSlips>["betSlips"][number];

// Additional fields we expect from the enriched hook
interface EnrichedSlipStruct {
  status: bigint;
  outcomeIndex: bigint;
  initialCollateral: bigint;
  totalShares?: number;
  marketsMeta?: PairMeta[];
  parentMarket?: MarketRow | null;
  marketplace?: MarketplaceRow | null;
  proxiedBetsData?: ProxiedBetData[];
}

interface PlatformInfo {
  marketplace: string;
  question: string;
  shares?: number;
}

interface TransformedSlip {
  id: string;
  market: string;
  statusGroup: "processing" | "open" | "closed";
  position: "Yes" | "No";
  totalCost: number;
  totalShares?: number;
  avgPrice?: number;
  marketplaceName: string;
  platforms: PlatformInfo[];
  failed: boolean;
}

// Minimal local type aliases to satisfy compiler without bringing full DB types
type MarketRow = { common_question?: string };
type MarketplaceRow = { id?: number; name?: string };
type PairMeta = { market: MarketRow; marketplace: MarketplaceRow | null };

// Minimal representation of on-chain ProxiedBet (subset of fields we need)
interface ProxiedBetData {
  marketplaceId: bigint;
  marketId: bigint;
  sharesBought: bigint;
  sharesSold: bigint;
  // Allow other fields but we only care for the above
  [key: string]: unknown;
}

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<"processing" | "open" | "closed">(
    "open"
  );

  // Fetch on-chain betslips for the authenticated user (PolyBet contract)
  const { betSlips: onChainBetSlips, error: betSlipsError } =
    useActiveBetSlips();

  useEffect(() => {
    if (betSlipsError) {
      // eslint-disable-next-line no-console
      console.error("Failed to load betSlips", betSlipsError);
    }
  }, [betSlipsError]);

  /* --------------------------------------------------
   * Transform on-chain slips → UI model
   * -------------------------------------------------- */

  const transformed = useMemo<TransformedSlip[]>(() => {
    return (onChainBetSlips as OnChainSlip[]).flatMap((raw) => {
      const slip = raw as OnChainSlip & EnrichedSlipStruct;

      // Basic runtime check to ensure required fields are present
      if (
        typeof slip.status === "undefined" ||
        typeof slip.initialCollateral === "undefined"
      ) {
        return [];
      }

      // Map status enum ⇒ UI group
      const statusEnum = Number(slip.status);
      let statusGroup: "processing" | "open" | "closed";
      if (
        statusEnum === BetSlipStatus.Pending ||
        statusEnum === BetSlipStatus.Processing
      ) {
        statusGroup = "processing";
      } else if (
        statusEnum === BetSlipStatus.Selling ||
        statusEnum === BetSlipStatus.Placed
      ) {
        statusGroup = "open";
      } else {
        statusGroup = "closed"; // Placed, Failed, and Closed treated as closed
      }

      const marketTitle =
        slip.marketsMeta?.[0]?.market.common_question ??
        slip.parentMarket?.common_question ??
        "Unknown Market";
      const marketplaceName =
        slip.marketsMeta?.[0]?.marketplace?.name ??
        slip.marketplace?.name ??
        "Unknown";

      // Build platform list. If the slip is OPEN we only list platforms that
      // have a corresponding proxied bet. Otherwise we fall back to all
      // available meta entries.

      const platforms: PlatformInfo[] = (() => {
        const meta = slip.marketsMeta ?? [];

        // Build quick lookup by marketplaceId for meta ➞ faster lookup
        const metaByMarketplace = new Map<number, PairMeta>();
        meta.forEach((pm) => {
          const id = pm.marketplace?.id;
          if (typeof id === "number") metaByMarketplace.set(id, pm);
        });

        // If we have proxied bets data, derive directly from them so we can
        // include shares. OTHERWISE fall back to meta list.
        if (
          Array.isArray(slip.proxiedBetsData) &&
          slip.proxiedBetsData.length
        ) {
          return slip.proxiedBetsData.map((pb) => {
            const pm = metaByMarketplace.get(Number(pb.marketplaceId));
            const sharesBought =
              Number(pb.sharesBought ?? 0) - Number(pb.sharesSold ?? 0);

            return {
              marketplace: pm?.marketplace?.name ?? "Unknown",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              question:
                (pm as any)?.question ??
                pm?.market.common_question ??
                "Unknown",
              shares: sharesBought,
            };
          });
        }

        // Helper fallback converter
        const toPlatform = (pm: PairMeta): PlatformInfo => ({
          marketplace: pm.marketplace?.name ?? "Unknown",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          question:
            (pm as any).question ?? pm.market.common_question ?? "Unknown",
          shares: undefined,
        });

        return meta.map(toPlatform);
      })();

      return {
        id: slip.id.toString(),
        market: marketTitle,
        statusGroup,
        position: slip.outcomeIndex === BigInt(0) ? "Yes" : "No",
        totalCost: Number(slip.initialCollateral) / 1_000_000,
        // Use precomputed totalShares if available otherwise sum from proxied bets
        totalShares:
          slip.totalShares ??
          (Array.isArray(slip.proxiedBetsData)
            ? slip.proxiedBetsData.reduce(
                (sum, pb) =>
                  sum +
                  Number(pb.sharesBought ?? 0) -
                  Number(pb.sharesSold ?? 0),
                0
              )
            : undefined),
        avgPrice: undefined,
        marketplaceName,
        platforms,
        failed: statusEnum === BetSlipStatus.Failed,
      };
    });
  }, [onChainBetSlips]);

  const grouped = useMemo(() => {
    return {
      processing: transformed.filter((t) => t.statusGroup === "processing"),
      open: transformed.filter((t) => t.statusGroup === "open"),
      closed: transformed.filter((t) => t.statusGroup === "closed"),
    } as const;
  }, [transformed]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const renderBetSlip = (betSlip: TransformedSlip) => {
    const showBreakdown = betSlip.platforms.length > 0;

    return (
      <Card key={betSlip.id} className="mb-6 border-foreground/10">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-lg font-bold uppercase font-sans  leading-tight">
                {betSlip.market}
              </CardTitle>
              <div className="text-xs uppercase text-muted-foreground tracking-wide">
                {betSlip.marketplaceName}
              </div>
              <div className="text-sm text-muted-foreground">
                Position:{" "}
                <span
                  className={`font-bold ${
                    betSlip.position === "Yes"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {betSlip.position.toUpperCase()}
                </span>
                {betSlip.avgPrice !== undefined && (
                  <span className="ml-2 font-heading">
                    @{betSlip.avgPrice}¢ avg.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Summary grid */}
          <div className="grid grid-cols-4 gap-4 p-3 bg-accent/30 border border-foreground/10 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase mb-1">
                Cost
              </div>
              <div className="font-bold font-heading">
                {formatCurrency(betSlip.totalCost)}
              </div>
            </div>
            <div className="text-center">
              {/* <div className="text-xs text-muted-foreground uppercase mb-1">
                Current Value
              </div>
              <div className="font-bold font-heading text-muted-foreground">
                —
              </div> */}
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase mb-1">
                {betSlip.statusGroup === "closed" ? "P&L" : "If Wins"}
              </div>
              <div
                className={
                  "font-bold font-heading " +
                  (betSlip.failed ? "text-red-600" : "text-primary")
                }
              >
                {betSlip.failed
                  ? "Error"
                  : betSlip.statusGroup === "open" &&
                      betSlip.totalShares !== undefined
                    ? formatCurrency(betSlip.totalShares)
                    : "—"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase mb-1">
                Shares
              </div>
              <div className="font-bold font-heading">
                {betSlip.totalShares}
              </div>
            </div>
          </div>
        </CardHeader>
        {showBreakdown && (
          <CardContent className="p-5 pt-4 space-y-3">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Platform Breakdown
            </div>
            {betSlip.platforms.map((p, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3 bg-background border border-foreground/5 rounded-md"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {p.marketplace}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.question}
                  </div>
                </div>
                <div className="text-right text-xs font-heading text-muted-foreground">
                  <div>
                    {p.shares !== undefined ? `${p.shares} shares` : "—"}
                  </div>
                </div>
              </div>
            ))}
            {betSlip.failed && (
              <p className="text-sm text-red-600 font-semibold mt-1">
                Execution failed – funds returned
              </p>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  /* --------------------------------------------------
   * Render
   * -------------------------------------------------- */

  if (transformed.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        No bets found.
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-10">
      <Tabs
        defaultValue={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as "processing" | "open" | "closed")
        }
      >
        <TabsList>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <TabsTrigger key={key} value={key} className="uppercase">
              <cfg.icon className="w-4 h-4 mr-2" />
              {cfg.label} ({grouped[key as keyof typeof grouped].length})
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(grouped).map(([key, slips]) => (
          <TabsContent key={key} value={key} className="mt-6">
            {slips.map((s) => renderBetSlip(s))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
