import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Heading5, BodySmall } from "@/components/ui/typography"
import { getProjectDetail, getProjectRequirements } from "@/features/projects/queries"
import {
  buildMatchingCriteriaChips,
  buildMatchingPreviewQueue,
} from "@/features/matching/presentation"
import MatchingExperience from "./components/MatchingExperience"

export default async function MatchingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: project } = await getProjectDetail(id, user.id)
  if (!project) {
    notFound()
  }

  const { data: requirements } = await getProjectRequirements(id)
  const { data: clinics } = await supabase
    .from("clinics")
    .select("id, name, city, country, patient_capacity, num_investigators")

  const totalClinics = clinics?.length ?? 0
  const criteriaChips = buildMatchingCriteriaChips(
    {
      title: project.title,
      phase: project.phase,
      moleculeType:
        "molecule_type" in project && typeof project.molecule_type === "string"
          ? project.molecule_type.replace(/_/g, " ")
          : null,
      geographicPreference:
        "geographic_preference" in project &&
        typeof project.geographic_preference === "string"
          ? project.geographic_preference
          : null,
      requiredPatientCount:
        "target_enrollment" in project && typeof project.target_enrollment === "number"
          ? project.target_enrollment
          : null,
    },
    requirements.map((requirement) => ({
      label: requirement.label,
      isHardFilter: requirement.is_hard_filter,
      weight: requirement.weight,
    })),
  )

  const previewQueue = buildMatchingPreviewQueue(
    (clinics ?? []).map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      city: clinic.city,
      country: clinic.country,
      siteType: "research_site",
      activeTrialCount: clinic.num_investigators,
      maxConcurrentTrials: clinic.patient_capacity,
    })),
    6,
  )

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/cro/projects/${id}`} className="body-small text-secondary hover:underline">
          ← Back to study
        </Link>
      </div>

      <div className="mb-6">
        <Heading5>AI Ranking in Progress</Heading5>
        <BodySmall className="mt-2 text-secondary">
          TrialAxis is running the full clinic ranking workflow before opening the shortlist.
        </BodySmall>
      </div>

      <MatchingExperience
        projectId={id}
        projectTitle={project.title}
        criteriaChips={criteriaChips}
        previewQueue={previewQueue}
        totalClinics={Math.max(totalClinics, previewQueue.length)}
      />
    </div>
  )
}
