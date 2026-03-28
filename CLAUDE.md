# TrialMatch — Project Guide

## What This Is

TrialMatch is a pharma/CRO-to-clinic matching platform. Pharma companies run clinical trials through Contract Research Organizations (CROs). CROs need to find the right clinics — the right equipment, specializations, capacity, and availability. This automates that site selection with a rule-based matching algorithm.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Forms** | React Hook Form + Zod |
| **Server state** | TanStack Query (React Query) |
| **Backend** | Supabase (Postgres, Auth, auto-generated REST API) |
| **Matching API** | Next.js API Route (`/api/match`) |
| **ORM/Types** | Supabase generated types (`supabase gen types typescript`) |
| **Deployment** | Vercel (frontend) + Supabase cloud |

## Project Structure

```
TrialMatch/
├── CLAUDE.md                    ← you are here
├── .planning/                   ← planning docs (roadmap, requirements, state)
├── web/                         ← Next.js 15 app (App Router)
│   ├── CLAUDE.md                ← web-specific rules
│   ├── app/                     ← Next.js App Router pages and layouts
│   ├── components/              ← UI components
│   ├── features/                ← feature-scoped logic
│   ├── lib/                     ← supabase client, utilities
│   ├── types/                   ← Supabase generated types + local types
│   └── supabase/                ← migrations, seed, schema
├── shared/                      ← TypeScript types + constants (minimal)
│   └── types/                   ← entity types shared between modules
├── backend/                     ← DEPRECATED — replaced by Supabase
└── apps/
    └── mobile/                  ← Out of scope for MVP
```

## Two User Roles

| Role | What They Do |
|---|---|
| **Sponsor** | Creates trial projects, defines requirements, runs matching, sends inquiries to clinics |
| **ClinicAdmin** | Registers clinic profile, manages equipment/certs/availability, responds to inquiries |

## Key Files

- `web/lib/supabase/client.ts` — browser Supabase client
- `web/lib/supabase/server.ts` — server-side Supabase client (for Server Components / API routes)
- `web/app/api/match/route.ts` — matching algorithm API route
- `web/supabase/schema.sql` — full DB schema
- `web/supabase/seed.sql` — seed data (clinics, therapeutic areas, sample trials)
- `web/middleware.ts` — auth + role-based route protection

## Auth

Supabase Auth handles all authentication:
- Email/password sign-up and sign-in
- Role stored in `public.profiles` table (linked to `auth.users`)
- Next.js middleware reads the session and redirects based on role
- No custom JWT or refresh token logic needed

## Database

All tables live in Supabase Postgres. Generate TypeScript types after schema changes:
```bash
npx supabase gen types typescript --local > web/types/supabase.ts
```

Local dev uses Supabase CLI:
```bash
npx supabase start          # start local Supabase
npx supabase db reset       # reset and re-seed
npx supabase stop           # stop
```

## Matching Algorithm

Lives in `web/app/api/match/route.ts`. Rule-based weighted scoring:
1. Filter clinics that fail any **Required** criterion (hard exclusion)
2. Score remaining clinics across dimensions (therapeutic area, equipment, certifications, capacity, geography)
3. Weighted sum → overall score 0–100
4. Persist results to `match_results` table
5. Return ranked list with breakdown

## Git Conventions

- **Atomic commits** — one logical change per commit, committed as soon as that unit of work is complete
- **Commit message format**: `type(scope): short description` — types: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`
  - Examples: `feat(auth): add register page with role picker`, `chore(db): apply schema and generate types`
- **No Co-Authored-By trailer** — never append `Co-Authored-By: Claude` or any AI attribution to commit messages

## What NOT to Do

- Do not use the `backend/` ASP.NET project — it is deprecated and replaced by Supabase
- Do not install `axios` — use Supabase client or Next.js `fetch` directly
- Do not use `shared/api/` or `shared/services/` — Supabase client replaces these
- Do not add `react-router-dom` — Next.js App Router handles routing
- Do not build custom auth — Supabase Auth handles everything

## Running Locally

```bash
# 1. Start Supabase local instance
cd web && npx supabase start

# 2. Run Next.js dev server
npm run dev

# 3. Open http://localhost:3000
```
