import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "body-small flex field-sizing-content min-h-16 w-full rounded-xl border border-primary bg-surface-level-0 px-3 py-2 text-primary placeholder:text-tertiary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-surface-level-5 disabled:cursor-not-allowed disabled:opacity-60 resize-none",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
