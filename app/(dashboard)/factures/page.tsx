import { getInvoices } from "@/app/actions/invoices"
import { getCustomers } from "@/app/actions/customers"
import { getProducts } from "@/app/actions/products"
import { InvoicesPageClient } from "@/components/invoices-page-client"
import { getPreferences } from "@/lib/preferences"
import { createTranslator } from "@/lib/i18n"

export default async function FacturesPage() {
  const [invoices, customers, products] = await Promise.all([
    getInvoices(),
    getCustomers(),
    getProducts(),
  ])
  const { lang } = await getPreferences()
  const t = createTranslator(lang)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{t("inv.title")}</h1>
        <p className="text-muted-foreground">{t("inv.subtitle")}</p>
      </div>
      <InvoicesPageClient invoices={invoices} products={products} customers={customers} />
    </div>
  )
}
