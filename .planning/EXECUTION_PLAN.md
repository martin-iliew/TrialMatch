# TrialMatch — 7–8 Hour Execution Plan

**Team**: 3 people — 1 UI/UX dev, 2 backend devs (full-stack capable)
**Target**: Live URL on Vercel + Supabase cloud
**Strategy**: Wave-based parallel execution — 4 time-boxed waves with concrete exit criteria

---

## Ownership Lanes

| Lane | Person | Owns |
|------|--------|------|
| **DB** | Backend Dev 1 | Schema, Supabase setup/cloud, auth middleware, matching algorithm |
| **Logic** | Backend Dev 2 | Seed data, Server Actions, all data layer for features |
| **UI** | UI Dev | All pages, components, forms, design system |

---

## Wave 1 — Foundation (Hours 0–1.5)

**Exit criterion: Types file committed to repo + Vercel skeleton live at URL**

> DB Dev starts schema the moment everyone sits down. No distractions until `supabase gen types` is done.

### DB Dev
- [ ] Create Supabase cloud project (supabase.com dashboard)
- [ ] `cd web && npx supabase init && npx supabase link --project-ref <ref>`
- [ ] Write `supabase/schema.sql` — all 11 tables (profiles, therapeutic_areas, clinics, clinic_specializations, equipment, certifications, clinic_availability, trial_projects, trial_requirements, match_results, partnership_inquiries, contact_inquiries)
- [ ] `npx supabase db push` → cloud
- [ ] `npx supabase gen types typescript --linked > types/supabase.ts`
- [ ] Push types to repo so Logic Dev and UI Dev can import them
- [ ] Deploy skeleton to Vercel (connect repo, add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars) — validates pipeline early

### Logic Dev
- [ ] `npm install @supabase/ssr @supabase/supabase-js react-hook-form @hookform/resolvers zod @tanstack/react-query sonner`
- [ ] Create `lib/supabase/client.ts` (browser client — `createBrowserClient`)
- [ ] Create `lib/supabase/server.ts` (server client — `createServerClient`)
- [ ] Write `supabase/seed.sql`:
  - 15 therapeutic areas (Oncology, Cardiology, Neurology, Endocrinology, Pulmonology, Rheumatology, Gastroenterology, Dermatology, Psychiatry, Ophthalmology, Immunology, Infectious Disease, Orthopedics, Hematology, Nephrology)
  - **8–10 clinics** with meaningfully distinct profiles across Sofia, Plovdiv, Varna, Burgas, Stara Zagora — vary specializations, equipment, capacity, certs
  - 3 sample trial projects with varied requirements (one easy match, one hard, one medium)
  - 2 sponsor demo accounts + 3 clinic_admin demo accounts via `auth.users` + `profiles`
- [ ] Apply seed after schema push: `npx supabase db push` reruns seed

### UI Dev
- [ ] `npx shadcn add dialog select form tabs label textarea separator` (button/card/badge/input/alert already exist)
- [ ] Add `sonner` toast to root layout
- [ ] Wire `QueryClientProvider` + `<Toaster />` into `app/layout.tsx`
- [ ] Build `components/layout/Navbar.tsx` — role-aware nav links + logout button
- [ ] Start `app/page.tsx` landing hero section (structure only, content fills Wave 3)

---

## Wave 2 — Auth + Core Structure (Hours 1.5–3.5)

**Exit criterion: Can register as Sponsor and ClinicAdmin, log in as either, middleware redirects correctly**

### DB Dev
- [ ] `web/middleware.ts` — session check via `createServerClient`, role-based redirect:
  - No session → `/login`
  - `sponsor` role on `/clinic/*` → `/sponsor/projects`
  - `clinic_admin` role on `/sponsor/*` → `/clinic/profile`
  - Unprotected routes: `/`, `/clinics`, `/contact`, `/(auth)/*`
- [ ] `app/(auth)/login/page.tsx` — wire form to `supabase.auth.signInWithPassword`, redirect to role home on success
- [ ] `app/(auth)/register/page.tsx` — wire form to `supabase.auth.signUp` + `INSERT INTO profiles (id, role, first_name, last_name)`, redirect to role home
- [ ] Test both flows against live Supabase cloud

### Logic Dev
- [ ] `features/clinic-profile/actions.ts` — Server Actions:
  - `upsertClinic(data)` — insert/update `clinics` row for `auth.uid()`
  - `upsertSpecializations(clinicId, areaIds)` — replace `clinic_specializations`
  - `addEquipment(data)` / `updateEquipment(id, data)` / `deleteEquipment(id)`
  - `addCertification(data)` / `deleteCertification(id)`
  - `upsertAvailability(data)`
- [ ] `app/(clinic)/profile/page.tsx` — Server Component: load clinic + equipment + certs + availability for `auth.uid()`

### UI Dev
- [ ] `app/(auth)/login/page.tsx` — `AuthFormShell` + RHF/Zod form (email, password)
- [ ] `app/(auth)/register/page.tsx` — `AuthFormShell` + RHF/Zod form (first name, last name, email, password, role picker toggle)
- [ ] `app/(clinic)/profile/page.tsx` — 3-tab layout:
  - **Profile tab**: clinic name, city, address, description, contact email, phone, website + specializations multi-select
  - **Equipment tab**: equipment list rows + add equipment inline form (free-text type, name, quantity, availability toggle)
  - **Certs & Availability tab**: cert list + add cert form, availability date range + capacity fields
- [ ] Landing page how-it-works section (3-step: Create Trial → Run Match → Connect) + dual CTA buttons

---

## Wave 3 — Features (Hours 3.5–6)

**Exit criterion: Sponsor can create project → run match → view results → send inquiry. Clinic can accept/decline.**

### DB Dev
- [ ] `app/api/match/route.ts` — POST endpoint, takes `{ trial_project_id }`:
  1. Load trial project + all requirements from DB
  2. Load all clinics with specializations, equipment, certifications, availability
  3. **Hard filter**: exclude any clinic missing a `Required` criterion
  4. **Score remaining clinics** (0–100):
     - Therapeutic area match: **30 pts** — clinic has matching specialization
     - Equipment match: **25 pts** — % of Preferred equipment requirements met
     - Certification compliance: **20 pts** — % of cert requirements met
     - Capacity/availability: **15 pts** — availability overlaps trial dates + has capacity
     - Geographic match: **10 pts** — clinic city matches `geographic_preference`
  5. Delete existing `match_results` for this project, insert new ranked rows with `breakdown` JSONB
  6. Update `trial_projects.status` to `searching` (or `draft` if zero results)
  7. Return ranked results
- [ ] `features/trial-project/actions.ts`:
  - `createTrialProject(data)` — insert `trial_projects` with status=draft
  - `updateTrialProject(id, data)` — only allowed when status=draft
  - `addRequirement(data)` / `deleteRequirement(id)`

### Logic Dev
- [ ] `features/inquiries/actions.ts`:
  - `sendInquiry({ matchResultId, message, notes })` — insert `partnership_inquiries` status=pending, update `match_results.status` to inquiry_sent
  - `acceptInquiry(id, message?)` — update status=accepted
  - `declineInquiry(id, reason)` — update status=declined, reason required
- [ ] `app/(clinic)/inquiries/page.tsx` — Server Component: load all inquiries for clinic with trial + sponsor info
- [ ] `app/(clinic)/inquiries/[id]/page.tsx` — full inquiry detail + accept/decline forms
- [ ] `app/(sponsor)/projects/[id]/matches/page.tsx` — Server Component: load match results with clinic data + existing inquiry status for each
- [ ] `app/clinics/page.tsx` — public browse: load all clinics, show name/city/top 3 specializations only
- [ ] `app/contact/page.tsx` + Server Action — insert `contact_inquiries`, show success message

### UI Dev
- [ ] `app/(sponsor)/projects/page.tsx` — project list cards with status badge, "New Trial Project" button
- [ ] `app/(sponsor)/projects/new/page.tsx` — creation form: title, description, therapeutic area select, phase select, patient count, start/end dates, geographic preference
- [ ] `app/(sponsor)/projects/[id]/page.tsx` — project detail:
  - Requirements list (type badge, value, priority badge) + "Add Requirement" form
  - "Find Matching Clinics" button → POST `/api/match` → redirect to matches page
  - Inquiry status section (clinic name, date, status badge, response message/decline reason)
- [ ] `app/(sponsor)/projects/[id]/matches/page.tsx` — ranked clinic cards:
  - Overall score badge (0–100)
  - Per-dimension score bars (5 rows, color-coded: green ≥70, yellow ≥40, red <40)
  - "Send Inquiry" button OR non-interactive status badge if inquiry exists
- [ ] Clinic profile preview `<Dialog>` — full clinic detail (equipment, certs, availability)
- [ ] Inquiry compose `<Dialog>` — message (required), notes (optional); pre-fills timeline + patient count read-only

---

## Wave 4 — Integration + Deploy (Hours 6–8)

**Exit criterion: Full demo story works on live URL start-to-finish without errors**

### DB Dev
- [ ] Confirm Vercel env vars set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Run `next build` locally — fix all TypeScript/build errors before pushing
- [ ] Run full sponsor E2E on live URL: register → create project → add requirements → run match → send inquiry
- [ ] Fix any production-only runtime errors

### Logic Dev
- [ ] Run matching algorithm against all 3 seed trial projects — confirm results are varied (different clinics rank #1 for different trials)
- [ ] Validate seed data completeness: every demo account logs in, every clinic has equipment + at least 1 cert
- [ ] Test clinic E2E on live URL: log in → complete profile → check inbox → accept inquiry

### UI Dev
- [ ] Suspense + skeleton loaders on all Server Component pages (project list, match results, inquiry inbox)
- [ ] Empty states: zero match results ("No clinics meet your required criteria"), empty project list, empty inquiry inbox
- [ ] Toast notifications: inquiry sent, profile saved, requirement added, inquiry accepted/declined
- [ ] Responsive check on all 14 screens — fix obvious mobile layout breaks

---

## Cut Priority

If Wave 3 runs long, cut in this order. **Never cut the demo story.**

| Order | Cut | Keep |
|-------|-----|------|
| First | Edit project (just create new), public clinic browse `/clinics`, contact form | Auth, matching, inquiry flow |
| Second | Profile completion indicator, score color coding | Score numbers + breakdown visible |
| Last | Toast notifications, skeleton loaders | Core E2E flow on live URL |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Schema takes >1.5h | Delays everything | DB Dev on schema only in Wave 1 — zero distractions |
| Vercel build fails on env vars | Demo URL broken | Deploy skeleton in Wave 1 to validate pipeline before features exist |
| Type mismatch after seed applied | Runtime errors | Regenerate types after seed is applied, not before |
| Matching produces all-same scores | Unconvincing demo | Distinct seed clinics; Logic Dev validates manually in Wave 4 |
| Someone blocked mid-wave | Wasted time | Each dev has a backlog of polish tasks to fill gaps |

---

## Demo Story (must work end-to-end)

1. **Sponsor** registers → creates trial project (e.g. Phase 2 Oncology, Sofia, requires MRI + GCP cert) → adds requirements → clicks "Find Matching Clinics"
2. Ranked results appear → Sponsor opens clinic profile modal → clicks "Send Inquiry" → writes message → sends
3. **Clinic Admin** logs in → sees inquiry in inbox → opens detail → clicks "Accept" → adds message
4. Sponsor goes back to project page → sees "Accepted" badge + clinic's message

---

## Commit Convention

- Format: `type(scope): description` — e.g. `feat(auth): add register page with role picker`
- Types: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`
- Atomic: one logical change per commit
- No AI attribution in commit messages
