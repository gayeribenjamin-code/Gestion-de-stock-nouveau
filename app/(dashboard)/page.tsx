import Link from "next/link"
import { getDashboard } from "@/app/actions/dashboard"
import { StatCard } from "@/components/stat-card"
import { RevenueChart, CategoryChart } from "@/components/dashboard-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatNumber } from "@/lib/helpers"
import { Euro, TrendingUp, Package, ShoppingCart, AlertTriangle, Boxes, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const d = await getDashboard()

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground text-balance">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Vue d&apos;ensemble de votre activité, mise à jour en temps réel.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Chiffre d'affaires" value={formatCurrency(d.totalRevenue)} icon={Euro} tone="positive" />
        <StatCard
          label="Bénéfice"
          value={formatCurrency(d.totalProfit)}
          icon={TrendingUp}
          tone="positive"
          hint={`Marge moyenne ${d.avgMargin.toFixed(0)}%`}
        />
        <StatCard
          label="Ventes"
          value={formatNumber(d.totalSalesCount)}
          icon={ShoppingCart}
          hint={`${formatNumber(d.unitsSold)} unités vendues`}
        />
        <StatCard
          label="Valeur du stock"
          value={formatCurrency(d.stockValue)}
          icon={Boxes}
          hint={`${formatNumber(d.productCount)} références`}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Produits en catalogue" value={formatNumber(d.productCount)} icon={Package} />
        <StatCard
          label="Stock faible"
          value={formatNumber(d.lowStockCount)}
          icon={AlertTriangle}
          tone={d.lowStockCount > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Ruptures"
          value={formatNumber(d.outOfStockCount)}
          icon={AlertTriangle}
          tone={d.outOfStockCount > 0 ? "danger" : "default"}
        />
        <StatCard label="Unités vendues" value={formatNumber(d.unitsSold)} icon={ShoppingCart} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <RevenueChart data={d.revenueByDay} />
        <CategoryChart data={d.salesByCategory} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-heading text-base">Produits les plus vendus</CardTitle>
          </CardHeader>
          <CardContent>
            {d.topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Aucune vente pour l&apos;instant.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {d.topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{formatNumber(p.units)} u.</span>
                    <span className="w-20 text-right text-sm font-semibold text-foreground">
                      {formatCurrency(p.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-heading text-base">À réapprovisionner</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/stock">
                Gérer <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {d.lowStockProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Tout est bien approvisionné.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {d.lowStockProducts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{p.name}</span>
                    {p.quantity <= 0 ? (
                      <Badge variant="destructive">Rupture</Badge>
                    ) : (
                      <Badge className="bg-chart-4/15 text-chart-4 hover:bg-chart-4/15">
                        {p.quantity} en stock
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
