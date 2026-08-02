"use client"

import { createContext, useContext, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { savePreferences } from "@/app/actions/preferences"
import {
  createTranslator,
  formatNumberL,
  formatDateL,
  tCategory as tCategoryBase,
  tPayment as tPaymentBase,
  type Lang,
  type Translator,
} from "@/lib/i18n"
import {
  CURRENCIES,
  formatConverted,
  formatRaw,
  convertFromEUR,
  convertToEUR,
  type CurrencyCode,
} from "@/lib/currency"

type PreferencesContextValue = {
  lang: Lang
  currency: CurrencyCode
  symbol: string
  decimals: number
  t: Translator
  /** Formate un montant stocké en euros (base) dans la devise active. */
  money: (amountEUR: number) => string
  /** Formate un montant déjà exprimé dans la devise active (sans conversion). */
  formatRawMoney: (amount: number) => string
  /** Euros -> devise active (nombre, pour préremplir un formulaire). */
  fromBase: (amountEUR: number) => number
  /** Devise active -> euros (nombre, pour enregistrer en base). */
  toBase: (amount: number) => number
  formatNumber: (n: number) => string
  formatDate: (d: Date | string) => string
  tCategory: (c: string) => string
  tPayment: (p: string) => string
  setLang: (l: Lang) => void
  setCurrency: (c: CurrencyCode) => void
  pending: boolean
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({
  children,
  initialLang,
  initialCurrency,
}: {
  children: React.ReactNode
  initialLang: Lang
  initialCurrency: CurrencyCode
}) {
  const router = useRouter()
  const [lang, setLangState] = useState<Lang>(initialLang)
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency)
  const [pending, startTransition] = useTransition()

  function setLang(l: Lang) {
    setLangState(l)
    startTransition(async () => {
      await savePreferences({ lang: l })
      router.refresh()
    })
  }

  function setCurrency(c: CurrencyCode) {
    setCurrencyState(c)
    startTransition(async () => {
      await savePreferences({ currency: c })
      router.refresh()
    })
  }

  const t = createTranslator(lang)
  const config = CURRENCIES[currency]

  const value: PreferencesContextValue = {
    lang,
    currency,
    symbol: config.symbol,
    decimals: config.decimals,
    t,
    money: (amountEUR) => formatConverted(amountEUR, currency, lang),
    formatRawMoney: (amount) => formatRaw(amount, currency, lang),
    fromBase: (amountEUR) => convertFromEUR(amountEUR, currency),
    toBase: (amount) => convertToEUR(amount, currency),
    formatNumber: (n) => formatNumberL(n, lang),
    formatDate: (d) => formatDateL(d, lang),
    tCategory: (c) => tCategoryBase(c, lang),
    tPayment: (p) => tPaymentBase(p, lang),
    setLang,
    setCurrency,
    pending,
  }

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error("usePreferences doit être utilisé dans un PreferencesProvider")
  return ctx
}
