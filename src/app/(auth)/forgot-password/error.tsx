"use client"

import { Button } from "@/components/ui/button"
import { Body } from "@/components/ui/typography"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-4">
      <Body className="text-secondary">Something went wrong loading this page.</Body>
      <Button variant="outline" onClick={reset}>Try again</Button>
    </div>
  )
}
