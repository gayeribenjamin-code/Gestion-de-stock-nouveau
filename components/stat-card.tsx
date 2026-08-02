import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  tone?: "default" | "positive" | "warning" | "danger"
}) {
  const toneClasses = {
    default: "bg-secondary text-secondary-foreground",
    positive: "bg-chart-3/15 text-chart-3",
    warning: "bg-chart-4/15 text-chart-4",
    danger: "bg-destructive/15 text-destructive",
  }[tone]

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", toneClasses)}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="font-heading text-xl font-bold text-foreground">{value}</p>
          {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
