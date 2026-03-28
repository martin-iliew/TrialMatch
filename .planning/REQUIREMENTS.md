# TrialMatch MVP Requirements

## R1: Domain Model
- **R1.1** Define `ClinicalTrial` entity with: title, description, phase, status, conditions targeted, eligibility criteria (age range, gender, location radius), sponsor, start/end dates
- **R1.2** Define `PatientProfile` entity linked to `User`: conditions, date of birth, gender, location (city/coordinates), medical history notes
- **R1.3** Define `TrialMatch` entity linking a patient profile to a trial with a match score and matched/unmatched criteria breakdown
- **R1.4** Define `Condition` entity (medical condition catalog) used by both trials and patient profiles

## R2: Trial Data & Seeding
- **R2.1** Seed database with 15-20 realistic clinical trials across various conditions (diabetes, hypertension, asthma, oncology, cardiology, etc.)
- **R2.2** Seed a condition catalog (ICD-style simplified list)
- **R2.3** Trials must have varied eligibility criteria to demonstrate meaningful matching

## R3: Patient Profile
- **R3.1** Authenticated user can create/update their patient profile
- **R3.2** Profile form captures: conditions (multi-select from catalog), date of birth, gender, location
- **R3.3** Profile data persists and is editable
- **R3.4** Backend validates profile completeness before matching

## R4: Trial Browsing
- **R4.1** List all active clinical trials with pagination
- **R4.2** Filter trials by condition, phase, and status
- **R4.3** Search trials by keyword (title/description)
- **R4.4** View full trial details on a dedicated page

## R5: Matching Engine
- **R5.1** Match algorithm compares patient profile against trial eligibility criteria
- **R5.2** Scoring: percentage-based match (matched criteria / total criteria)
- **R5.3** Breakdown shows which criteria matched and which didn't
- **R5.4** Endpoint returns matched trials sorted by score (descending)
- **R5.5** Only match against active/recruiting trials

## R6: Match Results UI
- **R6.1** Dashboard page shows top matches for the logged-in user
- **R6.2** Each match card shows: trial title, match percentage, key matched/unmatched criteria
- **R6.3** Click through to full trial detail from match results
- **R6.4** Empty state when no profile exists prompts user to create one

## R7: Shared Contracts
- **R7.1** Add trial-related API types to `shared/api-types`
- **R7.2** Add trial endpoint routes to `shared/constants`
- **R7.3** Add trial service wrappers to `shared/services`
