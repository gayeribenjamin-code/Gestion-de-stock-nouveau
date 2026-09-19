import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function getUserId(): Promise<string> {
  const user = await getSessionUser()
  if (!user) throw new Error("Non autorisé")
  return user.id
}
