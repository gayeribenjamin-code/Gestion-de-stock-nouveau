import { getProducts } from "@/app/actions/products"
import { getSuppliers } from "@/app/actions/suppliers"
import { StockManager } from "@/components/stock-manager"

export default async function StockPage() {
  const [products, suppliers] = await Promise.all([getProducts(), getSuppliers()])
  return (
    <div className="mx-auto max-w-6xl">
      <StockManager products={products} suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))} />
    </div>
  )
}
