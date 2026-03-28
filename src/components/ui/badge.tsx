import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type BadgeProps = HTMLAttributes<HTMLSpanElement>

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "small inline-flex items-center rounded-full border border-primary bg-surface-level-2 px-2.5 py-1 uppercase text-secondary",
        className,
      )}
      {...props}
    />
  )
}
