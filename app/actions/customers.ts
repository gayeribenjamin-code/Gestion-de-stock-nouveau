"use server"

import { db } from "@/lib/db"
import { customers, invoices } from "@/lib/db/schema"
import { getUserId } from "@/lib/session"
import { and, desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type CustomerRow = {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  invoiceCount: number
  totalSpent: number
  createdAt: Date
}

// Alias utilisé côté UI
export type CustomerWithStats = CustomerRow

export async function getCustomers(): Promise<CustomerRow[]> {
  const userId = await getUserId()
  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      email: customers.email,
      address: customers.address,
      notes: customers.notes,
      createdAt: customers.createdAt,
      invoiceCount: sql<number>`count(${invoices.id})`,
      totalSpent: sql<number>`coalesce(sum(${invoices.total}), 0)`,
    })
    .from(customers)
    .leftJoin(invoices, and(eq(invoices.customerId, customers.id), eq(invoices.userId, userId)))
    .where(eq(customers.userId, userId))
    .groupBy(customers.id)
    .orderBy(desc(customers.createdAt))

  return rows.map((r) => ({
    ...r,
    invoiceCount: Number(r.invoiceCount),
    totalSpent: Number(r.totalSpent),
  }))
}

export type CustomerInput = {
  name: string
  phone?: string
  email?: string
  address?: string
  notes?: string
}

export async function createCustomer(input: CustomerInput): Promise<number> {
  const userId = await getUserId()
  if (!input.name?.trim()) throw new Error("Le nom du client est requis")
  const [row] = await db
    .insert(customers)
    .values({
      userId,
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .returning({ id: customers.id })
  revalidatePath("/factures")
  return row.id
}

export async function updateCustomer(id: number, input: CustomerInput) {
  const userId = await getUserId()
  if (!input.name?.trim()) throw new Error("Le nom du client est requis")
  await db
    .update(customers)
    .set({
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
  // Met à jour le snapshot du nom sur les factures rattachées
  await db
    .update(invoices)
    .set({ customerName: input.name.trim() })
    .where(and(eq(invoices.customerId, id), eq(invoices.userId, userId)))
  revalidatePath("/factures")
}

export async function deleteCustomer(id: number) {
  const userId = await getUserId()
  // On conserve l'historique des factures : on détache seulement le client
  // (le nom reste enregistré en snapshot sur la facture).
  await db
    .update(invoices)
    .set({ customerId: null })
    .where(and(eq(invoices.customerId, id), eq(invoices.userId, userId)))
  await db.delete(customers).where(and(eq(customers.id, id), eq(customers.userId, userId)))
  revalidatePath("/factures")
}
