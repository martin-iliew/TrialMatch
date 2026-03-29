import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getClinicForUser, getInquiriesForClinic } from "@/features/inquiries/queries"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heading5, Body, BodySmall, Caption } from "@/components/ui/typography"

const statusColors: Record<string, string> = {
  open: "bg-surface-status-warning text-icon-status-warning",
  in_progress: "bg-surface-status-info text-icon-status-info",
  closed: "bg-surface-level-2 text-tertiary",
  withdrawn: "bg-surface-level-2 text-tertiary",
}

export default async function InquiriesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: clinic } = await getClinicForUser(user.id)
  if (!clinic) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Heading5 className="mb-4">Inquiries</Heading5>
        <div className="rounded-2xl border border-dashed border-primary p-12 text-center">
          <Body className="text-secondary">Complete your clinic profile first</Body>
          <BodySmall className="mt-1 text-tertiary">
            You need to set up your clinic profile before you can receive inquiries.
          </BodySmall>
          <div className="mt-4">
            <Link href="/clinic/profile"><Button>Set Up Profile</Button></Link>
          </div>
        </div>
      </div>
    )
  }

  const { data: inquiries } = await getInquiriesForClinic(clinic.id)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Heading5 className="mb-6">Partnership Inquiries</Heading5>
      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary p-12 text-center">
          <Body className="text-secondary">No inquiries yet</Body>
          <BodySmall className="mt-1 text-tertiary">
            When sponsors find your clinic through matching, their inquiries will appear here.
          </BodySmall>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const trial = (inquiry.match_result as Record<string, unknown>)?.trial_projects as {
              title: string
              phase: string | null
              target_enrollment: number | null
              therapeutic_areas: { name: string } | null
            } | null
            const sponsor = inquiry.sponsor as { first_name: string; last_name: string } | null
            return (
              <Link
                key={inquiry.id}
                href={`/clinic/inquiries/${inquiry.id}`}
                className="block rounded-2xl border border-primary p-4 transition-colors hover:bg-subtle"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Body className="font-semibold">{trial?.title ?? "Trial Project"}</Body>
                    <div className="mt-1 flex items-center gap-2">
                      {sponsor && (
                        <BodySmall className="text-secondary">From {sponsor.first_name} {sponsor.last_name}</BodySmall>
                      )}
                      {trial?.therapeutic_areas && (
                        <BodySmall className="text-secondary">{trial.therapeutic_areas.name}</BodySmall>
                      )}
                      {trial?.phase && <BodySmall className="text-secondary">Phase {trial.phase}</BodySmall>}
                    </div>
                    <BodySmall className="mt-2 line-clamp-2 text-secondary">{inquiry.subject}</BodySmall>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={statusColors[inquiry.status] ?? ""}>{inquiry.status}</Badge>
                    <Caption className="text-tertiary">{new Date(inquiry.created_at).toLocaleDateString()}</Caption>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
