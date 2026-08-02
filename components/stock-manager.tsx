"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  type ProductRow,
  type ProductInput,
} from "@/app/actions/products"
import { CATEGORIES, stockStatus } from "@/lib/helpers"
import { usePreferences } from "@/components/preferences-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Minus, Search } from "lucide-react"

type Supplier = { id: number; name: string }

const emptyForm: ProductInput = {
  sku: "",
  name: "",
  category: CATEGORIES[0],
  brand: "",
  supplierId: null,
  purchasePrice: 0,
  salePrice: 0,
  quantity: 0,
  reorderThreshold: 5,
}

function StatusBadge({ quantity, threshold }: { quantity: number; threshold: number }) {
  const { t } = usePreferences()
  const status = stockStatus(quantity, threshold)
  const label = t(`status.${status}`)
  if (status === "out_of_stock") return <Badge variant="destructive">{label}</Badge>
  if (status === "low_stock")
    return <Badge className="bg-chart-4/15 text-chart-4 hover:bg-chart-4/15">{label}</Badge>
  return <Badge className="bg-chart-3/15 text-chart-3 hover:bg-chart-3/15">{label}</Badge>
}

export function StockManager({ products, suppliers }: { products: ProductRow[]; suppliers: Supplier[] }) {
  const { t, money, formatRawMoney, tCategory, symbol, decimals, fromBase, toBase } = usePreferences()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProductRow | null>(null)
  const [form, setForm] = useState<ProductInput>(emptyForm)
  const [saving, setSaving] = useState(false)

  // Les prix du formulaire sont saisis dans la devise active ; la base est en euros.
  const roundToCur = (eur: number) => {
    const v = fromBase(eur)
    return decimals === 0 ? Math.round(v) : Math.round(v * 100) / 100
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase()) ||
        (p.brand ?? "").toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === "all" || p.category === category
      return matchesQuery && matchesCategory
    })
  }, [products, query, category])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(p: ProductRow) {
    setEditing(p)
    setForm({
      sku: p.sku,
      name: p.name,
      category: p.category,
      brand: p.brand ?? "",
      supplierId: p.supplierId,
      purchasePrice: roundToCur(p.purchasePrice),
      salePrice: roundToCur(p.salePrice),
      quantity: p.quantity,
      reorderThreshold: p.reorderThreshold,
    })
    setOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.sku.trim()) {
      toast.error(t("stock.skuRequired"))
      return
    }
    setSaving(true)
    // Reconversion des prix (devise active -> euros) avant enregistrement.
    const payload: ProductInput = {
      ...form,
      purchasePrice: toBase(form.purchasePrice),
      salePrice: toBase(form.salePrice),
    }
    try {
      if (editing) {
        await updateProduct(editing.id, payload)
        toast.success(t("stock.productUpdated"))
      } else {
        await createProduct(payload)
        toast.success(t("stock.productAdded"))
      }
      setOpen(false)
    } catch {
      toast.error(t("common.error"))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(p: ProductRow) {
    if (!confirm(t("stock.confirmDelete", { v: p.name }))) return
    try {
      await deleteProduct(p.id)
      toast.success(t("stock.productDeleted"))
    } catch {
      toast.error(t("stock.deleteError"))
    }
  }

  async function handleAdjust(p: ProductRow, delta: number) {
    try {
      await adjustStock(p.id, delta)
    } catch {
      toast.error(t("stock.adjustError"))
    }
  }

  const margin = form.salePrice > 0 ? ((form.salePrice - form.purchasePrice) / form.salePrice) * 100 : 0

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("stock.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("stock.subtitle", { v: products.length })}</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" /> {t("stock.addProduct")}
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("stock.search")}
            className="pl-9 text-base"
          />
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder={t("stock.category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("stock.allCategories")}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {tCategory(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vue desktop : tableau */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("stock.colProduct")}</TableHead>
                <TableHead>{t("stock.category")}</TableHead>
                <TableHead className="text-right">{t("stock.colPurchase")}</TableHead>
                <TableHead className="text-right">{t("stock.colSale")}</TableHead>
                <TableHead className="text-right">{t("stock.colMargin")}</TableHead>
                <TableHead className="text-center">{t("stock.colStock")}</TableHead>
                <TableHead>{t("stock.colStatus")}</TableHead>
                <TableHead className="text-right">{t("stock.colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    {t("stock.noProducts")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const m = p.salePrice > 0 ? ((p.salePrice - p.purchasePrice) / p.salePrice) * 100 : 0
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.sku}
                          {p.brand ? ` · ${p.brand}` : ""}
                          {p.supplierName ? ` · ${p.supplierName}` : ""}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tCategory(p.category)}</TableCell>
                      <TableCell className="text-right text-sm">{money(p.purchasePrice)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{money(p.salePrice)}</TableCell>
                      <TableCell className="text-right text-sm text-chart-3">{m.toFixed(0)}%</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            onClick={() => handleAdjust(p, -1)}
                            aria-label={t("stock.decreaseStock")}
                          >
                            <Minus className="size-3.5" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">{p.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            onClick={() => handleAdjust(p, 1)}
                            aria-label={t("stock.increaseStock")}
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge quantity={p.quantity} threshold={p.reorderThreshold} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(p)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            onClick={() => handleDelete(p)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vue mobile : cartes */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("stock.noProducts")}</p>
        ) : (
          filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.sku}
                      {p.brand ? ` · ${p.brand}` : ""}
                    </p>
                  </div>
                  <StatusBadge quantity={p.quantity} threshold={p.reorderThreshold} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{money(p.salePrice)}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="size-8" onClick={() => handleAdjust(p, -1)}>
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{p.quantity}</span>
                    <Button variant="outline" size="icon" className="size-8" onClick={() => handleAdjust(p, 1)}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(p)}>
                    <Pencil className="size-3.5" /> {t("common.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive"
                    onClick={() => handleDelete(p)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editing ? t("stock.editProduct") : t("stock.newProduct")}
            </DialogTitle>
            <DialogDescription>{t("stock.dialogDesc")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="sku">{t("stock.sku")}</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="text-base"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="brand">{t("stock.brand")}</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="text-base"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">{t("stock.productName")}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>{t("stock.category")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v ?? CATEGORIES[0] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {tCategory(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t("stock.supplier")}</Label>
                <Select
                  value={form.supplierId ? String(form.supplierId) : "none"}
                  onValueChange={(v) => setForm({ ...form, supplierId: !v || v === "none" ? null : Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.none")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("common.none")}</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="purchase">
                  {t("stock.purchasePrice")} ({symbol})
                </Label>
                <Input
                  id="purchase"
                  type="number"
                  inputMode="decimal"
                  step={decimals === 0 ? "1" : "0.01"}
                  value={form.purchasePrice}
                  onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
                  className="text-base"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="sale">
                  {t("stock.salePrice")} ({symbol})
                </Label>
                <Input
                  id="sale"
                  type="number"
                  inputMode="decimal"
                  step={decimals === 0 ? "1" : "0.01"}
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })}
                  className="text-base"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("stock.marginCalc")} <span className="font-semibold text-chart-3">{margin.toFixed(1)}%</span> (
              {formatRawMoney(form.salePrice - form.purchasePrice)} {t("stock.perUnit")})
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="qty">{t("stock.quantity")}</Label>
                <Input
                  id="qty"
                  type="number"
                  inputMode="numeric"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  className="text-base"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="threshold">{t("stock.threshold")}</Label>
                <Input
                  id="threshold"
                  type="number"
                  inputMode="numeric"
                  value={form.reorderThreshold}
                  onChange={(e) => setForm({ ...form, reorderThreshold: Number(e.target.value) })}
                  className="text-base"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {editing ? t("common.save") : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
