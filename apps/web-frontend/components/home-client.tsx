"use client";

import type React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MarketCard from "@/components/market-card";
import type { Market, Platform } from "@/components/market-card";
import { SearchIcon, ArrowRight } from "lucide-react";
import { BettingSidebar } from "@/components/betting-sidebar";
import type { Market as SidebarMarket } from "@/components/betting-sidebar";
import { useState, useEffect } from "react";
import { GroupedMarket } from "@/types/markets";
import { motion, AnimatePresence } from "motion/react";

interface HomeClientProps {
  groupedMarkets: GroupedMarket[];
}

export default function HomeClient({ groupedMarkets }: HomeClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<GroupedMarket | null>(
    null
  );
  const [selectedOutcome, setSelectedOutcome] = useState<"yes" | "no">("yes");

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  const handleBuyYes = (markets: Market[]) => {
    const market = groupedMarkets.find((m) => m.markets === markets);
    if (market) {
      setSelectedMarket(market);
      setSelectedOutcome("yes");
      setSidebarOpen(true);
    }
  };

  const handleBuyNo = (markets: Market[]) => {
    const market = groupedMarkets.find((m) => m.markets === markets);
    if (market) {
      setSelectedMarket(market);
      setSelectedOutcome("no");
      setSidebarOpen(true);
    }
  };

  const handlePlaceBet = async (
    betData: Parameters<
      NonNullable<React.ComponentProps<typeof BettingSidebar>["onPlaceBet"]>
    >[0]
  ) => {
    // eslint-disable-next-line no-console
    console.log("Placing bet:", betData);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  const categories = [
    "All",
    "Crypto",
    "Politics",
    "Technology",
    "Sports",
    "Geopolitics",
    "Finance",
  ];

  const sidebarRelatedMarkets: SidebarMarket[] = selectedMarket
    ? selectedMarket.markets.map((m: Market) => ({
        id: selectedMarket.id,
        marketplaceId: (m.platform as Platform).name,
        platform: (m.platform as Platform).name,
        title: m.title,
        yesPrice: m.percentage / 100,
        noPrice: 1 - m.percentage / 100,
        liquidity:
          Number.parseInt(m.volume.replace(/[$,kM]/g, "")) *
          (m.volume.includes("M") ? 1000000 : 1000),
        selected: false,
      }))
    : [];

  return (
    <div className="relative">
      <div className="container mx-auto px-0">
        {/* Banner Section */}
        <section className="relative my-20 text-center">
          <div className="absolute inset-0 -z-10">
            <div
              className="mx-auto h-full w-full max-w-4xl bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/background-lines.png')" }}
            />
          </div>
          <h1 className="text-5xl font-bold uppercase tracking-wider text-primary md:text-7xl font-heading">
            Private & Aggregated
          </h1>
          <h2 className="text-5xl font-bold uppercase tracking-wider md:text-7xl font-heading">
            Prediction Markets
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/80">
            Better odds require smarter aggregation. Build a better portfolio on
            the only privacy-first market aggregator.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button className="" size="lg" asChild>
              <Link href="#markets" className="flex items-center gap-2">
                Explore Markets <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              Learn More <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Search and Filters Section */}
        <section id="markets" className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search for a market..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  className="shrink-0 uppercase"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Market Cards Grid */}
        <section className="pb-20">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groupedMarkets.map((market, i) => (
              <MarketCard
                key={`${market.groupedTitle}-${i}`}
                {...market}
                onBuyYes={handleBuyYes}
                onBuyNo={handleBuyNo}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && selectedMarket && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSidebarOpen(false)}
              onWheel={(e: React.WheelEvent<HTMLDivElement>) => e.preventDefault()}
              onTouchMove={(e: React.TouchEvent<HTMLDivElement>) => e.preventDefault()}
            />
            <BettingSidebar
              key="sidebar"
              currentMarket={{
                title: selectedMarket.groupedTitle,
                yesPrice: selectedMarket.aggregatedPercentage / 100,
                noPrice: 1 - selectedMarket.aggregatedPercentage / 100,
                platform: "Aggregated",
              }}
              initialOutcome={selectedOutcome}
              relatedMarkets={sidebarRelatedMarkets}
              onPlaceBet={handlePlaceBet}
              onClose={() => setSidebarOpen(false)}
              isSticky={false}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
