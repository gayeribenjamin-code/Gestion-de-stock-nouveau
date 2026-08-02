"use client"

import { useState } from "react"
import { Download, Loader2, Check } from "lucide-react"

type Props = {
  variant?: "primary" | "outline"
  className?: string
  label?: string
}

export function DownloadButton({ variant = "primary", className = "", label = "Télécharger le fichier Excel" }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle")

  async function handleDownload() {
    try {
      setState("loading")
      const res = await fetch("/api/telecom-xlsx")
      if (!res.ok) throw new Error("Échec de la génération")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "Gestion-Boutique-Telecom.xlsx"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setState("done")
      setTimeout(() => setState("idle"), 2500)
    } catch (e) {
      console.log("[v0] download error:", (e as Error).message)
      setState("idle")
    }
  }

  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70"
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20"
      : "border border-border bg-card text-foreground hover:bg-secondary"

  return (
    <button onClick={handleDownload} disabled={state === "loading"} className={`${base} ${styles} ${className}`}>
      {state === "loading" ? (
        <>
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Génération en cours…
        </>
      ) : state === "done" ? (
        <>
          <Check className="size-5" aria-hidden />
          Téléchargé !
        </>
      ) : (
        <>
          <Download className="size-5" aria-hidden />
          {label}
        </>
      )}
    </button>
  )
}
