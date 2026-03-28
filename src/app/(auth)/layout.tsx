import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const role = user.user_metadata?.role as string | undefined
    redirect(role === "clinic_admin" ? "/clinic/profile" : "/sponsor/projects")
  }

  return (
    <main className="min-h-screen bg-default">
      {children}
    </main>
  )
}
