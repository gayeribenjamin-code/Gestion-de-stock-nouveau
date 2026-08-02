export type StockStatus = "in_stock" | "low_stock" | "out_of_stock"

export function stockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return "out_of_stock"
  if (quantity <= threshold) return "low_stock"
  return "in_stock"
}

export const STATUS_LABEL: Record<StockStatus, string> = {
  in_stock: "Disponible",
  low_stock: "Stock faible",
  out_of_stock: "Rupture",
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(Number.isFinite(value) ? value : 0)
}

export function formatDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export const CATEGORIES = [
  "Smartphone",
  "Tablette",
  "Accessoire",
  "Batterie externe",
  "Écouteurs",
  "Chargeur",
  "Coque & Protection",
  "Objet connecté",
] as const

export const PAYMENT_METHODS = ["Espèces", "Carte bancaire", "Mobile Money", "Virement"] as const
