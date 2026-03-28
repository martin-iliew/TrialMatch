import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ClinicProfileTabs from "@/features/clinic-profile/ClinicProfileTabs"

export default async function ClinicProfilePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Load clinic (may be null for first-time users)
  const { data: clinic } = await supabase
    .from("clinics")
    .select("*")
    .eq("owner_id", user.id)
    .single()

  const clinicId = clinic?.id

  // Load related data in parallel
  const [equipmentRes, certsRes, availRes, areasRes, specsRes] = await Promise.all([
    clinicId
      ? supabase.from("equipment").select("*").eq("clinic_id", clinicId)
      : Promise.resolve({ data: [] }),
    clinicId
      ? supabase.from("certifications").select("*").eq("clinic_id", clinicId)
      : Promise.resolve({ data: [] }),
    clinicId
      ? supabase.from("clinic_availability").select("*").eq("clinic_id", clinicId).single()
      : Promise.resolve({ data: null }),
    supabase.from("therapeutic_areas").select("*").order("name"),
    clinicId
      ? supabase.from("clinic_specializations").select("therapeutic_area_id").eq("clinic_id", clinicId)
      : Promise.resolve({ data: [] }),
  ])

  return (
    <ClinicProfileTabs
      clinic={clinic}
      equipment={equipmentRes.data ?? []}
      certifications={certsRes.data ?? []}
      availability={availRes.data ?? null}
      therapeuticAreas={areasRes.data ?? []}
      selectedSpecializations={(specsRes.data ?? []).map((s) => s.therapeutic_area_id)}
    />
  )
}
