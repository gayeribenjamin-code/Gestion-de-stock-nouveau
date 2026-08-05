"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Search, Trash2, FileText, Printer, Check, X, Eye } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { PAYMENT_METHODS } from "@/lib/helpers"
import { usePreferences } from "@/components/preferences-provider"
import {
  createInvoice,
  deleteInvoice,
  setInvoiceStatus,
  type InvoiceListRow,
  type InvoiceStatus,
} from "@/app/actions/invoices"
import type { ProductRow } from "@/app/actions/products"
import type { CustomerWithStats } from "@/app/actions/customers"

type Line = { key: string; productId: string; quantity: string }

function newLine(): Line {
  return { key: Math.random().toString(36).slice(2), productId: "", quantity: "1" }
}

export function InvoicesManager({
  invoices,
  products,
  customers,
}: {
  invoices: InvoiceListRow[]
  products: ProductRow[]
  customers: CustomerWithStats[]
}) {
  const { t, money, formatDate, tPayment } = usePreferences()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Formulaire
  const [customerId, setCustomerId] = useState<string>("free")
  const [customerName, setCustomerName] = useState("")
  const [payment, setPayment] = useState<string>(PAYMENT_METHODS[0])
  const [status, setStatus] = useState<InvoiceStatus>("paid")
  const [notes, setNotes] = useState("")
  const [lines, setLines] = useState<Line[]>([newLine()])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return invoices
    return invoices.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        (i.customerName ?? "").toLowerCase().includes(q),
    )
  }, [invoices, query])

  const productById = useMemo(() => new Map(products.map((p) => [String(p.id), p])), [products])

  const grandTotal = lines.reduce((acc, l) => {
    const p = productById.get(l.productId)
    const qty = Number.parseInt(l.quantity, 10) || 0
    return acc + (p ? p.salePrice * qty : 0)
  }, 0)

  function resetForm() {
    setCustomerId("free")
    setCustomerName("")
    setPayment(PAYMENT_METHODS[0])
    setStatus("paid")
    setNotes("")
    setLines([newLine()])
  }

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev))
  }

  async function onSubmit() {
    const cleanLines = lines
      .map((l) => ({ productId: Number.parseInt(l.productId, 10), quantity: Number.parseInt(l.quantity, 10) }))
      .filter((l) => l.productId && l.quantity > 0)

    if (cleanLines.length === 0) {
      toast.error(t("inv.noLine"))
      return
    }

    setSaving(true)
    try {
      const id = await createInvoice({
        customerId: customerId === "free" ? null : Number.parseInt(customerId, 10),
        customerName: customerId === "free" ? customerName.trim() || null : null,
        status,
        paymentMethod: payment,
        notes: notes.trim() || null,
        lines: cleanLines,
      })
      toast.success(t("inv.created"))
      setOpen(false)
      resetForm()
      router.push(`/factures/${id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("inv.createError"))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(inv: InvoiceListRow) {
    if (!confirm(t("inv.confirmDelete", { v: inv.invoiceNumber }))) return
    try {
      await deleteInvoice(inv.id)
      toast.success(t("inv.deleted"))
      router.refresh()
    } catch {
      toast.error(t("inv.deleteError"))
    }
  }

  async function onToggleStatus(inv: InvoiceListRow) {
    const next: InvoiceStatus = inv.status === "paid" ? "unpaid" : "paid"
    try {
      await setInvoiceStatus(inv.id, next)
      router.refresh()
    } catch {
      toast.error(t("common.error"))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("inv.search")}
            className="pl-9"
            aria-label={t("inv.search")}
          />
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            resetForm()
            setOpen(true)
          }}
          disabled={products.length === 0}
        >
          <Plus className="size-4" />
          {t("inv.new")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("inv.colNumber")}</TableHead>
                  <TableHead>{t("inv.colDate")}</TableHead>
                  <TableHead>{t("inv.colCustomer")}</TableHead>
                  <TableHead className="text-right">{t("inv.colItems")}</TableHead>
                  <TableHead className="text-right">{t("inv.colTotal")}</TableHead>
                  <TableHead>{t("inv.colStatus")}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="size-8 opacity-40" />
                        {t("inv.none")}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(inv.createdAt)}
                      </TableCell>
                      <TableCell>{inv.customerName || "—"}</TableCell>
                      <TableCell className="text-right">{inv.itemCount}</TableCell>
                      <TableCell className="text-right font-semibold">{money(inv.total)}</TableCell>
                      <TableCell>
                        <button type="button" onClick={() => onToggleStatus(inv)} className="cursor-pointer">
                          <Badge variant={inv.status === "paid" ? "default" : "secondary"}>
                            {t(`inv.status.${inv.status}`)}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon" className="size-8" aria-label={t("inv.colActions")} />
                            }
                          >
                            <MoreVertical className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/factures/${inv.id}`)}>
                              <Eye className="size-4" /> {t("inv.view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/factures/${inv.id}?print=1`)}>
                              <Printer className="size-4" /> {t("inv.print")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleStatus(inv)}>
                              {inv.status === "paid" ? (
                                <>
                                  <X className="size-4" /> {t("inv.markUnpaid")}
                                </>
                              ) : (
                                <>
                                  <Check className="size-4" /> {t("inv.markPaid")}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(inv)}>
                              <Trash2 className="size-4" /> {t("inv.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) resetForm()
        }}
      >
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("inv.dialogTitle")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>{t("inv.customer")}</Label>
                <Select value={customerId} onValueChange={(v) => setCustomerId(v ?? "free")}>
                  <SelectTrigger>
                    <SelectValue>
                      {(value: string) =>
                        value === "free"
                          ? t("inv.customerFree")
                          : customers.find((c) => String(c.id) === value)?.name ?? t("inv.chooseCustomer")
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">{t("inv.customerFree")}</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {customerId === "free" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invCustName">{t("inv.orTypeName")}</Label>
                  <Input
                    id="invCustName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Awa Diop"
                  />
                </div>
              )}
            </div>

            {/* Lignes de produits */}
            <div className="flex flex-col gap-2">
              <Label>{t("inv.lines")}</Label>
              <div className="flex flex-col gap-2">
                {lines.map((line) => {
                  const p = productById.get(line.productId)
                  const qty = Number.parseInt(line.quantity, 10) || 0
                  const lineTotal = p ? p.salePrice * qty : 0
                  return (
                    <div key={line.key} className="flex items-end gap-2 rounded-lg border border-border p-2">
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="text-xs text-muted-foreground">{t("inv.lineProduct")}</span>
                        <Select
                          value={line.productId}
                          onValueChange={(v) => updateLine(line.key, { productId: v ?? "" })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("inv.lineProduct")}>
                              {(value: string) => productById.get(value)?.name ?? t("inv.lineProduct")}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((prod) => (
                              <SelectItem key={prod.id} value={String(prod.id)} disabled={prod.quantity <= 0}>
                                {prod.name} — {t("inv.stockLeft", { v: prod.quantity })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex w-16 flex-col gap-1">
                        <span className="text-xs text-muted-foreground">{t("inv.lineQty")}</span>
                        <Input
                          type="number"
                          min={1}
                          inputMode="numeric"
                          value={line.quantity}
                          onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                        />
                      </div>
                      <div className="flex w-24 flex-col gap-1 text-right">
                        <span className="text-xs text-muted-foreground">{t("inv.lineTotal")}</span>
                        <span className="flex h-9 items-center justify-end text-sm font-medium">
                          {money(lineTotal)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeLine(line.key)}
                        disabled={lines.length === 1}
                        aria-label={t("inv.removeLine")}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 self-start" onClick={() => setLines((p) => [...p, newLine()])}>
                <Plus className="size-4" /> {t("inv.addLine")}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>{t("inv.payment")}</Label>
                <Select value={payment} onValueChange={(v) => setPayment(v ?? PAYMENT_METHODS[0])}>
                  <SelectTrigger>
                    <SelectValue>{(value: string) => tPayment(value)}</SelectValue>
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
              <div className="flex flex-col gap-2">
                <Label>{t("inv.statusLabel")}</Label>
                <Select value={status} onValueChange={(v) => setStatus((v as InvoiceStatus) ?? "paid")}>
                  <SelectTrigger>
                    <SelectValue>{(value: string) => t(`inv.status.${value}`)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">{t("inv.status.paid")}</SelectItem>
                    <SelectItem value="unpaid">{t("inv.status.unpaid")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="invNotes">{t("inv.notes")}</Label>
              <Input id="invNotes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm text-muted-foreground">{t("inv.grandTotal")}</span>
              <span className="text-lg font-semibold">{money(grandTotal)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              {t("common.cancel")}
            </Button>
            <Button onClick={onSubmit} disabled={saving}>
              {saving ? t("inv.creating") : t("inv.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
