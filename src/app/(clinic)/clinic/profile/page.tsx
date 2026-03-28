import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ClinicProfileTabs from "./components/ClinicProfileTabs"

export default async function ClinicProfilePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const clinicQuery = profile?.organization_id
    ? supabase.from("clinics").select("*").eq("organization_id", profile.organization_id).maybeSingle()
    : Promise.resolve({ data: null })

  const [clinicRes, areasRes] = await Promise.all([
    clinicQuery,
    supabase.from("therapeutic_areas").select("*").order("name"),
  ])

  const clinic = clinicRes.data ?? null
  const clinicId = clinic?.id

  const [equipmentRes, certsRes, availRes] = await Promise.all([
    clinicId
      ? supabase.from("clinic_equipment").select("*").eq("clinic_id", clinicId)
      : Promise.resolve({ data: [] }),
    clinicId
      ? supabase.from("certifications").select("*").eq("clinic_id", clinicId)
      : Promise.resolve({ data: [] }),
    clinicId
      ? supabase.from("clinic_availability").select("*").eq("clinic_id", clinicId)
      : Promise.resolve({ data: [] }),
  ])

  return (
    <ClinicProfileTabs
      clinic={clinic}
      equipment={equipmentRes.data ?? []}
      certifications={certsRes.data ?? []}
      availability={availRes.data ?? []}
      therapeuticAreas={areasRes.data ?? []}
      selectedSpecializations={clinic?.therapeutic_area_ids ?? []}
    />
  )
}
