# TrialMatch

## Vision
Pharma companies create drugs. To bring them to market, they must run clinical trials. They hire Contract Research Organizations (CROs) to manage these trials, and CROs need to find specific clinics (research sites) with the right capacity, equipment, expertise, and availability to execute each study. The statistics from these trials are critical to regulatory approval -- the wrong site means bad data, delays, and wasted money.

Today, site selection is slow, manual, and relationship-driven. CROs rely on spreadsheets, phone calls, and personal networks to match trials to clinics. This causes delays that cost pharma companies up to EUR 8M per day in lost revenue from enrollment timeline slippage.

TrialMatch automates this. A CRO or pharma sponsor inputs their trial requirements (therapeutic area, required equipment, patient pool, timeline, geographic preferences), and TrialMatch matches them with the best-fit clinics from a registered network -- scored, ranked, and ready for outreach. Fast, efficient, saving time, manual labor, and pharma costs.

## Market
- Pharma companies spend EUR 6,500-15,000 per recruited patient
- Enrollment delays cost up to EUR 8M per day
- 19-25% of EU trial slots go unfilled
- Site selection is a bottleneck that adds weeks/months to trial timelines
- Starting in Bulgaria (growing trial infrastructure, 6.5M population, aging demographics with high chronic disease burden) with a clear path to scale across Eastern Europe

## Context
- **Event**: AUBG Hackathon 2026
- **Scope**: MVP demo -- core matching flow, enough to demonstrate the concept end-to-end
- **Platform**: Web (Next.js 15 App Router + Supabase)
- **Existing foundation**: Next.js 15 app scaffolded with Tailwind CSS v4, shadcn/ui, and Supabase project initialized

## What Already Exists
- Next.js 15 app with App Router, TypeScript, Tailwind CSS v4, shadcn/ui
- Supabase project initialized (local dev via Supabase CLI)
- Supabase Auth configured (email/password, role stored in `profiles` table)
- React Hook Form + Zod for form validation
- TanStack Query (React Query) for server state
- Mobile app (Expo) -- out of scope for MVP

## MVP Demo Goal

### Sponsor/CRO (logged in) can:
1. Log in (existing auth)
2. Create a trial project with requirements (therapeutic area, phase, required equipment, patient count needed, timeline, geographic preference)
3. Run the matching algorithm against registered clinics
4. View ranked match results with compatibility scores and reasoning
5. View clinic profiles from match results
6. Send a partnership inquiry to a matched clinic
7. Track inquiry status (Pending / Accepted / Declined)

### Clinic Admin (logged in) can:
1. Log in (existing auth, clinic role)
2. Register their clinic profile (name, location, specializations, certifications)
3. Add equipment inventory (type, quantity, availability)
4. Set capacity and availability windows
5. View incoming partnership inquiries from CROs
6. Accept or decline inquiries (with reason for decline)

### Visitor (not logged in) can:
1. Browse registered clinics (limited view)
2. View the platform landing page explaining the service
3. Fill out a contact form to express interest in joining as a clinic or sponsor

## Key Constraints
- Hackathon timeline -- speed over perfection
- Seed data for clinics and sample trial projects (no admin CRUD needed for MVP)
- No real payment processing
- No real-time chat between CROs and clinics
- English only for MVP
- Matching algorithm is rule-based scoring (no ML for MVP) -- weighted criteria matching
- Web + Backend only (skip mobile for MVP)
- Geographic distance is simple city-based text matching (no maps/geocoding for MVP)