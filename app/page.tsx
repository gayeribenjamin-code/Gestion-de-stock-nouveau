import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Truck,
  BarChart3,
  SlidersHorizontal,
  ShieldCheck,
  ListFilter,
  Search,
  Sparkles,
  CheckCircle2,
  Smartphone,
} from "lucide-react"
import { DownloadButton } from "@/components/download-button"

const sheets = [
  {
    icon: LayoutDashboard,
    name: "Tableau de bord",
    desc: "15 indicateurs clés (CA, bénéfices, marge, ruptures) et champions du magasin, calculés en direct.",
  },
  {
    icon: Boxes,
    name: "Stock des produits",
    desc: "32 colonnes : coût réel, marge, stock disponible et statut 🟢🟡🔴 automatiques.",
  },
  {
    icon: ShoppingCart,
    name: "Ventes",
    desc: "Registre des ventes qui met à jour le stock, le chiffre d'affaires et les bénéfices.",
  },
  {
    icon: Truck,
    name: "Fournisseurs",
    desc: "Base de données complète : coordonnées, ville, pays, produits fournis.",
  },
  {
    icon: BarChart3,
    name: "Statistiques",
    desc: "Synthèses par catégorie et marque, Top 10 des produits, réapprovisionnement.",
  },
  {
    icon: SlidersHorizontal,
    name: "Paramètres",
    desc: "Listes modifiables qui alimentent automatiquement tous les menus déroulants.",
  },
]

const features = [
  { icon: Sparkles, title: "100 % automatisé", desc: "Toutes les formules se recalculent à chaque saisie." },
  { icon: ShieldCheck, title: "Formules protégées", desc: "Les colonnes calculées sont verrouillées contre les erreurs." },
  { icon: ListFilter, title: "Validation des données", desc: "Menus déroulants et contrôles pour éviter les fautes de saisie." },
  { icon: Search, title: "Recherche & filtres", desc: "Filtres intelligents par IMEI, n° de série, marque, modèle." },
  { icon: BarChart3, title: "Prêt pour graphiques", desc: "Tableaux structurés pour insérer camemberts et histogrammes." },
  { icon: CheckCircle2, title: "Sans macro VBA", desc: "Fonctions modernes uniquement, compatible Excel 365." },
]

const products = [
  "Smartphones",
  "Téléphones classiques",
  "Power Banks",
  "Écouteurs Bluetooth",
  "Casques audio",
  "Chargeurs",
  "Câbles USB",
  "Coques de protection",
  "Verres trempés",
  "Montres connectées",
  "Haut-parleurs Bluetooth",
  "Clés USB",
  "Cartes mémoire",
  "Routeurs Wi-Fi",
  "Accessoires",
]

const kpis = [
  { value: "6", label: "Feuilles reliées" },
  { value: "32", label: "Colonnes de stock" },
  { value: "15", label: "Indicateurs" },
  { value: "27", label: "Exemples inclus" },
]

export default function Page() {
  return (
    <main className="min-h-dvh">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="relative mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-sm font-medium">
            <Smartphone className="size-4" aria-hidden />
            Modèle Excel professionnel
          </div>
          <h1 className="mt-6 text-pretty font-heading text-4xl font-extrabold leading-tight sm:text-6xl">
            Gérez votre boutique télécom dans un fichier Excel intelligent
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-primary-foreground/80">
            Un classeur <span className="font-semibold text-accent">.xlsx</span> moderne et entièrement automatisé :
            stock, ventes, fournisseurs, tableau de bord et statistiques, reliés entre eux. Prêt à l&apos;emploi, avec
            des exemples réalistes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <DownloadButton />
            <a
              href="#apercu"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary-foreground/25 px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Voir le contenu
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-4">
                <dt className="sr-only">{k.label}</dt>
                <dd>
                  <span className="block font-heading text-3xl font-bold text-accent">{k.value}</span>
                  <span className="mt-1 block text-sm text-primary-foreground/70">{k.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Feuilles */}
      <section id="apercu" className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <header className="max-w-2xl">
          <h2 className="text-balance font-heading text-3xl font-bold sm:text-4xl">Six feuilles, un vrai logiciel</h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Chaque feuille est connectée aux autres. Ajoutez un produit ou une vente : tout se met à jour instantanément.
          </p>
        </header>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sheets.map((s) => (
            <article key={s.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <s.icon className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
          <h2 className="text-balance font-heading text-3xl font-bold sm:text-4xl">Fonctionnalités avancées</h2>
          <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground">
                  <f.icon className="size-5 text-primary" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Produits gérés */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <h2 className="text-balance font-heading text-3xl font-bold sm:text-4xl">Pensé pour votre catalogue</h2>
        <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Les 15 catégories de produits d&apos;une boutique de téléphonie sont déjà configurées dans les menus
          déroulants.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2.5">
          {products.map((p) => (
            <li
              key={p}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
            >
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12 sm:py-16">
          <h2 className="text-balance font-heading text-3xl font-bold sm:text-4xl">
            Téléchargez votre fichier de gestion
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty leading-relaxed text-primary-foreground/80">
            Format .xlsx compatible Microsoft Excel 365, Google Sheets et LibreOffice. Aucune installation, aucune macro.
          </p>
          <div className="mt-8 flex justify-center">
            <DownloadButton />
          </div>
        </div>
        <footer className="mt-10 text-center text-sm text-muted-foreground">
          Ouvrez le fichier, activez la modification, puis commencez à saisir vos produits et vos ventes.
        </footer>
      </section>
    </main>
  )
}
