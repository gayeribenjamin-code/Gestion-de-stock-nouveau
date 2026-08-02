import { getSuppliersWithCounts } from "@/app/actions/suppliers"
import { SuppliersManager } from "@/components/suppliers-manager"

export default async function FournisseursPage() {
  const suppliers = await getSuppliersWithCounts()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Fournisseurs</h1>
        <p className="text-muted-foreground">
          Gérez vos fournisseurs et retrouvez le nombre de produits associés à chacun.
        </p>
      </div>
      <SuppliersManager suppliers={suppliers} />
    </div>
  )
}
