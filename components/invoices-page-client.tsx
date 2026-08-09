"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Users } from "lucide-react"
import { usePreferences } from "@/components/preferences-provider"
import { InvoicesManager } from "@/components/invoices-manager"
import { CustomersManager } from "@/components/customers-manager"
import type { InvoiceListRow } from "@/app/actions/invoices"
import type { ProductRow } from "@/app/actions/products"
import type { CustomerWithStats } from "@/app/actions/customers"

export function InvoicesPageClient({
  invoices,
  products,
  customers,
}: {
  invoices: InvoiceListRow[]
  products: ProductRow[]
  customers: CustomerWithStats[]
}) {
  const { t } = usePreferences()
  const [tab, setTab] = useState("invoices")
  const [customerFilter, setCustomerFilter] = useState<number | null>(null)

  const shownInvoices = customerFilter
    ? invoices.filter((i) => i.customerId === customerFilter)
    : invoices

  function viewCustomerInvoices(customerId: number) {
    setCustomerFilter(customerId)
    setTab("invoices")
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <div className="flex items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="invoices" className="gap-1.5">
            <FileText className="size-4" />
            {t("inv.tabInvoices")}
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-1.5">
            <Users className="size-4" />
            {t("inv.tabCustomers")}
          </TabsTrigger>
        </TabsList>
        {customerFilter && tab === "invoices" && (
          <button
            type="button"
            onClick={() => setCustomerFilter(null)}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {customers.find((c) => c.id === customerFilter)?.name} ✕
          </button>
        )}
      </div>

      <TabsContent value="invoices" className="mt-6">
        <InvoicesManager invoices={shownInvoices} products={products} customers={customers} />
      </TabsContent>
      <TabsContent value="customers" className="mt-6">
        <CustomersManager customers={customers} onViewInvoices={viewCustomerInvoices} />
      </TabsContent>
    </Tabs>
  )
}
