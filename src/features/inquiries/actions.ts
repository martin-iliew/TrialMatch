"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const sendInquirySchema = z.object({
  matchResultId: z.string().min(1, "Match result ID is required"),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required"),
})

const respondToInquirySchema = z.object({
  inquiryId: z.string().min(1, "Inquiry ID is required"),
  action: z.enum(["accepted", "declined"]),
  message: z.string().optional(),
})

export async function sendInquiry(data: {
  matchResultId: string
  subject?: string
  message: string
}) {
  const result = sendInquirySchema.safeParse(data)
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const { data: matchResult } = await supabase
    .from("match_results")
    .select("id, project_id, status")
    .eq("id", result.data.matchResultId)
    .single()

  if (!matchResult) return { error: "Match result not found" }

  const { data: trialProject } = await supabase
    .from("trial_projects")
    .select("id, organization_id")
    .eq("id", matchResult.project_id)
    .eq("organization_id", profile?.organization_id ?? "")
    .single()

  if (!trialProject) return { error: "Not authorized" }

  if (matchResult.status !== "pending") {
    return { error: "Inquiry already sent for this match" }
  }

  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .insert({
      match_result_id: result.data.matchResultId,
      created_by: user.id,
      subject: result.data.subject ?? "Trial Partnership Inquiry",
      status: "open",
    })
    .select()
    .single()

  if (inquiryError) return { error: inquiryError.message }

  const { error: messageError } = await supabase
    .from("inquiry_messages")
    .insert({
      inquiry_id: inquiry.id,
      sender_id: user.id,
      type: "text",
      content: result.data.message,
    })

  if (messageError) return { error: messageError.message }

  const { error: updateError } = await supabase
    .from("match_results")
    .update({ status: "reviewed" })
    .eq("id", result.data.matchResultId)

  if (updateError) return { error: updateError.message }

  revalidatePath(`/sponsor/projects/${trialProject.id}/matches`)
  return { error: null }
}

export async function respondToInquiry(
  inquiryId: string,
  action: "accepted" | "declined",
  message?: string
) {
  const validationResult = respondToInquirySchema.safeParse({ inquiryId, action, message })
  if (!validationResult.success) return { error: validationResult.error.issues[0].message }

  if (action === "declined" && !message) {
    return { error: "A reason is required when declining" }
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const { data: inquiry } = await supabase
    .from("inquiries")
    .select("id, match_result_id, status")
    .eq("id", inquiryId)
    .single()

  if (!inquiry) return { error: "Inquiry not found" }

  const { data: matchResult } = await supabase
    .from("match_results")
    .select("id, clinic_id")
    .eq("id", inquiry.match_result_id)
    .single()

  if (!matchResult) return { error: "Match result not found" }

  const { data: clinic } = await supabase
    .from("clinics")
    .select("id, organization_id")
    .eq("id", matchResult.clinic_id)
    .eq("organization_id", profile?.organization_id ?? "")
    .single()

  if (!clinic) return { error: "Not authorized" }

  if (inquiry.status !== "open") {
    return { error: "Inquiry has already been responded to" }
  }

  const newInquiryStatus = action === "accepted" ? "in_progress" : "closed"
  const newMatchStatus = action === "accepted" ? "accepted" : "rejected"

  const { error: inquiryError } = await supabase
    .from("inquiries")
    .update({ status: newInquiryStatus })
    .eq("id", inquiryId)

  if (inquiryError) return { error: inquiryError.message }

  if (message) {
    await supabase.from("inquiry_messages").insert({
      inquiry_id: inquiryId,
      sender_id: user.id,
      type: "status_update",
      content: message,
    })
  }

  const { error: matchError } = await supabase
    .from("match_results")
    .update({ status: newMatchStatus })
    .eq("id", inquiry.match_result_id)

  if (matchError) return { error: matchError.message }

  revalidatePath("/clinic/inquiries")
  revalidatePath(`/clinic/inquiries/${inquiryId}`)
  return { error: null }
}
