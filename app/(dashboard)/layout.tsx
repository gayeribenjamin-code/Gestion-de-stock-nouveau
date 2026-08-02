import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/session"
import { getPreferences } from "@/lib/preferences"
import { PreferencesProvider } from "@/components/preferences-provider"
import { DesktopNav, MobileNav, MobileHeader } from "@/components/app-nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect("/sign-in")

  const shopName = user.name || user.email
  const { lang, currency } = await getPreferences()

  return (
    <PreferencesProvider initialLang={lang} initialCurrency={currency}>
      <div className="flex min-h-dvh bg-background">
        <DesktopNav shopName={shopName} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader shopName={shopName} />
          <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>
          <MobileNav />
        </div>
      </div>
    </PreferencesProvider>
  )
}
