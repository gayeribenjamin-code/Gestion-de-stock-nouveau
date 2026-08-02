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
import { formatCurrency, formatNumber, CATEGORIES, PAYMENT_METHODS } from "@/lib/helpers"
import { Percent, Coins, Boxes, TrendingUp } from "lucide-react"

export default async function StatistiquesPage() {
  const d = await getDashboard()

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Statistiques</h1>
        <p className="text-muted-foreground">Analyse détaillée de vos ventes, marges et de votre stock.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Marge moyenne" value={`${d.avgMargin.toFixed(1)} %`} icon={Percent} tone="positive" />
        <StatCard label="Bénéfice total" value={formatCurrency(d.totalProfit)} icon={TrendingUp} tone="positive" />
        <StatCard label="Panier moyen" value={formatCurrency(d.totalSalesCount ? d.totalRevenue / d.totalSalesCount : 0)} icon={Coins} />
        <StatCard label="Valeur du stock" value={formatCurrency(d.stockValue)} icon={Boxes} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart data={d.revenueByDay} />
        <CategoryChart data={d.salesByCategory} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Top 5 des produits</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Unités</TableHead>
                  <TableHead className="text-right">CA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      Aucune vente enregistrée.
                    </TableCell>
                  </TableRow>
                ) : (
                  d.topProducts.map((p) => (
                    <TableRow key={p.name}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">{formatNumber(p.units)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(p.revenue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">CA par catégorie</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Chiffre d&apos;affaires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.salesByCategory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                      Aucune donnée.
                    </TableCell>
                  </TableRow>
                ) : (
                  d.salesByCategory.map((c) => (
                    <TableRow key={c.category}>
                      <TableCell className="font-medium">{c.category}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(c.revenue)}</TableCell>
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
          <CardTitle className="font-heading text-base">Paramètres de référence</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Catégories de produits</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Moyens de paiement</p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => (
                <Badge key={m} variant="secondary">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
