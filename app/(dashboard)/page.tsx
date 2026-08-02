import Link from "next/link"
import { getDashboard } from "@/app/actions/dashboard"
import { StatCard } from "@/components/stat-card"
import { RevenueChart, CategoryChart } from "@/components/dashboard-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getPreferences } from "@/lib/preferences"
import { createTranslator, formatNumberL } from "@/lib/i18n"
import { formatConverted } from "@/lib/currency"
import { Euro, TrendingUp, Package, ShoppingCart, AlertTriangle, Boxes, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const d = await getDashboard()
  const { lang, currency } = await getPreferences()
  const t = createTranslator(lang)
  const money = (eur: number) => formatConverted(eur, currency, lang)
  const num = (n: number) => formatNumberL(n, lang)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground text-balance">{t("dash.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dash.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("dash.revenue")} value={money(d.totalRevenue)} icon={Euro} tone="positive" />
        <StatCard
          label={t("dash.profit")}
          value={money(d.totalProfit)}
          icon={TrendingUp}
          tone="positive"
          hint={t("dash.avgMargin", { v: d.avgMargin.toFixed(0) })}
        />
        <StatCard
          label={t("dash.sales")}
          value={num(d.totalSalesCount)}
          icon={ShoppingCart}
          hint={t("dash.unitsSoldHint", { v: num(d.unitsSold) })}
        />
        <StatCard
          label={t("dash.stockValue")}
          value={money(d.stockValue)}
          icon={Boxes}
          hint={t("dash.references", { v: num(d.productCount) })}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("dash.catalogProducts")} value={num(d.productCount)} icon={Package} />
        <StatCard
          label={t("dash.lowStock")}
          value={num(d.lowStockCount)}
          icon={AlertTriangle}
          tone={d.lowStockCount > 0 ? "warning" : "default"}
        />
        <StatCard
          label={t("dash.outOfStock")}
          value={num(d.outOfStockCount)}
          icon={AlertTriangle}
          tone={d.outOfStockCount > 0 ? "danger" : "default"}
        />
        <StatCard label={t("dash.unitsSold")} value={num(d.unitsSold)} icon={ShoppingCart} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <RevenueChart data={d.revenueByDay} />
        <CategoryChart data={d.salesByCategory} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-heading text-base">{t("dash.topProducts")}</CardTitle>
          </CardHeader>
          <CardContent>
            {d.topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("dash.noSalesYet")}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {d.topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {num(p.units)} {t("dash.unitsShort")}
                    </span>
                    <span className="w-24 text-right text-sm font-semibold text-foreground">{money(p.revenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-heading text-base">{t("dash.toRestock")}</CardTitle>
            <Link href="/stock" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-xs")}>
              {t("dash.manage")} <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {d.lowStockProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("dash.wellStocked")}</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {d.lowStockProducts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{p.name}</span>
                    {p.quantity <= 0 ? (
                      <Badge variant="destructive">{t("status.out_of_stock")}</Badge>
                    ) : (
                      <Badge className="bg-chart-4/15 text-chart-4 hover:bg-chart-4/15">
                        {p.quantity} {t("common.inStock")}
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
