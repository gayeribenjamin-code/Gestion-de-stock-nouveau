import { getSales } from "@/app/actions/sales"
import { getProducts } from "@/app/actions/products"
import { SalesManager } from "@/components/sales-manager"

export default async function VentesPage() {
  const [sales, products] = await Promise.all([getSales(), getProducts()])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Ventes</h1>
        <p className="text-muted-foreground">
          Enregistrez vos ventes : le stock et le chiffre d&apos;affaires sont mis à jour automatiquement.
        </p>
      </div>
      <SalesManager sales={sales} products={products} />
    </div>
  )
}
