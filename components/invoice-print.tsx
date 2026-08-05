"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePreferences } from "@/components/preferences-provider"
import type { InvoiceDetail } from "@/app/actions/invoices"

export function InvoicePrint({
  invoice,
  shopName,
}: {
  invoice: InvoiceDetail
  shopName: string
}) {
  const { t, money, formatDate, tPayment } = usePreferences()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Impression automatique si ?print=1
  useEffect(() => {
    if (searchParams.get("print") === "1") {
      const id = setTimeout(() => window.print(), 400)
      return () => clearTimeout(id)
    }
  }, [searchParams])

  const statusLabel = t(`inv.status.${invoice.status}`)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Barre d'actions (masquée à l'impression) */}
      <div className="mb-6 flex items-center justify-between gap-2 print:hidden">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push("/factures")}>
          <ArrowLeft className="size-4" />
          {t("inv.print.back")}
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="size-4" />
          {t("inv.print")}
        </Button>
      </div>

      {/* Document facture */}
      <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm print:border-0 print:p-0 print:shadow-none sm:p-10">
        <div className="flex flex-col gap-6 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-heading text-xl font-bold text-foreground">{shopName}</p>
            <p className="mt-1 text-sm text-muted-foreground">TéléStock</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-heading text-2xl font-bold tracking-tight text-primary">
              {t("inv.print.invoice")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("inv.print.number")} : <span className="font-medium text-foreground">{invoice.invoiceNumber}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {t("inv.print.date")} : <span className="font-medium text-foreground">{formatDate(invoice.createdAt)}</span>
            </p>
            <span
              className={
                "mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium " +
                (invoice.status === "paid"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground")
              }
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Client */}
        <div className="py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("inv.print.billedTo")}
          </p>
          <p className="mt-1 text-base font-semibold text-foreground">{invoice.customerName || "—"}</p>
        </div>

        {/* Lignes */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 font-medium">{t("inv.print.product")}</th>
              <th className="py-2 text-right font-medium">{t("inv.print.qty")}</th>
              <th className="py-2 text-right font-medium">{t("inv.print.unitPrice")}</th>
              <th className="py-2 text-right font-medium">{t("inv.print.lineTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((l) => (
              <tr key={l.id} className="border-b border-border/60">
                <td className="py-2.5 font-medium text-foreground">{l.productName}</td>
                <td className="py-2.5 text-right">{l.quantity}</td>
                <td className="py-2.5 text-right">{money(l.unitSalePrice)}</td>
                <td className="py-2.5 text-right font-medium">{money(l.unitSalePrice * l.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <span className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("inv.print.total")}
              </span>
              <span className="font-heading text-xl font-bold text-foreground">{money(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Pied */}
        <div className="mt-6 flex flex-col gap-1 border-t border-border pt-6 text-sm text-muted-foreground">
          {invoice.paymentMethod && (
            <p>
              {t("inv.print.payment")} :{" "}
              <span className="font-medium text-foreground">{tPayment(invoice.paymentMethod)}</span>
            </p>
          )}
          {invoice.notes && <p>{invoice.notes}</p>}
          <p className="mt-2">{t("inv.print.thanks")}</p>
        </div>
      </div>
    </div>
  )
}
