# Wave 2 — Auth + Core Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Register as Sponsor or ClinicAdmin, log in as either, middleware redirects by role — plus clinic profile page shell.

**Architecture:** Supabase Auth handles sessions. A DB trigger creates the `profiles` row atomically on signup. Middleware reads role from JWT `user_metadata` (zero DB round-trip). Route group layouts mount Navbar once. Clinic profile UI is built against typed stubs; Logic Dev wires real queries at end of wave.

**Tech Stack:** Next.js 15 App Router, Supabase SSR (`@supabase/ssr`), react-hook-form, zod, sonner (toasts), Tailwind v4 design tokens.

**Note on testing:** No test harness exists. Verification is via `npx tsc --noEmit` (type check) and manual browser steps against `npm run dev`.

**Note on commits:** Do NOT commit — user manages git manually.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `web/package.json` | Modify | Add Supabase SSR, RHF, zod, sonner |
| `web/supabase/schema.sql` | Create | DB schema + signup trigger |
| `web/types/supabase.ts` | Create | Stub type definitions for Wave 2 |
| `web/lib/supabase/server.ts` | Create | Server-side Supabase client |
| `web/lib/supabase/client.ts` | Create | Browser-side Supabase client |
| `web/middleware.ts` | Create | Session guard + role-based redirect |
| `web/app/layout.tsx` | Modify | Add `<Toaster />` from sonner |
| `web/components/layout/Navbar.tsx` | Create | Role-aware navigation bar |
| `web/app/(auth)/layout.tsx` | Create | Guest-only shell (no Navbar) |
| `web/app/(sponsor)/layout.tsx` | Create | Protected shell with Navbar |
| `web/app/(clinic)/layout.tsx` | Create | Protected shell with Navbar |
| `web/components/ui/select.tsx` | Create | Native select wrapper (design tokens) |
| `web/components/ui/tabs.tsx` | Create | Tab switcher (design tokens) |
| `web/app/(auth)/login/page.tsx` | Create | Login form (RHF + Zod) |
| `web/app/(auth)/register/page.tsx` | Create | Register form with role picker |
| `web/features/clinic-profile/actions.ts` | Create | Server Actions for clinic profile |
| `web/features/clinic-profile/ClinicProfileTabs.tsx` | Create | 3-tab profile UI (stubs) |
| `web/app/(clinic)/profile/page.tsx` | Create | Clinic profile page (typed stubs) |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `web/package.json` (via npm install)

- [ ] **Step 1: Install runtime packages**

Run from `web/` directory:
```bash
npm install @supabase/ssr @supabase/supabase-js react-hook-form @hookform/resolvers zod sonner
```

Expected: packages added to `node_modules`, `package.json` dependencies updated.

- [ ] **Step 2: Verify installation**

Run:
```bash
npx tsc --noEmit
```
Expected: same errors as before (no new errors from installs).

---

## Task 2: Create Supabase Clients

**Files:**
- Create: `web/lib/supabase/server.ts`
- Create: `web/lib/supabase/client.ts`

- [ ] **Step 1: Create the server client**

Create `web/lib/supabase/server.ts`:
```ts
import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createServerClient() {
  const cookieStore = await cookies()

  return createSSRServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component context — mutations ignored
          }
        },
      },
    }
  )
}
```

- [ ] **Step 2: Create the browser client**

Create `web/lib/supabase/client.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Type check**

Run:
```bash
npx tsc --noEmit
```
Expected: errors only about missing `@/types/supabase` — fixed in Task 3.

---

## Task 3: Create Stub Types File

**Files:**
- Create: `web/types/supabase.ts`

> This is a stub. The real file is generated via `npx supabase gen types typescript --linked` once the DB schema is pushed in Wave 1. Replace this file entirely when that command is run.

- [ ] **Step 1: Create the stub**

Create `web/types/supabase.ts`:
```ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'sponsor' | 'clinic_admin'
          first_name: string
          last_name: string
          created_at: string
        }
        Insert: {
          id: string
          role: 'sponsor' | 'clinic_admin'
          first_name: string
          last_name: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      clinics: {
        Row: {
          id: string
          owner_id: string
          name: string
          city: string
          address: string
          description: string | null
          contact_email: string
          phone: string | null
          website: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clinics']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['clinics']['Insert']>
      }
      equipment: {
        Row: {
          id: string
          clinic_id: string
          type: string
          name: string
          quantity: number
          available: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['equipment']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['equipment']['Insert']>
      }
      certifications: {
        Row: {
          id: string
          clinic_id: string
          name: string
          issued_by: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['certifications']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['certifications']['Insert']>
      }
      clinic_availability: {
        Row: {
          id: string
          clinic_id: string
          start_date: string
          end_date: string
          capacity: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clinic_availability']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['clinic_availability']['Insert']>
      }
      clinic_specializations: {
        Row: {
          clinic_id: string
          therapeutic_area_id: string
        }
        Insert: Database['public']['Tables']['clinic_specializations']['Row']
        Update: Partial<Database['public']['Tables']['clinic_specializations']['Row']>
      }
      therapeutic_areas: {
        Row: {
          id: string
          name: string
        }
        Insert: { id?: string; name: string }
        Update: Partial<Database['public']['Tables']['therapeutic_areas']['Insert']>
      }
      trial_projects: {
        Row: {
          id: string
          sponsor_id: string
          title: string
          description: string | null
          therapeutic_area_id: string | null
          phase: string | null
          patient_count: number | null
          start_date: string | null
          end_date: string | null
          geographic_preference: string | null
          status: 'draft' | 'searching' | 'matched' | 'closed'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['trial_projects']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['trial_projects']['Insert']>
      }
      trial_requirements: {
        Row: {
          id: string
          trial_project_id: string
          type: string
          value: string
          priority: 'Required' | 'Preferred'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['trial_requirements']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['trial_requirements']['Insert']>
      }
      match_results: {
        Row: {
          id: string
          trial_project_id: string
          clinic_id: string
          score: number
          breakdown: Json
          status: 'pending' | 'inquiry_sent' | 'accepted' | 'declined'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['match_results']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['match_results']['Insert']>
      }
      partnership_inquiries: {
        Row: {
          id: string
          match_result_id: string
          sponsor_id: string
          clinic_id: string
          message: string
          notes: string | null
          status: 'pending' | 'accepted' | 'declined'
          response_message: string | null
          decline_reason: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['partnership_inquiries']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['partnership_inquiries']['Insert']>
      }
      contact_inquiries: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contact_inquiries']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['contact_inquiries']['Insert']>
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
```

- [ ] **Step 2: Type check**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors from the types file itself.

---

## Task 4: DB Trigger in Schema

**Files:**
- Create: `web/supabase/schema.sql`

- [ ] **Step 1: Create schema.sql with signup trigger**

Create `web/supabase/schema.sql`. Add the trigger block at the end of whatever schema DB Dev writes, or create the file now with just the trigger:

```sql
-- ============================================================
-- Signup trigger: auto-create profile row when auth user is created
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

> DB Dev must merge this into the full schema.sql alongside the table definitions. This trigger must run AFTER the `profiles` table is created.
>
> **Required constraints for Server Actions to work:**
> - `clinics` table must have `UNIQUE(owner_id)` — needed for `upsertClinic` onConflict
> - `clinic_availability` table must have `UNIQUE(clinic_id)` — needed for `upsertAvailability` onConflict

---

## Task 5: Middleware

**Files:**
- Create: `web/middleware.ts`

- [ ] **Step 1: Create middleware**

Create `web/middleware.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: use getUser() not getSession() — getSession() does not verify the JWT
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Already-logged-in users hitting auth pages → redirect to role home
  if (user && (pathname === '/login' || pathname === '/register')) {
    const role = user.user_metadata.role as string
    const home = role === 'sponsor' ? '/sponsor/projects' : '/clinic/profile'
    return NextResponse.redirect(new URL(home, request.url))
  }

  // Unauthenticated users hitting protected routes → login
  const isProtected =
    pathname.startsWith('/sponsor') || pathname.startsWith('/clinic')
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Wrong-role access
  if (user) {
    const role = user.user_metadata.role as string
    if (role === 'sponsor' && pathname.startsWith('/clinic')) {
      return NextResponse.redirect(new URL('/sponsor/projects', request.url))
    }
    if (role === 'clinic_admin' && pathname.startsWith('/sponsor')) {
      return NextResponse.redirect(new URL('/clinic/profile', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: Type check**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

---

## Task 6: Root Layout + Toaster

**Files:**
- Modify: `web/app/layout.tsx`

- [ ] **Step 1: Add Toaster to root layout**

Replace `web/app/layout.tsx` with:
```tsx
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "TrialMatch",
  description: "Connect clinical trial sponsors with qualified clinics",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
```

---

## Task 7: Navbar Component

**Files:**
- Create: `web/components/layout/Navbar.tsx`

- [ ] **Step 1: Create Navbar**

Create `web/components/layout/Navbar.tsx`:
```tsx
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

async function logout() {
  "use server"
  const supabase = await createServerClient()
  await supabase.auth.signOut()
}

export default async function Navbar() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata.role as string | undefined

  return (
    <nav className="border-b border-primary bg-surface-level-1 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="font-display text-primary font-semibold text-lg">
          TrialMatch
        </Link>

        <div className="flex items-center gap-4">
          {role === "sponsor" && (
            <Link href="/sponsor/projects" className="text-sm text-secondary hover:text-primary">
              My Projects
            </Link>
          )}
          {role === "clinic_admin" && (
            <>
              <Link href="/clinic/profile" className="text-sm text-secondary hover:text-primary">
                My Profile
              </Link>
              <Link href="/clinic/inquiries" className="text-sm text-secondary hover:text-primary">
                Inquiries
              </Link>
            </>
          )}

          {user ? (
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">
                Log out
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button size="sm">Log in</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Type check**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

---

## Task 8: Route Group Layouts

**Files:**
- Create: `web/app/(auth)/layout.tsx`
- Create: `web/app/(sponsor)/layout.tsx`
- Create: `web/app/(clinic)/layout.tsx`

- [ ] **Step 1: Auth layout (guest shell)**

Create `web/app/(auth)/layout.tsx`:
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-default">
      {children}
    </main>
  )
}
```

- [ ] **Step 2: Sponsor layout (protected + Navbar)**

Create `web/app/(sponsor)/layout.tsx`:
```tsx
import Navbar from "@/components/layout/Navbar"

export default function SponsorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
    </>
  )
}
```

- [ ] **Step 3: Clinic layout (protected + Navbar)**

Create `web/app/(clinic)/layout.tsx`:
```tsx
import Navbar from "@/components/layout/Navbar"

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
    </>
  )
}
```

---

## Task 9: Login Page

**Files:**
- Create: `web/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create login page**

Create `web/app/(auth)/login/page.tsx`:
```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import AuthFormShell from "@/components/shared/AuthFormShell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/typography"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginValues) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    const role = data.user?.user_metadata.role as string
    router.push(role === "sponsor" ? "/sponsor/projects" : "/clinic/profile")
    router.refresh()
  }

  return (
    <AuthFormShell
      title="Welcome back"
      subtitle="Sign in to your TrialMatch account"
      footerLabel="Don't have an account?"
      footerCta="Sign up"
      footerHref="/register"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label as="label" htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label as="label" htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthFormShell>
  )
}
```

- [ ] **Step 2: Type check**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Verify in browser**

Run `npm run dev`, navigate to `http://localhost:3000/login`.
Expected: auth card renders with email + password fields and a Sign in button.

---

## Task 10: Register Page

**Files:**
- Create: `web/app/(auth)/register/page.tsx`

- [ ] **Step 1: Create register page**

Create `web/app/(auth)/register/page.tsx`:
```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import AuthFormShell from "@/components/shared/AuthFormShell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/typography"
import { cn } from "@/lib/cn"

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["sponsor", "clinic_admin"]),
})

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "sponsor" },
  })

  const selectedRole = watch("role")

  async function onSubmit(values: RegisterValues) {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          role: values.role,
          first_name: values.firstName,
          last_name: values.lastName,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Account created! Signing you in…")
    router.push(values.role === "sponsor" ? "/sponsor/projects" : "/clinic/profile")
    router.refresh()
  }

  return (
    <AuthFormShell
      title="Create account"
      subtitle="Join TrialMatch to connect trials with clinics"
      footerLabel="Already have an account?"
      footerCta="Sign in"
      footerHref="/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role picker */}
        <div className="space-y-1.5">
          <Label as="label">I am a…</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["sponsor", "clinic_admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setValue("role", r)}
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                  selectedRole === r
                    ? "border-primary bg-surface-level-2 text-primary"
                    : "border-primary/30 text-secondary hover:border-primary"
                )}
              >
                {r === "sponsor" ? "Sponsor" : "Clinic Admin"}
              </button>
            ))}
          </div>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label as="label" htmlFor="firstName">First name</Label>
            <Input id="firstName" placeholder="Alex" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label as="label" htmlFor="lastName">Last name</Label>
            <Input id="lastName" placeholder="Smith" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label as="label" htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label as="label" htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthFormShell>
  )
}
```

- [ ] **Step 2: Type check**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/register`.
Expected: form renders with role toggle, name fields, email, password, and Create account button.

---

## Task 11: Clinic Profile Server Actions

**Files:**
- Create: `web/features/clinic-profile/actions.ts`

- [ ] **Step 1: Create Server Actions**

Create `web/features/clinic-profile/actions.ts`:
```ts
"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// --- Clinic ---

export async function upsertClinic(data: {
  name: string
  city: string
  address: string
  description?: string
  contact_email: string
  phone?: string
  website?: string
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("clinics")
    .upsert({ ...data, owner_id: user.id }, { onConflict: "owner_id" })

  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

// --- Specializations ---

export async function upsertSpecializations(clinicId: string, areaIds: string[]) {
  const supabase = await createServerClient()

  await supabase
    .from("clinic_specializations")
    .delete()
    .eq("clinic_id", clinicId)

  if (areaIds.length > 0) {
    const { error } = await supabase
      .from("clinic_specializations")
      .insert(areaIds.map((id) => ({ clinic_id: clinicId, therapeutic_area_id: id })))
    if (error) throw new Error(error.message)
  }

  revalidatePath("/clinic/profile")
}

// --- Equipment ---

export async function addEquipment(clinicId: string, data: {
  type: string
  name: string
  quantity: number
  available: boolean
}) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("equipment")
    .insert({ ...data, clinic_id: clinicId })
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

export async function deleteEquipment(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from("equipment").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

// --- Certifications ---

export async function addCertification(clinicId: string, data: {
  name: string
  issued_by?: string
  expires_at?: string
}) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("certifications")
    .insert({ ...data, clinic_id: clinicId })
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

export async function deleteCertification(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from("certifications").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

// --- Availability ---

export async function upsertAvailability(clinicId: string, data: {
  start_date: string
  end_date: string
  capacity: number
}) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("clinic_availability")
    .upsert({ ...data, clinic_id: clinicId }, { onConflict: "clinic_id" })
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}
```

- [ ] **Step 2: Type check**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

---

## Task 12: ClinicProfileTabs Component

**Files:**
- Create: `web/features/clinic-profile/ClinicProfileTabs.tsx`

- [ ] **Step 1: Build the 3-tab UI**

Create `web/features/clinic-profile/ClinicProfileTabs.tsx`:
```tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { cn } from "@/lib/cn"
import type { Tables } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/typography"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  upsertClinic,
  addEquipment,
  deleteEquipment,
  addCertification,
  deleteCertification,
  upsertAvailability,
} from "./actions"

type Props = {
  clinic: Tables<"clinics"> | null
  equipment: Tables<"equipment">[]
  certifications: Tables<"certifications">[]
  availability: Tables<"clinic_availability"> | null
}

const tabs = ["Profile", "Equipment", "Certs & Availability"] as const
type Tab = typeof tabs[number]

// --- Zod schemas ---

const profileSchema = z.object({
  name: z.string().min(1, "Clinic name is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().optional(),
  contact_email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
})

const equipmentSchema = z.object({
  type: z.string().min(1, "Type is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().min(1),
  available: z.boolean(),
})

const certSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  issued_by: z.string().optional(),
  expires_at: z.string().optional(),
})

const availabilitySchema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
})

// --- Tab: Profile ---

function ProfileTab({ clinic }: { clinic: Tables<"clinics"> | null }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(profileSchema), defaultValues: clinic ?? {} })

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      await upsertClinic(values)
      toast.success("Profile saved")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <div className="space-y-1.5">
        <Label as="label">Clinic name</Label>
        <Input placeholder="City Oncology Center" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label as="label">City</Label>
          <Input placeholder="Sofia" {...register("city")} />
          {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label as="label">Address</Label>
          <Input placeholder="123 Main St" {...register("address")} />
          {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label as="label">Description</Label>
        <textarea
          className="h-24 w-full rounded-xl border border-primary bg-surface-level-0 px-3 py-2 text-sm text-primary placeholder:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-level-5 resize-none"
          placeholder="Brief overview of your clinic…"
          {...register("description")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label as="label">Contact email</Label>
          <Input type="email" placeholder="contact@clinic.com" {...register("contact_email")} />
          {errors.contact_email && <p className="text-sm text-red-500">{errors.contact_email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label as="label">Phone</Label>
          <Input placeholder="+359 2 000 0000" {...register("phone")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label as="label">Website</Label>
        <Input placeholder="https://clinic.com" {...register("website")} />
        {errors.website && <p className="text-sm text-red-500">{errors.website.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save profile"}
      </Button>
    </form>
  )
}

// --- Tab: Equipment ---

function EquipmentTab({
  equipment,
  clinicId,
}: {
  equipment: Tables<"equipment">[]
  clinicId: string | undefined
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(equipmentSchema), defaultValues: { available: true, quantity: 1 } })

  async function onSubmit(values: z.infer<typeof equipmentSchema>) {
    if (!clinicId) { toast.error("Save your profile first"); return }
    try {
      await addEquipment(clinicId, values)
      toast.success("Equipment added")
      reset()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add")
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEquipment(id)
      toast.success("Equipment removed")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove")
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      {equipment.length === 0 ? (
        <p className="text-sm text-secondary">No equipment added yet.</p>
      ) : (
        <ul className="space-y-2">
          {equipment.map((eq) => (
            <li key={eq.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
              <div>
                <p className="text-sm font-medium text-primary">{eq.name}</p>
                <p className="text-xs text-secondary">{eq.type} · qty {eq.quantity} · {eq.available ? "Available" : "Unavailable"}</p>
              </div>
              <button
                onClick={() => handleDelete(eq.id)}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-2xl border border-primary p-4">
        <p className="text-sm font-medium text-primary">Add equipment</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label as="label">Type</Label>
            <Input placeholder="MRI" {...register("type")} />
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label as="label">Name</Label>
            <Input placeholder="Siemens Magnetom" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label as="label">Quantity</Label>
            <Input type="number" min={1} {...register("quantity")} />
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
              <input type="checkbox" {...register("available")} className="rounded" />
              Available
            </label>
          </div>
        </div>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add equipment"}
        </Button>
      </form>
    </div>
  )
}

// --- Tab: Certs & Availability ---

function CertsAvailabilityTab({
  certifications,
  availability,
  clinicId,
}: {
  certifications: Tables<"certifications">[]
  availability: Tables<"clinic_availability"> | null
  clinicId: string | undefined
}) {
  const certForm = useForm({ resolver: zodResolver(certSchema) })
  const availForm = useForm({
    resolver: zodResolver(availabilitySchema),
    defaultValues: availability ?? {},
  })

  async function onAddCert(values: z.infer<typeof certSchema>) {
    if (!clinicId) { toast.error("Save your profile first"); return }
    try {
      await addCertification(clinicId, values)
      toast.success("Certification added")
      certForm.reset()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add")
    }
  }

  async function handleDeleteCert(id: string) {
    try {
      await deleteCertification(id)
      toast.success("Certification removed")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove")
    }
  }

  async function onSaveAvailability(values: z.infer<typeof availabilitySchema>) {
    if (!clinicId) { toast.error("Save your profile first"); return }
    try {
      await upsertAvailability(clinicId, values)
      toast.success("Availability saved")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
    }
  }

  return (
    <div className="space-y-8 max-w-xl">
      {/* Certifications */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-primary">Certifications</p>
        {certifications.length === 0 ? (
          <p className="text-sm text-secondary">No certifications added yet.</p>
        ) : (
          <ul className="space-y-2">
            {certifications.map((cert) => (
              <li key={cert.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-primary">{cert.name}</p>
                  {cert.issued_by && <p className="text-xs text-secondary">Issued by {cert.issued_by}</p>}
                </div>
                <button
                  onClick={() => handleDeleteCert(cert.id)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={certForm.handleSubmit(onAddCert)} className="space-y-3 rounded-2xl border border-primary p-4">
          <p className="text-sm font-medium text-primary">Add certification</p>
          <div className="space-y-1.5">
            <Label as="label">Name</Label>
            <Input placeholder="GCP Certificate" {...certForm.register("name")} />
            {certForm.formState.errors.name && (
              <p className="text-sm text-red-500">{certForm.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label as="label">Issued by</Label>
              <Input placeholder="ICH" {...certForm.register("issued_by")} />
            </div>
            <div className="space-y-1.5">
              <Label as="label">Expires</Label>
              <Input type="date" {...certForm.register("expires_at")} />
            </div>
          </div>
          <Button type="submit" size="sm" disabled={certForm.formState.isSubmitting}>
            {certForm.formState.isSubmitting ? "Adding…" : "Add certification"}
          </Button>
        </form>
      </div>

      {/* Availability */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-primary">Availability window</p>
        <form onSubmit={availForm.handleSubmit(onSaveAvailability)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label as="label">Start date</Label>
              <Input type="date" {...availForm.register("start_date")} />
              {availForm.formState.errors.start_date && (
                <p className="text-sm text-red-500">{availForm.formState.errors.start_date.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label as="label">End date</Label>
              <Input type="date" {...availForm.register("end_date")} />
              {availForm.formState.errors.end_date && (
                <p className="text-sm text-red-500">{availForm.formState.errors.end_date.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label as="label">Patient capacity</Label>
            <Input type="number" min={1} placeholder="50" {...availForm.register("capacity")} />
            {availForm.formState.errors.capacity && (
              <p className="text-sm text-red-500">{availForm.formState.errors.capacity.message}</p>
            )}
          </div>
          <Button type="submit" disabled={availForm.formState.isSubmitting}>
            {availForm.formState.isSubmitting ? "Saving…" : "Save availability"}
          </Button>
        </form>
      </div>
    </div>
  )
}

// --- Main component ---

export default function ClinicProfileTabs({ clinic, equipment, certifications, availability }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Profile")

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-display text-primary text-2xl font-semibold mb-6">Clinic Profile</h1>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-primary mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-secondary hover:text-primary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Profile" && <ProfileTab clinic={clinic} />}
      {activeTab === "Equipment" && (
        <EquipmentTab equipment={equipment} clinicId={clinic?.id} />
      )}
      {activeTab === "Certs & Availability" && (
        <CertsAvailabilityTab
          certifications={certifications}
          availability={availability}
          clinicId={clinic?.id}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type check**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

---

## Task 13: Clinic Profile Page

**Files:**
- Create: `web/app/(clinic)/profile/page.tsx`

- [ ] **Step 1: Create the page with typed stubs**

Create `web/app/(clinic)/profile/page.tsx`:
```tsx
import type { Tables } from "@/types/supabase"
import ClinicProfileTabs from "@/features/clinic-profile/ClinicProfileTabs"

export default async function ClinicProfilePage() {
  // Typed stubs — Logic Dev replaces with real Supabase queries at end of Wave 2
  // Replace with: const supabase = await createServerClient()
  //               const { data: { user } } = await supabase.auth.getUser()
  //               const { data: clinic } = await supabase.from("clinics").select("*").eq("owner_id", user!.id).single()
  //               etc.
  const clinic: Tables<"clinics"> | null = null
  const equipment: Tables<"equipment">[] = []
  const certifications: Tables<"certifications">[] = []
  const availability: Tables<"clinic_availability"> | null = null

  return (
    <ClinicProfileTabs
      clinic={clinic}
      equipment={equipment}
      certifications={certifications}
      availability={availability}
    />
  )
}
```

- [ ] **Step 2: Type check**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/clinic/profile` while logged in as a clinic_admin.
Expected: 3-tab layout renders. Profile tab shows blank form fields. Equipment and Certs tabs show empty states.

---

## Wave 2 Exit Criterion Checklist

- [ ] `http://localhost:3000/register` renders — role toggle, name, email, password fields
- [ ] Register as Sponsor → redirects to `/sponsor/projects` (404 expected — page not built yet, but redirect works)
- [ ] Register as Clinic Admin → redirects to `/clinic/profile` — 3-tab layout visible
- [ ] `http://localhost:3000/login` renders — email + password fields
- [ ] Login as Sponsor → redirects to `/sponsor/projects`
- [ ] Login as Clinic Admin → redirects to `/clinic/profile`
- [ ] Logged-in user visiting `/login` → auto-redirected to role home
- [ ] Unauthenticated user visiting `/clinic/profile` → redirected to `/login`
- [ ] Sponsor visiting `/clinic/profile` → redirected to `/sponsor/projects`
- [ ] `npx tsc --noEmit` — zero errors
