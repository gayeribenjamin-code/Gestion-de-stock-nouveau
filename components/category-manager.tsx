"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createCategory, renameCategory, deleteCategory } from "@/app/actions/categories"
import { usePreferences } from "@/components/preferences-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Tags, Check, X } from "lucide-react"

type CategoryError = Error & { count?: number }

export function CategoryManager({
  categories,
  counts,
}: {
  categories: string[]
  counts: Record<string, number>
}) {
  const { t, tCategory } = usePreferences()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  async function handleAdd() {
    const name = newName.trim()
    if (!name) {
      toast.error(t("cat.errEmpty"))
      return
    }
    setAdding(true)
    try {
      await createCategory(name)
      toast.success(t("cat.created"))
      setNewName("")
      router.refresh()
    } catch (e) {
      const err = e as CategoryError
      toast.error(err.message === "duplicate" ? t("cat.errDuplicate") : t("common.error"))
    } finally {
      setAdding(false)
    }
  }

  function startRename(cat: string) {
    setEditingCat(cat)
    setEditValue(cat)
  }

  async function handleRename(oldName: string) {
    const name = editValue.trim()
    if (!name) {
      toast.error(t("cat.errEmpty"))
      return
    }
    if (name === oldName) {
      setEditingCat(null)
      return
    }
    try {
      await renameCategory(oldName, name)
      toast.success(t("cat.renamed"))
      setEditingCat(null)
      router.refresh()
    } catch (e) {
      const err = e as CategoryError
      toast.error(err.message === "duplicate" ? t("cat.errDuplicate") : t("common.error"))
    }
  }

  async function handleDelete(cat: string) {
    if (!confirm(t("cat.confirmDelete", { v: tCategory(cat) }))) return
    try {
      await deleteCategory(cat)
      toast.success(t("cat.deleted"))
      router.refresh()
    } catch (e) {
      const err = e as CategoryError
      if (err.message === "in_use") {
        toast.error(t("cat.errInUse", { v: err.count ?? counts[cat] ?? 0 }))
      } else {
        toast.error(t("common.error"))
      }
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Tags className="size-4" /> {t("cat.manage")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("cat.title")}</DialogTitle>
            <DialogDescription>{t("cat.desc")}</DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 py-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              placeholder={t("cat.newPlaceholder")}
              className="text-base"
            />
            <Button onClick={handleAdd} disabled={adding} className="gap-1 shrink-0">
              <Plus className="size-4" /> {t("cat.add")}
            </Button>
          </div>

          <div className="flex flex-col gap-1">
            {categories.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("cat.empty")}</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                >
                  {editingCat === cat ? (
                    <>
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                            e.preventDefault()
                            handleRename(cat)
                          }
                          if (e.key === "Escape") setEditingCat(null)
                        }}
                        autoFocus
                        className="h-8 text-base"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0 text-chart-3"
                        onClick={() => handleRename(cat)}
                        aria-label={t("cat.rename")}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0"
                        onClick={() => setEditingCat(null)}
                        aria-label={t("common.cancel")}
                      >
                        <X className="size-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 truncate text-sm font-medium text-foreground">
                        {tCategory(cat)}
                      </span>
                      <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                        {t("cat.productsCount", { v: counts[cat] ?? 0 })}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0"
                        onClick={() => startRename(cat)}
                        aria-label={t("cat.rename")}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0 text-destructive"
                        onClick={() => handleDelete(cat)}
                        aria-label={t("cat.delete")}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
