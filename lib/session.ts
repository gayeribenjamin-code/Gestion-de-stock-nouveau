import { createClient } from "@/lib/supabase/server"

export async function getUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Non autorisé")
  return user.id
}

export async function getSessionUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
