# TrialMatch MVP Roadmap

## Phase 1: Domain & Persistence
**Goal**: Define entities, DB schema, and seed trial data

### Tasks
- [ ] 1.1 Create `Condition` entity in Domain (id, name, category)
- [ ] 1.2 Create `ClinicalTrial` entity in Domain (title, description, phase, status, sponsor, start/end dates, min/max age, gender, location, radius)
- [ ] 1.3 Create `TrialCondition` join entity linking trials to conditions
- [ ] 1.4 Create `PatientProfile` entity in Domain (userId, dateOfBirth, gender, city, latitude, longitude, medicalNotes)
- [ ] 1.5 Create `PatientCondition` join entity linking patient profiles to conditions
- [ ] 1.6 Add repository interfaces: `ITrialRepository`, `IConditionRepository`, `IPatientProfileRepository`
- [ ] 1.7 Add EF Core configurations for all new entities
- [ ] 1.8 Implement repositories in Infrastructure
- [ ] 1.9 Create and run EF migration
- [ ] 1.10 Build seed data: condition catalog (~30 conditions)
- [ ] 1.11 Build seed data: 15-20 clinical trials with varied eligibility

**Covers**: R1, R2

---

## Phase 2: Backend Use Cases
**Goal**: Implement all API endpoints for profiles, trials, and matching

### Tasks
- [ ] 2.1 Create `GetTrialsQuery` (list with pagination, filtering by condition/phase/status, keyword search)
- [ ] 2.2 Create `GetTrialByIdQuery` (single trial with conditions)
- [ ] 2.3 Create `CreatePatientProfileCommand` (validate + persist profile)
- [ ] 2.4 Create `UpdatePatientProfileCommand` (update existing profile)
- [ ] 2.5 Create `GetPatientProfileQuery` (fetch current user's profile)
- [ ] 2.6 Create `GetConditionsQuery` (list all conditions for multi-select)
- [ ] 2.7 Create `GetMatchesQuery` -- the matching engine:
  - Compare patient conditions vs trial conditions
  - Check age eligibility
  - Check gender eligibility
  - Compute match score as percentage
  - Return sorted results with criteria breakdown
- [ ] 2.8 Add request DTOs and validators for all commands
- [ ] 2.9 Add response DTOs for trials, profiles, matches, conditions
- [ ] 2.10 Create `TrialsController` with endpoints: GET /api/trials, GET /api/trials/{id}
- [ ] 2.11 Create `ProfileController` with endpoints: GET/POST/PUT /api/profile
- [ ] 2.12 Create `MatchesController` with endpoint: GET /api/matches
- [ ] 2.13 Create `ConditionsController` with endpoint: GET /api/conditions
- [ ] 2.14 Register all new services in DI

**Covers**: R3 (backend), R4 (backend), R5

---

## Phase 3: Shared Contracts
**Goal**: Add TypeScript types, routes, and services for the new endpoints

### Tasks
- [ ] 3.1 Add trial-related types to `shared/api-types` (Trial, Condition, PatientProfile, MatchResult)
- [ ] 3.2 Add endpoint routes to `shared/constants` (/api/trials, /api/profile, /api/matches, /api/conditions)
- [ ] 3.3 Add `trialService` to `shared/services` (getTrials, getTrialById, getConditions)
- [ ] 3.4 Add `profileService` to `shared/services` (getProfile, createProfile, updateProfile)
- [ ] 3.5 Add `matchService` to `shared/services` (getMatches)

**Covers**: R7

---

## Phase 4: Web -- Patient Profile
**Goal**: Build the patient profile creation/edit form

### Tasks
- [ ] 4.1 Create profile page at `/profile`
- [ ] 4.2 Build profile form with React Hook Form + Zod validation
- [ ] 4.3 Condition multi-select component (fetches from /api/conditions)
- [ ] 4.4 Date of birth, gender, and location fields
- [ ] 4.5 React Query mutations for create/update profile
- [ ] 4.6 Show success/error feedback
- [ ] 4.7 Add profile link to navigation/layout

**Covers**: R3 (frontend)

---

## Phase 5: Web -- Trial Browsing
**Goal**: Build trial listing and detail pages

### Tasks
- [ ] 5.1 Create trials listing page at `/trials`
- [ ] 5.2 Trial card component showing title, phase, status, conditions, age range
- [ ] 5.3 Filter bar: condition dropdown, phase selector, status toggle
- [ ] 5.4 Keyword search input
- [ ] 5.5 Pagination controls
- [ ] 5.6 Create trial detail page at `/trials/:id`
- [ ] 5.7 Detail page shows full trial info, eligibility criteria, conditions
- [ ] 5.8 Add trials link to navigation

**Covers**: R4 (frontend)

---

## Phase 6: Web -- Match Dashboard
**Goal**: Build the match results dashboard -- the core demo screen

### Tasks
- [ ] 6.1 Create dashboard/matches page at `/dashboard`
- [ ] 6.2 React Query hook to fetch matches from /api/matches
- [ ] 6.3 Match card component: trial title, match percentage (visual bar/ring), matched/unmatched criteria badges
- [ ] 6.4 Sort by match score (default), allow toggle
- [ ] 6.5 Click-through to trial detail from match card
- [ ] 6.6 Empty state: no profile yet -> prompt to create one
- [ ] 6.7 Empty state: no matches -> informational message
- [ ] 6.8 Make dashboard the default authenticated landing page

**Covers**: R6

---

## Phase 7: Polish & Demo Prep
**Goal**: Final integration, visual polish, demo readiness

### Tasks
- [ ] 7.1 End-to-end flow test: register -> profile -> browse -> matches -> detail
- [ ] 7.2 Navigation refinement (active states, breadcrumbs)
- [ ] 7.3 Loading states and skeleton screens
- [ ] 7.4 Error handling for API failures
- [ ] 7.5 Responsive layout check
- [ ] 7.6 Demo seed data validation (realistic and diverse)
