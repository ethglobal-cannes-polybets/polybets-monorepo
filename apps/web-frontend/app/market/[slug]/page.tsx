"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MarketChart } from "@/components/market-chart"
import { MarketComparison } from "@/components/market-comparison"
import { mockBinaryMarketData, mockPriceData } from "@/mockData/market-data"
import type { MarketData } from "@/mockData/market-data"
import { BarChart3, TrendingUp, Users, DollarSign, ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { BettingSidebar } from "@/components/betting-sidebar/betting-sidebar"
import type { Market as SidebarMarket } from "@/hooks/use-place-bet"
import { mockBetSlips } from "@/mockData/portfolio-data"

type BetData = Parameters<
  NonNullable<React.ComponentProps<typeof BettingSidebar>["onPlaceBet"]>
>[0]

export default function BinaryMarketPage() {
  const params = useParams()
  const router = useRouter()
  const marketSlug = params.slug as string

  const [selectedPlatformId, setSelectedPlatformId] = React.useState<string>("")
  const [timeframe, setTimeframe] = React.useState<"1H" | "1D" | "1W" | "1M" | "ALL">("1D")

  const marketData: MarketData | undefined =
    mockBinaryMarketData[marketSlug as keyof typeof mockBinaryMarketData]

  const handlePlaceBet = async (betData: BetData) => {
    console.log("Placing bet:", betData)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    // In a real app, you'd handle success/error from the API
  }

  const marketStats = React.useMemo(() => {
    if (!marketData) {
      return { totalVolume: 0, totalLiquidity: 0, avgYesPrice: 0, platformCount: 0 }
    }
    const totalVolume = marketData.platforms.reduce((sum, p) => sum + p.volume24h, 0)
    const totalLiquidity = marketData.platforms.reduce((sum, p) => sum + p.liquidity, 0)
    const avgYesPrice = marketData.platforms.reduce((sum, p) => sum + p.yesPrice, 0) / marketData.platforms.length
    return { totalVolume, totalLiquidity, avgYesPrice, platformCount: marketData.platforms.length }
  }, [marketData])

  // Aggregate current positions related to this market
  const currentMarketPositions = React.useMemo(() => {
    if (!marketData) return []

    const allPositions = [
      ...mockBetSlips.processing,
      ...mockBetSlips.open,
      ...mockBetSlips.closed,
    ]

    // Simple fuzzy match on the first three words of the market question
    const matchString = marketData.question.split(" ").slice(0, 3).join(" ").toLowerCase()

    return allPositions.filter((position) => position.market.toLowerCase().includes(matchString))
  }, [marketData])

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "geopolitics":
        return "text-red-600"
      case "sports":
        return "text-orange-600"
      case "politics":
        return "text-blue-600"
      case "crypto":
        return "text-yellow-600"
      case "movies":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  const activePlatform = React.useMemo(() => {
    if (!marketData) return null
    return selectedPlatformId
      ? (marketData.platforms.find((p) => p.id === selectedPlatformId) ?? marketData.platforms[0])
      : marketData.platforms[0]
  }, [marketData, selectedPlatformId])

  if (!marketData || !activePlatform) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold uppercase">Market Not Found</h1>
          <p className="mt-2 text-muted-foreground">The requested market could not be found.</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Back to Markets
          </Button>
        </div>
      </div>
    )
  }

  const sidebarRelatedMarkets: SidebarMarket[] = marketData.platforms.map((p) => ({
    id: Number(p.id),
    marketplaceId: p.platform,
    platform: p.platform,
    title: p.title,
    yesPrice: p.yesPrice,
    noPrice: p.noPrice,
    liquidity: p.liquidity,
    selected: false,
  }))

  return (
    <div className="flex min-h-screen container px-0">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="pr-5 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <Button variant="outline" size="icon" className="mt-1 bg-transparent" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to markets</span>
            </Button>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="border-primary/50 text-primary uppercase">
                  {marketData.category}
                </Badge>
                <Badge variant="outline" className="uppercase">
                  Binary Market
                </Badge>
                <Badge variant="outline" className="border-green-500/50 text-green-500 uppercase">
                  Live
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase">{marketData.question}</h1>
              <p className="text-muted-foreground mt-1">{marketData.description}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ends: {new Date(marketData.bets_close_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-foreground/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground uppercase">24h Volume</span>
                </div>
                <div className="text-2xl font-bold mt-1 font-heading">
                  ${(marketStats.totalVolume / 1000).toFixed(0)}K
                </div>
              </CardContent>
            </Card>
            <Card className="border-foreground/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground uppercase">Liquidity</span>
                </div>
                <div className="text-2xl font-bold mt-1 font-heading">
                  ${(marketStats.totalLiquidity / 1000000).toFixed(1)}M
                </div>
              </CardContent>
            </Card>
            <Card className="border-foreground/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground uppercase">Avg YES Price</span>
                </div>
                <div className="text-2xl font-bold mt-1 text-primary font-heading">
                  {(marketStats.avgYesPrice * 100).toFixed(1)}¢
                </div>
              </CardContent>
            </Card>
            <Card className="border-foreground/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground uppercase">Platforms</span>
                </div>
                <div className="text-2xl font-bold mt-1 font-heading">{marketStats.platformCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <MarketChart
              data={mockPriceData}
              title={
                activePlatform ? `${activePlatform.platform} - ${activePlatform.title}` : "Aggregated Market Prices"
              }
              currentYesPrice={activePlatform ? activePlatform.yesPrice : marketStats.avgYesPrice}
              currentNoPrice={activePlatform ? activePlatform.noPrice : 1 - marketStats.avgYesPrice}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              platform={activePlatform ? activePlatform.platform : "All Platforms"}
            />
            <MarketComparison
              markets={marketData.platforms}
              onMarketSelect={(market) => setSelectedPlatformId(market.id)}
              selectedMarketId={selectedPlatformId}
            />

            {/* Your Positions */}
            {currentMarketPositions.length > 0 && (
              <Card className="border-foreground/10">
                <CardHeader>
                  <CardTitle className="uppercase">Your Positions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentMarketPositions.map((position) => {
                    const CategoryIcon = position.icon
                    const isProfitable = position.profit ? position.profit > 0 : false
                    const isOpen = !Object.prototype.hasOwnProperty.call(position, "profit")

                    return (
                      <div
                        key={position.id}
                        className="p-4 bg-accent/30 border border-foreground/10 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-foreground/20 uppercase">
                              <CategoryIcon className={`w-4 h-4 mr-1.5 ${getCategoryColor(position.category)}`} />
                              {position.category}
                            </Badge>
                            {position.autoArbitrage && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-primary/10 text-primary border-primary/20 uppercase"
                              >
                                Auto-Arbitrage
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground uppercase">
                              {isOpen ? "Potential Value" : "Final Result"}
                            </div>
                            <div
                              className={`font-bold font-heading ${
                                isOpen ? "text-primary" : isProfitable ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isOpen
                                ? `$${position.totalShares.toFixed(2)}`
                                : isProfitable
                                ? `+$${position.profit!.toFixed(2)}`
                                : `$${position.profit!.toFixed(2)}`}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Position:</span>
                            <span
                              className={`font-bold ${
                                position.position === "Yes" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {position.position.toUpperCase()} @ {position.avgPrice.toFixed(1)}¢ avg.
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total Cost:</span>
                            <span className="font-heading">${position.totalCost}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Shares:</span>
                            <span className="font-heading">{position.totalShares.toFixed(2)}</span>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="flex gap-2 mt-4 pt-3 border-t border-foreground/10">
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                              Sell Shares
                            </Button>
                            <Button size="sm" className="flex-1">
                              Buy More
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Sidebar */}
      <div className="w-[420px] flex-shrink-0">
        <BettingSidebar
          currentMarket={{
            title: marketData.question,
            yesPrice: activePlatform.yesPrice,
            noPrice: activePlatform.noPrice,
            platform: activePlatform.platform,
          }}
          initialOutcome="yes"
          relatedMarkets={sidebarRelatedMarkets}
          onPlaceBet={handlePlaceBet}
          isSticky={true}
          isOpen={true}
        />
      </div>
    </div>
  )
}
