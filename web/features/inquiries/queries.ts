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

  // Load inquiries with related trial project info and sponsor name
  const { data: inquiries, error } = await supabase
    .from("partnership_inquiries")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false })

  if (error) return { data: [], error: error.message }
  if (!inquiries || inquiries.length === 0) return { data: [], error: null }

  // Load match results for these inquiries
  const matchResultIds = inquiries.map((i) => i.match_result_id)
  const { data: matchResults } = await supabase
    .from("match_results")
    .select("*, trial_projects(title, phase, patient_count, start_date, end_date, therapeutic_areas(name))")
    .in("id", matchResultIds)

  // Load sponsor profiles
  const sponsorIds = [...new Set(inquiries.map((i) => i.sponsor_id))]
  const { data: sponsors } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", sponsorIds)

  // Merge data
  const matchMap = new Map((matchResults ?? []).map((m) => [m.id, m]))
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

  // Load related data
  const [matchRes, sponsorRes] = await Promise.all([
    supabase
      .from("match_results")
      .select("*, trial_projects(title, description, phase, patient_count, start_date, end_date, geographic_preference, therapeutic_areas(name))")
      .eq("id", inquiry.match_result_id)
      .single(),
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("id", inquiry.sponsor_id)
      .single(),
  ])

  return {
    data: {
      ...inquiry,
      match_result: matchRes.data ?? null,
      sponsor: sponsorRes.data ?? null,
    },
    error: null,
  }
}
