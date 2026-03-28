import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProjectsForSponsor } from "@/features/trial-project/queries"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  searching: "bg-blue-100 text-blue-800",
  matched: "bg-green-100 text-green-800",
  closed: "bg-neutral-100 text-neutral-500",
}

export default async function ProjectsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: projects } = await getProjectsForSponsor(user.id)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trial Projects</h1>
        <Link
          href="/sponsor/projects/new"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Trial Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium text-muted-foreground">No projects yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first trial project to start matching with clinics.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const area = project.therapeutic_areas as { name: string } | null
            return (
              <Link
                key={project.id}
                href={`/sponsor/projects/${project.id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
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
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
