"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createTrialProject(data: {
  title: string
  description?: string
  therapeutic_area_id?: string
  phase?: string
  patient_count?: number
  start_date?: string
  end_date?: string
  geographic_preference?: string
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: project, error } = await supabase
    .from("trial_projects")
    .insert({
      ...data,
      sponsor_id: user.id,
      status: "draft" as const,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath("/sponsor/projects")
  return { data: project }
}

export async function updateTrialProject(
  id: string,
  data: {
    title?: string
    description?: string
    therapeutic_area_id?: string
    phase?: string
    patient_count?: number
    start_date?: string
    end_date?: string
    geographic_preference?: string
  }
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Verify ownership + draft status
  const { data: existing } = await supabase
    .from("trial_projects")
    .select("id")
    .eq("id", id)
    .eq("sponsor_id", user.id)
    .eq("status", "draft")
    .single()

  if (!existing) return { error: "Project not found, not yours, or not in draft status" }

  const { data: project, error } = await supabase
    .from("trial_projects")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/sponsor/projects/${id}`)
  return { data: project }
}

export async function addRequirement(data: {
  trial_project_id: string
  type: string
  value: string
  priority: "Required" | "Preferred"
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Verify ownership of the trial project
  const { data: project } = await supabase
    .from("trial_projects")
    .select("id")
    .eq("id", data.trial_project_id)
    .eq("sponsor_id", user.id)
    .single()

  if (!project) return { error: "Project not found or not authorized" }

  const { data: requirement, error } = await supabase
    .from("trial_requirements")
    .insert(data)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/sponsor/projects/${data.trial_project_id}`)
  return { data: requirement }
}

export async function deleteRequirement(id: string, trialProjectId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Verify ownership: load requirement, then check project ownership
  const { data: requirement } = await supabase
    .from("trial_requirements")
    .select("id, trial_project_id")
    .eq("id", id)
    .single()

  if (!requirement) return { error: "Requirement not found" }

  const { data: project } = await supabase
    .from("trial_projects")
    .select("id")
    .eq("id", requirement.trial_project_id)
    .eq("sponsor_id", user.id)
    .single()

  if (!project) return { error: "Not authorized" }

  const { error } = await supabase
    .from("trial_requirements")
    .delete()
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath(`/sponsor/projects/${trialProjectId}`)
  return { error: null }
}
