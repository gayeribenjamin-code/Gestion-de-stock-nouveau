"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { seedDemoData } from "@/app/actions/seed"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Smartphone } from "lucide-react"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === "sign-up"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim() },
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
              `${window.location.origin}/auth/callback`,
          },
        })
        if (error) {
          if (error.message.toLowerCase().includes("password")) throw new Error("Le mot de passe doit contenir au moins 8 caractères.")
          throw new Error("Impossible de créer le compte. Vérifiez vos informations et réessayez.")
        }
        if (!data.session) {
          setError("Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.")
          setLoading(false)
          return
        }
        try {
          await seedDemoData()
        } catch {
          // Les données de démonstration sont facultatives.
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) {
          const message = error.message.toLowerCase()
          if (message.includes("email not confirmed")) throw new Error("Confirmez votre adresse email avant de vous connecter.")
          throw new Error("Identifiants incorrects")
        }
      }
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Smartphone className="size-6" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {isSignUp ? "Créer un compte" : "Connexion"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          {isSignUp
            ? "Configurez votre espace de gestion de boutique."
            : "Accédez à votre gestion de stock et ventes."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isSignUp && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nom de la boutique</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ma Boutique Télécom"
              required
              className="text-base"
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            required
            className="text-base"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="text-base"
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="mt-2 h-11 w-full text-base">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {isSignUp ? "Créer mon compte" : "Se connecter"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignUp ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}{" "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {isSignUp ? "Se connecter" : "Créer un compte"}
        </Link>
      </p>
    </div>
  )
}
