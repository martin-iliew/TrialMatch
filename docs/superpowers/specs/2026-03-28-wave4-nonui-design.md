# Wave 4 Non-UI Design

**Date:** 2026-03-28
**Scope:** Integration + Deploy wave — DB Dev and Logic Dev lanes only (UI lane excluded)

---

## Overview

Wave 4 validates that the full application works end-to-end on the live Vercel URL before the demo. It is split into four sequential concerns: build validation, deployment, SQL integrity assertions, and manual E2E verification via a written checklist.

---

## Section 1 — Build Validation (DB Dev)

Run `next build` locally and fix all TypeScript and build errors before pushing anything to Vercel. This is a hard gate — nothing is pushed until the build is clean.

Catches:
- Type mismatches from generated Supabase types
- Missing imports from Wave 3 features
- Server/client boundary violations

---

## Section 2 — Deployment (DB Dev)

Verify the following env vars are set in the Vercel project dashboard before the first Wave 4 deploy:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These should already exist from the Wave 1 skeleton deploy — this is a verification step, not setup. After confirming, `git push` to `main` triggers Vercel's automatic deployment via GitHub integration. Verify the live URL loads without a 500 by opening the public landing page (`/`).

---

## Section 3 — SQL Integrity Assertions (Logic Dev)

**File:** `web/supabase/assert_seed.sql`

Five queries, each returning zero rows if the seed is healthy and non-zero rows if something is wrong. Run via the Supabase dashboard SQL editor against the cloud project, or with:

```bash
npx supabase db execute < web/supabase/assert_seed.sql
```

| # | Assertion | Returns rows when... |
|---|-----------|----------------------|
| 1 | Clinics missing certifications | Any clinic has no `certifications` rows |
| 2 | Clinics missing equipment | Any clinic has no `equipment` rows |
| 3 | Clinics missing specializations | Any clinic has no `clinic_specializations` rows |
| 4 | Match result variation | All 3 trial projects share the same rank-1 clinic (broken scoring) |
| 5 | Demo accounts with wrong/missing role | Any `profiles` row where `role` is null or not in `(sponsor, clinic_admin)` |

Logic Dev runs this after seeding. Any non-empty result is a bug to fix before proceeding to E2E.

---

## Section 4 — E2E Checklist

**File:** `.planning/E2E_CHECKLIST.md`

Two flows run against the live URL. Each step has an explicit expected outcome — "pass" is defined before running, not after.

### Sponsor Flow (DB Dev)

| Step | Action | Expected Outcome |
|------|--------|-----------------|
| 1 | Register as sponsor | Redirected to `/sponsor/projects` |
| 2 | Create a trial project | Appears in project list with `draft` status |
| 3 | Add 2–3 requirements | Visible in project detail page |
| 4 | Click "Find Matching Clinics" | Redirected to matches page with ranked results |
| 5 | Open clinic profile modal | Full clinic detail (equipment, certs, availability) visible |
| 6 | Send inquiry with a message | Inquiry status badge appears on matches page |

### Clinic Flow (Logic Dev)

| Step | Action | Expected Outcome |
|------|--------|-----------------|
| 1 | Log in as seed clinic admin | Redirected to `/clinic/profile` |
| 2 | Check profile tab | Name, city, specializations pre-populated from seed |
| 3 | Check equipment + certs tabs | At least 1 equipment row and 1 cert row visible |
| 4 | Navigate to inquiries inbox | Inquiry from sponsor flow is visible |
| 5 | Open inquiry detail | Trial info + sponsor message visible |
| 6 | Accept inquiry with a message | Status updates to `accepted` |
| 7 | Sponsor checks project page | Sees `accepted` badge + clinic's message |

If any step fails, note it as a production bug and fix before the demo.

---

## Ownership Summary

| Task | Owner |
|------|-------|
| `next build` clean locally | DB Dev |
| Verify Vercel env vars + push | DB Dev |
| Run match algorithm against all 3 seed trials (populates `match_results`) | Logic Dev |
| Write + run `assert_seed.sql` | Logic Dev |
| Fix any seed data bugs | Logic Dev |
| Write `.planning/E2E_CHECKLIST.md` | Logic Dev |
| Run sponsor E2E flow | DB Dev |
| Run clinic E2E flow | Logic Dev |
| Fix production-only runtime errors | DB Dev + Logic Dev |
