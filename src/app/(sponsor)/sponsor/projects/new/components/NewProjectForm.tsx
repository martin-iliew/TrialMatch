"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createTrialProject } from "@/features/projects/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label, Heading5, Caption } from "@/components/ui/typography"
import type { Tables } from "@/types"

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  therapeutic_area_id: z.string().optional(),
  phase: z.string().optional(),
  target_enrollment: z.preprocess(
    (v) => (v === '' || v === null || (typeof v === 'number' && isNaN(v)) ? undefined : Number(v)),
    z.number().positive().optional()
  ),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  geographic_preference: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function NewProjectForm({ areas }: { areas: Tables<"therapeutic_areas">[] }) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    const result = await createTrialProject({
      title: values.title,
      description: values.description,
      therapeutic_area_id: values.therapeutic_area_id,
      phase: values.phase,
      target_enrollment: values.target_enrollment,
      start_date: values.start_date,
      end_date: values.end_date,
      geographic_preference: values.geographic_preference,
    })

    if (result.error) {
      toast.error(result.error)
    } else if (result.data) {
      router.push(`/sponsor/projects/${result.data.id}`)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Heading5 className="mb-6">New Trial Project</Heading5>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g. Phase 2 Oncology Trial — Sofia Region"
            {...register("title")}
          />
          {errors.title && (
            <Caption className="text-icon-status-danger">{errors.title.message}</Caption>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the trial..."
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="therapeutic_area_id">Therapeutic Area</Label>
            <select
              id="therapeutic_area_id"
              className="h-11 w-full rounded-xl border border-primary bg-surface-level-0 px-3 text-body-small text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-level-5"
              {...register("therapeutic_area_id")}
            >
              <option value="">Select area...</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phase">Phase</Label>
            <select
              id="phase"
              className="h-11 w-full rounded-xl border border-primary bg-surface-level-0 px-3 text-body-small text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-level-5"
              {...register("phase")}
            >
              <option value="">Select phase...</option>
              {["I", "Ia", "Ib", "II", "IIa", "IIb", "III", "IV"].map((p) => (
                <option key={p} value={p}>
                  Phase {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="target_enrollment">Target Enrollment</Label>
          <Input
            id="target_enrollment"
            type="number"
            min={1}
            placeholder="e.g. 50"
            {...register("target_enrollment", { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="start_date">Start Date</Label>
            <Input id="start_date" type="date" {...register("start_date")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end_date">End Date</Label>
            <Input id="end_date" type="date" {...register("end_date")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="geographic_preference">Geographic Preference</Label>
          <Input
            id="geographic_preference"
            placeholder="e.g. Sofia, Plovdiv, Varna"
            {...register("geographic_preference")}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
