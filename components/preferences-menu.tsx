"use client"

import { useState } from "react"
import { Settings2 } from "lucide-react"
import { usePreferences } from "@/components/preferences-provider"
import { LANGS, type Lang } from "@/lib/i18n"
import { CURRENCIES, type CurrencyCode } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CURRENCY_ORDER: CurrencyCode[] = ["XOF", "XAF", "EUR", "USD"]

export function PreferencesMenu({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "icon"
}) {
  const { lang, currency, setLang, setCurrency, t } = usePreferences()
  const [open, setOpen] = useState(false)

  return (
    <>
      {variant === "sidebar" ? (
        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className="justify-start gap-3 text-muted-foreground"
        >
          <Settings2 className="size-4.5" />
          {t("prefs.title")}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label={t("prefs.title")}
        >
          <Settings2 className="size-5" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("prefs.title")}</DialogTitle>
            <DialogDescription>{t("prefs.hint")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>{t("prefs.language")}</Label>
              <Select value={lang} onValueChange={(v) => v && setLang(v as Lang)}>
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGS.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("prefs.currency")}</Label>
              <Select value={currency} onValueChange={(v) => v && setCurrency(v as CurrencyCode)}>
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_ORDER.map((code) => (
                    <SelectItem key={code} value={code}>
                      {CURRENCIES[code].label[lang]} · {CURRENCIES[code].symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>{t("prefs.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
