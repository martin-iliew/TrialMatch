"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function submitContactInquiry(data: {
  name: string
  email: string
  message: string
}) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("contact_inquiries")
    .insert(data)

  if (error) return { error: error.message }
  return { error: null }
}
