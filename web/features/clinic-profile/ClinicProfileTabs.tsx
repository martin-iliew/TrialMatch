"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { cn } from "@/lib/cn"
import type { Tables } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/typography"
import {
  upsertClinic,
  upsertSpecializations,
  addEquipment,
  deleteEquipment,
  addCertification,
  deleteCertification,
  upsertAvailability,
} from "./actions"

type Props = {
  clinic: Tables<"clinics"> | null
  equipment: Tables<"equipment">[]
  certifications: Tables<"certifications">[]
  availability: Tables<"clinic_availability"> | null
  therapeuticAreas?: Tables<"therapeutic_areas">[]
  selectedSpecializations?: string[]
}

const tabs = ["Profile", "Equipment", "Certs & Availability"] as const
type Tab = typeof tabs[number]

// --- Zod schemas ---

const profileSchema = z.object({
  name: z.string().min(1, "Clinic name is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().optional(),
  contact_email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
})

const equipmentSchema = z.object({
  type: z.string().min(1, "Type is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().min(1),
  available: z.boolean(),
})

const certSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  issued_by: z.string().optional(),
  expires_at: z.string().optional(),
})

const availabilitySchema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
})

// --- Tab: Profile ---

function ProfileTab({
  clinic,
  therapeuticAreas,
  selectedSpecializations,
}: {
  clinic: Tables<"clinics"> | null
  therapeuticAreas: Tables<"therapeutic_areas">[]
  selectedSpecializations: string[]
}) {
  const [checkedAreas, setCheckedAreas] = useState<Set<string>>(
    new Set(selectedSpecializations)
  )
  const [savingSpecs, setSavingSpecs] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: {
      name: clinic?.name ?? "",
      city: clinic?.city ?? "",
      address: clinic?.address ?? "",
      description: clinic?.description ?? "",
      contact_email: clinic?.contact_email ?? "",
      phone: clinic?.phone ?? "",
      website: clinic?.website ?? "",
    } })

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      await upsertClinic(values)
      toast.success("Profile saved")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <div className="space-y-1.5">
        <Label as="label">Clinic name</Label>
        <Input placeholder="City Oncology Center" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label as="label">City</Label>
          <Input placeholder="Sofia" {...register("city")} />
          {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label as="label">Address</Label>
          <Input placeholder="123 Main St" {...register("address")} />
          {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label as="label">Description</Label>
        <textarea
          className="h-24 w-full rounded-xl border border-primary bg-surface-level-0 px-3 py-2 text-sm text-primary placeholder:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-level-5 resize-none"
          placeholder="Brief overview of your clinic…"
          {...register("description")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label as="label">Contact email</Label>
          <Input type="email" placeholder="contact@clinic.com" {...register("contact_email")} />
          {errors.contact_email && <p className="text-sm text-red-500">{errors.contact_email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label as="label">Phone</Label>
          <Input placeholder="+359 2 000 0000" {...register("phone")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label as="label">Website</Label>
        <Input placeholder="https://clinic.com" {...register("website")} />
        {errors.website && <p className="text-sm text-red-500">{errors.website.message}</p>}
      </div>

      {therapeuticAreas.length > 0 && (
        <div className="space-y-2">
          <Label as="label">Specializations</Label>
          <div className="grid grid-cols-3 gap-2">
            {therapeuticAreas.map((area) => (
              <label key={area.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkedAreas.has(area.id)}
                  onChange={(e) => {
                    const next = new Set(checkedAreas)
                    if (e.target.checked) next.add(area.id)
                    else next.delete(area.id)
                    setCheckedAreas(next)
                  }}
                  className="rounded"
                />
                {area.name}
              </label>
            ))}
          </div>
          {clinic?.id && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={savingSpecs}
              onClick={async () => {
                setSavingSpecs(true)
                try {
                  await upsertSpecializations(clinic.id, [...checkedAreas])
                  toast.success("Specializations saved")
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed to save specializations")
                }
                setSavingSpecs(false)
              }}
            >
              {savingSpecs ? "Saving…" : "Save specializations"}
            </Button>
          )}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save profile"}
      </Button>
    </form>
  )
}

// --- Tab: Equipment ---

function EquipmentTab({
  equipment,
  clinicId,
}: {
  equipment: Tables<"equipment">[]
  clinicId: string | undefined
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(equipmentSchema), defaultValues: { available: true, quantity: 1 } })

  async function onSubmit(values: z.infer<typeof equipmentSchema>) {
    if (!clinicId) { toast.error("Save your profile first"); return }
    try {
      await addEquipment(clinicId, values)
      toast.success("Equipment added")
      reset()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add")
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEquipment(id)
      toast.success("Equipment removed")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove")
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      {equipment.length === 0 ? (
        <p className="text-sm text-secondary">No equipment added yet.</p>
      ) : (
        <ul className="space-y-2">
          {equipment.map((eq) => (
            <li key={eq.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
              <div>
                <p className="text-sm font-medium text-primary">{eq.name}</p>
                <p className="text-xs text-secondary">{eq.type} · qty {eq.quantity} · {eq.available ? "Available" : "Unavailable"}</p>
              </div>
              <button
                onClick={() => handleDelete(eq.id)}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-2xl border border-primary p-4">
        <p className="text-sm font-medium text-primary">Add equipment</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label as="label">Type</Label>
            <Input placeholder="MRI" {...register("type")} />
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label as="label">Name</Label>
            <Input placeholder="Siemens Magnetom" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label as="label">Quantity</Label>
            <Input type="number" min={1} {...register("quantity")} />
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
              <input type="checkbox" {...register("available")} className="rounded" />
              Available
            </label>
          </div>
        </div>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add equipment"}
        </Button>
      </form>
    </div>
  )
}

// --- Tab: Certs & Availability ---

function CertsAvailabilityTab({
  certifications,
  availability,
  clinicId,
}: {
  certifications: Tables<"certifications">[]
  availability: Tables<"clinic_availability"> | null
  clinicId: string | undefined
}) {
  const certForm = useForm({ resolver: zodResolver(certSchema) })
  const availForm = useForm({
    resolver: zodResolver(availabilitySchema),
    defaultValues: availability ?? {},
  })

  async function onAddCert(values: z.infer<typeof certSchema>) {
    if (!clinicId) { toast.error("Save your profile first"); return }
    try {
      await addCertification(clinicId, values)
      toast.success("Certification added")
      certForm.reset()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add")
    }
  }

  async function handleDeleteCert(id: string) {
    try {
      await deleteCertification(id)
      toast.success("Certification removed")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove")
    }
  }

  async function onSaveAvailability(values: z.infer<typeof availabilitySchema>) {
    if (!clinicId) { toast.error("Save your profile first"); return }
    try {
      await upsertAvailability(clinicId, values)
      toast.success("Availability saved")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
    }
  }

  return (
    <div className="space-y-8 max-w-xl">
      {/* Certifications */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-primary">Certifications</p>
        {certifications.length === 0 ? (
          <p className="text-sm text-secondary">No certifications added yet.</p>
        ) : (
          <ul className="space-y-2">
            {certifications.map((cert) => (
              <li key={cert.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-primary">{cert.name}</p>
                  {cert.issued_by && <p className="text-xs text-secondary">Issued by {cert.issued_by}</p>}
                </div>
                <button
                  onClick={() => handleDeleteCert(cert.id)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={certForm.handleSubmit(onAddCert)} className="space-y-3 rounded-2xl border border-primary p-4">
          <p className="text-sm font-medium text-primary">Add certification</p>
          <div className="space-y-1.5">
            <Label as="label">Name</Label>
            <Input placeholder="GCP Certificate" {...certForm.register("name")} />
            {certForm.formState.errors.name && (
              <p className="text-sm text-red-500">{certForm.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label as="label">Issued by</Label>
              <Input placeholder="ICH" {...certForm.register("issued_by")} />
            </div>
            <div className="space-y-1.5">
              <Label as="label">Expires</Label>
              <Input type="date" {...certForm.register("expires_at")} />
            </div>
          </div>
          <Button type="submit" size="sm" disabled={certForm.formState.isSubmitting}>
            {certForm.formState.isSubmitting ? "Adding…" : "Add certification"}
          </Button>
        </form>
      </div>

      {/* Availability */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-primary">Availability window</p>
        <form onSubmit={availForm.handleSubmit(onSaveAvailability)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label as="label">Start date</Label>
              <Input type="date" {...availForm.register("start_date")} />
              {availForm.formState.errors.start_date && (
                <p className="text-sm text-red-500">{availForm.formState.errors.start_date.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label as="label">End date</Label>
              <Input type="date" {...availForm.register("end_date")} />
              {availForm.formState.errors.end_date && (
                <p className="text-sm text-red-500">{availForm.formState.errors.end_date.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label as="label">Patient capacity</Label>
            <Input type="number" min={1} placeholder="50" {...availForm.register("capacity")} />
            {availForm.formState.errors.capacity && (
              <p className="text-sm text-red-500">{availForm.formState.errors.capacity.message}</p>
            )}
          </div>
          <Button type="submit" disabled={availForm.formState.isSubmitting}>
            {availForm.formState.isSubmitting ? "Saving…" : "Save availability"}
          </Button>
        </form>
      </div>
    </div>
  )
}

// --- Main component ---

export default function ClinicProfileTabs({ clinic, equipment, certifications, availability, therapeuticAreas = [], selectedSpecializations = [] }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Profile")

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-display text-primary text-2xl font-semibold mb-6">Clinic Profile</h1>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-primary mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-secondary hover:text-primary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Profile" && (
        <ProfileTab
          clinic={clinic}
          therapeuticAreas={therapeuticAreas}
          selectedSpecializations={selectedSpecializations}
        />
      )}
      {activeTab === "Equipment" && (
        <EquipmentTab equipment={equipment} clinicId={clinic?.id} />
      )}
      {activeTab === "Certs & Availability" && (
        <CertsAvailabilityTab
          certifications={certifications}
          availability={availability}
          clinicId={clinic?.id}
        />
      )}
    </div>
  )
}
