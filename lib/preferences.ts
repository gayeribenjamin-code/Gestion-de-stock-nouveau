import { cookies } from "next/headers"
import { DEFAULT_LANG, isLang, type Lang } from "./i18n"
import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from "./currency"

export const PREF_COOKIE = "telestock_prefs"

export type Preferences = { lang: Lang; currency: CurrencyCode }

export async function getPreferences(): Promise<Preferences> {
  const store = await cookies()
  const raw = store.get(PREF_COOKIE)?.value
  let lang: Lang = DEFAULT_LANG
  let currency: CurrencyCode = DEFAULT_CURRENCY
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { lang?: string; currency?: string }
      if (isLang(parsed.lang)) lang = parsed.lang
      if (isCurrencyCode(parsed.currency)) currency = parsed.currency
    } catch {
      // cookie corrompu : on garde les valeurs par défaut
    }
  }
  return { lang, currency }
}
