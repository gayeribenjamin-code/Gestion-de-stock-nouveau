export type CurrencyCode = "EUR" | "XOF" | "XAF" | "USD"

export type CurrencyConfig = {
  code: CurrencyCode
  symbol: string
  label: { fr: string; en: string }
  /** 1 EUR = rateFromEUR unités de cette devise (base = EUR) */
  rateFromEUR: number
  decimals: number
  symbolBefore: boolean
}

// Le Franc CFA (XOF/XAF) a une parité fixe avec l'euro : 1 € = 655,957 FCFA.
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  EUR: {
    code: "EUR",
    symbol: "€",
    label: { fr: "Euro (€)", en: "Euro (€)" },
    rateFromEUR: 1,
    decimals: 2,
    symbolBefore: false,
  },
  XOF: {
    code: "XOF",
    symbol: "FCFA",
    label: { fr: "Franc CFA — Afrique de l'Ouest", en: "CFA Franc — West Africa" },
    rateFromEUR: 655.957,
    decimals: 0,
    symbolBefore: false,
  },
  XAF: {
    code: "XAF",
    symbol: "FCFA",
    label: { fr: "Franc CFA — Afrique centrale", en: "CFA Franc — Central Africa" },
    rateFromEUR: 655.957,
    decimals: 0,
    symbolBefore: false,
  },
  USD: {
    code: "USD",
    symbol: "$",
    label: { fr: "Dollar US ($)", en: "US Dollar ($)" },
    rateFromEUR: 1.08,
    decimals: 2,
    symbolBefore: true,
  },
}

export const DEFAULT_CURRENCY: CurrencyCode = "EUR"

export function isCurrencyCode(v: string | undefined | null): v is CurrencyCode {
  return !!v && Object.prototype.hasOwnProperty.call(CURRENCIES, v)
}

function finiteAmount(value: number): number {
  return Number.isFinite(value) ? value : 0
}

function roundBaseEUR(value: number): number {
  // Keep enough precision in the EUR base to round-trip whole CFA francs exactly.
  return Math.round(finiteAmount(value) * 1_000_000) / 1_000_000
}

export function convertFromEUR(amountEUR: number, code: CurrencyCode): number {
  const converted = finiteAmount(amountEUR) * CURRENCIES[code].rateFromEUR
  return CURRENCIES[code].decimals === 0 ? Math.round(converted) : Math.round(converted * 100) / 100
}

export function convertToEUR(amount: number, code: CurrencyCode): number {
  const converted = finiteAmount(amount) / CURRENCIES[code].rateFromEUR
  return roundBaseEUR(converted)
}

function localeFor(lang: string): string {
  return lang === "en" ? "en-US" : "fr-FR"
}

/** Formate un montant DÉJÀ exprimé dans la devise cible (sans conversion). */
export function formatRaw(amount: number, code: CurrencyCode, lang: string): string {
  const c = CURRENCIES[code]
  const n = new Intl.NumberFormat(localeFor(lang), {
    minimumFractionDigits: c.decimals,
    maximumFractionDigits: c.decimals,
  }).format(Number.isFinite(amount) ? amount : 0)
  return c.symbolBefore ? `${c.symbol}${n}` : `${n} ${c.symbol}`
}

/** Convertit un montant en euros (base) vers la devise cible puis le formate. */
export function formatConverted(amountEUR: number, code: CurrencyCode, lang: string): string {
  return formatRaw(convertFromEUR(amountEUR, code), code, lang)
}
