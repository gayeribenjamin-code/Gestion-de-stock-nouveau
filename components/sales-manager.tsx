"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Search, Trash2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PAYMENT_METHODS } from "@/lib/helpers"
import { usePreferences } from "@/components/preferences-provider"
import { createSale, deleteSale, type SaleRow } from "@/app/actions/sales"
import type { ProductRow } from "@/app/actions/products"

export function SalesManager({
  sales,
  products,
}: {
  sales: SaleRow[]
  products: ProductRow[]
}) {
  const { t, money, formatDate, tPayment } = usePreferences()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [productId, setProductId] = useState<string>("")
  const [quantity, setQuantity] = useState("1")
  const [customer, setCustomer] = useState("")
  const [payment, setPayment] = useState<string>(PAYMENT_METHODS[0])

  const selectedProduct = products.find((p) => String(p.id) === productId)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sales
    return sales.filter(
      (s) =>
        s.productName.toLowerCase().includes(q) ||
        (s.customerName ?? "").toLowerCase().includes(q),
    )
  }, [sales, query])

  const totalRevenue = filtered.reduce((acc, s) => acc + s.unitSalePrice * s.quantity, 0)
  const totalProfit = filtered.reduce(
    (acc, s) => acc + (s.unitSalePrice - s.unitPurchasePrice) * s.quantity,
    0,
  )

  function resetForm() {
    setProductId("")
    setQuantity("1")
    setCustomer("")
    setPayment(PAYMENT_METHODS[0])
  }

  async function onSubmit() {
    if (!selectedProduct) {
      toast.error(t("sales.selectProduct"))
      return
    }
    const qty = Number.parseInt(quantity, 10)
    if (!Number.isInteger(qty) || qty <= 0) {
      toast.error(t("sales.invalidQty"))
      return
    }
    if (qty > selectedProduct.quantity) {
      toast.error(t("sales.insufficientStock", { v: selectedProduct.quantity }))
      return
    }
    setSaving(true)
    try {
      await createSale({
        productId: selectedProduct.id,
        quantity: qty,
        customerName: customer.trim() || undefined,
        paymentMethod: payment,
      })
      toast.success(t("sales.recorded"))
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("sales.recordError"))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id: number) {
    try {
      await deleteSale(id)
      toast.success(t("sales.deleted"))
    } catch {
      toast.error(t("sales.deleteError"))
    }
  }

  const previewTotal = selectedProduct
    ? selectedProduct.salePrice * (Number.parseInt(quantity, 10) || 0)
    : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("sales.search")}
            className="pl-9"
            aria-label={t("sales.search")}
          />
        </div>

        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) resetForm()
          }}
        >
          <DialogTrigger
            render={<Button className="gap-2" disabled={products.length === 0} />}
          >
            <Plus className="size-4" />
            {t("sales.newSale")}
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("sales.recordSale")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t("sales.product")}</Label>
                <Select value={productId} onValueChange={(v) => setProductId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("sales.chooseProduct")} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} disabled={p.quantity <= 0}>
                        {p.name} —{" "}
                        {p.quantity > 0 ? `${p.quantity} ${t("common.inStock")}` : t("status.out_of_stock")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="qty">{t("sales.quantity")}</Label>
                  <Input
                    id="qty"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("sales.unitPrice")}</Label>
                  <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm">
                    {selectedProduct ? money(selectedProduct.salePrice) : "—"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="customer">{t("sales.customer")}</Label>
                  <Input
                    id="customer"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder={t("sales.customerName")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("sales.payment")}</Label>
                  <Select value={payment} onValueChange={(v) => setPayment(v ?? PAYMENT_METHODS[0])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {tPayment(m)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedProduct && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("sales.saleTotal")}</span>
                    <span className="font-semibold">{money(previewTotal)}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                {t("common.cancel")}
              </Button>
              <Button onClick={onSubmit} disabled={saving}>
                {saving ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t("sales.revenue")}</p>
            <p className="mt-1 text-xl font-semibold sm:text-2xl">{money(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t("sales.profit")}</p>
            <p className="mt-1 text-xl font-semibold text-chart-3 sm:text-2xl">{money(totalProfit)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("sales.colDate")}</TableHead>
                  <TableHead>{t("sales.product")}</TableHead>
                  <TableHead className="text-right">{t("sales.colQty")}</TableHead>
                  <TableHead className="text-right">{t("sales.colUnitPrice")}</TableHead>
                  <TableHead className="text-right">{t("sales.colTotal")}</TableHead>
                  <TableHead>{t("sales.colCustomer")}</TableHead>
                  <TableHead>{t("sales.colPayment")}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="size-8 opacity-40" />
                        {t("sales.noSales")}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(s.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">{s.productName}</TableCell>
                      <TableCell className="text-right">{s.quantity}</TableCell>
                      <TableCell className="text-right">{money(s.unitSalePrice)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {money(s.unitSalePrice * s.quantity)}
                      </TableCell>
                      <TableCell>{s.customerName || "—"}</TableCell>
                      <TableCell>
                        {s.paymentMethod ? <Badge variant="secondary">{tPayment(s.paymentMethod)}</Badge> : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(s.id)}
                          aria-label={t("sales.deleteSaleOf", { v: s.productName })}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
