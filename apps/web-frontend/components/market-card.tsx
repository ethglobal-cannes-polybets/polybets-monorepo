"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"

// Create formatters once per module – avoids re-creating on every render
const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

export interface Platform {
  name: string
  icon: React.ReactNode
  color: string
}

export interface Market {
  platform: Platform
  title: string
  percentage: number
  volume: string
  marketplaceId: number
}

interface MarketCardProps {
  groupedTitle: string
  icon?: React.ReactNode
  aggregatedPercentage: number
  totalVolume: string
  markets: Market[]
  onBuyYes?: (markets: Market[]) => void
  onBuyNo?: (markets: Market[]) => void
}

export default function MarketCard({
  groupedTitle,
  icon,
  aggregatedPercentage,
  totalVolume,
  markets,
  onBuyYes,
  onBuyNo,
}: MarketCardProps) {
  const slugify = (text: string) =>
    text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "")

  const slug = slugify(groupedTitle)

  const handleBuyYes = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onBuyYes?.(markets)
  }

  const handleBuyNo = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onBuyNo?.(markets)
  }

  return (
    <Card className="flex h-full w-full flex-col border border-foreground/10 bg-background transition-shadow hover:border-foreground/30 hover:shadow-lg">
      <Link href={`/market/${slug}`} className="block">
        <CardHeader className="flex-shrink-0 p-4 pb-2 hover:bg-accent/50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {icon && <div className="flex-shrink-0 text-muted-foreground">{icon}</div>}
              <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground font-sans">
                {groupedTitle}
              </h3>
            </div>
            <div className="ml-4 flex-shrink-0 text-right">
              <div className="text-2xl font-bold text-primary font-heading">
                {percentFormatter.format(aggregatedPercentage / 100)}
              </div>
              <div className="text-xs uppercase text-muted-foreground">chance</div>
            </div>
          </div>
        </CardHeader>
      </Link>
      <CardContent className="flex flex-1 items-end p-4 py-2">
        <div className="flex w-full gap-2">
          <Button
            className="flex-1 border-green-600/50 text-sm hover:bg-green-600/10 bg-green-600 text-white"
            variant="outline"
            onClick={handleBuyYes}
          >
            Buy Yes ↗
          </Button>
          <Button
            className="flex-1 border-red-600/50 text-sm hover:bg-red-600/10 bg-red-600 text-white"
            variant="outline"
            onClick={handleBuyNo}
          >
            Buy No ↘
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex-shrink-0 p-4 pt-2">
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase">{totalVolume} Vol.</span>
          {markets.length > 1 ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-muted-foreground hover:bg-accent rounded p-1 -mr-1">
                  <div className="flex -space-x-2">
                    {markets.map((market, index) => (
                      <div
                        key={index}
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${market.platform.color} ring-2 ring-background`}
                      >
                        {market.platform.icon}
                      </div>
                    ))}
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 border-foreground/20 bg-background">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Related Markets
                  </h4>
                  {markets.map((market, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 text-sm">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs text-white ${market.platform.color}`}
                        >
                          {market.platform.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-foreground" title={market.title}>
                            {market.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{market.platform.name}</p>
                        </div>
                      </div>
                      <div className="w-16 flex-shrink-0 text-right">
                        <p className="font-bold text-primary font-heading">
                          {percentFormatter.format(market.percentage / 100)}
                        </p>
                        <p className="text-xs text-muted-foreground">{market.volume}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex gap-1">
              {markets.map((market, index) => (
                <div
                  key={index}
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${market.platform.color}`}
                >
                  {market.platform.icon}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
