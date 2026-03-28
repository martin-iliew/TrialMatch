import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createUser(email: string, password: string, role: 'sponsor' | 'clinic_admin', firstName: string, lastName: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, role }
  })
  if (error) throw new Error(`Failed to create ${email}: ${error.message}`)

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    role,
    first_name: firstName,
    last_name: lastName
  })
  if (profileError) throw new Error(`Failed to insert profile for ${email}: ${profileError.message}`)

  console.log(`Created user: ${email} (${data.user.id})`)
  return data.user.id
}

async function main() {
  console.log('Seeding demo auth users...')

  // Create sponsor accounts
  const sponsor1Id = await createUser('sponsor@demo.com', 'Demo1234!', 'sponsor', 'Alex', 'Morgan')
  await createUser('sponsor2@demo.com', 'Demo1234!', 'sponsor', 'Jordan', 'Taylor')

  // Create clinic admin accounts
  const clinic1AdminId = await createUser('clinic1@demo.com', 'Demo1234!', 'clinic_admin', 'Elena', 'Petrova')
  const clinic2AdminId = await createUser('clinic2@demo.com', 'Demo1234!', 'clinic_admin', 'Ivan', 'Dimitrov')
  const clinic3AdminId = await createUser('clinic3@demo.com', 'Demo1234!', 'clinic_admin', 'Maria', 'Ivanova')

  // Link demo clinic admins to clinic rows 1, 2, 3
  await supabase.from('clinics')
    .update({ user_id: clinic1AdminId })
    .eq('id', '00000000-0000-0000-0000-000000000201')
  await supabase.from('clinics')
    .update({ user_id: clinic2AdminId })
    .eq('id', '00000000-0000-0000-0000-000000000202')
  await supabase.from('clinics')
    .update({ user_id: clinic3AdminId })
    .eq('id', '00000000-0000-0000-0000-000000000203')

  console.log('Linked clinic admins to clinic rows 1-3')

  // Insert 3 seed trial projects under sponsor1
  const { error: trialError } = await supabase.from('trial_projects').insert([
    {
      id: '00000000-0000-0000-0000-000000000301',
      sponsor_user_id: sponsor1Id,
      title: 'NSCLC Maintenance Therapy Phase III — Osimertinib Comparator',
      description: 'A randomized Phase III study comparing osimertinib versus platinum-based chemotherapy as maintenance therapy in EGFR-mutated non-small cell lung cancer after first-line treatment.',
      therapeutic_area_id: '00000000-0000-0000-0000-000000000101',
      phase: 'III',
      molecule_type: 'small_molecule',
      sub_indication: 'EGFR+ NSCLC',
      required_patient_count: 120,
      target_enrollment_rate_per_month: 5.0,
      start_date: '2026-09-01',
      end_date: '2029-03-01',
      geographic_preference: 'Europe',
      irb_type_preference: 'either',
      status: 'draft'
    },
    {
      id: '00000000-0000-0000-0000-000000000302',
      sponsor_user_id: sponsor1Id,
      title: 'Axicabtagene Phase I Dose Escalation — Relapsed/Refractory DLBCL',
      description: 'First-in-human Phase I dose escalation study of a next-generation axicabtagene ciloleucel formulation in adult patients with relapsed or refractory diffuse large B-cell lymphoma after ≥2 prior lines of therapy.',
      therapeutic_area_id: '00000000-0000-0000-0000-000000000114',
      phase: 'I',
      molecule_type: 'cell_therapy',
      sub_indication: 'Relapsed/Refractory DLBCL',
      required_patient_count: 24,
      target_enrollment_rate_per_month: 1.5,
      start_date: '2026-10-01',
      end_date: '2029-10-01',
      geographic_preference: 'Europe',
      irb_type_preference: 'local',
      status: 'draft'
    },
    {
      id: '00000000-0000-0000-0000-000000000303',
      sponsor_user_id: sponsor1Id,
      title: 'Anti-IL-6 Biologic Phase II — Heart Failure with Preserved Ejection Fraction',
      description: 'Phase II randomized controlled trial of a novel anti-IL-6 monoclonal antibody in patients with HFpEF and elevated CRP. Primary endpoint: change in 6-minute walk distance at 24 weeks.',
      therapeutic_area_id: '00000000-0000-0000-0000-000000000102',
      phase: 'II',
      molecule_type: 'biologic',
      sub_indication: 'HFpEF',
      required_patient_count: 96,
      target_enrollment_rate_per_month: 4.0,
      start_date: '2026-08-01',
      end_date: '2028-08-01',
      geographic_preference: 'Varna, Burgas',
      irb_type_preference: 'either',
      status: 'draft'
    }
  ])
  if (trialError) throw new Error(`Failed to insert trial projects: ${trialError.message}`)

  // Insert requirements for Trial A (NSCLC Phase III)
  const { error: reqAError } = await supabase.from('trial_requirements').insert([
    { trial_project_id: '00000000-0000-0000-0000-000000000301', requirement_type: 'specialization', description: 'Oncology specialization required', value: 'Oncology', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000301', requirement_type: 'capacity', description: 'Minimum 100 EGFR+ NSCLC patients in database', value: '100', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000301', requirement_type: 'equipment', description: 'CT imaging for RECIST 1.1 assessment', value: 'CT Scanner', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000301', requirement_type: 'certification', description: 'GCP certification required for all investigational staff', value: 'GCP ICH E6(R2)', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000301', requirement_type: 'phase_experience', description: 'Phase III trial experience required', value: 'III', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000301', requirement_type: 'molecule_experience', description: 'Small molecule drug experience', value: 'small_molecule', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000301', requirement_type: 'capacity', description: 'Screen failure rate below 25% on comparable trials', value: '25', priority: 'preferred' },
    { trial_project_id: '00000000-0000-0000-0000-000000000301', requirement_type: 'capacity', description: 'IRB approval within 21 days preferred', value: '21', priority: 'preferred' }
  ])
  if (reqAError) throw new Error(`Failed to insert Trial A requirements: ${reqAError.message}`)

  // Insert requirements for Trial B (CAR-T Phase I)
  const { error: reqBError } = await supabase.from('trial_requirements').insert([
    { trial_project_id: '00000000-0000-0000-0000-000000000302', requirement_type: 'specialization', description: 'Hematology specialization required', value: 'Hematology', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000302', requirement_type: 'equipment', description: 'Phase I clinical pharmacology unit required', value: 'Phase I Clinical Pharmacology Unit', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000302', requirement_type: 'equipment', description: 'Leukapheresis capability required for T-cell collection', value: 'Leukapheresis Machine', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000302', requirement_type: 'equipment', description: '-80°C cryogenic storage for CAR-T product', value: '-80°C Biospecimen Freezer', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000302', requirement_type: 'molecule_experience', description: 'Cell therapy trial experience required', value: 'cell_therapy', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000302', requirement_type: 'certification', description: 'GCP certification required', value: 'GCP ICH E6(R2)', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000302', requirement_type: 'certification', description: 'FACT accreditation required for cell therapy program', value: 'FACT Accreditation (Cell Therapy)', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000302', requirement_type: 'capacity', description: 'Minimum 20 Relapsed/Refractory DLBCL patients in database', value: '20', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000302', requirement_type: 'phase_experience', description: 'Phase I trial experience required', value: 'I', priority: 'required' }
  ])
  if (reqBError) throw new Error(`Failed to insert Trial B requirements: ${reqBError.message}`)

  // Insert requirements for Trial C (HFpEF Phase II)
  const { error: reqCError } = await supabase.from('trial_requirements').insert([
    { trial_project_id: '00000000-0000-0000-0000-000000000303', requirement_type: 'specialization', description: 'Cardiology specialization required', value: 'Cardiology', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000303', requirement_type: 'equipment', description: 'Echocardiography for LVEF and diastolic function assessment', value: 'Echocardiography', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000303', requirement_type: 'molecule_experience', description: 'Biologic drug experience required', value: 'biologic', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000303', requirement_type: 'phase_experience', description: 'Phase II trial experience required', value: 'II', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000303', requirement_type: 'capacity', description: 'Minimum 80 HFpEF patients in database', value: '80', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000303', requirement_type: 'certification', description: 'GCP certification required', value: 'GCP ICH E6(R2)', priority: 'required' },
    { trial_project_id: '00000000-0000-0000-0000-000000000303', requirement_type: 'capacity', description: 'Contract execution within 25 days preferred', value: '25', priority: 'preferred' },
    { trial_project_id: '00000000-0000-0000-0000-000000000303', requirement_type: 'capacity', description: 'Site located in Varna or Burgas preferred', value: 'Varna,Burgas', priority: 'preferred' }
  ])
  if (reqCError) throw new Error(`Failed to insert Trial C requirements: ${reqCError.message}`)

  console.log('Seed complete.')
  console.log('')
  console.log('Demo accounts:')
  console.log('  sponsor@demo.com     / Demo1234!  (Sponsor)')
  console.log('  sponsor2@demo.com    / Demo1234!  (Sponsor)')
  console.log('  clinic1@demo.com     / Demo1234!  (Clinic Admin → Rilski)')
  console.log('  clinic2@demo.com     / Demo1234!  (Clinic Admin → Tokuda)')
  console.log('  clinic3@demo.com     / Demo1234!  (Clinic Admin → St. George)')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
