"use server"

import { db } from "@/lib/db"
import { products, suppliers } from "@/lib/db/schema"
import { getUserId } from "@/lib/session"
import { and, asc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type ProductRow = {
  id: number
  sku: string
  name: string
  category: string
  brand: string | null
  supplierId: number | null
  supplierName: string | null
  purchasePrice: number
  salePrice: number
  quantity: number
  reorderThreshold: number
}

export async function getProducts(): Promise<ProductRow[]> {
  const userId = await getUserId()
  const rows = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      category: products.category,
      brand: products.brand,
      supplierId: products.supplierId,
      supplierName: suppliers.name,
      purchasePrice: products.purchasePrice,
      salePrice: products.salePrice,
      quantity: products.quantity,
      reorderThreshold: products.reorderThreshold,
    })
    .from(products)
    .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
    .where(eq(products.userId, userId))
    .orderBy(asc(products.name))

  return rows.map((r) => ({
    ...r,
    purchasePrice: Number(r.purchasePrice),
    salePrice: Number(r.salePrice),
  }))
}

export type ProductInput = {
  sku: string
  name: string
  category: string
  brand?: string
  supplierId?: number | null
  purchasePrice: number
  salePrice: number
  quantity: number
  reorderThreshold: number
}

export async function createProduct(input: ProductInput) {
  const userId = await getUserId()
  await db.insert(products).values({
    userId,
    sku: input.sku,
    name: input.name,
    category: input.category,
    brand: input.brand || null,
    supplierId: input.supplierId ?? null,
    purchasePrice: String(input.purchasePrice),
    salePrice: String(input.salePrice),
    quantity: input.quantity,
    reorderThreshold: input.reorderThreshold,
  })
  revalidatePath("/stock")
  revalidatePath("/")
}

export async function updateProduct(id: number, input: ProductInput) {
  const userId = await getUserId()
  await db
    .update(products)
    .set({
      sku: input.sku,
      name: input.name,
      category: input.category,
      brand: input.brand || null,
      supplierId: input.supplierId ?? null,
      purchasePrice: String(input.purchasePrice),
      salePrice: String(input.salePrice),
      quantity: input.quantity,
      reorderThreshold: input.reorderThreshold,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, id), eq(products.userId, userId)))
  revalidatePath("/stock")
  revalidatePath("/")
}

export async function deleteProduct(id: number) {
  const userId = await getUserId()
  await db.delete(products).where(and(eq(products.id, id), eq(products.userId, userId)))
  revalidatePath("/stock")
  revalidatePath("/")
}

export async function adjustStock(id: number, delta: number) {
  const userId = await getUserId()
  const [row] = await db
    .select({ quantity: products.quantity })
    .from(products)
    .where(and(eq(products.id, id), eq(products.userId, userId)))
  if (!row) throw new Error("Produit introuvable")
  const next = Math.max(0, row.quantity + delta)
  await db
    .update(products)
    .set({ quantity: next, updatedAt: new Date() })
    .where(and(eq(products.id, id), eq(products.userId, userId)))
  revalidatePath("/stock")
  revalidatePath("/")
}
