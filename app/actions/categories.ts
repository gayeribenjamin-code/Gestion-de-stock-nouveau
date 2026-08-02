"use server"

import { db } from "@/lib/db"
import { products, settings } from "@/lib/db/schema"
import { CATEGORIES } from "@/lib/helpers"
import { getUserId } from "@/lib/session"
import { and, asc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const KIND = "category"

function revalidateAll() {
  revalidatePath("/stock")
  revalidatePath("/statistiques")
  revalidatePath("/")
}

/**
 * Renvoie les catégories de l'utilisateur.
 * Migration automatique : si aucune catégorie n'est encore enregistrée, on initialise
 * la liste à partir des catégories par défaut + celles déjà présentes sur ses produits.
 */
export async function getCategories(): Promise<string[]> {
  const userId = await getUserId()

  const rows = await db
    .select({ value: settings.value })
    .from(settings)
    .where(and(eq(settings.userId, userId), eq(settings.kind, KIND)))
    .orderBy(asc(settings.value))

  if (rows.length) return rows.map((r) => r.value)

  // Initialisation : catégories par défaut + catégories déjà utilisées par les produits
  const used = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(eq(products.userId, userId))

  const initial = Array.from(
    new Set<string>([...CATEGORIES, ...used.map((u) => u.category).filter(Boolean)]),
  ).sort((a, b) => a.localeCompare(b))

  if (initial.length) {
    await db.insert(settings).values(initial.map((value) => ({ userId, kind: KIND, value })))
  }

  return initial
}

export async function createCategory(rawName: string) {
  const userId = await getUserId()
  const name = rawName.trim()
  if (!name) throw new Error("empty")
  if (name.length > 60) throw new Error("too_long")

  // Éviter les doublons (insensible à la casse)
  const existing = await db
    .select({ value: settings.value })
    .from(settings)
    .where(and(eq(settings.userId, userId), eq(settings.kind, KIND)))

  if (existing.some((e) => e.value.toLowerCase() === name.toLowerCase())) {
    throw new Error("duplicate")
  }

  await db.insert(settings).values({ userId, kind: KIND, value: name })
  revalidateAll()
}

export async function renameCategory(oldName: string, rawNewName: string) {
  const userId = await getUserId()
  const newName = rawNewName.trim()
  if (!newName) throw new Error("empty")
  if (newName.length > 60) throw new Error("too_long")
  if (newName === oldName) return

  const existing = await db
    .select({ value: settings.value })
    .from(settings)
    .where(and(eq(settings.userId, userId), eq(settings.kind, KIND)))

  if (existing.some((e) => e.value.toLowerCase() === newName.toLowerCase())) {
    throw new Error("duplicate")
  }

  // Renommer la catégorie ET réaffecter tous les produits concernés
  await db
    .update(settings)
    .set({ value: newName })
    .where(and(eq(settings.userId, userId), eq(settings.kind, KIND), eq(settings.value, oldName)))

  await db
    .update(products)
    .set({ category: newName, updatedAt: new Date() })
    .where(and(eq(products.userId, userId), eq(products.category, oldName)))

  revalidateAll()
}

export async function deleteCategory(name: string) {
  const userId = await getUserId()

  // Bloquer la suppression si des produits utilisent encore la catégorie
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(and(eq(products.userId, userId), eq(products.category, name)))

  if (count > 0) {
    const err = new Error("in_use")
    ;(err as unknown as { count: number }).count = count
    throw err
  }

  await db
    .delete(settings)
    .where(and(eq(settings.userId, userId), eq(settings.kind, KIND), eq(settings.value, name)))

  revalidateAll()
}
