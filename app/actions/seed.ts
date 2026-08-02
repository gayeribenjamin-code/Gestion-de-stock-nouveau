"use server"

import { db } from "@/lib/db"
import { products, sales, suppliers } from "@/lib/db/schema"
import { getUserId } from "@/lib/session"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function isSeeded(): Promise<boolean> {
  const userId = await getUserId()
  const [row] = await db.select({ id: products.id }).from(products).where(eq(products.userId, userId)).limit(1)
  return Boolean(row)
}

export async function seedDemoData() {
  const userId = await getUserId()

  const existing = await db.select({ id: products.id }).from(products).where(eq(products.userId, userId)).limit(1)
  if (existing.length) return { skipped: true }

  // Fournisseurs
  const supplierRows = await db
    .insert(suppliers)
    .values([
      {
        userId,
        name: "TechDistrib SARL",
        contactName: "Karim Benali",
        phone: "06 12 34 56 78",
        email: "contact@techdistrib.fr",
        address: "12 rue de la Logistique, Lyon",
        notes: "Fournisseur principal smartphones",
      },
      {
        userId,
        name: "MobileImport",
        contactName: "Sophie Martin",
        phone: "07 98 76 54 32",
        email: "achats@mobileimport.fr",
        address: "45 avenue du Commerce, Paris",
        notes: "Accessoires et coques",
      },
      {
        userId,
        name: "AccessoPro",
        contactName: "Yanis Haddad",
        phone: "06 55 44 33 22",
        email: "pro@accessopro.fr",
        address: "8 zone industrielle, Marseille",
        notes: "Chargeurs, câbles, batteries",
      },
    ])
    .returning({ id: suppliers.id, name: suppliers.name })

  const s = (name: string) => supplierRows.find((r) => r.name === name)?.id ?? null

  // Produits
  const productDefs = [
    { sku: "SP-IP15", name: "iPhone 15 128 Go", category: "Smartphone", brand: "Apple", supplier: "TechDistrib SARL", purchase: 720, sale: 899, qty: 8, threshold: 3 },
    { sku: "SP-S24", name: "Samsung Galaxy S24", category: "Smartphone", brand: "Samsung", supplier: "TechDistrib SARL", purchase: 640, sale: 799, qty: 6, threshold: 3 },
    { sku: "SP-A55", name: "Samsung Galaxy A55", category: "Smartphone", brand: "Samsung", supplier: "TechDistrib SARL", purchase: 320, sale: 429, qty: 12, threshold: 4 },
    { sku: "SP-RN13", name: "Xiaomi Redmi Note 13", category: "Smartphone", brand: "Xiaomi", supplier: "MobileImport", purchase: 180, sale: 249, qty: 2, threshold: 4 },
    { sku: "TB-IPAD", name: "iPad 10e génération", category: "Tablette", brand: "Apple", supplier: "TechDistrib SARL", purchase: 380, sale: 489, qty: 4, threshold: 2 },
    { sku: "EC-APP2", name: "AirPods Pro 2", category: "Écouteurs", brand: "Apple", supplier: "MobileImport", purchase: 190, sale: 279, qty: 10, threshold: 4 },
    { sku: "EC-BUDS", name: "Galaxy Buds2 Pro", category: "Écouteurs", brand: "Samsung", supplier: "MobileImport", purchase: 110, sale: 169, qty: 0, threshold: 3 },
    { sku: "BT-PB20", name: "Batterie externe 20000mAh", category: "Batterie externe", brand: "Anker", supplier: "AccessoPro", purchase: 22, sale: 44.9, qty: 25, threshold: 8 },
    { sku: "CH-USBC", name: "Chargeur USB-C 65W", category: "Chargeur", brand: "Anker", supplier: "AccessoPro", purchase: 14, sale: 34.9, qty: 30, threshold: 10 },
    { sku: "CB-LGT", name: "Câble Lightning 2m", category: "Chargeur", brand: "Belkin", supplier: "AccessoPro", purchase: 6, sale: 19.9, qty: 40, threshold: 12 },
    { sku: "CQ-IP15", name: "Coque iPhone 15 silicone", category: "Coque & Protection", brand: "Spigen", supplier: "MobileImport", purchase: 4.5, sale: 16.9, qty: 3, threshold: 6 },
    { sku: "VP-S24", name: "Verre trempé Galaxy S24", category: "Coque & Protection", brand: "Spigen", supplier: "MobileImport", purchase: 2.5, sale: 12.9, qty: 50, threshold: 15 },
    { sku: "OC-WT", name: "Montre connectée GT4", category: "Objet connecté", brand: "Huawei", supplier: "TechDistrib SARL", purchase: 95, sale: 149, qty: 5, threshold: 3 },
    { sku: "AC-CARS", name: "Support voiture magnétique", category: "Accessoire", brand: "Baseus", supplier: "AccessoPro", purchase: 5, sale: 18.9, qty: 18, threshold: 6 },
  ]

  const insertedProducts = await db
    .insert(products)
    .values(
      productDefs.map((p) => ({
        userId,
        sku: p.sku,
        name: p.name,
        category: p.category,
        brand: p.brand,
        supplierId: s(p.supplier),
        purchasePrice: String(p.purchase),
        salePrice: String(p.sale),
        quantity: p.qty,
        reorderThreshold: p.threshold,
      })),
    )
    .returning({
      id: products.id,
      name: products.name,
      salePrice: products.salePrice,
      purchasePrice: products.purchasePrice,
    })

  const byName = new Map(insertedProducts.map((p) => [p.name, p]))

  // Ventes des 12 derniers jours
  const payments = ["Espèces", "Carte bancaire", "Mobile Money"]
  const customers = ["Client comptoir", "M. Dupont", "Mme Leroy", "Boutique partenaire", null, "M. Nabil", null]
  const saleDefs = [
    { name: "iPhone 15 128 Go", qty: 1, daysAgo: 11 },
    { name: "Chargeur USB-C 65W", qty: 2, daysAgo: 10 },
    { name: "AirPods Pro 2", qty: 1, daysAgo: 9 },
    { name: "Batterie externe 20000mAh", qty: 3, daysAgo: 8 },
    { name: "Samsung Galaxy A55", qty: 1, daysAgo: 7 },
    { name: "Verre trempé Galaxy S24", qty: 4, daysAgo: 6 },
    { name: "Câble Lightning 2m", qty: 2, daysAgo: 5 },
    { name: "iPhone 15 128 Go", qty: 1, daysAgo: 4 },
    { name: "Support voiture magnétique", qty: 2, daysAgo: 3 },
    { name: "Montre connectée GT4", qty: 1, daysAgo: 2 },
    { name: "AirPods Pro 2", qty: 1, daysAgo: 1 },
    { name: "Chargeur USB-C 65W", qty: 1, daysAgo: 0 },
    { name: "Samsung Galaxy S24", qty: 1, daysAgo: 0 },
  ]

  const now = Date.now()
  const saleValues = saleDefs
    .map((sd, i) => {
      const p = byName.get(sd.name)
      if (!p) return null
      return {
        userId,
        productId: p.id,
        productName: sd.name,
        quantity: sd.qty,
        unitSalePrice: p.salePrice,
        unitPurchasePrice: p.purchasePrice,
        customerName: customers[i % customers.length],
        paymentMethod: payments[i % payments.length],
        createdAt: new Date(now - sd.daysAgo * 86400000 - i * 3600000),
      }
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)

  await db.insert(sales).values(saleValues)

  revalidatePath("/")
  revalidatePath("/stock")
  revalidatePath("/ventes")
  revalidatePath("/fournisseurs")

  return { skipped: false }
}
