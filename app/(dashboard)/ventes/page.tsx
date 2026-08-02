import { getSales } from "@/app/actions/sales"
import { getProducts } from "@/app/actions/products"
import { SalesManager } from "@/components/sales-manager"
import { getPreferences } from "@/lib/preferences"
import { createTranslator } from "@/lib/i18n"

export default async function VentesPage() {
  const [sales, products] = await Promise.all([getSales(), getProducts()])
  const { lang } = await getPreferences()
  const t = createTranslator(lang)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{t("sales.title")}</h1>
        <p className="text-muted-foreground">{t("sales.subtitle")}</p>
      </div>
      <SalesManager sales={sales} products={products} />
    </div>
  )
}
