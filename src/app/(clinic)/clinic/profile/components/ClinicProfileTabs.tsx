"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Tables } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label, Heading5, BodySmall, Caption } from "@/components/ui/typography"
import {
  upsertClinic,
  upsertSpecializations,
  addEquipment,
  deleteEquipment,
  addCertification,
  deleteCertification,
  addAvailability,
  deleteAvailability,
} from "@/features/clinics/actions"

type Props = {
  clinic: Tables<"clinics"> | null
  equipment: Tables<"clinic_equipment">[]
  certifications: Tables<"certifications">[]
  availability: Tables<"clinic_availability">[]
  therapeuticAreas: Tables<"therapeutic_areas">[]
  selectedSpecializations: string[]
}

const tabs = ["Profile", "Equipment", "Certs & Availability"] as const
type Tab = typeof tabs[number]

const profileSchema = z.object({
  name: z.string().min(1, "Clinic name is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().optional(),
  contact_email: z.string().email("Enter a valid email"),
  contact_phone: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  patient_capacity: z.number().int().min(1).optional(),
})

const equipmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["imaging", "laboratory", "monitoring", "surgical", "rehabilitation", "diagnostic", "other"]),
  model: z.string().optional(),
  quantity: z.number().min(1),
})

const certSchema = z.object({
  certification_name: z.string().min(1, "Certification name is required"),
  issued_by: z.string().optional(),
  valid_until: z.string().optional(),
})

const availabilitySchema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  type: z.enum(["available", "busy", "tentative"]),
  slots_available: z.number().int().min(1).optional(),
  notes: z.string().optional(),
})

function ProfileTab({
  clinic,
  therapeuticAreas,
  selectedSpecializations,
}: {
  clinic: Tables<"clinics"> | null
  therapeuticAreas: Tables<"therapeutic_areas">[]
  selectedSpecializations: string[]
}) {
  const [checkedAreas, setCheckedAreas] = useState<Set<string>>(new Set(selectedSpecializations))
  const [savingSpecs, setSavingSpecs] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<z.infer<typeof profileSchema>>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        name: clinic?.name ?? "",
        city: clinic?.city ?? "",
        address: clinic?.address ?? "",
        description: clinic?.description ?? "",
        contact_email: clinic?.contact_email ?? "",
        contact_phone: clinic?.contact_phone ?? "",
        website: clinic?.website ?? "",
        patient_capacity: clinic?.patient_capacity ?? undefined,
      },
    })

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      await upsertClinic(values)
      toast.success("Profile saved")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Clinic name</Label>
        <Input id="name" placeholder="City Oncology Center" {...register("name")} />
        {errors.name && <Caption className="text-icon-status-danger">{errors.name.message}</Caption>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Sofia" {...register("city")} />
          {errors.city && <Caption className="text-icon-status-danger">{errors.city.message}</Caption>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Address</Label>
          <Input id="address" placeholder="123 Main St" {...register("address")} />
          {errors.address && <Caption className="text-icon-status-danger">{errors.address.message}</Caption>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className="h-24 w-full resize-none rounded-xl border border-primary bg-surface-level-0 px-3 py-2 text-body-small text-primary placeholder:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-level-5"
          placeholder="Brief overview of your clinic…"
          {...register("description")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="contact_email">Contact email</Label>
          <Input id="contact_email" type="email" placeholder="contact@clinic.com" {...register("contact_email")} />
          {errors.contact_email && <Caption className="text-icon-status-danger">{errors.contact_email.message}</Caption>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_phone">Phone</Label>
          <Input id="contact_phone" placeholder="+359 2 000 0000" {...register("contact_phone")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="website">Website</Label>
        <Input id="website" placeholder="https://clinic.com" {...register("website")} />
        {errors.website && <Caption className="text-icon-status-danger">{errors.website.message}</Caption>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="patient_capacity">Total patient capacity</Label>
        <Input
          id="patient_capacity"
          type="number"
          min={1}
          placeholder="e.g. 50"
          {...register("patient_capacity", { valueAsNumber: true })}
        />
        {errors.patient_capacity && (
          <Caption className="text-icon-status-danger">{errors.patient_capacity.message}</Caption>
        )}
      </div>

      {therapeuticAreas.length > 0 && (
        <div className="space-y-2">
          <Label>Specializations</Label>
          <div className="grid grid-cols-3 gap-2">
            {therapeuticAreas.map((area) => (
              <Label key={area.id} className="flex cursor-pointer items-center gap-2 text-body-small">
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
              </Label>
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
              {savingSpecs ? "Saving…" : "Update specializations"}
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

function EquipmentTab({
  equipment: initialEquipment,
  clinicId,
}: {
  equipment: Tables<"clinic_equipment">[]
  clinicId: string | undefined
}) {
  const [equipment, setEquipment] = useState(initialEquipment)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<z.infer<typeof equipmentSchema>>({
      resolver: zodResolver(equipmentSchema),
      defaultValues: { quantity: 1, category: "other" },
    })

  async function onAdd(values: z.infer<typeof equipmentSchema>) {
    if (!clinicId) { toast.error("Save your profile first"); return }
    const tempId = `temp-${Date.now()}`
    const optimisticItem = {
      id: tempId,
      clinic_id: clinicId,
      name: values.name,
      category: values.category,
      model: values.model ?? null,
      manufacturer: null,
      quantity: values.quantity,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Tables<"clinic_equipment">
    setEquipment((prev) => [...prev, optimisticItem])
    reset()
    try {
      const newItem = await addEquipment(clinicId, values)
      setEquipment((prev) => prev.map((e) => (e.id === tempId ? newItem : e)))
      toast.success("Equipment added")
    } catch (e) {
      setEquipment((prev) => prev.filter((e) => e.id !== tempId))
      toast.error(e instanceof Error ? e.message : "Failed to add")
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEquipment(id)
      setEquipment((prev) => prev.filter((e) => e.id !== id))
      toast.success("Equipment removed")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove")
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      {equipment.length === 0 ? (
        <BodySmall className="text-secondary">No equipment added yet.</BodySmall>
      ) : (
        <ul className="space-y-2">
          {equipment.map((eq) => (
            <li key={eq.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
              <div>
                <BodySmall className="font-medium text-primary">{eq.name}</BodySmall>
                <Caption className="text-secondary">{eq.category} · qty {eq.quantity}</Caption>
              </div>
              <button
                onClick={() => handleDelete(eq.id)}
                className="text-caption text-icon-status-danger hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit(onAdd)} className="space-y-3 rounded-2xl border border-primary p-4">
        <BodySmall className="font-medium text-primary">Add equipment</BodySmall>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="eq_name">Name</Label>
            <Input id="eq_name" placeholder="MRI Scanner" {...register("name")} />
            {errors.name && <Caption className="text-icon-status-danger">{errors.name.message}</Caption>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="h-10 w-full rounded-xl border border-primary bg-surface-level-0 px-3 text-body-small text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-level-5"
              {...register("category")}
            >
              {["imaging","laboratory","monitoring","surgical","rehabilitation","diagnostic","other"].map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="model">Type</Label>
            <Input id="model" placeholder="e.g. MRI" {...register("model")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" min={1} {...register("quantity", { valueAsNumber: true })} />
          </div>
        </div>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add equipment"}
        </Button>
      </form>
    </div>
  )
}

function CertsAvailabilityTab({
  certifications: initialCerts,
  availability: initialAvailability,
  clinicId,
}: {
  certifications: Tables<"certifications">[]
  availability: Tables<"clinic_availability">[]
  clinicId: string | undefined
}) {
  const [certifications, setCertifications] = useState(initialCerts)
  const [availability, setAvailability] = useState(initialAvailability)

  const certForm = useForm<z.infer<typeof certSchema>>({ resolver: zodResolver(certSchema) })
  const availForm = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { type: "available" },
  })

  async function onAddCert(values: z.infer<typeof certSchema>) {
    if (!clinicId) { toast.error("Save your profile first"); return }
    const tempId = `temp-${Date.now()}`
    const optimisticItem = {
      id: tempId,
      clinic_id: clinicId,
      certification_name: values.certification_name,
      issued_by: values.issued_by ?? null,
      valid_until: values.valid_until ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Tables<"certifications">
    setCertifications((prev) => [...prev, optimisticItem])
    certForm.reset()
    try {
      const newItem = await addCertification(clinicId, values)
      setCertifications((prev) => prev.map((c) => (c.id === tempId ? newItem : c)))
      toast.success("Certification added")
    } catch (e) {
      setCertifications((prev) => prev.filter((c) => c.id !== tempId))
      toast.error(e instanceof Error ? e.message : "Failed to add")
    }
  }

  async function handleDeleteCert(id: string) {
    try {
      await deleteCertification(id)
      setCertifications((prev) => prev.filter((c) => c.id !== id))
      toast.success("Certification removed")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove")
    }
  }

  async function onAddAvailability(values: z.infer<typeof availabilitySchema>) {
    if (!clinicId) { toast.error("Save your profile first"); return }
    const tempId = `temp-${Date.now()}`
    const optimisticItem = {
      id: tempId,
      clinic_id: clinicId,
      start_date: values.start_date,
      end_date: values.end_date,
      type: values.type,
      slots_available: values.slots_available ?? null,
      notes: values.notes ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Tables<"clinic_availability">
    setAvailability((prev) => [...prev, optimisticItem])
    availForm.reset()
    try {
      const newItem = await addAvailability(clinicId, values)
      setAvailability((prev) => prev.map((a) => (a.id === tempId ? newItem : a)))
      toast.success("Availability window added")
    } catch (e) {
      setAvailability((prev) => prev.filter((a) => a.id !== tempId))
      toast.error(e instanceof Error ? e.message : "Failed to save")
    }
  }

  async function handleDeleteAvailability(id: string) {
    try {
      await deleteAvailability(id)
      setAvailability((prev) => prev.filter((a) => a.id !== id))
      toast.success("Availability window removed")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove")
    }
  }

  return (
    <div className="max-w-xl space-y-8">
      <div className="space-y-4">
        <BodySmall className="font-semibold text-primary">Certifications</BodySmall>
        {certifications.length === 0 ? (
          <Caption className="text-secondary">No certifications added yet.</Caption>
        ) : (
          <ul className="space-y-2">
            {certifications.map((cert) => (
              <li key={cert.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
                <div>
                  <BodySmall className="font-medium text-primary">{cert.certification_name}</BodySmall>
                  {cert.issued_by && <Caption className="text-secondary">Issued by {cert.issued_by}</Caption>}
                </div>
                <button
                  onClick={() => handleDeleteCert(cert.id)}
                  className="text-caption text-icon-status-danger hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={certForm.handleSubmit(onAddCert)} className="space-y-3 rounded-2xl border border-primary p-4">
          <BodySmall className="font-medium text-primary">Add certification</BodySmall>
          <div className="space-y-1.5">
            <Label htmlFor="certification_name">Name</Label>
            <Input id="certification_name" placeholder="GCP Certificate" {...certForm.register("certification_name")} />
            {certForm.formState.errors.certification_name && (
              <Caption className="text-icon-status-danger">{certForm.formState.errors.certification_name.message}</Caption>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="issued_by">Issued by</Label>
              <Input id="issued_by" placeholder="ICH" {...certForm.register("issued_by")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valid_until">Expires</Label>
              <Input id="valid_until" type="date" {...certForm.register("valid_until")} />
            </div>
          </div>
          <Button type="submit" size="sm" disabled={certForm.formState.isSubmitting}>
            {certForm.formState.isSubmitting ? "Adding…" : "Add certification"}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <BodySmall className="font-semibold text-primary">Availability windows</BodySmall>
        {availability.length === 0 ? (
          <Caption className="text-secondary">No availability windows added yet.</Caption>
        ) : (
          <ul className="space-y-2">
            {availability.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
                <div>
                  <BodySmall className="font-medium text-primary">{a.start_date} → {a.end_date}</BodySmall>
                  <Caption className="text-secondary capitalize">
                    {a.type}
                    {a.slots_available != null
                      ? ` · ${a.slots_available} patient slots`
                      : " · slots not specified"}
                    {a.notes ? ` · ${a.notes}` : ""}
                  </Caption>
                </div>
                <button
                  onClick={() => handleDeleteAvailability(a.id)}
                  className="text-caption text-icon-status-danger hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={availForm.handleSubmit(onAddAvailability)} className="space-y-3 rounded-2xl border border-primary p-4">
          <BodySmall className="font-medium text-primary">Add availability window</BodySmall>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start_date">From</Label>
              <Input id="start_date" type="date" {...availForm.register("start_date")} />
              {availForm.formState.errors.start_date && (
                <Caption className="text-icon-status-danger">{availForm.formState.errors.start_date.message}</Caption>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_date">Until</Label>
              <Input id="end_date" type="date" {...availForm.register("end_date")} />
              {availForm.formState.errors.end_date && (
                <Caption className="text-icon-status-danger">{availForm.formState.errors.end_date.message}</Caption>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avail_type">Status</Label>
            <select
              id="avail_type"
              className="h-10 w-full rounded-xl border border-primary bg-surface-level-0 px-3 text-body-small text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-level-5"
              {...availForm.register("type")}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="tentative">Tentative</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avail_notes">Notes</Label>
            <Input id="avail_notes" placeholder="Optional" {...availForm.register("notes")} />
          </div>
          <Button type="submit" size="sm" disabled={availForm.formState.isSubmitting}>
            {availForm.formState.isSubmitting ? "Saving…" : "Add window"}
          </Button>
        </form>
      </div>
    </div>
  )
}

function ProfileCompletion({
  clinic,
  equipment,
  certifications,
  availability,
  selectedSpecializations,
}: {
  clinic: Tables<"clinics"> | null
  equipment: Tables<"clinic_equipment">[]
  certifications: Tables<"certifications">[]
  availability: Tables<"clinic_availability">[]
  selectedSpecializations: string[]
}) {
  const steps = [
    { label: "Basic info", done: Boolean(clinic?.name && clinic?.city && clinic?.contact_email) },
    { label: "Specializations", done: selectedSpecializations.length > 0 },
    { label: "Equipment", done: equipment.length > 0 },
    { label: "Certifications", done: certifications.length > 0 },
    { label: "Availability", done: availability.length > 0 },
  ]
  const completed = steps.filter((s) => s.done).length
  const pct = Math.round((completed / steps.length) * 100)

  if (pct === 100) return null

  return (
    <div className="mb-6 rounded-2xl border border-primary p-4">
      <div className="mb-2 flex items-center justify-between">
        <BodySmall className="font-medium">Profile completion</BodySmall>
        <Caption className="text-secondary">{completed}/{steps.length} steps</Caption>
      </div>
      <div className="mb-3 h-2 rounded-full bg-surface-level-3">
        <div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {steps.filter((s) => !s.done).map((s) => (
          <span key={s.label} className="rounded-full bg-surface-status-warning px-2.5 py-0.5 text-caption text-icon-status-warning">
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ClinicProfileTabs({
  clinic, equipment, certifications, availability, therapeuticAreas, selectedSpecializations,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Profile")

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Heading5 className="mb-6">Clinic Profile</Heading5>
      <ProfileCompletion
        clinic={clinic} equipment={equipment} certifications={certifications}
        availability={availability} selectedSpecializations={selectedSpecializations}
      />
      <div className="mb-8 flex gap-1 border-b border-primary">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-body-small font-medium transition-colors",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-secondary hover:text-primary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === "Profile" && (
        <ProfileTab clinic={clinic} therapeuticAreas={therapeuticAreas} selectedSpecializations={selectedSpecializations} />
      )}
      {activeTab === "Equipment" && (
        <EquipmentTab equipment={equipment} clinicId={clinic?.id} />
      )}
      {activeTab === "Certs & Availability" && (
        <CertsAvailabilityTab certifications={certifications} availability={availability} clinicId={clinic?.id} />
      )}
    </div>
  )
}
