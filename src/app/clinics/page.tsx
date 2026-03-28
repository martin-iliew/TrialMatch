import { getClinics } from "@/features/clinics/queries"
import Navbar from "@/components/layout/Navbar"
import { Badge } from "@/components/ui/badge"
import { Heading5, Body, BodySmall, Caption } from "@/components/ui/typography"
import { MapPin } from "lucide-react"

export const metadata = {
  title: "Browse Clinics — TrialMatch",
  description: "Explore registered research sites across Bulgaria and Europe.",
}

export default async function ClinicsPage() {
  const { data: clinics } = await getClinics()

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <Heading5 className="mb-2">Registered Clinics</Heading5>
          <BodySmall className="text-secondary">
            Browse the TrialMatch network — {clinics.length} research sites and growing.
          </BodySmall>
        </div>

        {clinics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary p-12 text-center">
            <Body className="text-secondary">No clinics registered yet</Body>
            <BodySmall className="mt-1 text-tertiary">
              Check back soon as the network grows.
            </BodySmall>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                className="rounded-2xl border border-primary bg-surface-level-1 p-5 transition-colors"
              >
                <div className="mb-3">
                  <BodySmall className="font-semibold text-primary">{clinic.name}</BodySmall>
                  <div className="mt-1 flex items-center gap-1">
                    <MapPin className="size-3.5 text-icon-secondary" />
                    <Caption className="text-secondary">
                      {clinic.city}
                      {clinic.country ? `, ${clinic.country}` : ""}
                    </Caption>
                  </div>
                </div>

                {clinic.description && (
                  <Caption className="mb-3 line-clamp-2 text-tertiary">
                    {clinic.description}
                  </Caption>
                )}

                {clinic.therapeutic_area_names.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {clinic.therapeutic_area_names.slice(0, 3).map((name) => (
                      <Badge key={name}>{name}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
