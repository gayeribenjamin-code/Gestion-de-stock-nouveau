"use server"

import { db } from "@/lib/db"
import { products, sales } from "@/lib/db/schema"
import { getUserId } from "@/lib/session"
import { eq } from "drizzle-orm"
import { stockStatus } from "@/lib/helpers"

export type DashboardData = {
  totalRevenue: number
  totalProfit: number
  totalSalesCount: number
  unitsSold: number
  stockValue: number
  productCount: number
  lowStockCount: number
  outOfStockCount: number
  avgMargin: number
  topProducts: { name: string; units: number; revenue: number }[]
  salesByCategory: { category: string; revenue: number }[]
  revenueByDay: { day: string; revenue: number }[]
  lowStockProducts: { id: number; name: string; quantity: number; threshold: number }[]
}

export async function getDashboard(): Promise<DashboardData> {
  const userId = await getUserId()

  const [productRows, saleRows] = await Promise.all([
    db.select().from(products).where(eq(products.userId, userId)),
    db.select().from(sales).where(eq(sales.userId, userId)),
  ])

  let totalRevenue = 0
  let totalProfit = 0
  let unitsSold = 0
  const productUnits = new Map<string, { units: number; revenue: number }>()
  const categoryRevenue = new Map<string, number>()
  const dayRevenue = new Map<string, number>()

  const categoryByProduct = new Map<number, string>()
  for (const p of productRows) categoryByProduct.set(p.id, p.category)

  for (const s of saleRows) {
    const revenue = Number(s.unitSalePrice) * s.quantity
    const cost = Number(s.unitPurchasePrice) * s.quantity
    totalRevenue += revenue
    totalProfit += revenue - cost
    unitsSold += s.quantity

    const pu = productUnits.get(s.productName) ?? { units: 0, revenue: 0 }
    pu.units += s.quantity
    pu.revenue += revenue
    productUnits.set(s.productName, pu)

    const cat = categoryByProduct.get(s.productId) ?? "Autre"
    categoryRevenue.set(cat, (categoryRevenue.get(cat) ?? 0) + revenue)

    const day = new Date(s.createdAt).toISOString().slice(0, 10)
    dayRevenue.set(day, (dayRevenue.get(day) ?? 0) + revenue)
  }

  let stockValue = 0
  let lowStockCount = 0
  let outOfStockCount = 0
  let marginSum = 0
  let marginCount = 0
  const lowStockProducts: DashboardData["lowStockProducts"] = []

  for (const p of productRows) {
    const purchase = Number(p.purchasePrice)
    const sale = Number(p.salePrice)
    stockValue += purchase * p.quantity
    const status = stockStatus(p.quantity, p.reorderThreshold)
    if (status === "low_stock") lowStockCount++
    if (status === "out_of_stock") outOfStockCount++
    if (status !== "in_stock") {
      lowStockProducts.push({ id: p.id, name: p.name, quantity: p.quantity, threshold: p.reorderThreshold })
    }
    if (sale > 0) {
      marginSum += ((sale - purchase) / sale) * 100
      marginCount++
    }
  }

  const topProducts = [...productUnits.entries()]
    .map(([name, v]) => ({ name, units: v.units, revenue: v.revenue }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5)

  const salesByCategory = [...categoryRevenue.entries()]
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  const revenueByDay = [...dayRevenue.entries()]
    .map(([day, revenue]) => ({ day, revenue }))
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-14)

  return {
    totalRevenue,
    totalProfit,
    totalSalesCount: saleRows.length,
    unitsSold,
    stockValue,
    productCount: productRows.length,
    lowStockCount,
    outOfStockCount,
    avgMargin: marginCount ? marginSum / marginCount : 0,
    topProducts,
    salesByCategory,
    revenueByDay,
    lowStockProducts: lowStockProducts.sort((a, b) => a.quantity - b.quantity).slice(0, 8),
  }
}
