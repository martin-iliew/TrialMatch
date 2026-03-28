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
  upsertAvailability,
} from "@/features/clinics/actions"

type Props = {
  clinic: Tables<"clinics"> | null
  equipment: Tables<"equipment">[]
  certifications: Tables<"certifications">[]
  availability: Tables<"clinic_availability"> | null
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
  phone: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
})

const equipmentSchema = z.object({
  equipment_type: z.string().min(1, "Type is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().min(1),
  is_available: z.boolean(),
})

const certSchema = z.object({
  certification_name: z.string().min(1, "Certification name is required"),
  issued_by: z.string().optional(),
  valid_until: z.string().optional(),
})

const availabilitySchema = z.object({
  available_from: z.string().min(1, "Start date is required"),
  available_to: z.string().min(1, "End date is required"),
  max_concurrent_trials: z.coerce.number().min(1, "Capacity must be at least 1"),
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
        phone: clinic?.contact_phone ?? "",
        website: clinic?.website ?? "",
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
          className="h-24 w-full resize-none rounded-xl border border-primary bg-surface-level-0 px-3 py-2 text-sm text-primary placeholder:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-level-5"
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
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+359 2 000 0000" {...register("phone")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="website">Website</Label>
        <Input id="website" placeholder="https://clinic.com" {...register("website")} />
        {errors.website && <Caption className="text-icon-status-danger">{errors.website.message}</Caption>}
      </div>

      {therapeuticAreas.length > 0 && (
        <div className="space-y-2">
          <Label>Specializations</Label>
          <div className="grid grid-cols-3 gap-2">
            {therapeuticAreas.map((area) => (
              <label key={area.id} className="flex cursor-pointer items-center gap-2 text-sm">
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

function EquipmentTab({
  equipment: initialEquipment,
  clinicId,
}: {
  equipment: Tables<"equipment">[]
  clinicId: string | undefined
}) {
  const [equipment, setEquipment] = useState(initialEquipment)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<z.infer<typeof equipmentSchema>>({
      resolver: zodResolver(equipmentSchema),
      defaultValues: { is_available: true, quantity: 1 },
    })

  async function onAdd(values: z.infer<typeof equipmentSchema>) {
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
                <Caption className="text-secondary">{eq.equipment_type} · qty {eq.quantity}</Caption>
              </div>
              <button
                onClick={() => handleDelete(eq.id)}
                className="text-xs text-icon-status-danger hover:underline"
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
            <Label htmlFor="equipment_type">Type</Label>
            <Input id="equipment_type" placeholder="Imaging" {...register("equipment_type")} />
            {errors.equipment_type && <Caption className="text-icon-status-danger">{errors.equipment_type.message}</Caption>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eq_name">Name</Label>
            <Input id="eq_name" placeholder="MRI Scanner" {...register("name")} />
            {errors.name && <Caption className="text-icon-status-danger">{errors.name.message}</Caption>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" min={1} {...register("quantity")} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="is_available" {...register("is_available")} />
            <Label htmlFor="is_available">Available</Label>
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
  availability,
  clinicId,
}: {
  certifications: Tables<"certifications">[]
  availability: Tables<"clinic_availability"> | null
  clinicId: string | undefined
}) {
  const [certifications, setCertifications] = useState(initialCerts)

  const certForm = useForm<z.infer<typeof certSchema>>({ resolver: zodResolver(certSchema) })
  const availForm = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      available_from: availability?.available_from ?? "",
      available_to: availability?.available_to ?? "",
      max_concurrent_trials: availability?.max_concurrent_trials ?? 1,
    },
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
      setCertifications((prev) => prev.filter((c) => c.id !== id))
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
                  className="text-xs text-icon-status-danger hover:underline"
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
        <BodySmall className="font-semibold text-primary">Availability window</BodySmall>
        <form onSubmit={availForm.handleSubmit(onSaveAvailability)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="available_from">Start date</Label>
              <Input id="available_from" type="date" {...availForm.register("available_from")} />
              {availForm.formState.errors.available_from && (
                <Caption className="text-icon-status-danger">{availForm.formState.errors.available_from.message}</Caption>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="available_to">End date</Label>
              <Input id="available_to" type="date" {...availForm.register("available_to")} />
              {availForm.formState.errors.available_to && (
                <Caption className="text-icon-status-danger">{availForm.formState.errors.available_to.message}</Caption>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="max_concurrent_trials">Patient capacity</Label>
            <Input id="max_concurrent_trials" type="number" min={1} placeholder="50" {...availForm.register("max_concurrent_trials")} />
            {availForm.formState.errors.max_concurrent_trials && (
              <Caption className="text-icon-status-danger">{availForm.formState.errors.max_concurrent_trials.message}</Caption>
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

function ProfileCompletion({
  clinic,
  equipment,
  certifications,
  availability,
  selectedSpecializations,
}: {
  clinic: Tables<"clinics"> | null
  equipment: Tables<"equipment">[]
  certifications: Tables<"certifications">[]
  availability: Tables<"clinic_availability"> | null
  selectedSpecializations: string[]
}) {
  const steps = [
    { label: "Basic info", done: Boolean(clinic?.name && clinic?.city && clinic?.contact_email) },
    { label: "Specializations", done: selectedSpecializations.length > 0 },
    { label: "Equipment", done: equipment.length > 0 },
    { label: "Certifications", done: certifications.length > 0 },
    { label: "Availability", done: Boolean(availability) },
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
          <span key={s.label} className="rounded-full bg-surface-status-warning px-2.5 py-0.5 text-xs text-icon-status-warning">
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
            onClick={() => setActiveTab(tab)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
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
