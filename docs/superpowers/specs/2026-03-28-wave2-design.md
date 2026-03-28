# Wave 2 Design — Auth + Core Structure

**Date**: 2026-03-28
**Scope**: Hours 1.5–3.5 of the 7–8 hour execution plan
**Exit criterion**: Can register as Sponsor and ClinicAdmin, log in as either, middleware redirects correctly

---

## Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Profile creation on signup | Supabase DB trigger | Atomic — no ghost users if INSERT fails |
| Role reading in middleware | JWT `user_metadata.role` | Zero DB round-trip, already present from signup |
| Clinic profile page ownership | UI Dev stubs + Logic Dev wires | Unblocks parallel work; typed stubs prevent integration surprises |
| Route group layouts | UI Dev adds all 3 layouts | 14 screens need Navbar — one layout beats per-page repetition |
| Middleware auth call | `getUser()` only | `getSession()` is insecure — does not verify with Supabase servers |

---

## Section 1: Auth (DB Dev)

### Signup Trigger

Add to `supabase/schema.sql` (DB Dev, Wave 1 — must land before Wave 2 starts):

```sql
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

The trigger fires automatically after `auth.users` insert. No manual `INSERT INTO profiles` is needed anywhere in application code.

### Register Action

`app/(auth)/register/page.tsx` calls only:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { role, first_name, last_name }
  }
})
```

Role values are `'sponsor'` or `'clinic_admin'` — driven by the role picker toggle in the register form. Do not expose any other role value in the UI.

### Login Action

`app/(auth)/login/page.tsx` calls:

```ts
await supabase.auth.signInWithPassword({ email, password })
```

On success, read role from session and redirect:
- `sponsor` → `/sponsor/projects`
- `clinic_admin` → `/clinic/profile`

### Middleware (`web/middleware.ts`)

**Critical**: use `getUser()` — never `getSession()`.

- `getSession()` reads the JWT from the cookie without server verification — a tampered or expired token passes through.
- `getUser()` validates the token with Supabase Auth servers — required for any server-side auth gate.

```ts
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.redirect(new URL('/login', request.url))
}

const role = user.user_metadata.role // 'sponsor' | 'clinic_admin'

// Wrong-role redirects
if (role === 'sponsor' && request.nextUrl.pathname.startsWith('/clinic')) {
  return NextResponse.redirect(new URL('/sponsor/projects', request.url))
}
if (role === 'clinic_admin' && request.nextUrl.pathname.startsWith('/sponsor')) {
  return NextResponse.redirect(new URL('/clinic/profile', request.url))
}

// Already-logged-in redirect from auth pages
if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
  const home = role === 'sponsor' ? '/sponsor/projects' : '/clinic/profile'
  return NextResponse.redirect(new URL(home, request.url))
}
```

Unprotected routes (no auth check): `/`, `/clinics`, `/contact`, `/(auth)/*`

---

## Section 2: Route Group Layouts (UI Dev)

UI Dev creates 3 layout files alongside Navbar work in Wave 2.

### `app/(auth)/layout.tsx`

Guest-only shell, no Navbar. Logged-in redirect is handled in middleware — no logic here.

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-background">{children}</main>
}
```

### `app/(sponsor)/layout.tsx` and `app/(clinic)/layout.tsx`

Protected shell — Navbar mounted once, inherited by all child pages.

```tsx
import Navbar from '@/components/layout/Navbar'

export default async function SponsorLayout({ children }: { children: React.ReactNode }) {
  // getUser() is called again here — middleware validates the session but does not
  // pass the user object to layouts/pages. This second call is cheap (cached by
  // Supabase SSR within the same request) and is the correct pattern.
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata.role

  return (
    <>
      <Navbar role={role} />
      <main className="flex-1">{children}</main>
    </>
  )
}
```

**Impact**: All 10+ pages added in Wave 3 under `(sponsor)/` and `(clinic)/` get Navbar automatically.

---

## Section 3: Clinic Profile Page (Logic Dev + UI Dev)

### Phase 1 — UI Dev builds with typed stubs (start of Wave 2)

UI Dev creates `app/(clinic)/profile/page.tsx` immediately using typed stubs from the generated `types/supabase.ts`:

```tsx
import type { Tables } from '@/types/supabase'
import ClinicProfileTabs from '@/features/clinic-profile/ClinicProfileTabs'

export default async function ClinicProfilePage() {
  // Typed stub — Logic Dev replaces with real Supabase queries at end of Wave 2
  const clinic: Tables<'clinics'> | null = null
  const equipment: Tables<'equipment'>[] = []
  const certifications: Tables<'certifications'>[] = []
  const availability: Tables<'clinic_availability'> | null = null

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

UI Dev builds `ClinicProfileTabs` as a Client Component with 3 tabs:
- **Profile**: clinic name, city, address, description, contact email, phone, website, specializations multi-select
- **Equipment**: equipment list + add equipment inline form (type, name, quantity, availability toggle)
- **Certs & Availability**: cert list + add cert form, availability date range + capacity fields

### Phase 2 — Logic Dev wires real queries (end of Wave 2)

Logic Dev replaces the stubs in `page.tsx` with real Supabase queries after `features/clinic-profile/actions.ts` Server Actions are complete.

**Handoff contract**: Logic Dev must not rename or restructure props on `ClinicProfileTabs` — only the data source in `page.tsx` changes.

---

## Lane Summary for Wave 2

| Lane | Key additions vs original plan |
|---|---|
| **DB Dev** | Add trigger to `schema.sql` in Wave 1; use `getUser()` not `getSession()` in middleware; handle already-logged-in redirect in middleware |
| **Logic Dev** | Remove manual `INSERT INTO profiles` from register action; wire real queries into profile page at end of wave |
| **UI Dev** | Add 3 route group layouts alongside Navbar; build clinic profile tabs against typed stubs from the start |
