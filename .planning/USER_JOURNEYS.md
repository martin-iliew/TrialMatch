# TrialMatch — User Journeys & Application Flows

**Core Functionalities | Hackathon MVP | Final Version**

March 2026

*Three user types: Visitor, Sponsor/CRO, Clinic Admin | Next.js 15 + Supabase*

---

## Table of Contents

1. User Roles Overview
2. Visitor Journeys (Not Logged In)
   - 2.1 Browse Registered Clinics
   - 2.2 View Landing Page
   - 2.3 Contact Form (Lead Capture)
3. Sponsor/CRO Journeys (Logged In)
   - 3.1 Create a Trial Project
   - 3.2 Add Requirements to a Trial Project
   - 3.3 Run the Matching Algorithm
   - 3.4 View Match Results
   - 3.5 Send a Partnership Inquiry
   - 3.6 Track Inquiry Status
4. Clinic Admin Journeys (Logged In)
   - 4.1 Register & Complete Clinic Profile
   - 4.2 Manage Equipment Inventory
   - 4.3 Manage Certifications & Availability
   - 4.4 View & Respond to Incoming Inquiries
5. Screen Inventory
6. Hackathon Build Plan

---

## 1. User Roles Overview

| Role | Primary Goal | Core Actions |
|------|-------------|--------------|
| **Visitor** | Discover the platform, browse registered clinics, express interest | View landing page · Browse clinic list · Submit contact form |
| **Sponsor/CRO** | Find the best-fit clinics for a clinical trial and initiate outreach | Create trial project · Add requirements · Run matching · View ranked results · Send inquiries · Track status |
| **Clinic Admin** | Be discoverable by sponsors, manage their profile, and respond to incoming inquiries | Register clinic profile · Manage equipment/certs/availability · View and respond to inquiries |

---

## 2. Visitor Journeys (Not Logged In)

### 2.1 Browse Registered Clinics

Any visitor can browse the clinic network without an account.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Public Clinic List | Visitor navigates to `/clinics` | Display cards for all registered clinics showing: name, city, top 3 specializations |
| 2 | Public Clinic List | Visitor browses the list | No filtering or search required for MVP |
| 3 | Public Clinic List | Visitor clicks a clinic card | Show limited profile view: name, city, address, specializations. Equipment and availability are hidden (visible only to logged-in sponsors) |
| 4 | Public Clinic List | Visitor clicks "Get in Touch" in the navbar or page footer | Navigate to `/contact` |

*Preconditions: None. Postconditions: None — read-only public view.*

### 2.2 View Landing Page

The landing page explains the service to first-time visitors.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Landing (`/`) | Visitor opens TrialMatch | Display value proposition, how-it-works steps, and dual call-to-action: "Join as Sponsor" and "Register Your Clinic" |
| 2 | Landing | Visitor clicks "Join as Sponsor" or "Register Your Clinic" | Navigate to `/register` with the relevant role pre-selected |

*Preconditions: None.*

### 2.3 Contact Form (Lead Capture)

A non-logged-in visitor expresses interest in the platform.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Landing or Clinic List | Visitor clicks "Get in Touch" | Navigate to `/contact` or open contact form |
| 2 | Contact Form | Visitor fills in: Name, Email, Organization Type (Clinic / Sponsor / Other), Message | Basic validation: name required, email format, message required |
| 3 | Contact Form | Visitor submits | Record stored as `contact_inquiries`. Success message: "Thank you — we'll be in touch." No tracking available to the visitor. |

*Preconditions: None. Postconditions: `contact_inquiries` row created.*

---

## 3. Sponsor/CRO Journeys (Logged In)

### 3.1 Create a Trial Project

The sponsor creates a trial project describing the study they need to place at clinics.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | My Projects (`/sponsor/projects`) | Sponsor clicks "New Trial Project" | Navigate to trial project creation form |
| 2 | Project Form | Sponsor fills in: title, description, therapeutic area (select from catalog), phase (Phase 1–4), required patient count, start date, end date, geographic preference (city/region text) | Form validates with Zod: title required, therapeutic area required, dates required |
| 3 | Project Form | Sponsor clicks "Create Project" | Project saved to `trial_projects` with status = Draft. Redirect to project detail page. |
| 4 | Project Detail | Sponsor wants to correct information on a Draft project | Sponsor clicks "Edit Project" to return to the pre-filled creation form. Projects in Searching status are read-only for MVP — editing is not available once matching has been run. |

*Preconditions: Sponsor logged in. Postconditions: `trial_projects` row created with status=Draft.*

### 3.2 Add Requirements to a Trial Project

The sponsor defines what a clinic must have in order to run this trial.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Project Detail | Sponsor clicks "Add Requirement" | Open requirement form |
| 2 | Requirement Form | Sponsor selects: type (Equipment / Certification / Specialization / Capacity), description/value, priority (Required / Preferred / NiceToHave) | Form validates: type and value required |
| 3 | Requirement Form | Sponsor saves requirement | Requirement added to `trial_requirements`. Shown in the requirements list on the project detail page. |
| 4 | Project Detail | Sponsor adds multiple requirements as needed | Each requirement appears as a row with type, value, and priority badge |

*Preconditions: Trial project exists with status=Draft. Postconditions: `trial_requirements` rows created.*

### 3.3 Run the Matching Algorithm

The sponsor triggers matching to find ranked clinics for their trial.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Project Detail | Sponsor clicks "Find Matching Clinics" | POST to `/api/match` with `trial_project_id`. If the project already has previous match results, they are deleted and replaced with the new run. |
| 2 | Loading | System processes the match | Hard filter: exclude clinics missing any Required criterion. Score remaining clinics across 5 dimensions. Persist results to `match_results`. |
| 3 | Match Results (happy path) | Redirect to match results page | Show ranked list of clinics with overall score and per-dimension breakdown. Trial project status updated to Searching. |
| 4 | Match Results (zero results) | No clinics pass the hard filter | Display empty state: "No clinics currently meet your required criteria. Consider relaxing your requirements." with a link back to edit requirements. Trial project status remains Draft. |

*Preconditions: Trial project has at least one requirement. At least one clinic is registered. Postconditions: `match_results` rows created (previous results for this project replaced). Trial project status = Searching on success, Draft on zero results.*

> **MVP Status Machine:** `trial_projects.status` supports `Draft → Searching` only. Further states (Active, Closed, Completed) are post-MVP.

### 3.4 View Match Results

The sponsor reviews ranked clinics and their compatibility breakdown.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Match Results (`/sponsor/projects/:id/matches`) | Sponsor views the results page | Display ranked clinic cards: overall score (0–100), score breakdown bars (therapeutic area, equipment, certifications, capacity, geography), clinic name and city |
| 2 | Match Results | Sponsor clicks on a clinic card | Open clinic profile preview modal (rendered within `/sponsor/projects/:id/matches`): full profile, equipment, certifications, availability |
| 3 | Match Results | Sponsor reviews breakdown | Color-coded scoring: green (strong match), yellow (partial), red (not met) |

*Preconditions: Matching has been run. Postconditions: None — read-only view.*

### 3.5 Send a Partnership Inquiry

The sponsor contacts a matched clinic to express interest.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Match Results | Sponsor views a clinic card they have not yet contacted | "Send Inquiry" button is active |
| 2 | Match Results | Sponsor views a clinic card they have already contacted | "Send Inquiry" button is replaced by a non-interactive status badge showing the current inquiry state (e.g., "Inquiry Sent — Pending", "Accepted", "Declined") |
| 3 | Match Results | Sponsor clicks "Send Inquiry" on an eligible clinic | Open inquiry compose form |
| 4 | Inquiry Form | Sponsor writes a message to the clinic. Also includes: proposed timeline (pre-filled from trial dates), required patient count (pre-filled, read-only), and a free-text notes field. | Message field required. Trial name pre-filled (read-only). |
| 5 | Inquiry Form | Sponsor clicks "Send" | Inquiry saved to `partnership_inquiries` with status=Pending. Match result status updated to InquirySent. Toast notification shown: "Inquiry sent to [Clinic Name]." Sponsor remains on the match results page. |

*Preconditions: Match results exist. Clinic not already contacted for this trial. Postconditions: `partnership_inquiries` row created with status=Pending.*

### 3.6 Track Inquiry Status

The sponsor monitors the status of all outreach for a trial project.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Project Detail | Sponsor navigates to their project | Inquiry status section shows all sent inquiries: clinic name, sent date, status badge (Pending / Accepted / Declined) |
| 2 | Project Detail | Clinic has accepted an inquiry | Badge updates to Accepted (green). If the clinic included an acceptance message, it is shown below the badge. |
| 3 | Project Detail | Clinic has declined an inquiry | Badge updates to Declined (red). The clinic's required decline reason is shown below the badge. |

*Preconditions: At least one inquiry has been sent. Postconditions: None — read-only view.*

---

## 4. Clinic Admin Journeys (Logged In)

### 4.1 Register & Complete Clinic Profile

The clinic admin creates their clinic's profile so it is discoverable by sponsors.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Clinic Dashboard (`/clinic/profile`) | Clinic admin logs in for the first time | If no clinic profile exists: show empty setup form with completion indicator. If profile exists: show pre-filled form. |
| 2 | Profile Form | Admin fills in: clinic name, city, address, description, contact email, contact phone, website | Form validates: name, city, contact email required |
| 3 | Specializations | Admin selects therapeutic areas from multi-select (loaded from `therapeutic_areas` catalog) | Multi-select with search. At least one required. |
| 4 | Profile Form | Admin clicks "Save Profile" | Profile saved to `clinics` + `clinic_specializations`. Profile completion indicator updates. |

*Preconditions: Clinic admin logged in. Postconditions: `clinics` row created/updated, `clinic_specializations` rows updated.*

### 4.2 Manage Equipment Inventory

The clinic admin lists the equipment their clinic has available.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Clinic Dashboard → Equipment tab | Admin navigates to Equipment | Shows current equipment list. "Add Equipment" button visible. |
| 2 | Add Equipment | Admin clicks "Add Equipment" | Inline form: equipment type (free-text for MVP — no separate catalog table required), name, quantity, availability toggle |
| 3 | Add Equipment | Admin fills form and saves | Row added to `equipment` table. Appears in list. |
| 4 | Equipment List | Admin toggles availability on an item | `is_available` updated inline. |
| 5 | Equipment List | Admin removes an item | Row deleted from `equipment`. |

*Preconditions: Clinic profile exists. Postconditions: `equipment` rows created/updated/deleted.*

> **MVP Note:** Equipment type is a free-text field. No `equipment_types` catalog table is required for MVP. Consistent naming across seed data is enforced manually.

### 4.3 Manage Certifications & Availability

The clinic admin adds their certifications and sets their trial capacity.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Clinic Dashboard → Certifications tab | Admin adds a certification: name (e.g., GCP), issued by, valid until | Saved to `certifications` table |
| 2 | Clinic Dashboard → Certifications tab | Admin removes a certification | Row deleted |
| 3 | Clinic Dashboard → Availability tab | Admin sets: available from/to dates, max concurrent trials, current trial count | Saved to `clinic_availability`. Used by matching algorithm for capacity scoring. |

*Preconditions: Clinic profile exists. Postconditions: `certifications` and `clinic_availability` rows updated.*

### 4.4 View & Respond to Incoming Inquiries

The clinic admin reviews partnership requests from sponsors and responds.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Clinic Inbox (`/clinic/inquiries`) | Clinic admin navigates to inbox | List of all incoming inquiries: sponsor name, trial name, trial therapeutic area, sent date, status badge (Pending / Accepted / Declined) |
| 2 | Inquiry Detail | Admin clicks an inquiry | Full detail: trial project info (title, description, phase, requirements, proposed timeline, required patient count), sponsor message and free-text notes |
| 3a | Inquiry Detail | Admin clicks "Accept" | Optional acceptance message field. On confirm: inquiry status → Accepted. Sponsor sees Accepted badge and acceptance message (if provided) on their project page. |
| 3b | Inquiry Detail | Admin clicks "Decline" | Required reason field (cannot submit blank). On confirm: inquiry status → Declined. Sponsor sees Declined badge and the reason on their project page. |

*Preconditions: Clinic admin logged in. At least one inquiry exists. Postconditions: `partnership_inquiries.status` updated to Accepted or Declined.*

---

## 5. Screen Inventory

| Role | Screen | Route | Key Components | Roadmap Phase |
|------|--------|-------|---------------|---------------|
| Public | Landing | `/` | Value prop, how-it-works, dual CTA | Phase 7 |
| Public | Clinic Browse | `/clinics` | Clinic cards (name, city, specializations), "Get in Touch" in navbar/footer | Phase 7 |
| Public | Contact Form | `/contact` | Name, email, org type, message | Phase 7 |
| Auth | Register | `/register` | Email, password, name, role picker (Sponsor / Clinic Admin) | Phase 2 |
| Auth | Login | `/login` | Email, password | Phase 2 |
| Sponsor | My Projects | `/sponsor/projects` | Project list with status badges, "New Project" button | Phase 4 |
| Sponsor | Project Detail | `/sponsor/projects/:id` | Requirements list, match status, inquiry status list with response messages | Phase 4 |
| Sponsor | Match Results | `/sponsor/projects/:id/matches` | Ranked clinic cards, score breakdown, "Send Inquiry" button or status badge | Phase 6 |
| Sponsor | Clinic Profile Modal | *(modal on `/sponsor/projects/:id/matches`)* | Full clinic detail, equipment, certs, availability | Phase 6 |
| Clinic | Clinic Profile | `/clinic/profile` | Profile form, specializations multi-select, completion indicator | Phase 3 |
| Clinic | Equipment Tab | `/clinic/profile` (tab) | Equipment list, add/remove/toggle availability, free-text equipment type | Phase 3 |
| Clinic | Certifications & Availability Tab | `/clinic/profile` (tab) | Cert list, availability date range + capacity | Phase 3 |
| Clinic | Inquiry Inbox | `/clinic/inquiries` | Inquiry list with status badges | Phase 6 |
| Clinic | Inquiry Detail | `/clinic/inquiries/:id` | Trial + sponsor info (including timeline and patient count), accept/decline actions | Phase 6 |

**Total: 14 screens (3 public, 2 auth, 5 sponsor, 4 clinic). Includes 1 modal (clinic profile preview).**

---

## 6. Hackathon Build Plan

Aligned with ROADMAP.md phases. The demo story: a sponsor creates a trial, runs matching, finds a clinic, sends an inquiry, and the clinic accepts.

### Phase 1: DB Schema + Seed (~4 hours)
1. Define all tables in `supabase/schema.sql`
2. Seed `therapeutic_areas` catalog and demo accounts
3. Seed **8–10 clinics with meaningfully distinct profiles** (mix of urban/rural, oncology specialists vs. generalists, high-capacity vs. boutique) to ensure matching produces varied, non-obvious results
4. Seed 2–3 sample trial projects with different requirement sets
5. Apply via `npx supabase db reset`
6. Generate TypeScript types

> **Note:** Equipment type is free-text for MVP — no `equipment_types` catalog table needed. Enforce consistent naming in seed data manually.

### Phase 2: Auth & Role-Based Routing (~2 hours)
1. Register page with role picker (Sponsor / Clinic Admin)
2. Login page
3. Middleware for route protection by role
4. Role-aware navbar (include "Get in Touch" link visible to all)

### Phase 2.5: Landing Page Skeleton (~1 hour)
1. Hero section with EUR 8M/day stat prominently displayed
2. Dual CTA: "Join as Sponsor" / "Register Your Clinic"
3. Basic how-it-works outline (can be fleshed out in Phase 7)

> **Why here:** Judges and evaluators may open the URL cold before the full demo. A bare-bones landing page ensures there is always a coherent entry point, even if Phase 7 polish is cut due to time pressure.

### Phase 3: Clinic Profile Management (~3 hours)
1. Clinic profile form with specializations (multi-select from `therapeutic_areas`)
2. Equipment management tab (free-text type, name, quantity, availability toggle)
3. Certifications and availability tab

### Phase 4: Trial Project Management (~3 hours)
1. Trial project creation form
2. Edit flow for Draft projects (reuses creation form, pre-filled)
3. Requirements builder (type, value, priority)
4. My projects list + project detail page (includes inquiry status section with response messages)

### Phase 5: Matching Algorithm (~3 hours)
1. `/api/match` route — hard filter + weighted scoring across 5 dimensions
2. On re-run: delete existing `match_results` for the project before inserting new rows
3. Zero-results handling: return empty array, keep project status as Draft
4. Persist results to `match_results`
5. Return ranked list with per-dimension breakdown

### Phase 6: Match Results UI + Partnership Inquiries (~4 hours)
1. Ranked match results page with color-coded score breakdown
2. Clinic profile modal (rendered within match results page)
3. "Send Inquiry" button → disabled/replaced with status badge once inquiry exists for that clinic
4. Inquiry compose form (message, proposed timeline, patient count, notes)
5. Toast notification on successful send
6. Clinic admin inquiry inbox with full trial detail (including timeline and patient count)
7. Accept (optional message) / Decline (required reason) actions
8. Sponsor project detail reflects acceptance message and decline reason

### Phase 7: Landing & Public Pages (~2 hours)
1. Full landing page polish (value prop, how-it-works, dual CTA)
2. Public clinic browse with "Get in Touch" in navbar/footer
3. Contact form

### Phase 8: Polish & Demo Prep (~3 hours)
1. E2E flow: sponsor registers → creates project → runs match → sends inquiry → clinic accepts
2. Loading states and error handling (including zero-results empty state)
3. Responsive layout check
4. Deploy to Vercel + Supabase cloud

---

## Appendix: Key Decisions & Constraints

| Decision | Rationale |
|----------|-----------|
| Equipment type is free-text (no catalog) | Avoids extra seed complexity for MVP; consistent naming enforced in seed data |
| Matching re-run replaces previous results | Simpler state management; no result history needed for MVP |
| Project editing locked after Searching status | Prevents requirement changes invalidating existing match results |
| Landing page skeleton built at Phase 2.5 | Ensures a coherent entry point exists even if Phase 7 is cut |
| 8–10 distinct seed clinics | Ensures matching produces varied results; fewer produces an unconvincing demo |
| Acceptance message is optional; shown to sponsor | Symmetric with decline reason; surfaced in inquiry status section |
| "Send Inquiry" replaced by status badge once sent | Prevents duplicate inquiries; clear visual feedback without silent failure |

---

*This document is aligned with PROJECT.md, REQUIREMENTS.md, ROADMAP.md as of March 2026.*
