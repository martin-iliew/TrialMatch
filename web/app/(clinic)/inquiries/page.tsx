import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getClinicForUser, getInquiriesForClinic } from "@/features/inquiries/queries"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
}

export default async function InquiriesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: clinic } = await getClinicForUser(user.id)
  if (!clinic) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">Inquiries</h1>
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium text-muted-foreground">
            Complete your clinic profile first
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You need to set up your clinic profile before you can receive inquiries.
          </p>
          <Link
            href="/clinic/profile"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Set Up Profile
          </Link>
        </div>
      </div>
    )
  }

  const { data: inquiries } = await getInquiriesForClinic(clinic.id)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Partnership Inquiries</h1>

      {inquiries.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium text-muted-foreground">
            No inquiries yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            When sponsors find your clinic through matching, their inquiries will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const trial = (inquiry.match_result as Record<string, unknown>)?.trial_projects as {
              title: string
              phase: string | null
              patient_count: number | null
              therapeutic_areas: { name: string } | null
            } | null
            const sponsor = inquiry.sponsor as { first_name: string; last_name: string } | null

            return (
              <Link
                key={inquiry.id}
                href={`/clinic/inquiries/${inquiry.id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {trial?.title ?? "Trial Project"}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      {sponsor && (
                        <span>
                          From {sponsor.first_name} {sponsor.last_name}
                        </span>
                      )}
                      {trial?.therapeutic_areas && (
                        <span>{trial.therapeutic_areas.name}</span>
                      )}
                      {trial?.phase && <span>Phase {trial.phase}</span>}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {inquiry.message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={statusColors[inquiry.status] ?? ""}>
                      {inquiry.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </span>
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
