"use server"

import { cookies } from "next/headers"
import { PREF_COOKIE } from "@/lib/preferences"
import { isLang } from "@/lib/i18n"
import { isCurrencyCode } from "@/lib/currency"

export async function savePreferences(prefs: { lang?: string; currency?: string }) {
  const store = await cookies()
  const current = store.get(PREF_COOKIE)?.value
  let base: { lang?: string; currency?: string } = {}
  if (current) {
    try {
      base = JSON.parse(current)
    } catch {
      base = {}
    }
  }
  if (isLang(prefs.lang)) base.lang = prefs.lang
  if (isCurrencyCode(prefs.currency)) base.currency = prefs.currency

  const isDev = process.env.NODE_ENV === "development"
  store.set(PREF_COOKIE, JSON.stringify(base), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    // En preview v0, l'app tourne dans une iframe cross-site : le cookie doit être SameSite=None+Secure.
    sameSite: isDev ? "none" : "lax",
    secure: isDev ? true : undefined,
  })
}
