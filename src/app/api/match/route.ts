import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import type { Json, Tables } from "@/types/supabase"

type Clinic = Tables<"clinics">
type Equipment = Tables<"equipment">
type Certification = Tables<"certifications">
type Availability = Tables<"clinic_availability">
type Requirement = Tables<"trial_requirements">
type TrialProject = Tables<"trial_projects">

interface ClinicProfile {
  clinic: Clinic
  specializations: string[]
  equipment: Equipment[]
  certifications: Certification[]
  availability: Availability | null
}

interface ScoreBreakdown {
  therapeutic_area: number
  equipment: number
  certification: number
  availability: number
  geographic: number
}

function scoreTherapeuticArea(cp: ClinicProfile, trial: TrialProject): number {
  if (!trial.therapeutic_area_id) return 30
  return cp.specializations.includes(trial.therapeutic_area_id) ? 30 : 0
}

function scoreEquipment(cp: ClinicProfile, preferredReqs: Requirement[]): number {
  if (preferredReqs.length === 0) return 25
  const matched = preferredReqs.filter((req) =>
    cp.equipment.some((eq) =>
      eq.name.toLowerCase().includes((req.value ?? "").toLowerCase())
    )
  ).length
  return Math.round((matched / preferredReqs.length) * 25)
}

function scoreCertification(cp: ClinicProfile, preferredReqs: Requirement[]): number {
  if (preferredReqs.length === 0) return 20
  const matched = preferredReqs.filter((req) =>
    cp.certifications.some((cert) =>
      cert.certification_name.toLowerCase().includes((req.value ?? "").toLowerCase())
    )
  ).length
  return Math.round((matched / preferredReqs.length) * 20)
}

function scoreAvailability(cp: ClinicProfile, trial: TrialProject): number {
  let availPoints = 0
  let capacityPoints = 0

  if (!trial.start_date || !trial.end_date) {
    availPoints = 10
  } else if (cp.availability) {
    const overlaps =
      cp.availability.available_from <= trial.end_date &&
      trial.start_date <= cp.availability.available_to
    availPoints = overlaps ? 10 : 0
  }

  if (cp.availability) {
    const remainingSlots = cp.availability.max_concurrent_trials - cp.availability.current_trial_count
    capacityPoints = remainingSlots > 0 ? 5 : 0
  }

  return availPoints + capacityPoints
}

function scoreGeographic(cp: ClinicProfile, trial: TrialProject): number {
  if (!trial.geographic_preference) return 10
  const prefs = trial.geographic_preference.toLowerCase().split(",").map((s) => s.trim())
  return prefs.includes(cp.clinic.city.toLowerCase()) ? 10 : 0
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json() as { trial_project_id?: string }
  const { trial_project_id } = body

  if (!trial_project_id) {
    return NextResponse.json({ error: "trial_project_id is required" }, { status: 400 })
  }

  const { data: trial } = await supabase
    .from("trial_projects")
    .select("*")
    .eq("id", trial_project_id)
    .eq("sponsor_user_id", user.id)
    .single()

  if (!trial) {
    return NextResponse.json({ error: "Trial project not found" }, { status: 404 })
  }

  const { data: requirements } = await supabase
    .from("trial_requirements")
    .select("*")
    .eq("trial_project_id", trial_project_id)

  const allReqs = requirements ?? []

  const [clinicsRes, specsRes, equipRes, certsRes, availRes, areasRes] = await Promise.all([
    supabase.from("clinics").select("*"),
    supabase.from("clinic_specializations").select("*"),
    supabase.from("equipment").select("*"),
    supabase.from("certifications").select("*"),
    supabase.from("clinic_availability").select("*"),
    supabase.from("therapeutic_areas").select("*"),
  ])

  const clinics = clinicsRes.data ?? []
  const specs = specsRes.data ?? []
  const equip = equipRes.data ?? []
  const certs = certsRes.data ?? []
  const avail = availRes.data ?? []
  const areas = areasRes.data ?? []

  const areaNameToId = new Map(areas.map((a) => [a.name.toLowerCase(), a.id]))

  const clinicProfiles: ClinicProfile[] = clinics.map((clinic) => ({
    clinic,
    specializations: specs
      .filter((s) => s.clinic_id === clinic.id)
      .map((s) => s.therapeutic_area_id),
    equipment: equip.filter((e) => e.clinic_id === clinic.id),
    certifications: certs.filter((c) => c.clinic_id === clinic.id),
    availability: avail.find((a) => a.clinic_id === clinic.id) ?? null,
  }))

  const requiredReqs = allReqs.filter((r) => r.priority === "required")
  const preferredEquipReqs = allReqs.filter(
    (r) => r.requirement_type === "equipment" && r.priority === "preferred"
  )
  const preferredCertReqs = allReqs.filter(
    (r) => r.requirement_type === "certification" && r.priority === "preferred"
  )

  const filtered = clinicProfiles.filter((cp) => {
    for (const req of requiredReqs) {
      const val = req.value ?? ""
      switch (req.requirement_type) {
        case "specialization": {
          const targetId = areaNameToId.get(val.toLowerCase())
          if (!targetId || !cp.specializations.includes(targetId)) return false
          break
        }
        case "equipment":
          if (!cp.equipment.some((eq) => eq.name.toLowerCase().includes(val.toLowerCase()))) return false
          break
        case "certification":
          if (!cp.certifications.some((cert) => cert.certification_name.toLowerCase().includes(val.toLowerCase()))) return false
          break
        case "capacity": {
          const reqCapacity = parseInt(val, 10)
          if (isNaN(reqCapacity) || !cp.availability || cp.availability.max_concurrent_trials < reqCapacity) return false
          break
        }
        case "phase_experience": {
          const phaseExp = cp.clinic.phase_experience
          if (!phaseExp || !phaseExp.includes(val as (typeof phaseExp)[number])) return false
          break
        }
        case "molecule_experience": {
          const molExp = cp.clinic.molecule_type_experience
          if (!molExp || !molExp.includes(val as (typeof molExp)[number])) return false
          break
        }
      }
    }
    return true
  })

  const scored = filtered.map((cp) => {
    const breakdown: ScoreBreakdown = {
      therapeutic_area: scoreTherapeuticArea(cp, trial),
      equipment: scoreEquipment(cp, preferredEquipReqs),
      certification: scoreCertification(cp, preferredCertReqs),
      availability: scoreAvailability(cp, trial),
      geographic: scoreGeographic(cp, trial),
    }
    const score =
      breakdown.therapeutic_area +
      breakdown.equipment +
      breakdown.certification +
      breakdown.availability +
      breakdown.geographic

    return {
      clinic_id: cp.clinic.id,
      clinic_name: cp.clinic.name,
      clinic_city: cp.clinic.city,
      score,
      breakdown,
    }
  })

  scored.sort((a, b) => b.score - a.score)

  await supabase
    .from("match_results")
    .delete()
    .eq("trial_project_id", trial_project_id)

  if (scored.length > 0) {
    const { error: insertError } = await supabase
      .from("match_results")
      .insert(
        scored.map((r) => ({
          trial_project_id,
          clinic_id: r.clinic_id,
          overall_score: r.score,
          breakdown: r.breakdown as unknown as Json,
          status: "pending" as const,
        }))
      )

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  await supabase
    .from("trial_projects")
    .update({ status: scored.length > 0 ? ("matched" as const) : ("draft" as const) })
    .eq("id", trial_project_id)

  return NextResponse.json({ results: scored, count: scored.length })
}
