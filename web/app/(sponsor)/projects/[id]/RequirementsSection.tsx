"use client"

import { useState } from "react"
import { addRequirement, deleteRequirement } from "@/features/trial-project/actions"
import { Badge } from "@/components/ui/badge"
import type { Tables } from "@/types/supabase"

const requirementTypes = [
  { value: "therapeutic_area", label: "Therapeutic Area" },
  { value: "equipment", label: "Equipment" },
  { value: "certification", label: "Certification" },
  { value: "capacity", label: "Capacity" },
  { value: "geographic", label: "Geographic" },
]

export default function RequirementsSection({
  projectId,
  requirements: initialReqs,
}: {
  projectId: string
  requirements: Tables<"trial_requirements">[]
}) {
  const [requirements, setRequirements] = useState(initialReqs)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await addRequirement({
      trial_project_id: projectId,
      type: formData.get("type") as string,
      value: formData.get("value") as string,
      priority: formData.get("priority") as "Required" | "Preferred",
    })

    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setRequirements((prev) => [...prev, result.data!])
      setShowForm(false)
      ;(e.target as HTMLFormElement).reset()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const result = await deleteRequirement(id, projectId)
    if (!result.error) {
      setRequirements((prev) => prev.filter((r) => r.id !== id))
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Requirements</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-primary hover:underline"
        >
          {showForm ? "Cancel" : "+ Add Requirement"}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 rounded-lg border p-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Type</label>
              <select
                name="type"
                required
                className="w-full rounded-md border px-2 py-1.5 text-sm"
              >
                {requirementTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Value</label>
              <input
                name="value"
                required
                className="w-full rounded-md border px-2 py-1.5 text-sm"
                placeholder="e.g. MRI Scanner"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Priority</label>
              <select
                name="priority"
                required
                className="w-full rounded-md border px-2 py-1.5 text-sm"
              >
                <option value="Required">Required</option>
                <option value="Preferred">Preferred</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-3 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      )}

      {requirements.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No requirements added yet. Add requirements to define what you need from clinics.
        </p>
      ) : (
        <div className="space-y-2">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Badge className="text-xs">
                  {req.type}
                </Badge>
                <span className="text-sm">{req.value}</span>
                <Badge
                  className={
                    req.priority === "Required"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {req.priority}
                </Badge>
              </div>
              <button
                onClick={() => handleDelete(req.id)}
                className="text-sm text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
