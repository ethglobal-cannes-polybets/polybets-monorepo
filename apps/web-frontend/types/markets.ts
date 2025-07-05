import type React from "react"
import type { Market } from "@/components/market-card"

export interface GroupedMarket {
  id: number
  groupedTitle: string
  icon?: React.ReactNode
  aggregatedPercentage: number
  totalVolume: string
  markets: Market[]
  category: string
} 