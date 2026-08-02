import { getSuppliersWithCounts } from "@/app/actions/suppliers"
import { SuppliersManager } from "@/components/suppliers-manager"
import { getPreferences } from "@/lib/preferences"
import { createTranslator } from "@/lib/i18n"

export default async function FournisseursPage() {
  const suppliers = await getSuppliersWithCounts()
  const { lang } = await getPreferences()
  const t = createTranslator(lang)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{t("sup.title")}</h1>
        <p className="text-muted-foreground">{t("sup.subtitle")}</p>
      </div>
      <SuppliersManager suppliers={suppliers} />
    </div>
  )
}
