"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const upsertClinicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().optional(),
  contact_email: z.string().email("Invalid email address"),
  contact_phone: z.string().optional(),
  website: z.string().optional(),
})

const addEquipmentSchema = z.object({
  clinicId: z.string().min(1),
  data: z.object({
    name: z.string().min(1, "Name is required"),
    category: z.enum(["imaging", "laboratory", "monitoring", "surgical", "rehabilitation", "diagnostic", "other"]),
    model: z.string().optional(),
    manufacturer: z.string().optional(),
    quantity: z.number().positive("Quantity must be positive"),
  }),
})

const addCertificationSchema = z.object({
  clinicId: z.string().min(1),
  data: z.object({
    certification_name: z.string().min(1, "Certification name is required"),
    issued_by: z.string().optional(),
    valid_until: z.string().optional(),
  }),
})

const upsertAvailabilitySchema = z.object({
  clinicId: z.string().min(1),
  data: z.object({
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    type: z.enum(["available", "busy", "tentative"]).default("available"),
    notes: z.string().optional(),
  }),
})

const deleteIdSchema = z.string().min(1, "ID is required")

export async function upsertClinic(data: {
  name: string
  city: string
  address: string
  description?: string
  contact_email: string
  contact_phone?: string
  website?: string
}) {
  const result = upsertClinicSchema.safeParse(data)
  if (!result.success) throw new Error(result.error.issues[0].message)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get the user's organization
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) throw new Error("No organization found for this user")

  // Check if clinic already exists for this org
  const { data: existing } = await supabase
    .from("clinics")
    .select("id")
    .eq("organization_id", profile.organization_id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("clinics")
      .update(result.data)
      .eq("id", existing.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from("clinics")
      .insert({ ...result.data, organization_id: profile.organization_id })
    if (error) throw new Error(error.message)
  }

  revalidatePath("/clinic/profile")
}

export async function upsertSpecializations(clinicId: string, areaIds: string[]) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("clinics")
    .update({ therapeutic_area_ids: areaIds })
    .eq("id", clinicId)

  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

export async function addEquipment(clinicId: string, data: {
  name: string
  category: "imaging" | "laboratory" | "monitoring" | "surgical" | "rehabilitation" | "diagnostic" | "other"
  model?: string
  manufacturer?: string
  quantity: number
}) {
  const result = addEquipmentSchema.safeParse({ clinicId, data })
  if (!result.success) throw new Error(result.error.issues[0].message)

  const supabase = await createServerClient()
  const { data: newItem, error } = await supabase
    .from("clinic_equipment")
    .insert({ ...result.data.data, clinic_id: result.data.clinicId })
    .select()
    .single()
  if (error) throw new Error(error.message)
  if (!newItem) throw new Error("Failed to insert equipment")
  revalidatePath("/clinic/profile")
  return newItem
}

export async function deleteEquipment(id: string) {
  const parsed = deleteIdSchema.safeParse(id)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const supabase = await createServerClient()
  const { error } = await supabase.from("clinic_equipment").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

export async function addCertification(clinicId: string, data: {
  certification_name: string
  issued_by?: string
  valid_until?: string
}) {
  const result = addCertificationSchema.safeParse({ clinicId, data })
  if (!result.success) throw new Error(result.error.issues[0].message)

  const supabase = await createServerClient()
  const { data: newItem, error } = await supabase
    .from("certifications")
    .insert({ ...result.data.data, clinic_id: result.data.clinicId })
    .select()
    .single()
  if (error) throw new Error(error.message)
  if (!newItem) throw new Error("Failed to insert certification")
  revalidatePath("/clinic/profile")
  return newItem
}

export async function deleteCertification(id: string) {
  const parsed = deleteIdSchema.safeParse(id)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const supabase = await createServerClient()
  const { error } = await supabase.from("certifications").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

export async function addAvailability(clinicId: string, data: {
  start_date: string
  end_date: string
  type?: "available" | "busy" | "tentative"
  notes?: string
}) {
  const result = upsertAvailabilitySchema.safeParse({ clinicId, data })
  if (!result.success) throw new Error(result.error.issues[0].message)

  const supabase = await createServerClient()
  const { data: newItem, error } = await supabase
    .from("clinic_availability")
    .insert({ ...result.data.data, clinic_id: result.data.clinicId })
    .select()
    .single()
  if (error) throw new Error(error.message)
  if (!newItem) throw new Error("Failed to insert availability")
  revalidatePath("/clinic/profile")
  return newItem
}

export async function deleteAvailability(id: string) {
  const parsed = deleteIdSchema.safeParse(id)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const supabase = await createServerClient()
  const { error } = await supabase.from("clinic_availability").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}
