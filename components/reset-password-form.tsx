"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.")
    if (password !== confirmation) return setError("Les mots de passe ne correspondent pas.")
    setLoading(true)
    const { error: updateError } = await createClient().auth.updateUser({ password })
    if (updateError) setError("Le lien a expiré. Demandez une nouvelle réinitialisation.")
    else router.push("/")
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-foreground">Nouveau mot de passe</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choisissez un nouveau mot de passe pour votre compte.</p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2"><Label htmlFor="new-password">Nouveau mot de passe</Label><Input id="new-password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="text-base" /></div>
        <div className="flex flex-col gap-2"><Label htmlFor="confirm-password">Confirmer le mot de passe</Label><Input id="confirm-password" type="password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="text-base" /></div>
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" disabled={loading} className="h-11 w-full text-base">{loading ? "Enregistrement…" : "Enregistrer"}</Button>
      </form>
    </div>
  )
}
