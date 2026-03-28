"use client"

import { useState } from "react"
import { toast } from "sonner"
import { addRequirement, deleteRequirement } from "@/features/projects/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label, BodySmall, Caption } from "@/components/ui/typography"
import type { Tables, Enums } from "@/types"

type RequirementType = Enums<"requirement_type">

const requirementTypes: { value: RequirementType; label: string }[] = [
  { value: "specialization", label: "Specialization" },
  { value: "equipment", label: "Equipment" },
  { value: "certification", label: "Certification" },
  { value: "capacity", label: "Capacity" },
  { value: "phase_experience", label: "Phase Experience" },
  { value: "molecule_experience", label: "Molecule Experience" },
]

const priorityColors: Record<string, string> = {
  required: "bg-surface-status-danger text-icon-status-danger",
  preferred: "bg-surface-status-warning text-icon-status-warning",
  nice_to_have: "bg-surface-status-info text-icon-status-info",
}

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
  const [type, setType] = useState<RequirementType>("equipment")
  const [value, setValue] = useState("")
  const [priority, setPriority] = useState<"required" | "preferred" | "nice_to_have">("required")

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const result = await addRequirement({
      trial_project_id: projectId,
      requirement_type: type,
      value,
      priority,
    })

    if (result.error) {
      toast.error(result.error)
    } else if (result.data) {
      setRequirements((prev) => [...prev, result.data!])
      setShowForm(false)
      setValue("")
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const result = await deleteRequirement(id, projectId)
    if (!result.error) {
      setRequirements((prev) => prev.filter((r) => r.id !== id))
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <BodySmall className="font-semibold text-primary">Requirements</BodySmall>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-brand hover:underline"
        >
          {showForm ? "Cancel" : "+ Add Requirement"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 rounded-2xl border border-primary p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RequirementType)}
                className="h-9 w-full rounded-xl border border-primary bg-surface-level-0 px-2 text-sm text-primary focus-visible:outline-none"
              >
                {requirementTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Value</Label>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                placeholder="e.g. MRI Scanner"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="h-9 w-full rounded-xl border border-primary bg-surface-level-0 px-2 text-sm text-primary focus-visible:outline-none"
              >
                <option value="required">Required</option>
                <option value="preferred">Preferred</option>
                <option value="nice_to_have">Nice to Have</option>
              </select>
            </div>
          </div>
          <Button type="submit" size="sm" disabled={loading} className="mt-3">
            {loading ? "Adding..." : "Add"}
          </Button>
        </form>
      )}

      {requirements.length === 0 ? (
        <Caption className="text-secondary">
          No requirements added yet. Add requirements to define what you need from clinics.
        </Caption>
      ) : (
        <div className="space-y-2">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between rounded-xl border border-primary px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Badge>{req.requirement_type}</Badge>
                <BodySmall>{req.value}</BodySmall>
                <Badge className={priorityColors[req.priority ?? ""] ?? ""}>{req.priority}</Badge>
              </div>
              <button
                onClick={() => handleDelete(req.id)}
                className="text-sm text-secondary hover:text-icon-status-danger"
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
