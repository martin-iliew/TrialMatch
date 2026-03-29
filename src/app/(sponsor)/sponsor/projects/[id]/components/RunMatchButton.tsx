"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function RunMatchButton({ projectId, hasMatches }: { projectId: string; hasMatches: boolean }) {
  if (hasMatches) return null
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleMatch() {
    setLoading(true)

    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trial_project_id: projectId }),
    })

    const data = (await res.json()) as { error?: string; count?: number }

    if (!res.ok) {
      toast.error(data.error ?? "Matching failed")
      setLoading(false)
      return
    }

    if ((data.count ?? 0) > 0) {
      router.push(`/sponsor/projects/${projectId}/matches`)
    } else {
      toast.error(
        "No clinics match your required criteria. Try adjusting your requirements.",
      )
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <Button onClick={handleMatch} disabled={loading}>
      {loading ? "Finding Matches..." : "Find Matching Clinics"}
    </Button>
  )
}
