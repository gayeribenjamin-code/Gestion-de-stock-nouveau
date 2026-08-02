"use server"

import { db } from "@/lib/db"
import { products, sales } from "@/lib/db/schema"
import { getUserId } from "@/lib/session"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type SaleRow = {
  id: number
  productId: number
  productName: string
  quantity: number
  unitSalePrice: number
  unitPurchasePrice: number
  customerName: string | null
  paymentMethod: string | null
  createdAt: Date
}

export async function getSales(): Promise<SaleRow[]> {
  const userId = await getUserId()
  const rows = await db.select().from(sales).where(eq(sales.userId, userId)).orderBy(desc(sales.createdAt))
  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    productName: r.productName,
    quantity: r.quantity,
    unitSalePrice: Number(r.unitSalePrice),
    unitPurchasePrice: Number(r.unitPurchasePrice),
    customerName: r.customerName,
    paymentMethod: r.paymentMethod,
    createdAt: r.createdAt,
  }))
}

export type SaleInput = {
  productId: number
  quantity: number
  customerName?: string
  paymentMethod?: string
}

export async function createSale(input: SaleInput) {
  const userId = await getUserId()

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, input.productId), eq(products.userId, userId)))

  if (!product) throw new Error("Produit introuvable")
  if (input.quantity <= 0) throw new Error("La quantité doit être positive")
  if (product.quantity < input.quantity) {
    throw new Error(`Stock insuffisant : il reste ${product.quantity} unité(s) de ${product.name}`)
  }

  await db.insert(sales).values({
    userId,
    productId: product.id,
    productName: product.name,
    quantity: input.quantity,
    unitSalePrice: product.salePrice,
    unitPurchasePrice: product.purchasePrice,
    customerName: input.customerName || null,
    paymentMethod: input.paymentMethod || null,
  })

  // Décrémente automatiquement le stock
  await db
    .update(products)
    .set({ quantity: product.quantity - input.quantity, updatedAt: new Date() })
    .where(and(eq(products.id, product.id), eq(products.userId, userId)))

  revalidatePath("/ventes")
  revalidatePath("/stock")
  revalidatePath("/")
}

export async function deleteSale(id: number) {
  const userId = await getUserId()
  const [sale] = await db.select().from(sales).where(and(eq(sales.id, id), eq(sales.userId, userId)))
  if (!sale) return

  // Restitue le stock lors de l'annulation d'une vente
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, sale.productId), eq(products.userId, userId)))
  if (product) {
    await db
      .update(products)
      .set({ quantity: product.quantity + sale.quantity, updatedAt: new Date() })
      .where(and(eq(products.id, product.id), eq(products.userId, userId)))
  }

  await db.delete(sales).where(and(eq(sales.id, id), eq(sales.userId, userId)))
  revalidatePath("/ventes")
  revalidatePath("/stock")
  revalidatePath("/")
}
