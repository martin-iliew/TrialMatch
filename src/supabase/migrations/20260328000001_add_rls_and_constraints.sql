-- ============================================================
-- UNIQUE CONSTRAINTS (needed for upsert operations)
-- ============================================================
ALTER TABLE public.clinics
  ADD CONSTRAINT clinics_user_id_unique UNIQUE (user_id);

ALTER TABLE public.clinic_availability
  ADD CONSTRAINT clinic_availability_clinic_id_unique UNIQUE (clinic_id);

-- ============================================================
-- ROW LEVEL SECURITY for remaining tables
-- ============================================================

-- therapeutic_areas: read-only for everyone, no writes through API
ALTER TABLE public.therapeutic_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "therapeutic_areas_read" ON public.therapeutic_areas
  FOR SELECT USING (true);

-- clinic_specializations: anyone can read; only clinic owner can write
ALTER TABLE public.clinic_specializations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clinic_specializations_read" ON public.clinic_specializations
  FOR SELECT USING (true);
CREATE POLICY "clinic_specializations_write" ON public.clinic_specializations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clinics c
      WHERE c.id = clinic_id AND c.user_id = auth.uid()
    )
  );

-- equipment: anyone can read; only clinic owner can write
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipment_read" ON public.equipment
  FOR SELECT USING (true);
CREATE POLICY "equipment_write" ON public.equipment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clinics c
      WHERE c.id = clinic_id AND c.user_id = auth.uid()
    )
  );

-- certifications: anyone can read; only clinic owner can write
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certifications_read" ON public.certifications
  FOR SELECT USING (true);
CREATE POLICY "certifications_write" ON public.certifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clinics c
      WHERE c.id = clinic_id AND c.user_id = auth.uid()
    )
  );

-- clinic_availability: anyone can read; only clinic owner can write
ALTER TABLE public.clinic_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clinic_availability_read" ON public.clinic_availability
  FOR SELECT USING (true);
CREATE POLICY "clinic_availability_write" ON public.clinic_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clinics c
      WHERE c.id = clinic_id AND c.user_id = auth.uid()
    )
  );

-- trial_requirements: anyone authenticated can read; only project owner can write
ALTER TABLE public.trial_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trial_requirements_read" ON public.trial_requirements
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "trial_requirements_write" ON public.trial_requirements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.trial_projects tp
      WHERE tp.id = trial_project_id AND tp.sponsor_user_id = auth.uid()
    )
  );

-- contact_inquiries: anyone can insert; no reads through API
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_inquiries_insert" ON public.contact_inquiries
  FOR INSERT WITH CHECK (true);
