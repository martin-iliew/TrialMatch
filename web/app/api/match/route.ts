import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import type { Tables } from "@/types/supabase"

// --- Types ---

type Clinic = Tables<"clinics">
type Equipment = Tables<"equipment">
type Certification = Tables<"certifications">
type Availability = Tables<"clinic_availability">
type Requirement = Tables<"trial_requirements">
type TrialProject = Tables<"trial_projects">

interface ClinicProfile {
  clinic: Clinic
  specializations: string[] // therapeutic_area_ids
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

// --- Scoring Functions ---

function scoreTherapeuticArea(
  clinic: ClinicProfile,
  trial: TrialProject
): number {
  if (!trial.therapeutic_area_id) return 30 // no preference = full points
  return clinic.specializations.includes(trial.therapeutic_area_id) ? 30 : 0
}

function scoreEquipment(
  clinic: ClinicProfile,
  preferredReqs: Requirement[]
): number {
  if (preferredReqs.length === 0) return 25
  const matched = preferredReqs.filter((req) =>
    clinic.equipment.some((eq) =>
      eq.name.toLowerCase().includes(req.value.toLowerCase())
    )
  ).length
  return Math.round((matched / preferredReqs.length) * 25)
}

function scoreCertification(
  clinic: ClinicProfile,
  preferredReqs: Requirement[]
): number {
  if (preferredReqs.length === 0) return 20
  const matched = preferredReqs.filter((req) =>
    clinic.certifications.some((cert) =>
      cert.name.toLowerCase().includes(req.value.toLowerCase())
    )
  ).length
  return Math.round((matched / preferredReqs.length) * 20)
}

function scoreAvailability(
  clinic: ClinicProfile,
  trial: TrialProject
): number {
  let availPoints = 0
  let capacityPoints = 0

  if (!trial.start_date || !trial.end_date) {
    availPoints = 10
  } else if (clinic.availability) {
    // Two ranges overlap if start1 <= end2 AND start2 <= end1
    const overlaps =
      clinic.availability.start_date <= trial.end_date &&
      trial.start_date <= clinic.availability.end_date
    availPoints = overlaps ? 10 : 0
  }

  if (!trial.patient_count) {
    capacityPoints = 5
  } else if (clinic.availability) {
    capacityPoints = clinic.availability.capacity >= trial.patient_count ? 5 : 0
  }

  return availPoints + capacityPoints
}

function scoreGeographic(
  clinic: ClinicProfile,
  trial: TrialProject
): number {
  if (!trial.geographic_preference) return 10
  return clinic.clinic.city.toLowerCase() === trial.geographic_preference.toLowerCase()
    ? 10
    : 0
}

// --- Main Handler ---

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { trial_project_id } = body as { trial_project_id: string }

  if (!trial_project_id) {
    return NextResponse.json({ error: "trial_project_id is required" }, { status: 400 })
  }

  // Step 1: Load trial project + requirements
  const { data: trial } = await supabase
    .from("trial_projects")
    .select("*")
    .eq("id", trial_project_id)
    .eq("sponsor_id", user.id)
    .single()

  if (!trial) {
    return NextResponse.json({ error: "Trial project not found" }, { status: 404 })
  }

  const { data: requirements } = await supabase
    .from("trial_requirements")
    .select("*")
    .eq("trial_project_id", trial_project_id)

  const allReqs = requirements ?? []

  // Step 2: Load all clinics with related data (parallel queries)
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

  // Build area name → id map for therapeutic_area requirement matching
  const areaNameToId = new Map(areas.map((a) => [a.name.toLowerCase(), a.id]))
  const areaIdToName = new Map(areas.map((a) => [a.id, a.name]))

  // Group related data by clinic_id
  const clinicProfiles: ClinicProfile[] = clinics.map((clinic) => ({
    clinic,
    specializations: specs
      .filter((s) => s.clinic_id === clinic.id)
      .map((s) => s.therapeutic_area_id),
    equipment: equip.filter((e) => e.clinic_id === clinic.id),
    certifications: certs.filter((c) => c.clinic_id === clinic.id),
    availability: avail.find((a) => a.clinic_id === clinic.id) ?? null,
  }))

  // Step 3: Separate requirements by type and priority
  const requiredReqs = allReqs.filter((r) => r.priority === "Required")
  const preferredEquipReqs = allReqs.filter((r) => r.type === "equipment" && r.priority === "Preferred")
  const preferredCertReqs = allReqs.filter((r) => r.type === "certification" && r.priority === "Preferred")

  // Step 4: Hard filter — replace the broken therapeutic_area check with proper logic
  const filtered = clinicProfiles.filter((cp) => {
    for (const req of requiredReqs) {
      switch (req.type) {
        case "therapeutic_area": {
          const targetId = areaNameToId.get(req.value.toLowerCase())
          if (!targetId || !cp.specializations.includes(targetId)) return false
          break
        }
        case "equipment":
          if (!cp.equipment.some((eq) =>
            eq.name.toLowerCase().includes(req.value.toLowerCase())
          )) return false
          break
        case "certification":
          if (!cp.certifications.some((cert) =>
            cert.name.toLowerCase().includes(req.value.toLowerCase())
          )) return false
          break
        case "capacity":
          if (!cp.availability || cp.availability.capacity < parseInt(req.value, 10)) return false
          break
        case "geographic":
          if (cp.clinic.city.toLowerCase() !== req.value.toLowerCase()) return false
          break
      }
    }
    return true
  })

  // Step 5: Score remaining clinics
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

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Step 6: Persist results
  // Delete existing results for this project
  await supabase
    .from("match_results")
    .delete()
    .eq("trial_project_id", trial_project_id)

  // Insert new results
  if (scored.length > 0) {
    const { error: insertError } = await supabase
      .from("match_results")
      .insert(
        scored.map((r) => ({
          trial_project_id,
          clinic_id: r.clinic_id,
          score: r.score,
          breakdown: r.breakdown as unknown as Record<string, unknown>,
          status: "pending" as const,
        }))
      )

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  // Update trial status
  const newStatus = scored.length > 0 ? "matched" : "draft"
  await supabase
    .from("trial_projects")
    .update({ status: newStatus as "draft" | "searching" | "matched" | "closed" })
    .eq("id", trial_project_id)

  // Step 7: Return results
  return NextResponse.json({
    results: scored,
    count: scored.length,
  })
}
