import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getClinicForUser, getInquiryDetail } from "@/features/inquiries/queries"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import InquiryResponseForm from "./InquiryResponseForm"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: clinic } = await getClinicForUser(user.id)
  if (!clinic) redirect("/clinic/profile")

  const { data: inquiry } = await getInquiryDetail(id, clinic.id)
  if (!inquiry) notFound()

  const trial = (inquiry.match_result as Record<string, unknown>)?.trial_projects as {
    title: string
    description: string | null
    phase: string | null
    patient_count: number | null
    start_date: string | null
    end_date: string | null
    geographic_preference: string | null
    therapeutic_areas: { name: string } | null
  } | null

  const sponsor = inquiry.sponsor as { first_name: string; last_name: string } | null
  const matchScore = (inquiry.match_result as Record<string, unknown>)?.score as number | undefined

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/clinic/inquiries"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to inquiries
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{trial?.title ?? "Trial Inquiry"}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {sponsor && (
              <span>
                From {sponsor.first_name} {sponsor.last_name}
              </span>
            )}
            <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <Badge className={statusColors[inquiry.status] ?? ""}>
          {inquiry.status}
        </Badge>
      </div>

      {/* Trial details */}
      {trial && (
        <div className="mb-6 rounded-lg border p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
            Trial Details
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {trial.therapeutic_areas && (
              <div>
                <span className="text-muted-foreground">Therapeutic Area</span>
                <p className="font-medium">{trial.therapeutic_areas.name}</p>
              </div>
            )}
            {trial.phase && (
              <div>
                <span className="text-muted-foreground">Phase</span>
                <p className="font-medium">Phase {trial.phase}</p>
              </div>
            )}
            {trial.patient_count && (
              <div>
                <span className="text-muted-foreground">Patient Count</span>
                <p className="font-medium">{trial.patient_count}</p>
              </div>
            )}
            {trial.geographic_preference && (
              <div>
                <span className="text-muted-foreground">Geographic Preference</span>
                <p className="font-medium">{trial.geographic_preference}</p>
              </div>
            )}
            {trial.start_date && (
              <div>
                <span className="text-muted-foreground">Timeline</span>
                <p className="font-medium">
                  {trial.start_date} — {trial.end_date ?? "TBD"}
                </p>
              </div>
            )}
            {matchScore !== undefined && (
              <div>
                <span className="text-muted-foreground">Match Score</span>
                <p className="font-medium">{matchScore}/100</p>
              </div>
            )}
          </div>
          {trial.description && (
            <p className="mt-3 text-sm text-muted-foreground">{trial.description}</p>
          )}
        </div>
      )}

      {/* Sponsor message */}
      <div className="mb-6 rounded-lg border p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
          Message from Sponsor
        </h2>
        <p className="text-sm">{inquiry.message}</p>
      </div>

      {/* Response section */}
      {inquiry.status === "pending" ? (
        <InquiryResponseForm inquiryId={inquiry.id} />
      ) : (
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
            Your Response
          </h2>
          <Badge className={statusColors[inquiry.status] ?? ""}>
            {inquiry.status}
          </Badge>
          {inquiry.response_message && (
            <p className="mt-2 text-sm">{inquiry.response_message}</p>
          )}
          {inquiry.decline_reason && (
            <p className="mt-2 text-sm text-destructive">
              Reason: {inquiry.decline_reason}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
