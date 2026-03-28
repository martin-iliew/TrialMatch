import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getProjectDetail, getProjectRequirements } from "@/features/trial-project/queries"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import RequirementsSection from "./RequirementsSection"
import RunMatchButton from "./RunMatchButton"

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  searching: "bg-blue-100 text-blue-800",
  matched: "bg-green-100 text-green-800",
  closed: "bg-neutral-100 text-neutral-500",
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: project } = await getProjectDetail(id, user.id)
  if (!project) notFound()

  const { data: requirements } = await getProjectRequirements(id)

  const area = project.therapeutic_areas as { name: string } | null

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/sponsor/projects"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to projects
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {area && <span>{area.name}</span>}
            {project.phase && <span>Phase {project.phase}</span>}
            {project.geographic_preference && (
              <span>{project.geographic_preference}</span>
            )}
          </div>
        </div>
        <Badge className={statusColors[project.status] ?? ""}>
          {project.status}
        </Badge>
      </div>

      {project.description && (
        <p className="mb-6 text-sm text-muted-foreground">{project.description}</p>
      )}

      <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg border p-4 text-sm">
        <div>
          <span className="text-muted-foreground">Patient Count</span>
          <p className="font-medium">{project.patient_count ?? "Not set"}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Start Date</span>
          <p className="font-medium">{project.start_date ?? "Not set"}</p>
        </div>
        <div>
          <span className="text-muted-foreground">End Date</span>
          <p className="font-medium">{project.end_date ?? "Not set"}</p>
        </div>
      </div>

      <RequirementsSection
        projectId={id}
        requirements={requirements}
      />

      <div className="mt-8 flex gap-3">
        <RunMatchButton projectId={id} />
        {project.status === "matched" && (
          <Link
            href={`/sponsor/projects/${id}/matches`}
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            View Match Results
          </Link>
        )}
      </div>
    </div>
  )
}
