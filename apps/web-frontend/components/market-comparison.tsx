"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MarketComparisonProps {
  markets: {
    id: string
    platform: string
    title: string
    yesPrice: number
    noPrice: number
    volume24h: number
    liquidity: number
    change24h: number
  }[]
  onMarketSelect: (market: any) => void
  selectedMarketId: string | null
}

export function MarketComparison({ markets, onMarketSelect, selectedMarketId }: MarketComparisonProps) {
  return (
    <Card className="border-foreground/10">
      <CardHeader>
        <CardTitle className="uppercase">Platform Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="uppercase">Platform</TableHead>
              <TableHead className="uppercase text-right">Yes Price</TableHead>
              <TableHead className="uppercase text-right">No Price</TableHead>
              <TableHead className="uppercase text-right">24h Volume</TableHead>
              <TableHead className="uppercase text-right">Liquidity</TableHead>
              <TableHead className="uppercase text-right">24h Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markets.map((market) => (
              <TableRow
                key={market.id}
                onClick={() => onMarketSelect(market)}
                className={cn("cursor-pointer", selectedMarketId === market.id ? "bg-primary/10" : "hover:bg-accent")}
              >
                <TableCell className="font-medium">{market.platform}</TableCell>
                <TableCell className="text-right font-bold text-green-500">
                  {(market.yesPrice * 100).toFixed(1)}¢
                </TableCell>
                <TableCell className="text-right font-bold text-red-500">
                  {(market.noPrice * 100).toFixed(1)}¢
                </TableCell>
                <TableCell className="text-right">${(market.volume24h / 1000).toFixed(0)}K</TableCell>
                <TableCell className="text-right">${(market.liquidity / 1000).toFixed(0)}K</TableCell>
                <TableCell className={cn("text-right", market.change24h >= 0 ? "text-green-500" : "text-red-500")}>
                  {market.change24h.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
