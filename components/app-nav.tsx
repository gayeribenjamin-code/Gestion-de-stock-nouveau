"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, ShoppingCart, Truck, BarChart3, Smartphone, LogOut } from "lucide-react"

const links = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/stock", label: "Stock", icon: Package },
  { href: "/ventes", label: "Ventes", icon: ShoppingCart },
  { href: "/fournisseurs", label: "Fournisseurs", icon: Truck },
  { href: "/statistiques", label: "Statistiques", icon: BarChart3 },
]

export function DesktopNav({ shopName }: { shopName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Smartphone className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-sm font-bold leading-tight text-foreground">TéléStock</p>
          <p className="truncate text-xs text-muted-foreground">{shopName}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <link.icon className="size-4.5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <Button variant="ghost" onClick={signOut} className="justify-start gap-3 text-muted-foreground">
        <LogOut className="size-4.5" />
        Se déconnecter
      </Button>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-card md:hidden">
      {links.map((link) => {
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <link.icon className="size-5" />
            <span className="leading-none">{link.label.split(" ")[0]}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function MobileHeader({ shopName }: { shopName: string }) {
  const router = useRouter()
  async function signOut() {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Smartphone className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-sm font-bold leading-tight text-foreground">TéléStock</p>
          <p className="truncate text-xs text-muted-foreground">{shopName}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={signOut} aria-label="Se déconnecter">
        <LogOut className="size-5" />
      </Button>
    </header>
  )
}
