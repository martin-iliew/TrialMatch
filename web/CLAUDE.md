# Web App Guide (Next.js 15 + Supabase)

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript — never use `any`
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Forms**: React Hook Form + Zod + `@hookform/resolvers`
- **Server state**: TanStack Query for client-side fetching
- **Backend**: Supabase client (no axios, no custom API client)
- **Auth**: Supabase Auth via `@supabase/ssr`

## Folder Structure

```
web/
├── CLAUDE.md
├── app/                          ← App Router pages, layouts, API routes
│   ├── layout.tsx                ← root layout (providers)
│   ├── page.tsx                  ← landing page
│   ├── middleware.ts             ← auth + role redirect
│   ├── (auth)/                   ← login, register pages
│   ├── (sponsor)/                ← sponsor-only pages (projects, matches)
│   ├── (clinic)/                 ← clinic-admin-only pages (profile, inbox)
│   └── api/
│       └── match/route.ts        ← matching algorithm endpoint
├── components/
│   ├── ui/                       ← shadcn/ui primitives
│   ├── shared/                   ← cross-feature composed components
│   └── layout/                   ← navbar, shell, sidebar
├── features/
│   ├── matching/                 ← match results, score cards
│   ├── clinic-profile/           ← equipment, certs, availability forms
│   ├── trial-project/            ← project creation, requirements
│   └── inquiries/                ← inquiry inbox, send/respond
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← browser client (createBrowserClient)
│   │   └── server.ts             ← server client (createServerClient)
│   └── utils.ts
├── types/
│   ├── supabase.ts               ← generated (npx supabase gen types typescript)
│   └── index.ts                  ← local type aliases
└── supabase/
    ├── schema.sql                ← full DB schema
    ├── seed.sql                  ← seed data
    └── migrations/
```

## Supabase Client Rules

- Use `lib/supabase/server.ts` in Server Components, Server Actions, and API routes
- Use `lib/supabase/client.ts` in Client Components only
- Never import the server client into client components

```ts
// Server Component / API route
import { createServerClient } from '@/lib/supabase/server'
const supabase = createServerClient()

// Client Component
import { createBrowserClient } from '@/lib/supabase/client'
const supabase = createBrowserClient()
```

## Auth & Role Routing

- Auth state comes from Supabase session — no custom JWT handling
- Role is stored in `public.profiles.role` (values: `sponsor`, `clinic_admin`)
- `middleware.ts` reads session + role, redirects unauthenticated users and wrong-role access
- Route groups: `(auth)` = guest only, `(sponsor)` = sponsor role, `(clinic)` = clinic_admin role

## Data Fetching Patterns

**Server Components** (default — prefer this):
```ts
const supabase = createServerClient()
const { data } = await supabase.from('clinics').select('*')
```

**Client Components with React Query** (for interactive/real-time):
```ts
const { data } = useQuery({
  queryKey: ['clinics'],
  queryFn: () => supabase.from('clinics').select('*').then(r => r.data)
})
```

**Mutations** — use Server Actions or React Query mutations with Supabase client.

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Page | `page.tsx` in route folder | `app/(sponsor)/projects/page.tsx` |
| Layout | `layout.tsx` | `app/(clinic)/layout.tsx` |
| Feature component | `PascalCase.tsx` | `MatchScoreCard.tsx` |
| shadcn primitive | lowercase | `button.tsx`, `dialog.tsx` |
| Hook | `useX.ts` | `useMatchResults.ts` |
| Server Action | `actions.ts` in feature folder | `features/clinic-profile/actions.ts` |

## What Goes Where

| Need to... | Put it in |
|---|---|
| Add a page | `app/(role)/route/page.tsx` |
| Add a shadcn primitive | `components/ui/` |
| Add a composed component | `components/shared/` |
| Add feature logic | `features/{feature}/` |
| Add a Server Action | `features/{feature}/actions.ts` |
| Add matching logic | `app/api/match/route.ts` |
| Change DB schema | `supabase/schema.sql` + migration |

## Styling Rules

- Use semantic Tailwind tokens only — no raw hex or RGB in components
- shadcn/ui for all base primitives — do not build parallel component systems
- After `npx shadcn add <component>`, remap generated theme vars to project tokens

## Do Not

- Do not use `axios` — use Supabase client or `fetch`
- Do not use `react-router-dom` — App Router handles routing
- Do not add custom auth logic — Supabase Auth handles everything
- Do not use `pages/` directory — App Router only
- Do not use `any` type
