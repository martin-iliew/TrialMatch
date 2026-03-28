-- ============================================================
-- THERAPEUTIC AREAS
-- ============================================================
INSERT INTO public.therapeutic_areas (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000101', 'Oncology', 'Cancer and tumor diseases'),
  ('00000000-0000-0000-0000-000000000102', 'Cardiology', 'Heart and cardiovascular diseases'),
  ('00000000-0000-0000-0000-000000000103', 'Neurology', 'Nervous system disorders'),
  ('00000000-0000-0000-0000-000000000104', 'Endocrinology', 'Hormonal and metabolic disorders'),
  ('00000000-0000-0000-0000-000000000105', 'Pulmonology', 'Respiratory and lung diseases'),
  ('00000000-0000-0000-0000-000000000106', 'Rheumatology', 'Autoimmune and musculoskeletal diseases'),
  ('00000000-0000-0000-0000-000000000107', 'Gastroenterology', 'Digestive system disorders'),
  ('00000000-0000-0000-0000-000000000108', 'Dermatology', 'Skin diseases and conditions'),
  ('00000000-0000-0000-0000-000000000109', 'Psychiatry', 'Mental health and behavioral disorders'),
  ('00000000-0000-0000-0000-000000000110', 'Ophthalmology', 'Eye diseases and disorders'),
  ('00000000-0000-0000-0000-000000000111', 'Immunology', 'Immune system disorders and therapies'),
  ('00000000-0000-0000-0000-000000000112', 'Infectious Disease', 'Bacterial, viral, and parasitic infections'),
  ('00000000-0000-0000-0000-000000000113', 'Orthopedics', 'Bone, joint, and musculoskeletal conditions'),
  ('00000000-0000-0000-0000-000000000114', 'Hematology', 'Blood and lymphatic system disorders'),
  ('00000000-0000-0000-0000-000000000115', 'Nephrology', 'Kidney diseases and disorders');

-- ============================================================
-- CLINICS (user_id NULL — filled in by seed-auth.ts for demo accounts)
-- ============================================================
INSERT INTO public.clinics (
  id, name, city, country, address, description,
  contact_email, contact_phone, website,
  site_type, nci_designated,
  avg_enrollment_rate_per_month, avg_screen_failure_rate,
  avg_query_response_days, avg_contract_execution_days,
  irb_type, irb_avg_review_days, last_fda_inspection_outcome,
  protocol_deviation_rate, active_trial_count, max_concurrent_trials,
  phase_experience, molecule_type_experience,
  patient_population, referral_network_size, catchment_area_population
) VALUES

-- 1. St. Ivan Rilski — Sofia, Bulgaria (academic, Phase I, cell therapy capable)
(
  '00000000-0000-0000-0000-000000000201',
  'St. Ivan Rilski University Hospital Research Centre',
  'Sofia', 'Bulgaria',
  '2 Urvich St, Sofia 1431, Bulgaria',
  'Leading Bulgarian academic medical center with a dedicated Phase I unit and GMP-certified cell therapy laboratory. NCI-designated cancer program. Full oncology and hematology capabilities including leukapheresis and cryogenic storage.',
  'research@rilski.bg', '+359 2 9520 900', 'https://www.rilski.bg',
  'academic_medical_center', true,
  4.2, 32.0, 5.2, 35, 'local', 45, 'no_action', 2.1, 8, 15,
  ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV']::trial_phase[],
  ARRAY['small_molecule','biologic','cell_therapy','gene_therapy','vaccine']::molecule_type[],
  '{"Oncology": 950, "Hematology": 340, "Relapsed/Refractory DLBCL": 45, "AML": 78, "Neurology": 420}'::jsonb,
  85, 1200000
),

-- 2. Tokuda — Sofia, Bulgaria (dedicated research, best operational metrics)
(
  '00000000-0000-0000-0000-000000000202',
  'Tokuda Hospital Clinical Trials Unit',
  'Sofia', 'Bulgaria',
  '51B Nikola Vaptsarov Blvd, Sofia 1407, Bulgaria',
  'ISO-certified dedicated clinical research unit with industry-leading operational metrics. Fastest IRB turnaround in Bulgaria (14 days). AAHRPP-accredited human research protection program. Specialized in oncology and cardiology Phase II-III trials.',
  'trials@tokuda.bg', '+359 2 4035 700', 'https://www.tokuda.bg',
  'dedicated_research', false,
  6.8, 22.0, 1.8, 18, 'central', 14, 'no_action', 1.2, 12, 20,
  ARRAY['II','IIa','IIb','III','IV']::trial_phase[],
  ARRAY['small_molecule','biologic']::molecule_type[],
  '{"Oncology": 520, "Cardiology": 380, "Endocrinology": 290, "EGFR+ NSCLC": 65, "HFpEF": 88}'::jsonb,
  120, 1500000
),

-- 3. St. George — Plovdiv, Bulgaria (academic, large oncology patient DB)
(
  '00000000-0000-0000-0000-000000000203',
  'St. George University Hospital Oncology Institute',
  'Plovdiv', 'Bulgaria',
  '66 Peshtersko Shose Blvd, Plovdiv 4000, Bulgaria',
  'South Bulgaria academic cancer center with the largest oncology patient database in the region. Phase I-IV capabilities across solid tumors and hematological malignancies. Strong referral network from Plovdiv, Pazardzhik, and Stara Zagora.',
  'oncology@stgeorge-plovdiv.bg', '+359 32 602 900', 'https://www.stgeorge.bg',
  'academic_medical_center', false,
  5.1, 28.0, 4.1, 40, 'local', 30, 'voluntary_action', 3.2, 6, 12,
  ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV']::trial_phase[],
  ARRAY['small_molecule','biologic','gene_therapy']::molecule_type[],
  '{"Oncology": 1250, "NSCLC": 320, "EGFR+ NSCLC": 110, "Breast Cancer HER2+": 145, "Colorectal Cancer": 180, "Hematology": 210}'::jsonb,
  65, 800000
),

-- 4. MedStar — Varna, Bulgaria (community, cardiology focus, geographic advantage)
(
  '00000000-0000-0000-0000-000000000204',
  'MedStar Clinic Varna',
  'Varna', 'Bulgaria',
  '100 Vladislav Varnenchik Blvd, Varna 9000, Bulgaria',
  'Black Sea region community hospital with a strong cardiology program and large HFpEF patient registry. Serves the coastal population of northeast Bulgaria. Good contract execution speed and cardiology equipment.',
  'research@medstar-varna.bg', '+359 52 688 000', 'https://www.medstarvarna.bg',
  'community_hospital', false,
  3.9, 35.0, 6.5, 25, 'local', 28, 'never_inspected', 4.1, 4, 8,
  ARRAY['II','IIa','IIb','III','IV']::trial_phase[],
  ARRAY['small_molecule','biologic']::molecule_type[],
  '{"Cardiology": 520, "HFpEF": 112, "Hypertension": 890, "Atrial Fibrillation": 230, "Nephrology": 180}'::jsonb,
  42, 450000
),

-- 5. Acibadem — Sofia, Bulgaria (dedicated research, best screen failure rate)
(
  '00000000-0000-0000-0000-000000000205',
  'Acibadem City Clinic Research',
  'Sofia', 'Bulgaria',
  '2 Srebarna St, Sofia 1407, Bulgaria',
  'JCI-accredited international hospital with the lowest screen failure rate in Bulgaria (18%). AAHRPP-certified research program with real-time EDC monitoring. Industry benchmark for query response time (1.2 days). Preferred by major sponsors for Phase II-III.',
  'clinicaltrials@acibadem.bg', '+359 2 9069 100', 'https://www.acibademcityclinic.bg',
  'dedicated_research', false,
  7.2, 18.0, 1.2, 22, 'central', 21, 'no_action', 0.9, 15, 22,
  ARRAY['II','IIa','IIb','III']::trial_phase[],
  ARRAY['small_molecule','biologic']::molecule_type[],
  '{"Oncology": 680, "EGFR+ NSCLC": 98, "Cardiology": 310, "Rheumatology": 245}'::jsonb,
  95, 1800000
),

-- 6. MMA — Sofia, Bulgaria (VA-type, diverse patient population, slow contracts)
(
  '00000000-0000-0000-0000-000000000206',
  'Military Medical Academy Sofia',
  'Sofia', 'Bulgaria',
  '3 Georgi Sofiiski St, Sofia 1606, Bulgaria',
  'National military hospital with broad patient access across all therapeutic areas. Strong GCP compliance culture and experienced investigator team. Slower administrative processes due to institutional bureaucracy, but access to unique patient populations including veterans.',
  'research@mma.bg', '+359 2 9225 810', 'https://www.vma.bg',
  'va_medical_center', false,
  3.2, 38.0, 8.1, 60, 'local', 35, 'no_action', 3.8, 5, 10,
  ARRAY['II','IIa','IIb','III','IV']::trial_phase[],
  ARRAY['small_molecule']::molecule_type[],
  '{"Oncology": 380, "Neurology": 290, "Psychiatry": 340, "Infectious Disease": 220}'::jsonb,
  30, 2000000
),

-- 7. Vita — Burgas, Bulgaria (private practice, fastest contracts, lean)
(
  '00000000-0000-0000-0000-000000000207',
  'Vita Research Center Burgas',
  'Burgas', 'Bulgaria',
  '120 Alexandrovska St, Burgas 8000, Bulgaria',
  'Lean private research site with the fastest contract execution in Bulgaria (8 days). Ideal for Phase III-IV trials that prioritize speed-to-start and cost efficiency. Limited to small molecule studies. Small but well-motivated patient database.',
  'info@vita-research.bg', '+359 56 813 200', 'https://www.vita-research.bg',
  'private_practice', false,
  2.8, 40.0, 3.2, 8, 'central', 28, 'never_inspected', 5.2, 3, 6,
  ARRAY['III','IV']::trial_phase[],
  ARRAY['small_molecule']::molecule_type[],
  '{"Cardiology": 180, "Pulmonology": 120, "Endocrinology": 95}'::jsonb,
  18, 350000
),

-- 8. Kirkovich — Stara Zagora, Bulgaria (community, neurology/psychiatry focus)
(
  '00000000-0000-0000-0000-000000000208',
  'Prof. Dr. Stoyan Kirkovich University Hospital',
  'Stara Zagora', 'Bulgaria',
  '11 Armeyska St, Stara Zagora 6000, Bulgaria',
  'Central Bulgaria university hospital specializing in neurology and psychiatry. Large catchment area covering rural central Bulgaria. Strong patient database for CNS and psychiatric trials. Phase II-III experience in neurodegenerative and psychiatric indications.',
  'research@kirkovich.bg', '+359 42 664 401', 'https://www.mbal-stara-zagora.com',
  'community_hospital', false,
  3.5, 33.0, 5.8, 30, 'local', 32, 'never_inspected', 3.5, 4, 8,
  ARRAY['II','IIa','IIb','III']::trial_phase[],
  ARRAY['small_molecule','biologic']::molecule_type[],
  '{"Neurology": 420, "Psychiatry": 380, "Endocrinology": 220, "Gastroenterology": 180}'::jsonb,
  35, 600000
),

-- 9. Charité — Berlin, Germany (largest European academic site, all capabilities)
(
  '00000000-0000-0000-0000-000000000209',
  'Charité Clinical Research Organisation',
  'Berlin', 'Germany',
  'Charitéplatz 1, 10117 Berlin, Germany',
  'Europe''s largest university hospital and leading clinical research organization. Phase I-IV capabilities across all therapeutic areas. On-site cyclotron for radiopharmaceuticals, GMP cell therapy manufacturing, three leukapheresis machines, and 7T research MRI. AAHRPP-accredited. Fastest IRB in Germany (10 days via dedicated ethics committee).',
  'cro@charite.de', '+49 30 450 550', 'https://www.charite.de',
  'academic_medical_center', true,
  9.1, 20.0, 1.5, 42, 'local', 10, 'no_action', 1.0, 45, 80,
  ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV']::trial_phase[],
  ARRAY['small_molecule','biologic','cell_therapy','gene_therapy','vaccine','device']::molecule_type[],
  '{"Oncology": 3200, "NSCLC": 680, "EGFR+ NSCLC": 195, "Neurology": 1800, "Cardiology": 2100, "Hematology": 890, "Relapsed/Refractory DLBCL": 112, "AML": 156}'::jsonb,
  380, 6000000
),

-- 10. Amsterdam UMC — Amsterdam, Netherlands (best data quality, FACT-accredited cell therapy)
(
  '00000000-0000-0000-0000-000000000210',
  'Amsterdam UMC Trial Centre',
  'Amsterdam', 'Netherlands',
  'Meibergdreef 9, 1105 AZ Amsterdam, Netherlands',
  'World-class academic medical center with the lowest protocol deviation rate in this network (0.8 per 100 visits). FACT-accredited cell therapy unit with dedicated leukapheresis capacity. EMA-inspected with no findings. Central IRB reduces review time. Extensive EDC system experience across all major platforms.',
  'trials@amsterdamumc.nl', '+31 20 566 9111', 'https://www.amsterdamumc.nl',
  'academic_medical_center', false,
  7.4, 21.0, 1.1, 55, 'central', 18, 'no_action', 0.8, 38, 60,
  ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV']::trial_phase[],
  ARRAY['small_molecule','biologic','cell_therapy']::molecule_type[],
  '{"Oncology": 2100, "NSCLC": 420, "EGFR+ NSCLC": 145, "Cardiology": 1400, "HFpEF": 180, "Hematology": 560, "Relapsed/Refractory DLBCL": 68}'::jsonb,
  210, 4000000
),

-- 11. Vall d'Hebron — Barcelona, Spain (large oncology volume, Phase I unit)
(
  '00000000-0000-0000-0000-000000000211',
  'Hospital Vall d''Hebron Research Institute',
  'Barcelona', 'Spain',
  'Passeig de la Vall d''Hebron 119-129, 08035 Barcelona, Spain',
  'Spain''s largest oncology research center with Phase I dose-escalation infrastructure. AAHRPP-accredited. Largest NSCLC patient registry in southern Europe. Strong investigator KOL network. High active trial load reflects site quality and sponsor confidence.',
  'research@vhir.org', '+34 93 489 4000', 'https://www.vhir.org',
  'academic_medical_center', false,
  8.3, 30.0, 2.8, 38, 'local', 22, 'no_action', 2.2, 52, 75,
  ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV']::trial_phase[],
  ARRAY['small_molecule','biologic','gene_therapy']::molecule_type[],
  '{"Oncology": 2400, "NSCLC": 580, "EGFR+ NSCLC": 168, "Breast Cancer HER2+": 290, "Cardiology": 880, "Neurology": 1100}'::jsonb,
  280, 5000000
),

-- 12. Gustave Roussy — Villejuif, France (Europe's largest cancer center, highest enrollment rate)
(
  '00000000-0000-0000-0000-000000000212',
  'Gustave Roussy Clinical Trials Office',
  'Villejuif', 'France',
  '114 Rue Edouard Vaillant, 94805 Villejuif, France',
  'Europe''s largest comprehensive cancer center. Highest enrollment rate in network (11.2 patients/month). On-site radiopharmacy with cyclotron for theranostics trials. GMP cell therapy manufacturing for CAR-T and gene therapy. Unmatched oncology patient volume — 4,100 active oncology patients.',
  'essais-cliniques@gustaveroussy.fr', '+33 1 4211 4211', 'https://www.gustaveroussy.fr',
  'dedicated_research', true,
  11.2, 25.0, 2.2, 50, 'local', 28, 'no_action', 1.5, 68, 100,
  ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV']::trial_phase[],
  ARRAY['small_molecule','biologic','cell_therapy','gene_therapy','vaccine']::molecule_type[],
  '{"Oncology": 4100, "NSCLC": 850, "EGFR+ NSCLC": 240, "Hematology": 1100, "Relapsed/Refractory DLBCL": 145, "AML": 198, "Breast Cancer HER2+": 380}'::jsonb,
  450, 12000000
),

-- 13. University Hospital Zurich — Zurich, Switzerland (excellent cardiology/neurology, SwissMedic)
(
  '00000000-0000-0000-0000-000000000213',
  'University Hospital Zurich Research Centre',
  'Zurich', 'Switzerland',
  'Rämistrasse 100, 8091 Zürich, Switzerland',
  'SwissMedic-accredited academic center with outstanding cardiology and neurology patient databases. Lowest screen failure rate among European sites (19%). Exceptional data quality metrics. Phase II-IV experience in chronic disease indications. Central ethics committee ensures fast, predictable review.',
  'research@usz.ch', '+41 44 255 1111', 'https://www.usz.ch',
  'academic_medical_center', false,
  6.1, 19.0, 1.4, 48, 'central', 20, 'no_action', 1.1, 28, 45,
  ARRAY['II','IIa','IIb','III','IV']::trial_phase[],
  ARRAY['small_molecule','biologic']::molecule_type[],
  '{"Cardiology": 1680, "HFpEF": 245, "Neurology": 920, "Endocrinology": 680, "Rheumatology": 420}'::jsonb,
  180, 3500000
);

-- ============================================================
-- CLINIC SPECIALIZATIONS
-- ============================================================
INSERT INTO public.clinic_specializations (clinic_id, therapeutic_area_id) VALUES
  -- Rilski: Oncology, Hematology, Neurology, Immunology
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000114'),
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000111'),
  -- Tokuda: Oncology, Cardiology, Endocrinology
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000104'),
  -- St. George: Oncology, Hematology, Immunology
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000114'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000111'),
  -- MedStar: Cardiology, Nephrology
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000115'),
  -- Acibadem: Oncology, Cardiology, Rheumatology
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000106'),
  -- MMA: Oncology, Neurology, Psychiatry, Infectious Disease
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000109'),
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000112'),
  -- Vita: Cardiology, Pulmonology, Endocrinology
  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000105'),
  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000104'),
  -- Kirkovich: Neurology, Psychiatry, Endocrinology, Gastroenterology
  ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000109'),
  ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000104'),
  ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000107'),
  -- Charité: all 15
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000104'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000105'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000106'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000107'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000108'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000109'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000110'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000111'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000112'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000113'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000114'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000115'),
  -- Amsterdam UMC: Oncology, Hematology, Cardiology, Neurology, Immunology, Pulmonology
  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000114'),
  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000111'),
  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000105'),
  -- Vall d'Hebron: Oncology, Cardiology, Neurology, Immunology, Gastroenterology
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000111'),
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000107'),
  -- Gustave Roussy: Oncology, Hematology, Immunology, Dermatology
  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000114'),
  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000111'),
  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000108'),
  -- Zurich: Cardiology, Neurology, Endocrinology, Rheumatology, Nephrology
  ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000104'),
  ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000106'),
  ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000115');

-- ============================================================
-- EQUIPMENT (key differentiating items per clinic)
-- ============================================================
INSERT INTO public.equipment (clinic_id, equipment_type, name, quantity, is_available) VALUES
  -- Rilski (Phase I, cell therapy)
  ('00000000-0000-0000-0000-000000000201', 'Phase I Infrastructure', 'Phase I Clinical Pharmacology Unit', 1, true),
  ('00000000-0000-0000-0000-000000000201', 'Apheresis', 'Leukapheresis Machine (Fresenius COM.TEC)', 2, true),
  ('00000000-0000-0000-0000-000000000201', 'Cryostorage', '-80°C Biospecimen Freezer (Thermo Scientific)', 4, true),
  ('00000000-0000-0000-0000-000000000201', 'Imaging', '3T MRI (Siemens Magnetom Prisma)', 1, true),
  ('00000000-0000-0000-0000-000000000201', 'Imaging', 'PET-CT (GE Discovery MI)', 1, true),
  ('00000000-0000-0000-0000-000000000201', 'Infusion', 'Infusion Suite (12 chairs, HEPA-filtered)', 1, true),
  ('00000000-0000-0000-0000-000000000201', 'Laboratory', 'Flow Cytometer (BD FACSCanto II)', 1, true),
  -- Tokuda (best operational metrics)
  ('00000000-0000-0000-0000-000000000202', 'Imaging', '1.5T MRI (Philips Ingenia)', 2, true),
  ('00000000-0000-0000-0000-000000000202', 'Imaging', 'CT Scanner (Siemens SOMATOM)', 2, true),
  ('00000000-0000-0000-0000-000000000202', 'Cardiac', 'Echocardiography (Philips EPIQ)', 2, true),
  ('00000000-0000-0000-0000-000000000202', 'Infusion', 'Infusion Suite (8 chairs)', 1, true),
  ('00000000-0000-0000-0000-000000000202', 'Cryostorage', '-20°C Biospecimen Freezer', 6, true),
  ('00000000-0000-0000-0000-000000000202', 'Densitometry', 'DEXA Bone Densitometer (Hologic Horizon)', 1, true),
  -- St. George (large oncology volume)
  ('00000000-0000-0000-0000-000000000203', 'Imaging', 'CT Scanner (GE Revolution)', 3, true),
  ('00000000-0000-0000-0000-000000000203', 'Imaging', '1.5T MRI (Siemens Aera)', 1, true),
  ('00000000-0000-0000-0000-000000000203', 'Imaging', 'PET-CT (Siemens Biograph)', 1, true),
  ('00000000-0000-0000-0000-000000000203', 'Oncology', 'Tumor Biopsy Suite (IR-guided)', 1, true),
  ('00000000-0000-0000-0000-000000000203', 'Infusion', 'Infusion Suite (10 chairs)', 1, true),
  ('00000000-0000-0000-0000-000000000203', 'Cryostorage', '-80°C Biospecimen Freezer', 2, true),
  -- MedStar (cardiology)
  ('00000000-0000-0000-0000-000000000204', 'Cardiac', 'Echocardiography (GE Vivid E95)', 3, true),
  ('00000000-0000-0000-0000-000000000204', 'Cardiac', '24-hour Holter ECG Monitor', 5, true),
  ('00000000-0000-0000-0000-000000000204', 'Imaging', 'CT Scanner (Philips Incisive)', 1, true),
  ('00000000-0000-0000-0000-000000000204', 'Cardiac', 'Cardiac Catheterization Lab', 1, true),
  ('00000000-0000-0000-0000-000000000204', 'Infusion', 'Infusion Suite (4 chairs)', 1, true),
  -- Acibadem (best screen failure rate)
  ('00000000-0000-0000-0000-000000000205', 'Imaging', '3T MRI (Siemens Skyra)', 1, true),
  ('00000000-0000-0000-0000-000000000205', 'Imaging', 'CT Scanner (Siemens SOMATOM Force)', 2, true),
  ('00000000-0000-0000-0000-000000000205', 'Cardiac', 'Echocardiography (Philips EPIQ CVx)', 2, true),
  ('00000000-0000-0000-0000-000000000205', 'Infusion', 'Infusion Suite (15 chairs, HEPA-filtered)', 1, true),
  ('00000000-0000-0000-0000-000000000205', 'Laboratory', 'Flow Cytometer (BD LSRFortessa)', 1, true),
  -- MMA Sofia
  ('00000000-0000-0000-0000-000000000206', 'Imaging', 'CT Scanner (Toshiba Aquilion)', 2, true),
  ('00000000-0000-0000-0000-000000000206', 'Imaging', '1.5T MRI (GE Optima)', 1, true),
  ('00000000-0000-0000-0000-000000000206', 'Infusion', 'Infusion Suite (6 chairs)', 1, true),
  ('00000000-0000-0000-0000-000000000206', 'Neurology', 'EEG System (Nihon Kohden)', 3, true),
  -- Vita Burgas (lean)
  ('00000000-0000-0000-0000-000000000207', 'Imaging', 'CT Scanner (GE Optima)', 1, true),
  ('00000000-0000-0000-0000-000000000207', 'Pulmonology', 'Spirometry (Jaeger MasterScreen)', 2, true),
  ('00000000-0000-0000-0000-000000000207', 'Cardiac', '12-lead ECG (GE MAC 5500)', 3, true),
  ('00000000-0000-0000-0000-000000000207', 'Infusion', 'Infusion Suite (3 chairs)', 1, true),
  -- Kirkovich
  ('00000000-0000-0000-0000-000000000208', 'Imaging', 'CT Scanner (Siemens Emotion)', 1, true),
  ('00000000-0000-0000-0000-000000000208', 'Imaging', '1.5T MRI (Siemens Essenza)', 1, true),
  ('00000000-0000-0000-0000-000000000208', 'Neurology', 'EEG System (Natus Quantum)', 4, true),
  ('00000000-0000-0000-0000-000000000208', 'Infusion', 'Infusion Suite (4 chairs)', 1, true),
  -- Charité (full service, Europe-leading)
  ('00000000-0000-0000-0000-000000000209', 'Phase I Infrastructure', 'Phase I Clinical Pharmacology Unit (24-bed)', 1, true),
  ('00000000-0000-0000-0000-000000000209', 'Apheresis', 'Leukapheresis Machine (Fresenius COM.TEC)', 3, true),
  ('00000000-0000-0000-0000-000000000209', 'Cryostorage', '-80°C Biospecimen Freezer (Thermo Scientific)', 12, true),
  ('00000000-0000-0000-0000-000000000209', 'Cryostorage', 'Liquid Nitrogen Storage (-196°C)', 4, true),
  ('00000000-0000-0000-0000-000000000209', 'Imaging', '7T Research MRI (Siemens MAGNETOM Terra)', 1, true),
  ('00000000-0000-0000-0000-000000000209', 'Imaging', '3T MRI (Siemens Prisma)', 2, true),
  ('00000000-0000-0000-0000-000000000209', 'Imaging', 'PET-CT with On-Site Cyclotron (Siemens Biograph)', 1, true),
  ('00000000-0000-0000-0000-000000000209', 'Laboratory', 'Flow Cytometer (BD FACSLyric)', 3, true),
  ('00000000-0000-0000-0000-000000000209', 'Infusion', 'Infusion Suite (30 chairs, HEPA-filtered)', 1, true),
  ('00000000-0000-0000-0000-000000000209', 'Cell Therapy', 'GMP Cell Therapy Cleanroom', 1, true),
  -- Amsterdam UMC (FACT-accredited, data quality leader)
  ('00000000-0000-0000-0000-000000000210', 'Phase I Infrastructure', 'Phase I Clinical Unit (12-bed)', 1, true),
  ('00000000-0000-0000-0000-000000000210', 'Apheresis', 'Leukapheresis Machine (Spectra Optia)', 2, true),
  ('00000000-0000-0000-0000-000000000210', 'Cryostorage', '-80°C Biospecimen Freezer', 8, true),
  ('00000000-0000-0000-0000-000000000210', 'Imaging', '3T MRI (Philips Ingenia Ambition)', 3, true),
  ('00000000-0000-0000-0000-000000000210', 'Imaging', 'PET-CT (Philips Vereos)', 1, true),
  ('00000000-0000-0000-0000-000000000210', 'Infusion', 'Infusion Suite (20 chairs)', 1, true),
  ('00000000-0000-0000-0000-000000000210', 'Cell Therapy', 'FACT-Accredited Cell Therapy Laboratory', 1, true),
  -- Vall d'Hebron (large oncology volume)
  ('00000000-0000-0000-0000-000000000211', 'Phase I Infrastructure', 'Phase I Dose-Escalation Unit (8-bed)', 1, true),
  ('00000000-0000-0000-0000-000000000211', 'Imaging', '3T MRI (GE SIGNA Pioneer)', 2, true),
  ('00000000-0000-0000-0000-000000000211', 'Imaging', 'PET-CT (GE Discovery MI)', 1, true),
  ('00000000-0000-0000-0000-000000000211', 'Imaging', 'CT Scanner', 4, true),
  ('00000000-0000-0000-0000-000000000211', 'Infusion', 'Infusion Suite (25 chairs, HEPA-filtered)', 1, true),
  ('00000000-0000-0000-0000-000000000211', 'Cryostorage', '-80°C Biospecimen Freezer', 6, true),
  -- Gustave Roussy (Europe largest cancer center)
  ('00000000-0000-0000-0000-000000000212', 'Phase I Infrastructure', 'Phase I Unit (20-bed, 24h monitoring)', 1, true),
  ('00000000-0000-0000-0000-000000000212', 'Nuclear Medicine', 'On-Site Radiopharmacy with Cyclotron', 1, true),
  ('00000000-0000-0000-0000-000000000212', 'Apheresis', 'Leukapheresis Machine', 4, true),
  ('00000000-0000-0000-0000-000000000212', 'Cryostorage', '-80°C Biospecimen Freezer', 20, true),
  ('00000000-0000-0000-0000-000000000212', 'Cryostorage', 'Liquid Nitrogen Storage (-196°C)', 8, true),
  ('00000000-0000-0000-0000-000000000212', 'Imaging', '3T MRI', 4, true),
  ('00000000-0000-0000-0000-000000000212', 'Imaging', 'PET-CT', 3, true),
  ('00000000-0000-0000-0000-000000000212', 'Cell Therapy', 'GMP Cell Therapy Cleanroom (Class A)', 2, true),
  ('00000000-0000-0000-0000-000000000212', 'Infusion', 'Infusion Suite (50 chairs)', 1, true),
  ('00000000-0000-0000-0000-000000000212', 'Laboratory', 'Flow Cytometer (BD FACSLyric)', 5, true),
  -- Zurich (cardiology/neurology excellence)
  ('00000000-0000-0000-0000-000000000213', 'Imaging', '3T MRI (Siemens Prisma Fit)', 2, true),
  ('00000000-0000-0000-0000-000000000213', 'Imaging', 'CT Scanner (Siemens SOMATOM Definition AS+)', 2, true),
  ('00000000-0000-0000-0000-000000000213', 'Cardiac', 'Echocardiography (GE Vivid E95)', 4, true),
  ('00000000-0000-0000-0000-000000000213', 'Cardiac', 'Cardiac Catheterization Lab', 1, true),
  ('00000000-0000-0000-0000-000000000213', 'Cardiac', 'Cardiac MRI Suite', 1, true),
  ('00000000-0000-0000-0000-000000000213', 'Infusion', 'Infusion Suite (12 chairs)', 1, true),
  ('00000000-0000-0000-0000-000000000213', 'Cryostorage', '-80°C Biospecimen Freezer', 4, true);

-- ============================================================
-- CERTIFICATIONS
-- ============================================================
INSERT INTO public.certifications (clinic_id, certification_name, issued_by, valid_until) VALUES
  -- Rilski
  ('00000000-0000-0000-0000-000000000201', 'GCP ICH E6(R2)', 'ICH / BDA Bulgaria', '2027-03-01'),
  ('00000000-0000-0000-0000-000000000201', 'FACT Accreditation (Cell Therapy)', 'Foundation for the Accreditation of Cellular Therapy', '2027-06-01'),
  ('00000000-0000-0000-0000-000000000201', 'ISO 15189 Medical Laboratory', 'Bulgarian Accreditation Service', '2026-12-01'),
  -- Tokuda
  ('00000000-0000-0000-0000-000000000202', 'GCP ICH E6(R2)', 'ICH / BDA Bulgaria', '2027-01-01'),
  ('00000000-0000-0000-0000-000000000202', 'AAHRPP Accreditation', 'AAHRPP', '2028-01-01'),
  ('00000000-0000-0000-0000-000000000202', 'ISO 9001:2015 Quality Management', 'TÜV Rheinland', '2027-05-01'),
  -- St. George
  ('00000000-0000-0000-0000-000000000203', 'GCP ICH E6(R2)', 'ICH / BDA Bulgaria', '2026-09-01'),
  ('00000000-0000-0000-0000-000000000203', 'CAP Laboratory Accreditation', 'College of American Pathologists', '2027-03-01'),
  ('00000000-0000-0000-0000-000000000203', 'ISO 15189 Medical Laboratory', 'Bulgarian Accreditation Service', '2027-01-01'),
  -- MedStar
  ('00000000-0000-0000-0000-000000000204', 'GCP ICH E6(R2)', 'ICH / BDA Bulgaria', '2026-11-01'),
  ('00000000-0000-0000-0000-000000000204', 'Joint Commission International', 'Joint Commission International', '2027-08-01'),
  -- Acibadem
  ('00000000-0000-0000-0000-000000000205', 'GCP ICH E6(R2)', 'ICH / BDA Bulgaria', '2027-04-01'),
  ('00000000-0000-0000-0000-000000000205', 'AAHRPP Accreditation', 'AAHRPP', '2028-06-01'),
  ('00000000-0000-0000-0000-000000000205', 'JCI Hospital Accreditation', 'Joint Commission International', '2027-02-01'),
  -- MMA
  ('00000000-0000-0000-0000-000000000206', 'GCP ICH E6(R2)', 'ICH / BDA Bulgaria', '2026-07-01'),
  ('00000000-0000-0000-0000-000000000206', 'ISO 9001:2015 Quality Management', 'Bureau Veritas', '2027-03-01'),
  -- Vita
  ('00000000-0000-0000-0000-000000000207', 'GCP ICH E6(R2)', 'ICH / BDA Bulgaria', '2027-02-01'),
  -- Kirkovich
  ('00000000-0000-0000-0000-000000000208', 'GCP ICH E6(R2)', 'ICH / BDA Bulgaria', '2026-10-01'),
  ('00000000-0000-0000-0000-000000000208', 'ISO 9001:2015 Quality Management', 'TÜV SÜD', '2027-06-01'),
  -- Charité
  ('00000000-0000-0000-0000-000000000209', 'GCP ICH E6(R2)', 'EMA / BfArM Germany', '2027-11-01'),
  ('00000000-0000-0000-0000-000000000209', 'FACT Accreditation (Cell Therapy)', 'Foundation for the Accreditation of Cellular Therapy', '2027-09-01'),
  ('00000000-0000-0000-0000-000000000209', 'AAHRPP Accreditation', 'AAHRPP', '2028-03-01'),
  ('00000000-0000-0000-0000-000000000209', 'GMP Cell Therapy Manufacturing', 'Paul-Ehrlich-Institut', '2027-06-01'),
  ('00000000-0000-0000-0000-000000000209', 'ISO 15189 Medical Laboratory', 'DAkkS Germany', '2027-01-01'),
  -- Amsterdam UMC
  ('00000000-0000-0000-0000-000000000210', 'GCP ICH E6(R2)', 'EMA / CCMO Netherlands', '2027-08-01'),
  ('00000000-0000-0000-0000-000000000210', 'FACT Accreditation (Cell Therapy)', 'Foundation for the Accreditation of Cellular Therapy', '2027-12-01'),
  ('00000000-0000-0000-0000-000000000210', 'ISO 15189 Medical Laboratory', 'RvA Netherlands', '2027-04-01'),
  ('00000000-0000-0000-0000-000000000210', 'AAHRPP Accreditation', 'AAHRPP', '2028-09-01'),
  -- Vall d'Hebron
  ('00000000-0000-0000-0000-000000000211', 'GCP ICH E6(R2)', 'EMA / AEMPS Spain', '2027-07-01'),
  ('00000000-0000-0000-0000-000000000211', 'AAHRPP Accreditation', 'AAHRPP', '2028-02-01'),
  ('00000000-0000-0000-0000-000000000211', 'ISO 15189 Medical Laboratory', 'ENAC Spain', '2027-05-01'),
  -- Gustave Roussy
  ('00000000-0000-0000-0000-000000000212', 'GCP ICH E6(R2)', 'EMA / ANSM France', '2027-10-01'),
  ('00000000-0000-0000-0000-000000000212', 'FACT Accreditation (Cell Therapy)', 'Foundation for the Accreditation of Cellular Therapy', '2028-01-01'),
  ('00000000-0000-0000-0000-000000000212', 'GMP Cell and Gene Therapy Manufacturing', 'ANSM France', '2027-08-01'),
  ('00000000-0000-0000-0000-000000000212', 'AAHRPP Accreditation', 'AAHRPP', '2028-07-01'),
  ('00000000-0000-0000-0000-000000000212', 'Nuclear Medicine Accreditation', 'Société Française de Médecine Nucléaire', '2027-03-01'),
  -- Zurich
  ('00000000-0000-0000-0000-000000000213', 'GCP ICH E6(R2)', 'SwissMedic', '2027-09-01'),
  ('00000000-0000-0000-0000-000000000213', 'SwissMedic Site Certification', 'SwissMedic', '2028-01-01'),
  ('00000000-0000-0000-0000-000000000213', 'ISO 15189 Medical Laboratory', 'SAS Switzerland', '2027-06-01'),
  ('00000000-0000-0000-0000-000000000213', 'ISO 9001:2015 Quality Management', 'SGS Switzerland', '2027-11-01');

-- ============================================================
-- CLINIC AVAILABILITY
-- ============================================================
INSERT INTO public.clinic_availability (clinic_id, available_from, available_to, max_concurrent_trials, current_trial_count) VALUES
  ('00000000-0000-0000-0000-000000000201', '2026-06-01', '2029-06-01', 15, 8),
  ('00000000-0000-0000-0000-000000000202', '2026-05-01', '2029-05-01', 20, 12),
  ('00000000-0000-0000-0000-000000000203', '2026-07-01', '2029-07-01', 12, 6),
  ('00000000-0000-0000-0000-000000000204', '2026-06-01', '2028-12-01', 8, 4),
  ('00000000-0000-0000-0000-000000000205', '2026-05-01', '2029-05-01', 22, 15),
  ('00000000-0000-0000-0000-000000000206', '2026-08-01', '2029-08-01', 10, 5),
  ('00000000-0000-0000-0000-000000000207', '2026-06-01', '2028-06-01', 6, 3),
  ('00000000-0000-0000-0000-000000000208', '2026-07-01', '2029-07-01', 8, 4),
  ('00000000-0000-0000-0000-000000000209', '2026-05-01', '2030-05-01', 80, 45),
  ('00000000-0000-0000-0000-000000000210', '2026-06-01', '2030-06-01', 60, 38),
  ('00000000-0000-0000-0000-000000000211', '2026-05-01', '2030-05-01', 75, 52),
  ('00000000-0000-0000-0000-000000000212', '2026-05-01', '2030-12-01', 100, 68),
  ('00000000-0000-0000-0000-000000000213', '2026-06-01', '2029-12-01', 45, 28);
