import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import type { Json, Tables } from "@/types/supabase"

type Clinic = Tables<"clinics">
type Equipment = Tables<"clinic_equipment">
type Certification = Tables<"certifications">
type Availability = Tables<"clinic_availability">
type Requirement = Tables<"project_requirements">
type TrialProject = Tables<"trial_projects"> & { geographic_preference?: string | null }

interface ClinicProfile {
  clinic: Clinic
  equipment: Equipment[]
  certifications: Certification[]
  availability: Availability[]
}

interface ScoreBreakdown {
  therapeutic_area: number
  equipment: number
  certification: number
  availability: number
  geographic: number
}

function normalizeOverallScore(score: number): number {
  if (!Number.isFinite(score)) return 0

  // Some environments appear to have a stricter numeric precision on
  // match_results.overall_score than the checked-in schema suggests.
  // Store a bounded two-decimal score so /api/match does not fail on insert.
  return Math.min(99.99, Math.max(0, Number(score.toFixed(2))))
}

function scoreTherapeuticArea(cp: ClinicProfile, trial: TrialProject): number {
  if (!trial.therapeutic_area_id) return 30
  const ids = cp.clinic.therapeutic_area_ids ?? []
  return ids.includes(trial.therapeutic_area_id) ? 30 : 0
}

function scoreEquipment(cp: ClinicProfile, reqs: Requirement[]): number {
  if (reqs.length === 0) return 25
  const matched = reqs.filter((req) => {
    const val = (typeof req.value === "object" && req.value !== null && "text" in req.value)
      ? String((req.value as Record<string, unknown>).text ?? "").toLowerCase()
      : ""
    return cp.equipment.some((eq) => eq.name.toLowerCase().includes(val))
  }).length
  return Math.round((matched / reqs.length) * 25)
}

function scoreCertification(cp: ClinicProfile, reqs: Requirement[]): number {
  if (reqs.length === 0) return 20
  const matched = reqs.filter((req) => {
    const val = (typeof req.value === "object" && req.value !== null && "text" in req.value)
      ? String((req.value as Record<string, unknown>).text ?? "").toLowerCase()
      : ""
    return cp.certifications.some((cert) =>
      cert.certification_name.toLowerCase().includes(val)
    )
  }).length
  return Math.round((matched / reqs.length) * 20)
}

function scoreAvailability(cp: ClinicProfile, trial: TrialProject): number {
  // No trial dates → clinic is always eligible
  if (!trial.start_date || !trial.end_date) return 15

  const overlappingWindows = cp.availability.filter(
    (a) =>
      a.type === "available" &&
      a.start_date <= trial.end_date! &&
      trial.start_date! <= a.end_date
  )

  if (overlappingWindows.length === 0) return 0

  const target = trial.target_enrollment
  if (!target || target <= 0) return 15

  // Find the best (highest) slots_available across overlapping windows
  const slots = overlappingWindows
    .map((a) => a.slots_available)
    .filter((s): s is number => s != null && s > 0)

  if (slots.length === 0) {
    // Overlap exists but no slot count declared — partial credit
    return 8
  }

  const bestSlots = Math.max(...slots)
  if (bestSlots >= target) return 15
  return Math.max(3, Math.round((bestSlots / target) * 15))
}

function scoreGeographic(cp: ClinicProfile, trial: TrialProject): number {
  if (!trial.geographic_preference) return 10
  const prefs = trial.geographic_preference.toLowerCase().split(",").map((s) => s.trim())
  return prefs.includes((cp.clinic.city ?? "").toLowerCase()) ? 10 : 0
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const { data: trial } = await supabase
    .from("trial_projects")
    .select("*")
    .eq("id", trial_project_id)
    .eq("organization_id", profile?.organization_id ?? "")
    .single()

  if (!trial) {
    return NextResponse.json({ error: "Trial project not found" }, { status: 404 })
  }

  const { data: requirements } = await supabase
    .from("project_requirements")
    .select("*")
    .eq("project_id", trial_project_id)

  const allReqs = requirements ?? []

  const [clinicsRes, equipRes, certsRes, availRes] = await Promise.all([
    supabase.from("clinics").select("*"),
    supabase.from("clinic_equipment").select("*"),
    supabase.from("certifications").select("*"),
    supabase.from("clinic_availability").select("*"),
  ])

  const clinics = clinicsRes.data ?? []
  const equip = equipRes.data ?? []
  const certs = certsRes.data ?? []
  const avail = availRes.data ?? []

  const clinicProfiles: ClinicProfile[] = clinics.map((clinic) => ({
    clinic,
    equipment: equip.filter((e) => e.clinic_id === clinic.id),
    certifications: certs.filter((c) => c.clinic_id === clinic.id),
    availability: avail.filter((a) => a.clinic_id === clinic.id),
  }))

  const hardFilterReqs = allReqs.filter((r) => r.is_hard_filter)
  const equipReqs = allReqs.filter((r) => r.type === "equipment" && !r.is_hard_filter)
  const certReqs = allReqs.filter((r) => r.type === "certification" && !r.is_hard_filter)

  const filtered = clinicProfiles.filter((cp) => {
    for (const req of hardFilterReqs) {
      const val = (typeof req.value === "object" && req.value !== null && "text" in req.value)
        ? String((req.value as Record<string, unknown>).text ?? "").toLowerCase()
        : ""
      switch (req.type) {
        case "therapeutic_area": {
          const ids = cp.clinic.therapeutic_area_ids ?? []
          if (!ids.some((id) => id.toLowerCase().includes(val))) return false
          break
        }
        case "equipment":
          if (!cp.equipment.some((eq) => eq.name.toLowerCase().includes(val))) return false
          break
        case "certification":
          if (!cp.certifications.some((cert) => cert.certification_name.toLowerCase().includes(val))) return false
          break
        case "patient_volume": {
          const reqCapacity = parseInt(val, 10)
          if (isNaN(reqCapacity) || (cp.clinic.patient_capacity ?? 0) < reqCapacity) return false
          break
        }
        case "geography":
          if (!(cp.clinic.city ?? "").toLowerCase().includes(val)) return false
          break
      }
    }
    return true
  })

  const trialWithGeo = trial as TrialProject

  const scored = filtered.map((cp) => {
    const breakdown: ScoreBreakdown = {
      therapeutic_area: scoreTherapeuticArea(cp, trialWithGeo),
      equipment: scoreEquipment(cp, equipReqs),
      certification: scoreCertification(cp, certReqs),
      availability: scoreAvailability(cp, trialWithGeo),
      geographic: scoreGeographic(cp, trialWithGeo),
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
    .eq("project_id", trial_project_id)

  if (scored.length > 0) {
    const { error: insertError } = await supabase
      .from("match_results")
      .insert(
        scored.map((r) => ({
          project_id: trial_project_id,
          clinic_id: r.clinic_id,
          overall_score: normalizeOverallScore(r.score),
          score_breakdown: r.breakdown as unknown as Json,
          status: "pending" as const,
          algorithm_version: "1.0",
        }))
      )

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  await supabase
    .from("trial_projects")
    .update({ status: scored.length > 0 ? "active" : "draft" })
    .eq("id", trial_project_id)

  return NextResponse.json({ results: scored, count: scored.length })
}
