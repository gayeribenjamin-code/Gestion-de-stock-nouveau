"use server"

import { db } from "@/lib/db"
import { customers, invoices, products, sales } from "@/lib/db/schema"
import { getUserId } from "@/lib/session"
import { and, desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type InvoiceStatus = "paid" | "unpaid"

export type InvoiceListRow = {
  id: number
  invoiceNumber: string
  customerId: number | null
  customerName: string | null
  status: InvoiceStatus
  paymentMethod: string | null
  total: number
  itemCount: number
  createdAt: Date
}

export type InvoiceLine = {
  id: number
  productId: number
  productName: string
  quantity: number
  unitSalePrice: number
}

export type InvoiceDetail = {
  id: number
  invoiceNumber: string
  customerId: number | null
  customerName: string | null
  status: InvoiceStatus
  paymentMethod: string | null
  notes: string | null
  total: number
  createdAt: Date
  lines: InvoiceLine[]
}

export async function getInvoices(customerId?: number): Promise<InvoiceListRow[]> {
  const userId = await getUserId()
  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      customerId: invoices.customerId,
      customerName: invoices.customerName,
      status: invoices.status,
      paymentMethod: invoices.paymentMethod,
      total: invoices.total,
      createdAt: invoices.createdAt,
      itemCount: sql<number>`coalesce(sum(${sales.quantity}), 0)`,
    })
    .from(invoices)
    .leftJoin(sales, and(eq(sales.invoiceId, invoices.id), eq(sales.userId, userId)))
    .where(
      customerId
        ? and(eq(invoices.userId, userId), eq(invoices.customerId, customerId))
        : eq(invoices.userId, userId),
    )
    .groupBy(invoices.id)
    .orderBy(desc(invoices.createdAt))

  return rows.map((r) => ({
    ...r,
    status: (r.status as InvoiceStatus) ?? "paid",
    total: Number(r.total),
    itemCount: Number(r.itemCount),
  }))
}

export async function getInvoice(id: number): Promise<InvoiceDetail | null> {
  const userId = await getUserId()
  const [inv] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
  if (!inv) return null

  const lineRows = await db
    .select()
    .from(sales)
    .where(and(eq(sales.invoiceId, id), eq(sales.userId, userId)))

  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerId: inv.customerId,
    customerName: inv.customerName,
    status: (inv.status as InvoiceStatus) ?? "paid",
    paymentMethod: inv.paymentMethod,
    notes: inv.notes,
    total: Number(inv.total),
    createdAt: inv.createdAt,
    lines: lineRows.map((l) => ({
      id: l.id,
      productId: l.productId,
      productName: l.productName,
      quantity: l.quantity,
      unitSalePrice: Number(l.unitSalePrice),
    })),
  }
}

export type InvoiceInput = {
  customerId?: number | null
  customerName?: string | null
  status: InvoiceStatus
  paymentMethod?: string | null
  notes?: string | null
  lines: { productId: number; quantity: number }[]
}

export async function createInvoice(input: InvoiceInput): Promise<number> {
  const userId = await getUserId()

  const cleanLines = input.lines.filter((l) => l.productId && l.quantity > 0)
  if (cleanLines.length === 0) throw new Error("Ajoutez au moins un produit à la facture")

  // Regroupe les quantités par produit (au cas où le même produit est ajouté plusieurs fois)
  const qtyByProduct = new Map<number, number>()
  for (const l of cleanLines) {
    qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) ?? 0) + Math.floor(l.quantity))
  }

  const newId = await db.transaction(async (tx) => {
    // 1. Charge et valide tous les produits
    const productRows = await tx
      .select()
      .from(products)
      .where(eq(products.userId, userId))
    const byId = new Map(productRows.map((p) => [p.id, p]))

    let total = 0
    for (const [productId, qty] of qtyByProduct) {
      const p = byId.get(productId)
      if (!p) throw new Error("Produit introuvable")
      if (p.quantity < qty) {
        throw new Error(`Stock insuffisant pour ${p.name} : il reste ${p.quantity} unité(s)`)
      }
      total += Number(p.salePrice) * qty
    }

    // 2. Numéro de facture séquentiel par année (F-AAAA-000N)
    const year = new Date().getFullYear()
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(and(eq(invoices.userId, userId), sql`extract(year from ${invoices.createdAt}) = ${year}`))
    const seq = Number(count) + 1
    const invoiceNumber = `F-${year}-${String(seq).padStart(4, "0")}`

    // 3. Résout le nom du client (snapshot)
    let customerName = input.customerName?.trim() || null
    if (input.customerId) {
      const [c] = await tx
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, userId)))
      if (c) customerName = c.name
    }

    // 4. Crée l'en-tête de facture
    const [inv] = await tx
      .insert(invoices)
      .values({
        userId,
        invoiceNumber,
        customerId: input.customerId ?? null,
        customerName,
        status: input.status,
        paymentMethod: input.paymentMethod || null,
        notes: input.notes?.trim() || null,
        total: String(total.toFixed(2)),
      })
      .returning({ id: invoices.id })

    // 5. Crée les lignes (dans sales) et décrémente le stock
    for (const [productId, qty] of qtyByProduct) {
      const p = byId.get(productId)!
      await tx.insert(sales).values({
        userId,
        productId: p.id,
        productName: p.name,
        quantity: qty,
        unitSalePrice: p.salePrice,
        unitPurchasePrice: p.purchasePrice,
        customerName,
        paymentMethod: input.paymentMethod || null,
        invoiceId: inv.id,
      })
      await tx
        .update(products)
        .set({ quantity: p.quantity - qty, updatedAt: new Date() })
        .where(and(eq(products.id, p.id), eq(products.userId, userId)))
    }

    return inv.id
  })

  revalidatePath("/factures")
  revalidatePath("/ventes")
  revalidatePath("/stock")
  revalidatePath("/")
  return newId
}

export async function setInvoiceStatus(id: number, status: InvoiceStatus) {
  const userId = await getUserId()
  await db
    .update(invoices)
    .set({ status })
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
  revalidatePath("/factures")
}

export async function deleteInvoice(id: number) {
  const userId = await getUserId()

  await db.transaction(async (tx) => {
    const [inv] = await tx
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
    if (!inv) return

    // Restitue le stock pour chaque ligne
    const lineRows = await tx
      .select()
      .from(sales)
      .where(and(eq(sales.invoiceId, id), eq(sales.userId, userId)))

    for (const l of lineRows) {
      const [p] = await tx
        .select()
        .from(products)
        .where(and(eq(products.id, l.productId), eq(products.userId, userId)))
      if (p) {
        await tx
          .update(products)
          .set({ quantity: p.quantity + l.quantity, updatedAt: new Date() })
          .where(and(eq(products.id, p.id), eq(products.userId, userId)))
      }
    }

    await tx.delete(sales).where(and(eq(sales.invoiceId, id), eq(sales.userId, userId)))
    await tx.delete(invoices).where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
  })

  revalidatePath("/factures")
  revalidatePath("/ventes")
  revalidatePath("/stock")
  revalidatePath("/")
}
