"use server"

import { db } from "@/lib/db"
import { suppliers, products } from "@/lib/db/schema"
import { getUserId } from "@/lib/session"
import { and, asc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getSuppliers() {
  const userId = await getUserId()
  return db.select().from(suppliers).where(eq(suppliers.userId, userId)).orderBy(asc(suppliers.name))
}

export async function getSuppliersWithCounts() {
  const userId = await getUserId()
  const rows = await db
    .select({
      id: suppliers.id,
      name: suppliers.name,
      contactName: suppliers.contactName,
      phone: suppliers.phone,
      email: suppliers.email,
      address: suppliers.address,
      notes: suppliers.notes,
      productCount: sql<number>`count(${products.id})`.mapWith(Number),
    })
    .from(suppliers)
    .leftJoin(products, and(eq(products.supplierId, suppliers.id), eq(products.userId, userId)))
    .where(eq(suppliers.userId, userId))
    .groupBy(suppliers.id)
    .orderBy(asc(suppliers.name))
  return rows
}

export type SupplierInput = {
  name: string
  contactName?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
}

export async function createSupplier(input: SupplierInput) {
  const userId = await getUserId()
  await db.insert(suppliers).values({ ...input, userId })
  revalidatePath("/fournisseurs")
  revalidatePath("/stock")
}

export async function updateSupplier(id: number, input: SupplierInput) {
  const userId = await getUserId()
  await db
    .update(suppliers)
    .set(input)
    .where(and(eq(suppliers.id, id), eq(suppliers.userId, userId)))
  revalidatePath("/fournisseurs")
}

export async function deleteSupplier(id: number) {
  const userId = await getUserId()
  await db.delete(suppliers).where(and(eq(suppliers.id, id), eq(suppliers.userId, userId)))
  revalidatePath("/fournisseurs")
}
