"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/helpers"

export function RevenueChart({ data }: { data: { day: string; revenue: number }[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.day).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">Chiffre d&apos;affaires (14 derniers jours)</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Aucune vente enregistrée pour l&apos;instant.</p>
        ) : (
          <ChartContainer
            config={{ revenue: { label: "CA", color: "var(--chart-1)" } }}
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
              <YAxis tickLine={false} axisLine={false} width={44} fontSize={11} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />}
              />
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">CA par catégorie</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Aucune donnée à afficher.</p>
        ) : (
          <ChartContainer
            config={{ revenue: { label: "CA", color: "var(--chart-2)" } }}
            className="aspect-auto h-64 w-full"
          >
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
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
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
