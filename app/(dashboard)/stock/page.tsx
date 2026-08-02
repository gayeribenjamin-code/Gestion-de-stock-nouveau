import { getProducts } from "@/app/actions/products"
import { getSuppliers } from "@/app/actions/suppliers"
import { getCategories } from "@/app/actions/categories"
import { StockManager } from "@/components/stock-manager"

export default async function StockPage() {
  const [products, suppliers, categories] = await Promise.all([
    getProducts(),
    getSuppliers(),
    getCategories(),
  ])
  return (
    <div className="mx-auto max-w-6xl">
      <StockManager
        products={products}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
        categories={categories}
      />
    </div>
  )
}
