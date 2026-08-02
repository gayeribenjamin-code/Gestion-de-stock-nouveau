"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { usePreferences } from "@/components/preferences-provider"

export function RevenueChart({ data }: { data: { day: string; revenue: number }[] }) {
  const { t, lang, fromBase, formatRawMoney } = usePreferences()
  const chartData = data.map((d) => ({
    label: new Date(d.day).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
    revenue: fromBase(d.revenue),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">{t("chart.revenue14")}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("chart.noSales")}</p>
        ) : (
          <ChartContainer
            config={{ revenue: { label: t("chart.revShort"), color: "var(--chart-1)" } }}
            className="aspect-auto h-64 w-full"
          >
            <AreaChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} width={56} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatRawMoney(Number(v))} />} />
              <Area
                dataKey="revenue"
                type="monotone"
                stroke="var(--color-revenue)"
                fill="url(#fillRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function CategoryChart({ data }: { data: { category: string; revenue: number }[] }) {
  const { t, tCategory, fromBase, formatRawMoney } = usePreferences()
  const chartData = data.map((d) => ({
    category: tCategory(d.category),
    revenue: fromBase(d.revenue),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">{t("chart.revByCategory")}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("chart.noData")}</p>
        ) : (
          <ChartContainer
            config={{ revenue: { label: t("chart.revShort"), color: "var(--chart-2)" } }}
            className="aspect-auto h-64 w-full"
          >
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis
                type="category"
                dataKey="category"
                tickLine={false}
                axisLine={false}
                width={110}
                fontSize={11}
              />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatRawMoney(Number(v))} />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
