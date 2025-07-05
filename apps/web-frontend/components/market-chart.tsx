"use client"
import { Bar, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

interface MarketChartProps {
  data: any[]
  title: string
  currentYesPrice: number
  currentNoPrice: number
  timeframe: "1H" | "1D" | "1W" | "1M" | "ALL"
  onTimeframeChange: (tf: "1H" | "1D" | "1W" | "1M" | "ALL") => void
  platform: string
}

export function MarketChart({
  data,
  title,
  currentYesPrice,
  currentNoPrice,
  timeframe,
  onTimeframeChange,
  platform,
}: MarketChartProps) {
  const chartConfig = {
    yesPrice: { label: "Yes Price", color: "hsl(var(--primary))" },
    volume: { label: "Volume", color: "hsl(var(--foreground), 0.1)" },
  }

  return (
    <Card className="border-foreground/10">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardDescription className="uppercase">{platform}</CardDescription>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {(["1H", "1D", "1W", "1M", "ALL"] as const).map((tf) => (
              <Button
                key={tf}
                size="sm"
                variant={timeframe === tf ? "default" : "outline"}
                className={timeframe === tf ? "bg-primary text-primary-foreground" : "bg-transparent"}
                onClick={() => onTimeframeChange(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <LineChart data={data}>
              <Tooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                }
              />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                }
              />
              <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}¢`} />
              <Line type="monotone" dataKey="yesPrice" stroke="var(--color-yesPrice)" strokeWidth={2} dot={false} />
              <Bar dataKey="volume" fill="var(--color-volume)" radius={4} barSize={20} yAxisId={1} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
