import { createClient } from '@supabase/supabase-js'

/**
 * Removes test-generated equipment rows so that each run starts clean
 * and getByText('E2E Test MRI Scanner') always matches exactly 1 element.
 */
export default async function globalSetup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) return

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  await supabase.from('clinic_equipment').delete().like('name', 'E2E Test%')
  await supabase.from('trial_projects').delete().like('title', 'E2E%')
}
