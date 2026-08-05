import Link from "next/link"
import { getInvoice } from "@/app/actions/invoices"
import { getSessionUser } from "@/lib/session"
import { getPreferences } from "@/lib/preferences"
import { createTranslator } from "@/lib/i18n"
import { InvoicePrint } from "@/components/invoice-print"

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const invoiceId = Number.parseInt(id, 10)
  const [invoice, user] = await Promise.all([getInvoice(invoiceId), getSessionUser()])
  const { lang } = await getPreferences()
  const t = createTranslator(lang)

  if (!invoice) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted-foreground">{t("inv.print.notFound")}</p>
        <Link href="/factures" className="text-sm text-primary underline-offset-4 hover:underline">
          {t("inv.print.back")}
        </Link>
      </div>
    )
  }

  const shopName = user?.name || user?.email || "TéléStock"

  return <InvoicePrint invoice={invoice} shopName={shopName} />
}
