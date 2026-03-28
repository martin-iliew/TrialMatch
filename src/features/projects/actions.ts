"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const createTrialProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  therapeutic_area_id: z.string().uuid().optional(),
  phase: z.string().optional(),
  target_enrollment: z.number().positive().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  geographic_preference: z.string().optional(),
})

const addRequirementSchema = z.object({
  project_id: z.string().uuid("Invalid project ID"),
  type: z.enum(["therapeutic_area", "equipment", "patient_volume", "certification", "geography", "other"]),
  label: z.string().min(1, "Label is required"),
  value: z.record(z.string(), z.unknown()),
  is_hard_filter: z.boolean().default(false),
  weight: z.number().min(0).max(1).default(1.0),
})

export async function createTrialProject(data: {
  title: string
  description?: string
  therapeutic_area_id?: string
  phase?: string
  target_enrollment?: number
  start_date?: string
  end_date?: string
  geographic_preference?: string
}) {
  const result = createTrialProjectSchema.safeParse(data)
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) return { error: "No organization found. Please complete your profile first." }

  const { data: project, error } = await supabase
    .from("trial_projects")
    .insert({ ...result.data, organization_id: profile.organization_id, status: "draft" })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath("/sponsor/projects")
  return { data: project }
}

export async function addRequirement(data: {
  project_id: string
  type: "therapeutic_area" | "equipment" | "patient_volume" | "certification" | "geography" | "other"
  label: string
  value: Record<string, unknown>
  is_hard_filter?: boolean
  weight?: number
}) {
  const result = addRequirementSchema.safeParse(data)
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: requirement, error } = await supabase
    .from("project_requirements")
    .insert(result.data)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/sponsor/projects/${result.data.project_id}`)
  return { data: requirement }
}

export async function deleteRequirement(id: string, projectId: string) {
  if (!id || !projectId) return { error: "Invalid parameters" }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const { data: requirement } = await supabase
    .from("project_requirements")
    .select("id, project_id")
    .eq("id", id)
    .single()

  if (!requirement) return { error: "Requirement not found" }

  const { data: project } = await supabase
    .from("trial_projects")
    .select("id")
    .eq("id", requirement.project_id)
    .eq("organization_id", profile?.organization_id ?? "")
    .single()

  if (!project) return { error: "Not authorized" }

  const { error } = await supabase
    .from("project_requirements")
    .delete()
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath(`/sponsor/projects/${projectId}`)
  return { error: null }
}
