"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    const { error: resetError } = await authClient.requestPasswordReset({
      email: email.trim(),
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (resetError) {
      setError("La récupération est indisponible pour le moment. Réessayez plus tard.")
    } else {
      setMessage("Si cette adresse correspond à un compte, un lien de réinitialisation vient d’être envoyé.")
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié ?</h1>
      <p className="mt-2 text-sm text-muted-foreground">Saisissez votre email pour recevoir un lien sécurisé.</p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="reset-email">Email</Label>
          <Input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="text-base" />
        </div>
        {message && <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary" role="status">{message}</p>}
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" disabled={loading} className="h-11 w-full text-base">{loading ? "Envoi…" : "Envoyer le lien"}</Button>
      </form>
      <Link href="/sign-in" className="mt-6 block text-center text-sm font-medium underline underline-offset-4">Retour à la connexion</Link>
    </div>
  )
}
