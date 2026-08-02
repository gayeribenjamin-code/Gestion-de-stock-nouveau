"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, Truck, Phone, Mail, MapPin, Package } from "lucide-react"
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
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
  type SupplierInput,
} from "@/app/actions/suppliers"

type SupplierWithCount = {
  id: number
  name: string
  contactName: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  productCount: number
}

const emptyForm: SupplierInput = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
}

export function SuppliersManager({ suppliers }: { suppliers: SupplierWithCount[] }) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SupplierWithCount | null>(null)
  const [form, setForm] = useState<SupplierInput>(emptyForm)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return suppliers
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.contactName ?? "").toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q),
    )
  }, [suppliers, query])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(s: SupplierWithCount) {
    setEditing(s)
    setForm({
      name: s.name,
      contactName: s.contactName ?? "",
      phone: s.phone ?? "",
      email: s.email ?? "",
      address: s.address ?? "",
      notes: s.notes ?? "",
    })
    setOpen(true)
  }

  async function onSubmit() {
    if (!form.name.trim()) {
      toast.error("Le nom du fournisseur est requis.")
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateSupplier(editing.id, form)
        toast.success("Fournisseur mis à jour.")
      } else {
        await createSupplier(form)
        toast.success("Fournisseur ajouté.")
      }
      setOpen(false)
    } catch {
      toast.error("Enregistrement impossible.")
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(s: SupplierWithCount) {
    try {
      await deleteSupplier(s.id)
      toast.success("Fournisseur supprimé.")
    } catch {
      toast.error("Suppression impossible.")
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
            placeholder="Rechercher un fournisseur..."
            className="pl-9"
            aria-label="Rechercher un fournisseur"
          />
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="size-4" />
          Nouveau fournisseur
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <Truck className="size-8 opacity-40" />
            Aucun fournisseur.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Truck className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold leading-tight text-foreground">{s.name}</p>
                      {s.contactName && (
                        <p className="text-sm text-muted-foreground">{s.contactName}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                    <Package className="size-3" />
                    {s.productCount}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  {s.phone && (
                    <span className="flex items-center gap-2">
                      <Phone className="size-3.5 shrink-0" />
                      {s.phone}
                    </span>
                  )}
                  {s.email && (
                    <span className="flex items-center gap-2 break-all">
                      <Mail className="size-3.5 shrink-0" />
                      {s.email}
                    </span>
                  )}
                  {s.address && (
                    <span className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0" />
                      {s.address}
                    </span>
                  )}
                </div>

                {s.notes && <p className="text-sm text-muted-foreground/80">{s.notes}</p>}

                <div className="mt-auto flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => openEdit(s)}>
                    <Pencil className="size-3.5" />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(s)}
                    aria-label={`Supprimer ${s.name}`}
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
            <DialogTitle>{editing ? "Modifier le fournisseur" : "Nouveau fournisseur"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="TechDistrib SARL"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={onSubmit} disabled={saving}>
              {saving ? "Enregistrement..." : editing ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
