"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createTrialProject } from "@/features/trial-project/actions"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/supabase"

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [areas, setAreas] = useState<Tables<"therapeutic_areas">[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("therapeutic_areas")
      .select("*")
      .order("name")
      .then(({ data }) => setAreas(data ?? []))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createTrialProject({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      therapeutic_area_id: (formData.get("therapeutic_area_id") as string) || undefined,
      phase: (formData.get("phase") as string) || undefined,
      patient_count: formData.get("patient_count")
        ? parseInt(formData.get("patient_count") as string, 10)
        : undefined,
      start_date: (formData.get("start_date") as string) || undefined,
      end_date: (formData.get("end_date") as string) || undefined,
      geographic_preference: (formData.get("geographic_preference") as string) || undefined,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.data) {
      router.push(`/sponsor/projects/${result.data.id}`)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">New Trial Project</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Title *
          </label>
          <input
            id="title"
            name="title"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="e.g. Phase 2 Oncology Trial — Sofia Region"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Brief description of the trial..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="therapeutic_area_id" className="mb-1 block text-sm font-medium">
              Therapeutic Area
            </label>
            <select
              id="therapeutic_area_id"
              name="therapeutic_area_id"
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Select area...</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="phase" className="mb-1 block text-sm font-medium">
              Phase
            </label>
            <select
              id="phase"
              name="phase"
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Select phase...</option>
              <option value="1">Phase 1</option>
              <option value="2">Phase 2</option>
              <option value="3">Phase 3</option>
              <option value="4">Phase 4</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="patient_count" className="mb-1 block text-sm font-medium">
            Patient Count
          </label>
          <input
            id="patient_count"
            name="patient_count"
            type="number"
            min={1}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="e.g. 50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="mb-1 block text-sm font-medium">
              Start Date
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="end_date" className="mb-1 block text-sm font-medium">
              End Date
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="geographic_preference" className="mb-1 block text-sm font-medium">
            Geographic Preference
          </label>
          <input
            id="geographic_preference"
            name="geographic_preference"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="e.g. Sofia, Plovdiv, Varna"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
