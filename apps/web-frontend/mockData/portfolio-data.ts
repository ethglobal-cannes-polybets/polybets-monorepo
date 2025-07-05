import type { LucideIcon } from "lucide-react"
import {
  ShieldCheck,
  Trophy,
  Droplets,
  Zap,
  ShoppingBasket as Basketball,
} from "lucide-react"

export interface ArbitrageHistory {
  timestamp: string
  cause: string
  action: string
  incrementalReturn: number
}

export interface BetDetail {
  platform: string
  marketTitle: string
  cost: number
  price: number
  shares: number
  status?: "won" | "lost"
}

export interface BetSlip {
  id: string
  market: string
  category: string
  icon: LucideIcon
  position: "Yes" | "No"
  totalCost: number
  totalShares: number
  avgPrice: number
  autoArbitrage: boolean
  createdAt: string
  // Optional properties for open/closed positions
  arbitrageHistory?: ArbitrageHistory[]
  bets?: BetDetail[]
  // Closed positions
  finalValue?: number
  profit?: number
  closedAt?: string
}

export interface BetSlipsCollection {
  processing: BetSlip[]
  open: BetSlip[]
  closed: BetSlip[]
}

export const mockBetSlips: BetSlipsCollection = {
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
          action: "Increased exposure on Limitless, acquiring 50 shares at an average of 65¢.",
          incrementalReturn: 17.5,
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
          action: "Increased exposure on Polymarket, acquiring 100 shares at an average of 60¢.",
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
          action: "Increased exposure on Polymarket, acquiring 52 shares at an average of 70¢.",
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
} 