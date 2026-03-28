import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import {
  getProjectDetail,
  getMatchResults,
  getMatchResultInquiries,
} from "@/features/projects/queries"
import { Heading5, Body, BodySmall } from "@/components/ui/typography"
import Link from "next/link"
import MatchResultCard from "./components/MatchResultCard"

export default async function MatchResultsPage({
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

  const { data: results } = await getMatchResults(id)

  const matchResultIds = results.map((r) => r.id)
  const { data: inquiries } = await getMatchResultInquiries(matchResultIds)
  const inquiryByMatch = new Map(
    (inquiries ?? []).map((inq) => [inq.match_result_id, inq]),
  )

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/sponsor/projects/${id}`}
          className="text-sm text-secondary hover:underline"
        >
          ← Back to project
        </Link>
      </div>

      <Heading5 className="mb-2">Match Results</Heading5>
      <BodySmall className="mb-6 text-secondary">
        {project.title} — {results.length} matching clinic
        {results.length !== 1 ? "s" : ""} found
      </BodySmall>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary p-12 text-center">
          <Body className="text-secondary">No clinics meet your required criteria</Body>
          <BodySmall className="mt-1 text-tertiary">
            Try adjusting your requirements to broaden the search.
          </BodySmall>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, index) => {
            const inquiry = inquiryByMatch.get(result.id)
            const clinic = result.clinics as {
              name: string
              city: string
              contact_email: string
            } | null
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
