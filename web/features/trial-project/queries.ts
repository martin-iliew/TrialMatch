import { createServerClient } from "@/lib/supabase/server"

export async function getProjectsForSponsor(userId: string) {
  const supabase = await createServerClient()
  const { data: projects, error } = await supabase
    .from("trial_projects")
    .select("*")
    .eq("sponsor_id", userId)
    .order("created_at", { ascending: false })

  if (error) return { data: [], error: error.message }
  if (!projects || projects.length === 0) return { data: [], error: null }

  // Load therapeutic area names for projects that have one
  const areaIds = [...new Set(
    projects.map((p) => p.therapeutic_area_id).filter(Boolean) as string[]
  )]
  const areaMap = new Map<string, string>()

  if (areaIds.length > 0) {
    const { data: areas } = await supabase
      .from("therapeutic_areas")
      .select("id, name")
      .in("id", areaIds)
    for (const area of areas ?? []) {
      areaMap.set(area.id, area.name)
    }
  }

  const enriched = projects.map((p) => ({
    ...p,
    therapeutic_areas: p.therapeutic_area_id
      ? { name: areaMap.get(p.therapeutic_area_id) ?? null }
      : null,
  }))

  return { data: enriched, error: null }
}

export async function getProjectDetail(projectId: string, userId: string) {
  const supabase = await createServerClient()
  const { data: project, error } = await supabase
    .from("trial_projects")
    .select("*")
    .eq("id", projectId)
    .eq("sponsor_id", userId)
    .single()

  if (error || !project) return { data: null, error: error?.message ?? "Not found" }

  // Load therapeutic area name
  let therapeuticArea: { name: string } | null = null
  if (project.therapeutic_area_id) {
    const { data: area } = await supabase
      .from("therapeutic_areas")
      .select("name")
      .eq("id", project.therapeutic_area_id)
      .single()
    if (area) therapeuticArea = area
  }

  return {
    data: { ...project, therapeutic_areas: therapeuticArea },
    error: null,
  }
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
  const { data: results, error } = await supabase
    .from("match_results")
    .select("*")
    .eq("trial_project_id", projectId)
    .order("score", { ascending: false })

  if (error) return { data: [], error: error.message }
  if (!results || results.length === 0) return { data: [], error: null }

  // Load clinic info for each match result
  const clinicIds = [...new Set(results.map((r) => r.clinic_id))]
  const { data: clinics } = await supabase
    .from("clinics")
    .select("id, name, city, contact_email")
    .in("id", clinicIds)

  const clinicMap = new Map(
    (clinics ?? []).map((c) => [c.id, { name: c.name, city: c.city, contact_email: c.contact_email }])
  )

  const enriched = results.map((r) => ({
    ...r,
    clinics: clinicMap.get(r.clinic_id) ?? null,
  }))

  return { data: enriched, error: null }
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
