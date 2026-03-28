"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RunMatchButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleMatch() {
    setLoading(true)
    setError(null)

    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trial_project_id: projectId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Matching failed")
      setLoading(false)
      return
    }

    if (data.count > 0) {
      router.push(`/sponsor/projects/${projectId}/matches`)
    } else {
      setError("No clinics match your required criteria. Try adjusting your requirements.")
      setLoading(false)
    }

    router.refresh()
  }

  return (
    <div>
      <button
        onClick={handleMatch}
        disabled={loading}
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Finding Matches..." : "Find Matching Clinics"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
