import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import {
  getProjectDetail,
  getProjectRequirements,
  getProjectInquiries,
} from "@/features/projects/queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heading5, Heading6, Body, BodySmall, Caption } from "@/components/ui/typography"
import Link from "next/link"
import RequirementsSection from "./components/RequirementsSection"
import RunMatchButton from "./components/RunMatchButton"
import ArchiveDeleteActions from "./components/ArchiveDeleteActions"

const statusColors: Record<string, string> = {
  draft: "bg-surface-level-2 text-secondary",
  active: "bg-surface-status-info text-icon-status-info",
  paused: "bg-surface-status-warning text-icon-status-warning",
  completed: "bg-surface-status-success text-icon-status-success",
  archived: "bg-surface-level-2 text-tertiary",
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
  const { data: inquiries } = await getProjectInquiries(id)
  const area = project.therapeutic_areas as { name: string } | null

  const inquiryStatusColors: Record<string, string> = {
    open: "bg-surface-status-warning text-icon-status-warning",
    in_progress: "bg-surface-status-info text-icon-status-info",
    closed: "bg-surface-level-2 text-tertiary",
    withdrawn: "bg-surface-level-2 text-tertiary",
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link href="/sponsor/projects" className="text-body-small text-secondary hover:underline">
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
            {project.target_enrollment ?? "Not set"}
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

      {/* Inquiry Status Section */}
      {inquiries.length > 0 && (
        <div className="mt-8">
          <Heading6 className="mb-3">Inquiry Status</Heading6>
          <div className="space-y-3">
            {inquiries.map((inq) => {
              const clinic = inq.clinic as { name: string; city: string } | null
              return (
                <div
                  key={inq.id}
                  className="flex items-start justify-between rounded-xl border border-primary p-3"
                >
                  <div>
                    <BodySmall className="font-medium">
                      {clinic?.name ?? "Unknown Clinic"}
                    </BodySmall>
                    <Caption className="text-secondary">
                      Sent {new Date(inq.created_at).toLocaleDateString()}
                    </Caption>
                  </div>
                  <Badge className={inquiryStatusColors[inq.status] ?? ""}>
                    {inq.status}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <RunMatchButton projectId={id} hasMatches={project.status === "active"} />
        {project.status === "active" && (
          <Link href={`/sponsor/projects/${id}/matches`}>
            <Button variant="outline">View Match Results</Button>
          </Link>
        )}
        <ArchiveDeleteActions projectId={id} status={project.status} />
      </div>
    </div>
  )
}
