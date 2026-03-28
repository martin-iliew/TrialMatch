import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTherapeuticAreas } from "@/features/projects/queries"
import NewProjectForm from "./components/NewProjectForm"

export default async function NewProjectPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: areas } = await getTherapeuticAreas()

  return <NewProjectForm areas={areas} />
}
