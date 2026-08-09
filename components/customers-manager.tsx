"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, Users, Phone, Mail, MapPin, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usePreferences } from "@/components/preferences-provider"
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type CustomerWithStats,
  type CustomerInput,
} from "@/app/actions/customers"

const emptyForm: CustomerInput = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
}

export function CustomersManager({
  customers,
  onViewInvoices,
}: {
  customers: CustomerWithStats[]
  onViewInvoices?: (customerId: number) => void
}) {
  const { t, money } = usePreferences()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CustomerWithStats | null>(null)
  const [form, setForm] = useState<CustomerInput>(emptyForm)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q),
    )
  }, [customers, query])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(c: CustomerWithStats) {
    setEditing(c)
    setForm({
      name: c.name,
      phone: c.phone ?? "",
      email: c.email ?? "",
      address: c.address ?? "",
      notes: c.notes ?? "",
    })
    setOpen(true)
  }

  async function onSubmit() {
    if (!form.name.trim()) {
      toast.error(t("cust.nameRequired"))
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateCustomer(editing.id, form)
        toast.success(t("cust.updated"))
      } else {
        await createCustomer(form)
        toast.success(t("cust.added"))
      }
      setOpen(false)
      router.refresh()
    } catch {
      toast.error(t("cust.saveError"))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(c: CustomerWithStats) {
    if (!confirm(t("cust.confirmDelete", { v: c.name }))) return
    try {
      await deleteCustomer(c.id)
      toast.success(t("cust.deleted"))
      router.refresh()
    } catch {
      toast.error(t("cust.deleteError"))
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
            placeholder={t("cust.search")}
            className="pl-9"
            aria-label={t("cust.search")}
          />
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="size-4" />
          {t("cust.new")}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <Users className="size-8 opacity-40" />
            {t("cust.none")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="size-4" />
                    </div>
                    <p className="font-semibold leading-tight text-foreground">{c.name}</p>
                  </div>
                  <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                    <FileText className="size-3" />
                    {c.invoiceCount}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  {c.phone && (
                    <span className="flex items-center gap-2">
                      <Phone className="size-3.5 shrink-0" />
                      {c.phone}
                    </span>
                  )}
                  {c.email && (
                    <span className="flex items-center gap-2 break-all">
                      <Mail className="size-3.5 shrink-0" />
                      {c.email}
                    </span>
                  )}
                  {c.address && (
                    <span className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0" />
                      {c.address}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{t("cust.totalSpent")}</span>
                  <span className="font-semibold">{money(c.totalSpent)}</span>
                </div>

                <div className="mt-auto flex gap-2 pt-2">
                  {onViewInvoices && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => onViewInvoices(c.id)}
                      disabled={c.invoiceCount === 0}
                    >
                      <FileText className="size-3.5" />
                      {t("cust.viewInvoices")}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEdit(c)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(c)}
                    aria-label={t("cust.deleteCustomer", { v: c.name })}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t("cust.edit") : t("cust.add")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cname">{t("cust.name")} *</Label>
              <Input
                id="cname"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Awa Diop"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cphone">{t("cust.phone")}</Label>
                <Input
                  id="cphone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cemail">{t("cust.email")}</Label>
                <Input
                  id="cemail"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="caddress">{t("cust.address")}</Label>
              <Input
                id="caddress"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cnotes">{t("cust.notes")}</Label>
              <Input
                id="cnotes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              {t("common.cancel")}
            </Button>
            <Button onClick={onSubmit} disabled={saving}>
              {saving ? t("common.saving") : editing ? t("common.update") : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
