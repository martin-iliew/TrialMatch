@AGENTS.md

# TrialMatch — Project Guide

## Purpose

TrialMatch is a clinical trial site matching MVP. Two roles: `sponsor` (pharmaceutical companies posting trials) and `clinic_admin` (clinic staff managing site profiles and responding to inquiries).

This file is for AI agents starting new work in this project. Read it to understand:

- the expected folder structure
- the preferred libraries and integrations
- the UI component strategy
- the design-token rules
- where new code should go
- how App Router conventions apply
- the database schema and auth model

Read this file first, then read `DESIGN-SYSTEM.md` in the project root before creating any UI.

---

## Default Stack

Treat this as the default stack for all new work:

- **Framework**: Next.js 16 + React 19 (App Router)
- **Language**: TypeScript (strict)
- **Routing**: Next.js App Router — file-based, in `src/app/`
- **Backend / DB**: Supabase (Postgres + Auth + RLS)
- **Supabase client**: `@supabase/ssr` + `@supabase/supabase-js`
- **Server state**: `@tanstack/react-query` (client-side caching, mutations, async state)
- **Forms**: `react-hook-form`
- **Validation**: `zod`
- **Form validation bridge**: `@hookform/resolvers`
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`
- **Component strategy**: shadcn/ui conventions (`base-nova` style, `@base-ui/react` primitives)
- **Variants**: `class-variance-authority` (CVA)
- **Class utilities**: `clsx` + `tailwind-merge` via `cn()` in `src/lib/utils.ts`
- **Icons**: `lucide-react`
- **Toasts**: `sonner`
- **Animations**: `gsap` + `lenis`
- **Path alias**: `@/*` → `src/*`

Important:

- `zod` is the default schema and validation library.
- `@tanstack/react-query` is the default async server-state layer on the client.
- `react-hook-form` is the default form state layer.
- shadcn/ui is the expected base-component pattern. Primitives live in `src/components/ui/`.
- Server Components are the default. Add `'use client'` only when needed.
- Supabase is the sole backend — no custom Express/API layer.

---

## Must-Read Token File

Before writing UI, read:

- `DESIGN-SYSTEM.md` (project root)

That file defines how semantic tokens must be used in Tailwind classes and how they must be authored.

Non-negotiable token rule:

- use semantic tokens in component code
- never use primitive tokens directly in components
- never put raw color values inside semantic tokens
- semantic tokens must always reference primitives

---

## Folder Structure

Use this structure as the default organization target. Items marked `[NEW]` need to be created.

```
trial-match/
├── CLAUDE.md
├── AGENTS.md
├── DESIGN-SYSTEM.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json                        ← shadcn/ui config
├── middleware.ts                           ← auth route protection (Supabase)
├── public/                                ← static assets, favicons, images
├── src/
│   ├── app/
│   │   ├── globals.css                    ← global styles, Tailwind imports, token definitions
│   │   ├── layout.tsx                     ← root layout: fonts, providers
│   │   ├── page.tsx                       ← landing page (visitor)
│   │   ├── (auth)/                        ← route group: guest-only pages
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (sponsor)/                     ← route group: sponsor pages
│   │   │   ├── layout.tsx                 ← sponsor shell layout
│   │   │   └── sponsor/
│   │   │       └── projects/
│   │   │           ├── page.tsx           ← project list
│   │   │           └── [id]/
│   │   │               ├── page.tsx       ← project detail
│   │   │               └── matches/
│   │   │                   └── page.tsx   ← match results
│   │   ├── (clinic)/                      ← route group: clinic admin pages
│   │   │   ├── layout.tsx                 ← clinic shell layout
│   │   │   └── clinic/
│   │   │       ├── profile/page.tsx       ← clinic profile management
│   │   │       ├── equipment/page.tsx     ← equipment inventory
│   │   │       ├── availability/page.tsx  ← availability calendar
│   │   │       └── inquiries/page.tsx     ← inquiry responses
│   │   └── api/                           ← API route handlers
│   │       └── [...route]/route.ts
│   ├── components/
│   │   ├── ui/                            ← base reusable primitives, shadcn-style
│   │   ├── common/                        ← cross-feature composed components
│   │   └── layout/                        ← nav, shell, header, sidebar, footer
│   ├── features/                          ← domain modules
│   │   ├── auth/                          ← login, register, session helpers
│   │   ├── projects/                      ← trial project CRUD, search
│   │   ├── clinics/                       ← clinic profile, equipment, availability
│   │   ├── matching/                      ← match algorithm, results display
│   │   └── inquiries/                     ← sponsor↔clinic messaging
│   ├── hooks/                             ← reusable React hooks (client)
│   ├── lib/
│   │   ├── utils.ts                       ← cn() and other helpers
│   │   ├── providers.tsx                  ← client providers (QueryClient, etc.)
│   │   └── supabase/
│   │       ├── client.ts                  ← browser Supabase client
│   │       └── server.ts                  ← server Supabase client (cookies)
│   ├── styles/
│   │   ├── tokens.css                     ← design token definitions
│   │   └── typography.css                 ← typography scale
│   ├── types/
│   │   ├── index.ts                       ← shared app types (Clinic, TrialProject, etc.)
│   │   └── supabase.ts                    ← generated Database types
│   └── config/                            ← environment-aware runtime config
├── supabase/
│   ├── migrations/                        ← SQL migration files
│   └── seed.sql                           ← seed data
```

Notes:

- `src/components/ui/` is for reusable primitives: button, dialog, input, badge, sheet, dropdown, etc.
- `src/components/common/` is for higher-level compositions used across multiple features.
- `src/features/` is the preferred place for feature-scoped UI, hooks, mutations, and Server Actions.
- Route groups `(auth)`, `(sponsor)`, and `(clinic)` segment routing without affecting the URL.
- Shared logic that could be used server-side should live in `src/lib/` or `src/features/`, not in client-only hooks.

---

## App Router Conventions

### Server vs Client Components

- Server Components are the **default** — no `'use client'` needed.
- Add `'use client'` only when the component uses browser APIs, React hooks, or event handlers.
- Keep `'use client'` as close to the leaf as possible — don't mark a whole feature subtree as client if only one button needs it.
- Data fetching in Server Components uses `async`/`await` directly. No `useEffect + fetch`.
- Client-side caching and mutation state uses React Query.

### Layouts

- `src/app/layout.tsx` is the root layout — load fonts, global providers, and metadata here.
- Nested layouts in `(sponsor)` and `(clinic)` route groups handle shell chrome (nav, sidebar) for each role.
- Providers that require `'use client'` (e.g. `QueryClientProvider`) should be extracted into `src/lib/providers.tsx` and imported in the root layout.

### Routing

- Guest-only pages live in `src/app/(auth)/`.
- Sponsor pages live in `src/app/(sponsor)/sponsor/...`.
- Clinic admin pages live in `src/app/(clinic)/clinic/...`.
- Route protection is handled in `middleware.ts`, not in layouts or page bodies.
- Every route segment should include `loading.tsx` and `error.tsx`.
- Prefer `redirect()` from `next/navigation` for server-side redirects.
- Use `useRouter()` and `usePathname()` (from `next/navigation`) in client components only.

### Server Actions

- Prefer Server Actions for form submissions and mutations that don't need optimistic UI.
- Define actions in `src/features/{feature}/actions.ts` with the `'use server'` directive.
- Validate action inputs with `zod` before touching any backend.
- Use React Query mutations for client-side optimistic updates and cache invalidation.

### Metadata

- Define static metadata via `export const metadata` in `layout.tsx` or `page.tsx`.
- Use `generateMetadata()` for dynamic metadata.

---

## Library Rules

### `@tanstack/react-query`

Use it for:

- client-side data fetching with caching
- mutations with optimistic updates
- cache invalidation and refetch behavior
- async loading and error states on the client

Do not use plain `useEffect` + `fetch` for server-state flows when React Query fits. For pure server-side data fetching in Server Components, use `async/await` directly.

### `zod`

Use it for:

- form schema validation
- Server Action input validation
- parsing untrusted external data
- defining input contracts for reusable forms

Do not duplicate validation rules across ad hoc `if` statements when a schema should exist.

### `react-hook-form`

Use it for:

- form state
- field registration
- submit lifecycle
- integration with Zod via `@hookform/resolvers`

Only used in Client Components (`'use client'`).

### shadcn/ui

Use shadcn/ui conventions for:

- buttons, inputs, form primitives
- dialogs, popovers, dropdowns, sheets
- tables, tabs, badges

If the primitive does not exist yet:

- add it under `src/components/ui/`
- keep the API close to shadcn/ui conventions
- theme it with semantic tokens only
- after every `npx shadcn add <component>`, immediately replace generated shadcn theme classes (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `sidebar-*`, `chart-*`) with local semantic token classes before the component is used or committed

Do not build a second design system next to `src/components/ui/`.

---

## Styling Rules

- Token definitions live in `src/app/globals.css`.
- Additional tokens in `src/styles/tokens.css`, typography scale in `src/styles/typography.css`.
- Import order in `globals.css`: `tailwindcss` → `tw-animate-css` → `shadcn/tailwind.css` → custom tokens.
- Use Tailwind semantic token utilities for new UI work.
- Keep `globals.css` small: token definitions, base resets, and structural rules only.
- Prefer semantic classes like `bg-default`, `text-primary`, `border-primary`, `text-icon-secondary`.
- Avoid raw hex, raw rgb, and raw oklch values in component code.
- Avoid using primitive tokens like `neutral-200` or `primary-500` directly in UI code.
- Do not keep stock shadcn registry theme utilities in checked-in components. Remap them to this project's tokens first.

Frontend enforcement for AI edits:

- never use the `any` type
- use Tailwind utility classes instead of bespoke semantic CSS classes like `nav-right`, `btn`, or similar
- componentize repeated UI first, then compose pages from those primitives or shared components
- keep `globals.css` limited to token imports and base/global structural rules
- use `@/*` for all project-local imports (resolves to `src/*`)
- do not write raw `h1`–`h6`, `p`, `label`, or `code` tags in UI files unless editing a typography primitive

If a semantic token is missing:

- add or update the semantic token definition in `src/app/globals.css`
- make it reference primitives
- do not bypass the token system with a raw color
- if a freshly generated shadcn component needs a semantic treatment that does not exist yet, extend the tokens first then remap the component

---

## Naming Conventions

| Artifact                    | Convention                       | Example                                      |
| --------------------------- | -------------------------------- | -------------------------------------------- |
| Page                        | `page.tsx` inside route folder   | `src/app/(sponsor)/sponsor/projects/page.tsx` |
| Layout                      | `layout.tsx` inside route folder | `src/app/(sponsor)/layout.tsx`                |
| Server Action file          | `actions.ts` in feature folder   | `src/features/auth/actions.ts`               |
| Base UI primitive           | lowercase shadcn-style           | `button.tsx`, `dialog.tsx`                   |
| Reusable composed component | `PascalCase.tsx`                 | `UserMenu.tsx`                               |
| Hook                        | `useX.ts`                        | `useCurrentUser.ts`                          |
| Feature folder              | `kebab-case`                     | `src/features/auth/`, `src/features/clinics/`|
| Utility file                | `camelCase.ts`                   | `formatDate.ts`                              |
| Supabase helper             | descriptive `.ts`                | `src/lib/supabase/server.ts`                 |
| Feature schema              | `schemas.ts` in feature folder   | `src/features/projects/schemas.ts`           |

---

## What Goes Where

| Need to...                          | Put it in                                   |
| ----------------------------------- | ------------------------------------------- |
| Add a page                          | `src/app/{route}/page.tsx`                  |
| Add a layout or shell               | `src/app/{route}/layout.tsx`                |
| Add feature-scoped UI and logic     | `src/features/{feature}/`                   |
| Add a base reusable primitive       | `src/components/ui/`                        |
| Add a shared composed component     | `src/components/common/`                    |
| Add shell chrome (nav, sidebar)     | `src/components/layout/`                    |
| Add a Server Action                 | `src/features/{feature}/actions.ts`         |
| Add a client-side hook              | `src/hooks/` or `src/features/{feature}/`   |
| Add an API route handler            | `src/app/api/{route}/route.ts`              |
| Add query client or setup helpers   | `src/lib/`                                  |
| Add Supabase helpers                | `src/lib/supabase/`                         |
| Add browser runtime config          | `src/config/`                               |
| Add project-wide types              | `src/types/`                                |
| Add feature validation schemas      | `src/features/{feature}/schemas.ts`         |

---

## Practical Rules

- Start with the existing stack before introducing new libraries.
- Prefer Server Components and `async/await` for server-side data fetching.
- Prefer React Query for client-side caching and mutation state.
- Prefer Server Actions for form submissions without complex optimistic UI.
- Prefer Zod for all validation — forms, actions, API boundaries.
- Prefer React Hook Form over ad hoc controlled-form state for non-trivial forms.
- Prefer shadcn/ui-style primitives over bespoke one-off controls.
- Use only semantic design tokens in UI code.
- Read `DESIGN-SYSTEM.md` before editing tokenized UI.
- Mark components `'use client'` as close to the leaf as possible.

### Supabase Rules

- Use `createServerClient()` from `@/lib/supabase/server` in Server Components and Server Actions.
- Use `createClient()` from `@/lib/supabase/client` in Client Components.
- Always use `getUser()`, never `getSession()` — `getUser()` verifies the JWT with Supabase Auth, `getSession()` does not.
- RLS is the authorization layer — never bypass it with service-role keys in app code.
- Type all Supabase queries with the `Database` generic from `@/types/supabase`.

If backend payloads or API contracts change:

- update shared types in `src/types/` first
- regenerate Supabase types if schema changed: `npx supabase gen types typescript --local > src/types/supabase.ts`
- then update the consumers

If a new visual pattern is needed and no token exists:

- extend the token definitions in `src/app/globals.css`
- reference primitives from the token definitions
- never hardcode a color in a component

---

## Database Schema Reference

### Tables

| Table                  | Purpose                                    | Key FKs / Relations                    | RLS                      |
| ---------------------- | ------------------------------------------ | -------------------------------------- | ------------------------ |
| `profiles`             | User profile, role, org link               | `id` → `auth.users`                   | Own row only             |
| `organizations`        | Sponsor or clinic organization             | —                                      | Members only             |
| `clinics`              | Clinic site details, location, capacity    | `organization_id` → `organizations`   | Owner + matched sponsors |
| `clinic_equipment`     | Equipment inventory per clinic             | `clinic_id` → `clinics`               | Clinic owner only        |
| `clinic_availability`  | Availability windows                       | `clinic_id` → `clinics`               | Clinic owner only        |
| `therapeutic_areas`    | Lookup: oncology, cardiology, etc.         | —                                      | Public read              |
| `trial_projects`       | Sponsor's trial project definition         | `organization_id` → `organizations`   | Org members              |
| `project_requirements` | Criteria for a trial project               | `project_id` → `trial_projects`       | Org members              |
| `match_results`        | Algorithm output: clinic↔project score     | `project_id`, `clinic_id`             | Both parties             |
| `inquiries`            | Sponsor inquiry to a matched clinic        | `match_result_id` → `match_results`   | Both parties             |
| `inquiry_messages`     | Messages within an inquiry thread          | `inquiry_id` → `inquiries`            | Thread participants      |
| `audit_log`            | Immutable action log                       | `user_id` → `profiles`                | Admin only               |

### Enums

`user_role` · `organization_type` · `clinic_status` · `project_status` · `requirement_type` · `match_status` · `inquiry_status` · `message_type` · `equipment_category` · `availability_type`

### TypeScript Types

Key types exported from `@/types`:
- `Clinic`, `ClinicEquipment`, `ClinicAvailability`
- `TrialProject`, `ProjectRequirement`
- `MatchResult`, `Inquiry`, `InquiryMessage`
- `Profile`, `Organization`
- `Database` (generated, in `@/types/supabase`)

---

## Supabase Integration Patterns

### Server Client (Server Components, Server Actions, Route Handlers)

```ts
import { createServerClient } from '@/lib/supabase/server'

export async function getProjects() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('trial_projects')
    .select('*')
  // handle error, return data
}
```

### Browser Client (Client Components)

```ts
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
```

### Middleware (route protection)

```ts
// middleware.ts at project root
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
```

Key rules:

- The server client is **async** — always `await createServerClient()`.
- The browser client is **sync** — just `createClient()`.
- Always pass the `Database` generic for typed queries.
- Never import `@supabase/supabase-js` directly in app code — use the wrappers in `src/lib/supabase/`.
- RLS policies handle authorization; the app only needs to authenticate the user.

---

## Auth & Roles

| Role           | Home route     | Accessible routes                                        |
| -------------- | -------------- | -------------------------------------------------------- |
| `sponsor`      | `/sponsor/projects` | `/sponsor/*`                                        |
| `clinic_admin` | `/clinic/profile`   | `/clinic/*`                                         |
| visitor (anon) | `/`                 | `/`, `/login`, `/register`                          |

- `middleware.ts` enforces route access based on auth state and role.
- Role is stored in `user_metadata.role` (Supabase Auth) and mirrored in `profiles.role`.
- After login, redirect to the role's home route.
- Unauthenticated users hitting `/sponsor/*` or `/clinic/*` are redirected to `/login`.
- Authenticated users hitting `/login` or `/register` are redirected to their home route.

---

## MVP User Flows

### Sponsor Flow
1. Register as sponsor → create organization
2. Create trial project → define requirements (therapeutic area, equipment, patient volume)
3. Run matching → view ranked clinic matches with scores
4. Send inquiry to selected clinic → track inquiry status
5. Exchange messages within inquiry thread

### Clinic Admin Flow
1. Register as clinic admin → create organization + clinic profile
2. Manage clinic profile (location, capacity, therapeutic areas)
3. Add equipment inventory and availability windows
4. Receive and respond to sponsor inquiries
5. Track inquiry status and message history

### Visitor Flow
1. Land on marketing page → learn about TrialMatch
2. Navigate to `/register` → choose role (sponsor or clinic admin)
3. Contact via landing page form (no auth required)
