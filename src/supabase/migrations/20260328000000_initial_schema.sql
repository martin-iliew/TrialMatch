-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('sponsor', 'clinic_admin');
CREATE TYPE trial_phase AS ENUM ('I', 'Ia', 'Ib', 'II', 'IIa', 'IIb', 'III', 'IV');
CREATE TYPE molecule_type AS ENUM ('small_molecule', 'biologic', 'cell_therapy', 'gene_therapy', 'vaccine', 'device');
CREATE TYPE site_type AS ENUM ('academic_medical_center', 'community_hospital', 'dedicated_research', 'private_practice', 'va_medical_center');
CREATE TYPE fda_inspection_outcome AS ENUM ('no_action', 'voluntary_action', 'official_action', 'never_inspected');
CREATE TYPE requirement_priority AS ENUM ('required', 'preferred', 'nice_to_have');
CREATE TYPE requirement_type AS ENUM ('equipment', 'certification', 'specialization', 'capacity', 'phase_experience', 'molecule_experience');
CREATE TYPE trial_status AS ENUM ('draft', 'searching', 'matched', 'closed');
CREATE TYPE inquiry_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE match_status AS ENUM ('pending', 'inquiry_sent', 'accepted', 'declined');

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.profiles (
  id         uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role       user_role NOT NULL,
  first_name text NOT NULL,
  last_name  text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.therapeutic_areas (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL UNIQUE,
  description text
);

CREATE TABLE public.clinics (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name        text NOT NULL,
  city        text NOT NULL,
  country     text NOT NULL DEFAULT 'Bulgaria',
  address     text,
  description text,
  contact_email text,
  contact_phone text,
  website     text,

  -- Classification
  site_type               site_type NOT NULL DEFAULT 'community_hospital',
  nci_designated          boolean NOT NULL DEFAULT false,

  -- Operational metrics
  avg_enrollment_rate_per_month  numeric(5,2),
  avg_screen_failure_rate        numeric(5,2),
  avg_query_response_days        numeric(5,1),
  avg_contract_execution_days    integer,
  irb_type                       text,
  irb_avg_review_days            integer,
  last_fda_inspection_outcome    fda_inspection_outcome DEFAULT 'never_inspected',
  protocol_deviation_rate        numeric(5,2),

  -- Capacity
  active_trial_count    integer NOT NULL DEFAULT 0,
  max_concurrent_trials integer NOT NULL DEFAULT 5,

  -- Experience
  phase_experience         trial_phase[],
  molecule_type_experience molecule_type[],

  -- Patient population JSONB: { "NSCLC": 180, "EGFR+ NSCLC": 45 }
  patient_population jsonb DEFAULT '{}',

  -- Reach
  referral_network_size    integer,
  catchment_area_population integer,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.clinic_specializations (
  clinic_id           uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  therapeutic_area_id uuid REFERENCES public.therapeutic_areas(id) ON DELETE CASCADE,
  PRIMARY KEY (clinic_id, therapeutic_area_id)
);

CREATE TABLE public.equipment (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id      uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  equipment_type text NOT NULL,
  name           text NOT NULL,
  quantity       integer NOT NULL DEFAULT 1,
  is_available   boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.certifications (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id            uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  certification_name   text NOT NULL,
  issued_by            text,
  valid_until          date,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.clinic_availability (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id            uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  available_from       date NOT NULL,
  available_to         date NOT NULL,
  max_concurrent_trials integer NOT NULL DEFAULT 3,
  current_trial_count  integer NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.trial_projects (
  id                               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_user_id                  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title                            text NOT NULL,
  description                      text,
  therapeutic_area_id              uuid REFERENCES public.therapeutic_areas(id),
  phase                            trial_phase,
  molecule_type                    molecule_type,
  sub_indication                   text,
  required_patient_count           integer,
  target_enrollment_rate_per_month numeric(5,2),
  start_date                       date,
  end_date                         date,
  geographic_preference            text,
  irb_type_preference              text,
  status                           trial_status NOT NULL DEFAULT 'draft',
  created_at                       timestamptz NOT NULL DEFAULT now(),
  updated_at                       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.trial_requirements (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_project_id uuid REFERENCES public.trial_projects(id) ON DELETE CASCADE NOT NULL,
  requirement_type requirement_type NOT NULL,
  description      text NOT NULL,
  value            text,
  priority         requirement_priority NOT NULL DEFAULT 'preferred',
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.match_results (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_project_id uuid REFERENCES public.trial_projects(id) ON DELETE CASCADE NOT NULL,
  clinic_id        uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  overall_score    numeric(5,2) NOT NULL DEFAULT 0,
  breakdown        jsonb DEFAULT '{}',
  matched_at       timestamptz NOT NULL DEFAULT now(),
  status           match_status NOT NULL DEFAULT 'pending'
);

CREATE TABLE public.partnership_inquiries (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_result_id  uuid REFERENCES public.match_results(id) ON DELETE CASCADE NOT NULL,
  sender_user_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message          text NOT NULL,
  notes            text,
  status           inquiry_status NOT NULL DEFAULT 'pending',
  response_message text,
  decline_reason   text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  responded_at     timestamptz
);

CREATE TABLE public.contact_inquiries (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              text NOT NULL,
  email             text NOT NULL,
  organization_type text,
  message           text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_clinics_city ON public.clinics(city);
CREATE INDEX idx_clinics_country ON public.clinics(country);
CREATE INDEX idx_clinics_phase_exp ON public.clinics USING GIN(phase_experience);
CREATE INDEX idx_clinics_molecule_exp ON public.clinics USING GIN(molecule_type_experience);
CREATE INDEX idx_clinics_patient_pop ON public.clinics USING GIN(patient_population);
CREATE INDEX idx_clinic_spec_ta ON public.clinic_specializations(therapeutic_area_id);
CREATE INDEX idx_trial_req_project ON public.trial_requirements(trial_project_id);
CREATE INDEX idx_match_results_project ON public.match_results(trial_project_id);
CREATE INDEX idx_match_results_clinic ON public.match_results(clinic_id);
CREATE INDEX idx_inquiries_match ON public.partnership_inquiries(match_result_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_inquiries ENABLE ROW LEVEL SECURITY;

-- profiles: users read/write own row only
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- clinics: anyone authenticated can read; only owner can write
CREATE POLICY "clinics_read" ON public.clinics
  FOR SELECT USING (true);
CREATE POLICY "clinics_write" ON public.clinics
  FOR ALL USING (auth.uid() = user_id);

-- trial_projects: sponsor manages own; all authenticated can read
CREATE POLICY "trial_projects_own" ON public.trial_projects
  FOR ALL USING (auth.uid() = sponsor_user_id);
CREATE POLICY "trial_projects_read" ON public.trial_projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- match_results: sponsor reads via project; clinic reads own matches
CREATE POLICY "match_results_sponsor" ON public.match_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.trial_projects tp
      WHERE tp.id = trial_project_id AND tp.sponsor_user_id = auth.uid()
    )
  );
CREATE POLICY "match_results_clinic" ON public.match_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clinics c
      WHERE c.id = clinic_id AND c.user_id = auth.uid()
    )
  );

-- partnership_inquiries: sender + clinic admin can access
CREATE POLICY "inquiries_sender" ON public.partnership_inquiries
  FOR ALL USING (auth.uid() = sender_user_id);
CREATE POLICY "inquiries_clinic" ON public.partnership_inquiries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.match_results mr
      JOIN public.clinics c ON c.id = mr.clinic_id
      WHERE mr.id = match_result_id AND c.user_id = auth.uid()
    )
  );
