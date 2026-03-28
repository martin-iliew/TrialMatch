-- ============================================================
-- Seed Integrity Assertions
-- Run against the cloud Supabase project after seeding.
-- Every query must return 0 rows for the seed to be valid.
-- ============================================================

-- 1. Clinics missing certifications
SELECT c.id, c.name, 'missing certifications' AS issue
FROM clinics c
LEFT JOIN certifications cert ON cert.clinic_id = c.id
WHERE cert.id IS NULL;

-- 2. Clinics missing equipment
SELECT c.id, c.name, 'missing equipment' AS issue
FROM clinics c
LEFT JOIN equipment e ON e.clinic_id = c.id
WHERE e.id IS NULL;

-- 3. Clinics missing specializations
SELECT c.id, c.name, 'missing specializations' AS issue
FROM clinics c
LEFT JOIN clinic_specializations cs ON cs.clinic_id = c.id
WHERE cs.clinic_id IS NULL;

-- 4. Match result variation broken (all rank-1 results point to same clinic)
-- Run AFTER executing /api/match for all 3 seed trial projects.
SELECT 'broken_match_variation' AS issue, COUNT(DISTINCT top.clinic_id) AS unique_winners
FROM (
  SELECT DISTINCT ON (trial_project_id)
    trial_project_id,
    clinic_id
  FROM match_results
  ORDER BY trial_project_id, score DESC
) top
HAVING COUNT(DISTINCT top.clinic_id) = 1
  AND (SELECT COUNT(*) FROM trial_projects) >= 3;

-- 5. Demo accounts with wrong or missing role
SELECT id, role, 'wrong or missing role' AS issue
FROM profiles
WHERE role IS NULL OR role NOT IN ('sponsor', 'clinic_admin');
