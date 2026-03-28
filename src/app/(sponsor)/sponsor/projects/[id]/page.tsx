import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getProjectDetail, getProjectRequirements } from "@/features/projects/queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heading5, BodySmall, Caption } from "@/components/ui/typography"
import Link from "next/link"
import RequirementsSection from "./components/RequirementsSection"
import RunMatchButton from "./components/RunMatchButton"

const statusColors: Record<string, string> = {
  draft: "bg-surface-level-2 text-secondary",
  searching: "bg-surface-status-info text-icon-status-info",
  matched: "bg-surface-status-success text-icon-status-success",
  closed: "bg-surface-level-2 text-tertiary",
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: project } = await getProjectDetail(id, user.id)
  if (!project) notFound()

  const { data: requirements } = await getProjectRequirements(id)
  const area = project.therapeutic_areas as { name: string } | null

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link href="/sponsor/projects" className="text-sm text-secondary hover:underline">
          ← Back to projects
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <Heading5>{project.title}</Heading5>
          <div className="mt-1 flex items-center gap-2">
            {area && <BodySmall className="text-secondary">{area.name}</BodySmall>}
            {project.phase && (
              <BodySmall className="text-secondary">Phase {project.phase}</BodySmall>
            )}
            {project.geographic_preference && (
              <BodySmall className="text-secondary">{project.geographic_preference}</BodySmall>
            )}
          </div>
        </div>
        <Badge className={statusColors[project.status] ?? ""}>{project.status}</Badge>
      </div>

      {project.description && (
        <BodySmall className="mb-6 text-secondary">{project.description}</BodySmall>
      )}

      <div className="mb-6 grid grid-cols-3 gap-4 rounded-2xl border border-primary p-4">
        <div>
          <Caption className="text-secondary">Patient Count</Caption>
          <BodySmall className="font-medium">
            {project.required_patient_count ?? "Not set"}
          </BodySmall>
        </div>
        <div>
          <Caption className="text-secondary">Start Date</Caption>
          <BodySmall className="font-medium">{project.start_date ?? "Not set"}</BodySmall>
        </div>
        <div>
          <Caption className="text-secondary">End Date</Caption>
          <BodySmall className="font-medium">{project.end_date ?? "Not set"}</BodySmall>
        </div>
      </div>

      <RequirementsSection projectId={id} requirements={requirements} />

      <div className="mt-8 flex gap-3">
        <RunMatchButton projectId={id} />
        {project.status === "matched" && (
          <Link href={`/sponsor/projects/${id}/matches`}>
            <Button variant="outline">View Match Results</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
