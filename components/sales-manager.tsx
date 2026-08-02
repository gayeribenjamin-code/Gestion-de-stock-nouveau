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
import { formatCurrency, formatDate, PAYMENT_METHODS } from "@/lib/helpers"
import { createSale, deleteSale, type SaleRow } from "@/app/actions/sales"
import type { ProductRow } from "@/app/actions/products"

export function SalesManager({
  sales,
  products,
}: {
  sales: SaleRow[]
  products: ProductRow[]
}) {
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
      toast.error("Sélectionnez un produit.")
      return
    }
    const qty = Number.parseInt(quantity, 10)
    if (!Number.isInteger(qty) || qty <= 0) {
      toast.error("Quantité invalide.")
      return
    }
    if (qty > selectedProduct.quantity) {
      toast.error(`Stock insuffisant : ${selectedProduct.quantity} en stock.`)
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
      toast.success("Vente enregistrée. Stock mis à jour.")
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible d'enregistrer la vente.")
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id: number) {
    try {
      await deleteSale(id)
      toast.success("Vente supprimée. Stock restauré.")
    } catch {
      toast.error("Suppression impossible.")
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
            placeholder="Rechercher une vente..."
            className="pl-9"
            aria-label="Rechercher une vente"
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
            Nouvelle vente
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Enregistrer une vente</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Produit</Label>
                <Select value={productId} onValueChange={(v) => setProductId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} disabled={p.quantity <= 0}>
                        {p.name} — {p.quantity > 0 ? `${p.quantity} en stock` : "Rupture"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="qty">Quantité</Label>
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
                  <Label>Prix unitaire</Label>
                  <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm">
                    {selectedProduct ? formatCurrency(selectedProduct.salePrice) : "—"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="customer">Client (optionnel)</Label>
                  <Input
                    id="customer"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="Nom du client"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Paiement</Label>
                  <Select value={payment} onValueChange={(v) => setPayment(v ?? PAYMENT_METHODS[0])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedProduct && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de la vente</span>
                    <span className="font-semibold">{formatCurrency(previewTotal)}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Annuler
              </Button>
              <Button onClick={onSubmit} disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
            <p className="mt-1 text-xl font-semibold sm:text-2xl">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Bénéfice</p>
            <p className="mt-1 text-xl font-semibold text-chart-3 sm:text-2xl">
              {formatCurrency(totalProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">Prix U.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="size-8 opacity-40" />
                        Aucune vente pour le moment.
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
                      <TableCell className="text-right">{formatCurrency(s.unitSalePrice)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(s.unitSalePrice * s.quantity)}
                      </TableCell>
                      <TableCell>{s.customerName || "—"}</TableCell>
                      <TableCell>
                        {s.paymentMethod ? <Badge variant="secondary">{s.paymentMethod}</Badge> : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(s.id)}
                          aria-label={`Supprimer la vente de ${s.productName}`}
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
