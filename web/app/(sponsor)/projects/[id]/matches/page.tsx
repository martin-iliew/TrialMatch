import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getProjectDetail, getMatchResults, getMatchResultInquiries } from "@/features/trial-project/queries"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import MatchResultCard from "./MatchResultCard"

export default async function MatchResultsPage({
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

  const { data: results } = await getMatchResults(id)

  // Load existing inquiries for these match results
  const matchResultIds = results.map((r) => r.id)
  const { data: inquiries } = await getMatchResultInquiries(matchResultIds)
  const inquiryByMatch = new Map(
    (inquiries ?? []).map((inq) => [inq.match_result_id, inq])
  )

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/sponsor/projects/${id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to project
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold">Match Results</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {project.title} — {results.length} matching clinic{results.length !== 1 ? "s" : ""} found
      </p>

      {results.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium text-muted-foreground">
            No clinics meet your required criteria
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your requirements to broaden the search.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, index) => {
            const inquiry = inquiryByMatch.get(result.id)
            const clinic = result.clinics as { name: string; city: string; contact_email: string } | null
            return (
              <MatchResultCard
                key={result.id}
                rank={index + 1}
                matchResult={result}
                clinicName={clinic?.name ?? "Unknown"}
                clinicCity={clinic?.city ?? ""}
                inquiry={inquiry ?? null}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
