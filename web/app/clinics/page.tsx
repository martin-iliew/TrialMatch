import { createServerClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"

export default async function ClinicsPage() {
  const supabase = await createServerClient()

  const { data: clinics } = await supabase
    .from("clinics")
    .select("id, name, city, description")
    .order("name")

  // Load specializations for all clinics
  const clinicIds = (clinics ?? []).map((c) => c.id)
  const { data: specs } = clinicIds.length > 0
    ? await supabase
        .from("clinic_specializations")
        .select("clinic_id, therapeutic_areas(name)")
        .in("clinic_id", clinicIds)
    : { data: [] }

  // Group specializations by clinic, limit to 3
  const specsByClinic = new Map<string, string[]>()
  for (const spec of specs ?? []) {
    const area = spec.therapeutic_areas as { name: string } | null
    if (!area) continue
    const existing = specsByClinic.get(spec.clinic_id) ?? []
    if (existing.length < 3) {
      existing.push(area.name)
      specsByClinic.set(spec.clinic_id, existing)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Browse Clinics</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Explore clinical trial sites across Bulgaria
      </p>

      {(!clinics || clinics.length === 0) ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium text-muted-foreground">
            No clinics registered yet
          </h3>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clinics.map((clinic) => {
            const areas = specsByClinic.get(clinic.id) ?? []
            return (
              <div
                key={clinic.id}
                className="rounded-lg border p-4"
              >
                <h3 className="font-semibold">{clinic.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{clinic.city}</p>
                {clinic.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {clinic.description}
                  </p>
                )}
                {areas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {areas.map((area) => (
                      <Badge key={area} className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
