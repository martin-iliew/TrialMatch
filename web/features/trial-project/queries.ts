import { createServerClient } from "@/lib/supabase/server"

export async function getProjectsForSponsor(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("trial_projects")
    .select("*, therapeutic_areas(name)")
    .eq("sponsor_id", userId)
    .order("created_at", { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: data ?? [], error: null }
}

export async function getProjectDetail(projectId: string, userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("trial_projects")
    .select("*, therapeutic_areas(name)")
    .eq("id", projectId)
    .eq("sponsor_id", userId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function getProjectRequirements(projectId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("trial_requirements")
    .select("*")
    .eq("trial_project_id", projectId)
    .order("created_at")

  if (error) return { data: [], error: error.message }
  return { data: data ?? [], error: null }
}

export async function getMatchResults(projectId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("match_results")
    .select("*, clinics(name, city, contact_email)")
    .eq("trial_project_id", projectId)
    .order("score", { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: data ?? [], error: null }
}

export async function getMatchResultInquiries(matchResultIds: string[]) {
  if (matchResultIds.length === 0) return { data: [], error: null }
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("partnership_inquiries")
    .select("*")
    .in("match_result_id", matchResultIds)

  if (error) return { data: [], error: error.message }
  return { data: data ?? [], error: null }
}

export async function getTherapeuticAreas() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("therapeutic_areas")
    .select("*")
    .order("name")

  if (error) return { data: [], error: error.message }
  return { data: data ?? [], error: null }
}
