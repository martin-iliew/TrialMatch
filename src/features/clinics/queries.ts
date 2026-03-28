import { createServerClient } from "@/lib/supabase/server"

export async function getClinics() {
  const supabase = await createServerClient()

  const { data: clinics, error } = await supabase
    .from("clinics")
    .select("id, name, city, country, description, therapeutic_area_ids")
    .order("name")

  if (error) return { data: [], error: error.message }
  if (!clinics || clinics.length === 0) return { data: [], error: null }

  const allAreaIds = [...new Set(clinics.flatMap((c) => c.therapeutic_area_ids ?? []))]
  const areaMap = new Map<string, string>()

  if (allAreaIds.length > 0) {
    const { data: areas } = await supabase
      .from("therapeutic_areas")
      .select("id, name")
      .in("id", allAreaIds)
    for (const area of areas ?? []) {
      areaMap.set(area.id, area.name)
    }
  }

  const enriched = clinics.map((clinic) => ({
    ...clinic,
    therapeutic_area_names: (clinic.therapeutic_area_ids ?? [])
      .map((id) => areaMap.get(id))
      .filter((n): n is string => Boolean(n)),
  }))

  return { data: enriched, error: null }
}

export async function getClinicForUser(userId: string) {
  const supabase = await createServerClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .single()

  if (!profile?.organization_id) return { data: null, error: "No organization found" }

  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .maybeSingle()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}
