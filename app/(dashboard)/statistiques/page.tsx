import { getDashboard } from "@/app/actions/dashboard"
import { RevenueChart, CategoryChart } from "@/components/dashboard-charts"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PAYMENT_METHODS } from "@/lib/helpers"
import { getPreferences } from "@/lib/preferences"
import { getCategories } from "@/app/actions/categories"
import { createTranslator, formatNumberL, tCategory, tPayment } from "@/lib/i18n"
import { formatConverted } from "@/lib/currency"
import { Percent, Coins, Boxes, TrendingUp } from "lucide-react"

export default async function StatistiquesPage() {
  const [d, categories] = await Promise.all([getDashboard(), getCategories()])
  const { lang, currency } = await getPreferences()
  const t = createTranslator(lang)
  const money = (eur: number) => formatConverted(eur, currency, lang)
  const num = (n: number) => formatNumberL(n, lang)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{t("stats.title")}</h1>
        <p className="text-muted-foreground">{t("stats.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("stats.avgMargin")} value={`${d.avgMargin.toFixed(1)} %`} icon={Percent} tone="positive" />
        <StatCard label={t("stats.totalProfit")} value={money(d.totalProfit)} icon={TrendingUp} tone="positive" />
        <StatCard
          label={t("stats.avgBasket")}
          value={money(d.totalSalesCount ? d.totalRevenue / d.totalSalesCount : 0)}
          icon={Coins}
        />
        <StatCard label={t("stats.stockValue")} value={money(d.stockValue)} icon={Boxes} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart data={d.revenueByDay} />
        <CategoryChart data={d.salesByCategory} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">{t("stats.top5")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("stats.colProduct")}</TableHead>
                  <TableHead className="text-right">{t("stats.colUnits")}</TableHead>
                  <TableHead className="text-right">{t("stats.colRevenue")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      {t("stats.noSales")}
                    </TableCell>
                  </TableRow>
                ) : (
                  d.topProducts.map((p) => (
                    <TableRow key={p.name}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">{num(p.units)}</TableCell>
                      <TableCell className="text-right font-semibold">{money(p.revenue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">{t("stats.revByCategory")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("stats.colCategory")}</TableHead>
                  <TableHead className="text-right">{t("stats.colRevenueFull")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.salesByCategory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                      {t("stats.noData")}
                    </TableCell>
                  </TableRow>
                ) : (
                  d.salesByCategory.map((c) => (
                    <TableRow key={c.category}>
                      <TableCell className="font-medium">{tCategory(c.category, lang)}</TableCell>
                      <TableCell className="text-right font-semibold">{money(c.revenue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">{t("stats.refSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">{t("stats.productCategories")}</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Badge key={c} variant="secondary">
                  {tCategory(c, lang)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">{t("stats.paymentMethods")}</p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => (
                <Badge key={m} variant="secondary">
                  {tPayment(m, lang)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
