import { createServerClient } from "@/lib/supabase/server"

export async function getClinicForUser(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("owner_id", userId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function getInquiriesForClinic(clinicId: string) {
  const supabase = await createServerClient()

  const { data: inquiries, error } = await supabase
    .from("partnership_inquiries")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false })

  if (error) return { data: [], error: error.message }
  if (!inquiries || inquiries.length === 0) return { data: [], error: null }

  // Load match results
  const matchResultIds = [...new Set(inquiries.map((i) => i.match_result_id))]
  const { data: matchResults } = await supabase
    .from("match_results")
    .select("*")
    .in("id", matchResultIds)

  // Load trial projects from match results
  const trialProjectIds = [...new Set(
    (matchResults ?? []).map((m) => m.trial_project_id)
  )]
  const { data: trialProjects } = trialProjectIds.length > 0
    ? await supabase.from("trial_projects").select("*").in("id", trialProjectIds)
    : { data: [] }

  // Load therapeutic areas for trial projects
  const areaIds = [...new Set(
    (trialProjects ?? []).map((t) => t.therapeutic_area_id).filter(Boolean) as string[]
  )]
  const { data: areas } = areaIds.length > 0
    ? await supabase.from("therapeutic_areas").select("id, name").in("id", areaIds)
    : { data: [] }

  const areaMap = new Map((areas ?? []).map((a) => [a.id, a.name]))
  const trialMap = new Map((trialProjects ?? []).map((t) => [t.id, {
    ...t,
    therapeutic_areas: t.therapeutic_area_id
      ? { name: areaMap.get(t.therapeutic_area_id) ?? null }
      : null,
  }]))
  const matchMap = new Map((matchResults ?? []).map((m) => [m.id, {
    ...m,
    trial_projects: trialMap.get(m.trial_project_id) ?? null,
  }]))

  // Load sponsor profiles
  const sponsorIds = [...new Set(inquiries.map((i) => i.sponsor_id))]
  const { data: sponsors } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", sponsorIds)

  const sponsorMap = new Map((sponsors ?? []).map((s) => [s.id, s]))

  const enriched = inquiries.map((inquiry) => ({
    ...inquiry,
    match_result: matchMap.get(inquiry.match_result_id) ?? null,
    sponsor: sponsorMap.get(inquiry.sponsor_id) ?? null,
  }))

  return { data: enriched, error: null }
}

export async function getInquiryDetail(inquiryId: string, clinicId: string) {
  const supabase = await createServerClient()

  const { data: inquiry, error } = await supabase
    .from("partnership_inquiries")
    .select("*")
    .eq("id", inquiryId)
    .eq("clinic_id", clinicId)
    .single()

  if (error || !inquiry) return { data: null, error: error?.message ?? "Not found" }

  // Load match result
  const { data: matchResult } = await supabase
    .from("match_results")
    .select("*")
    .eq("id", inquiry.match_result_id)
    .single()

  // Load trial project
  let trialProject = null
  if (matchResult) {
    const { data: tp } = await supabase
      .from("trial_projects")
      .select("*")
      .eq("id", matchResult.trial_project_id)
      .single()

    if (tp) {
      let therapeuticArea: { name: string } | null = null
      if (tp.therapeutic_area_id) {
        const { data: area } = await supabase
          .from("therapeutic_areas")
          .select("name")
          .eq("id", tp.therapeutic_area_id)
          .single()
        if (area) therapeuticArea = area
      }
      trialProject = { ...tp, therapeutic_areas: therapeuticArea }
    }
  }

  // Load sponsor
  const { data: sponsor } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("id", inquiry.sponsor_id)
    .single()

  return {
    data: {
      ...inquiry,
      match_result: matchResult
        ? { ...matchResult, trial_projects: trialProject }
        : null,
      sponsor: sponsor ?? null,
    },
    error: null,
  }
}
