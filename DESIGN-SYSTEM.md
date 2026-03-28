# Web Design System

## Source of Truth

All token definitions live in three files:

- **`src/styles/tokens.css`** — color primitives, semantic tokens, spacing, radius, z-index, motion, shadows, focus rings, and the Tailwind v4 theme bridge
- **`src/styles/typography.css`** — typographic scale (font sizes, line heights, letter spacing) with responsive breakpoints, and CSS typography classes
- **`src/components/ui/typography.tsx`** — React components that apply the typography classes

Read those files for exact values. This document explains **how to use** the system, not what every value is.

---

## Core Rules

1. Use **semantic tokens only** in UI code.
2. Semantic tokens must reference **primitive tokens** — never raw hex/rgb/oklch.
3. Primitives are for token definitions, not component styling.
4. If a semantic token is missing, add one — don't bypass the system.

---

## Tailwind Usage

| Intent | Prefix | Examples |
|---|---|---|
| Backgrounds | `bg-*` | `bg-default`, `bg-subtle`, `bg-muted`, `bg-inverse`, `bg-scrim-primary` |
| Surfaces | `bg-surface-*` | `bg-surface-level-0` through `bg-surface-level-5` |
| Status surfaces | `bg-surface-status-*` | `bg-surface-status-danger`, `-warning`, `-success`, `-info` |
| Skeleton surface | `bg-surface-skeleton` | Loading placeholder fill — use via `<Skeleton>` component |
| Text | `text-*` | `text-primary`, `text-secondary`, `text-tertiary`, `text-accent`, `text-inverse` |
| Icons | `text-icon-*` | `text-icon-primary`, `text-icon-secondary`, `text-icon-tertiary` |
| Status icons | `text-icon-status-*` | `text-icon-status-danger`, `-warning`, `-success`, `-info` |
| Borders | `border-*` | `border-primary` |
| Status borders | `border-status-*` | `border-status-danger`, `-warning`, `-success`, `-info` |

---

## Token Meanings (quick reference)

### Backgrounds

- **`bg-default`** — main page canvas, base layer
- **`bg-subtle`** — alternate sections, gentle segmentation
- **`bg-muted`** — disabled zones, low-priority wells, stronger than subtle
- **`bg-inverse`** — hero bands, contrast-flip sections (not for cards or alerts)
- **`bg-scrim-primary`** — modal/drawer backdrops only

### Surfaces (depth, not meaning)

`bg-surface-level-0` through `bg-surface-level-5` — increasing elevation. Use for cards, navs, panels, modals. Don't overuse higher levels.

### Status Surfaces (meaning, not depth)

- **`bg-surface-status-danger`** — error alerts, failed-payment callouts
- **`bg-surface-status-warning`** — caution notices, expiring-session warnings
- **`bg-surface-status-success`** — success toasts, completion banners
- **`bg-surface-status-info`** — informational callouts, onboarding hints

Pair with matching `border-status-*` and `text-icon-status-*`.

### Skeleton Surface

- **`bg-surface-skeleton`** — loading skeleton placeholder fill. References `--black-50`. Always use the `<Skeleton>` component from `src/components/ui/skeleton.tsx` — never write raw `animate-pulse` divs with hardcoded background classes.

### Text

- **`text-primary`** — headings, body, important labels
- **`text-secondary`** — helper text, secondary metadata
- **`text-tertiary`** — captions, placeholders, decorative
- **`text-accent`** — brand highlights (not for body text)
- **`text-inverse`** — text on inverse/high-contrast surfaces

### Borders

- **`border-primary`** — default borders, dividers, inputs, cards
- **`border-status-*`** — only when the component communicates semantic state

### Icons

- **`text-icon-primary/secondary/tertiary`** — standard icon hierarchy
- **`text-icon-status-*`** — only for feedback icons (errors, warnings, success, info)

---

## Typography

Typography is split across two files:

- **`src/styles/typography.css`** — defines the primitive scale (`--text-*`, `--leading-*`, `--tracking-*` tokens) and CSS classes (`.landing-hero`, `.display-page`, `.heading-1`–`.heading-9`, `.body`, `.body-small`, `.caption`, `.small`, `.label`, `.cta`, `.cta-sm`, `.code`)
- **`src/components/ui/typography.tsx`** — React components that apply those CSS classes

### Available typography components

| Component | CSS class | Scale token | Typical use |
|---|---|---|---|
| `LandingHero` | `.landing-hero` | `--text-landing` | Landing page hero headline |
| `DisplayPage` | `.display-page` | `--text-9xl` | Hero/display sections |
| `TitlePage` | `.title-page` | `--text-8xl` | Page title |
| `Heading1` | `.heading-1` | `--text-7xl` | Top-level section heading |
| `Heading2` | `.heading-2` | `--text-6xl` | Major section heading |
| `Heading3` / `SectionTitle` / `Title` | `.heading-3` | `--text-5xl` | Section heading |
| `Heading4` | `.heading-4` | `--text-4xl` | Sub-section heading |
| `Heading5` / `SubTitlePage` | `.heading-5` | `--text-3xl` | Page subtitle, card title |
| `Heading6` | `.heading-6` | `--text-2xl` | Small heading |
| `Heading7` | `.heading-7` | `--text-xl` | Minor heading |
| `Heading8` | `.heading-8` | `--text-lg` | List heading, label heading |
| `Heading9` | `.heading-9` | `--text-md` | Smallest heading |
| `Body` / `BodyBase` | `.body` | `--text-base` | Body copy |
| `BodySmall` | `.body-small` | `--text-sm` | Secondary body text |
| `Caption` | `.caption` | `--text-sm` | Captions, metadata |
| `Small` | `.small` | `--text-xs` | Fine print, badges |
| `Label` | `.label` | `--text-sm` | Form labels (weight 500) |
| `CTA` | `.cta` | `--text-cta` | Button / CTA text |
| `CTASmall` | `.cta-sm` | `--text-cta-sm` | Small button / CTA text |
| `CodeSnippet` | `.code` | `--text-sm` | Inline code |

### Responsive behavior

The typographic scale in `typography.css` is **breakpoint-based** (desktop-first):

| Breakpoint | Behavior |
|---|---|
| Default (>1600px) | Full desktop scale |
| `≤1600px` | Landing hero downscaled |
| `≤1024px` | Full tablet scale — all sizes reduced |
| `≤767px` | Mobile — landing hero reduced further |
| `≤425px` | Small mobile — landing hero minimal |

Responsiveness is handled by the CSS variables themselves (they change at breakpoints). You do **not** need responsive Tailwind classes like `md:text-*` — the typography classes adapt automatically.

### Rules

- **Always use the React components** from `typography.tsx` — don't write raw `h1`–`h6`, `p`, `label`, or `code` tags in UI files
- **Never use raw Tailwind text sizes** (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-xs`, `text-[...]`) — use the typography components or CSS classes instead
- **Never use raw font-weight utilities** (`font-semibold`, `font-bold`, `font-medium`, `font-light`, `font-[450]`) as className overrides on or alongside typography components — each CSS class already bundles the correct weight
- **Never use `text-caption`, `text-body-small`, `text-title`** etc. — these are NOT valid tokens. Typography CSS class names (`caption`, `body-small`, `heading-6`) do NOT use the `text-` prefix. Only color tokens use `text-` (`text-primary`, `text-secondary`)
- **Never use raw `tracking-[...]` values** — use token variable syntax instead: `tracking-[var(--tracking-sm)]`
- If you need the CSS class directly (e.g., on a `<select>`, `<textarea>`, `<button>`, or any element whose tag you don't control), apply the class name without `text-` prefix: `className="body-small ..."` not `className="text-body-small ..."`
- Each CSS class bundles `font-family`, `font-size`, `line-height`, `letter-spacing`, `font-weight`, and `font-variation-settings` — don't override individual properties unless intentional
- Need a new typographic treatment? Add a token to `typography.css` and a component to `typography.tsx` — don't inline one-off classes

### How to apply text styling (decision order)

Follow this priority order — use the **first option that fits**:

**1. Use a typography React component (preferred)**
When you control the markup and can wrap text in its own element, always use a component from `typography.tsx`. This is the default for all new text.

```tsx
// ✅ Correct — component controls the full text treatment
<Heading5>Clinic Profile</Heading5>
<Body>Enter your clinic details below.</Body>
<Caption>Last updated 2 days ago</Caption>
```

**2. Use a typography CSS class on an existing element**
When you can't use a typography component — e.g., text lives inside a third-party component, a slot, or an element whose tag you don't control — apply the CSS class directly.

```tsx
// ✅ Correct — can't wrap in a typography component, so use the class
<DialogTitle className="heading-6">Edit Equipment</DialogTitle>
<CardDescription className="body-small">Manage your inventory</CardDescription>
```

**3. Use the closest matching design token as a Tailwind class (last resort)**
When neither a component nor a CSS class works — e.g., you need to style a small piece of text inside an already-styled component and the full typography class would override too much — pick the most logical design token. Match by intent, not by exact pixel size.

```tsx
// ✅ Correct — inside a Button, we just need the size/tracking, not a full typography class
<button className="font-body text-[length:var(--text-sm)] leading-[var(--leading-sm)] tracking-[var(--tracking-sm)]">
  Save
</button>
```

Use this table to pick the right token:

| Intent | Token group |
|---|---|
| Body-sized text | `--text-base`, `--leading-base`, `--tracking-base` |
| Small/secondary text | `--text-sm`, `--leading-sm`, `--tracking-sm` |
| Fine print / badge | `--text-xs`, `--leading-xs`, `--tracking-xs` |
| Medium UI text | `--text-md`, `--leading-md`, `--tracking-md` |
| Large UI text | `--text-lg`, `--leading-lg`, `--tracking-lg` |
| CTA / button | `--text-cta`, `--leading-cta`, `--tracking-cta` |
| Small CTA / button | `--text-cta-sm`, `--leading-cta-sm`, `--tracking-cta-sm` |

**Hard rule:** never use raw Tailwind sizes (`text-sm`, `text-base`, `text-lg`, `text-[14px]`) or raw pixel/rem values. Always go through the token system — either via component, CSS class, or token variable.

### Banned patterns (never write these)

| Banned | Correct alternative |
|---|---|
| `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-xs`, `text-[...]` | Use typography component or CSS class |
| `font-semibold`, `font-bold`, `font-medium`, `font-light` | Remove — the typography CSS class sets the correct weight |
| `font-[450]` in UI code | Remove — bundled in typography CSS classes |
| `tracking-[0.18em]` (raw tracking) | Use `tracking-[var(--tracking-sm)]` or apply the CSS class |
| `text-caption`, `text-body-small`, `text-title` | Apply CSS class without prefix: `caption`, `body-small`, `heading-7` |
| `className="body-small"` on a typography component | Don't apply CSS class to a component that already applies it |
| `<Body className="font-semibold">` | Use `<Heading9>` or the heading component with correct weight |
| `<Caption className="font-semibold uppercase">` | Use `<Heading9 className="uppercase">` |

---

## Fonts

Three font stacks defined in `tokens.css`:
- `--ff-display` — display/heading face
- `--ff-body` — body face
- `--ff-code` — monospace

Tailwind bridge: `font-sans` (body), `font-display`, `font-body`, `font-code`

Heading components (`LandingHero` through `Heading9`) use `--ff-display`. Body components (`Body`, `BodySmall`, `Caption`, `Small`, `Label`, `CTA`, `CTASmall`) use `--ff-body`. `CodeSnippet` uses `--ff-code`.

---

## shadcn/ui Remap Rules

After every `npx shadcn add <component>`, remap all stock shadcn utilities before use.

**Banned Tailwind classes** (replace with local tokens):
`bg-primary`, `text-primary-foreground`, `bg-card`, `text-card-foreground`, `bg-popover`, `text-popover-foreground`, `border-border`, `bg-background`, `text-foreground`, `bg-secondary`, `text-secondary-foreground`, `bg-accent`, `text-accent-foreground`, `text-muted-foreground`, `bg-destructive`, `text-destructive`, `border-input`, `bg-input`, `border-ring`, `ring-ring`

**Banned CSS variables** (don't define these locally):
`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`, `--input`, `--ring`, `--sidebar-*`, `--chart-*`

**Preferred remaps:**
- Action buttons: `bg-inverse text-inverse`
- Neutral containers/fields: `bg-surface-level-*`, `border-primary`, `text-primary`, `text-secondary`
- Destructive feedback: `bg-surface-status-danger`, `border-status-danger`, `text-icon-status-danger`

---

## When shadcn MCP or AI generates a component

### Required steps after any `shadcn add` (non-negotiable checklist)

1. **Find all banned Tailwind classes** (see table below) — replace every occurrence with the project semantic token equivalent.
2. **Find all banned CSS variables** (see "Banned CSS variables" list above) — remove any local definitions; the variables must not exist in app code.
3. **Delete every `dark:` prefixed class** — this project is light-only. There are no dark mode token overrides.
4. **`--radius-*` variables are safe** — they come from `styles/tokens.css` and are project tokens, not shadcn theme variables. Keep them.

### Find-and-replace table

| Banned class | Replace with |
|---|---|
| `bg-primary` | `bg-inverse` |
| `text-primary-foreground` | `text-inverse` |
| `bg-secondary` | `bg-surface-level-1` |
| `text-secondary-foreground` | `text-secondary` |
| `bg-background` | `bg-surface-level-0` |
| `text-foreground` | `text-primary` |
| `bg-muted` | `bg-surface-level-1` |
| `text-muted-foreground` | `text-secondary` |
| `bg-accent` | `bg-surface-level-2` |
| `text-accent-foreground` | `text-primary` |
| `bg-card` | `bg-surface-level-0` |
| `text-card-foreground` | `text-primary` |
| `bg-popover` | `bg-surface-level-1` |
| `text-popover-foreground` | `text-primary` |
| `bg-destructive` | `bg-surface-status-danger` |
| `text-destructive` | `text-icon-status-danger` |
| `border-border` | `border-primary` |
| `border-input` | `border-primary` |
| `bg-input` | `bg-surface-level-0` |
| `border-ring` | `border-primary` |
| `ring-ring` | _(remove — use `shadow-focus-ring` instead)_ |
| `focus-visible:ring-*` | `focus-visible:shadow-focus-ring` |
| `focus-visible:border-ring` | `focus-visible:border-primary` |
| `aria-invalid:border-destructive` | `aria-invalid:border-status-danger` |
| `aria-invalid:ring-*` | `aria-invalid:shadow-focus-ring-danger` |

### Note on `dark:` variants

Every `dark:` prefixed class in a generated shadcn component must be deleted. This project does not support dark mode — only light theme tokens exist.

---

## Additional Primitives

### In `src/styles/tokens.css`

- **Spacing:** `--space-*` (4px grid), `--space-section-md/lg`, `--space-container-padding`
- **Radius:** `--radius-none` through `--radius-full`
- **Z-index:** `--z-behind` through `--z-max`
- **Motion:** `--duration-*`, `--ease-*`, `--transition-*` (auto-disabled on `prefers-reduced-motion`)
- **Shadows:** `--shadow-xs` through `--shadow-2xl`, `--shadow-inset`
- **Focus rings:** `--focus-ring`, `--focus-ring-danger`, `--focus-ring-success`
- **Colors:** all primitive ramps (neutral, primary, accent, orange, green, red, blue, black-alpha, white-alpha)
- **Semantic tokens:** light mode mappings for backgrounds, surfaces, text, borders, icons, brand, accent, disabled, interactive states

### In `src/styles/typography.css`

- **Type scale tokens:** `--text-*`, `--leading-*`, `--tracking-*` (landing through xs, plus cta variants)
- **CSS classes:** `.landing-hero`, `.display-page`, `.title-page`, `.heading-1`–`.heading-9`, `.body`, `.body-small`, `.caption`, `.small`, `.label`, `.cta`, `.cta-sm`, `.code`
- **Responsive breakpoints:** sizes auto-adjust at 1600px, 1024px, 767px, 425px

---

## Contrast Pairing Rules

Every background token has required text and icon pairings. Using the wrong combination produces invisible or unreadable text.

| Background | Text | Icons |
|---|---|---|
| `bg-default`, `bg-subtle`, `bg-muted` | `text-primary`, `text-secondary`, `text-tertiary` | `text-icon-primary`, `text-icon-secondary`, `text-icon-tertiary` |
| `bg-surface-level-0` through `bg-surface-level-5` | `text-primary`, `text-secondary`, `text-tertiary` | `text-icon-primary`, `text-icon-secondary`, `text-icon-tertiary` |
| `bg-inverse` | `text-inverse` only | `text-icon-inverse` (when added) or override with `text-inverse` |
| `bg-surface-status-*` | `text-primary`, `text-secondary` (not `text-inverse`) | `text-icon-status-*` matching the surface |

**Hard rules:**
- `bg-inverse` **must** pair with `text-inverse` — never with `text-primary`/`text-secondary`/`text-tertiary`
- `bg-default`/`bg-subtle`/`bg-muted`/`bg-surface-*` **must not** pair with `text-inverse`
- Status surfaces use normal text tokens (`text-primary`) — status color only goes on the icon and border
- Typography primitives (`TitlePage`, `Body`, etc.) default to `text-primary`/`text-secondary`. When used inside `bg-inverse`, override with `className="text-inverse"`

**If you are unsure:** ask which background the text sits on, then pick from the table above.

---

## Text Size Rules

All text sizes come from `src/styles/typography.css` as CSS custom properties (`--text-*`, `--leading-*`, `--tracking-*`). They are **not** exposed as Tailwind utilities — instead they are consumed through CSS classes defined in the same file.

**Available scale tokens** (defined in `typography.css`):

| Token | Desktop size | Used by |
|---|---|---|
| `--text-landing` | 107px | `.landing-hero` |
| `--text-9xl` | 148px | `.display-page` |
| `--text-8xl` | 124px | `.title-page` |
| `--text-7xl` | 98px | `.heading-1` |
| `--text-6xl` | 72px | `.heading-2` |
| `--text-5xl` | 54px | `.heading-3` |
| `--text-4xl` | 42px | `.heading-4` |
| `--text-3xl` | 32px | `.heading-5` |
| `--text-2xl` | 28px | `.heading-6` |
| `--text-xl` | 24px | `.heading-7` |
| `--text-lg` | 22px | `.heading-8` |
| `--text-md` | 20px | `.heading-9` |
| `--text-base` | 17.5px | `.body`, `.cta` |
| `--text-sm` | 14.5px | `.body-small`, `.caption`, `.label`, `.code` |
| `--text-xs` | 12.5px | `.small` |
| `--text-cta` | 17.5px | `.cta` |
| `--text-cta-sm` | 14.5px | `.cta-sm` |

Each token also has matching `--leading-*` and `--tracking-*` companions. All three are bundled together in the CSS class — you never need to set them individually.

**Hard rules:**
- Use the React typography components — never raw `text-sm`, `text-base`, `text-lg`, `text-[...]`, or responsive prefixes like `sm:text-base`
- Typography components already bundle font-family, size, line-height, letter-spacing, weight, and font-variation-settings
- If a new text size is needed, add the token to `typography.css`, add the CSS class, then add a React component to `typography.tsx`
- The scale tokens in `typography.css` are **primitives** (like color primitives in `tokens.css`) — they should never be used directly in component code. Always go through the CSS class or React component

**Which component for which context:**

| Context | Component | CSS class |
|---|---|---|
| Landing hero headline | `LandingHero` | `.landing-hero` |
| Hero/display sections | `DisplayPage` | `.display-page` |
| Page title | `TitlePage` | `.title-page` |
| Top-level heading | `Heading1` | `.heading-1` |
| Major section heading | `Heading2` | `.heading-2` |
| Section heading | `Heading3` / `SectionTitle` / `Title` | `.heading-3` |
| Sub-section heading | `Heading4` | `.heading-4` |
| Page subtitle / card title | `Heading5` / `SubTitlePage` | `.heading-5` |
| Small heading | `Heading6` | `.heading-6` |
| Minor heading | `Heading7` | `.heading-7` |
| List/label heading | `Heading8` | `.heading-8` |
| Smallest heading | `Heading9` | `.heading-9` |
| Body copy | `Body` / `BodyBase` | `.body` |
| Secondary body | `BodySmall` | `.body-small` |
| Captions/meta | `Caption` | `.caption` |
| Fine print, badges | `Small` | `.small` |
| Form labels | `Label` | `.label` |
| Button text | `CTA` | `.cta` |
| Small button text | `CTASmall` | `.cta-sm` |
| Inline code | `CodeSnippet` | `.code` |

---

## Component Rules

- Cards: surface tokens, not page background tokens
- Icons: icon tokens (`text-icon-*`)
- Text: text tokens (`text-*`)
- Sections: background tokens (`bg-*`)
- Separators: `border-primary`
- Status UI: use the trio — status surface + status border + status icon
- Keep message text on normal text tokens even inside status containers
- Reserve status tokens for feedback UI, not layout
- **Check contrast pairing** (see table above) before combining background and text tokens

---

## Summary

1. Semantic tokens only in UI code
2. `bg-*` for backgrounds, `text-*` for text, `text-icon-*` for icons, `border-*` for borders
3. Semantic tokens always reference primitives
4. No raw values in semantic tokens
5. When unsure, extend the token system — don't bypass it
6. **Always check the contrast pairing table** — `bg-inverse` needs `text-inverse`, never `text-primary`
7. **Always use typography React components** (`<Heading3>`, `<Body>`, `<Label>`) — never raw Tailwind sizes (`text-sm`, `text-base`) or raw HTML tags (`h1`–`h6`, `p`)
8. **Typography tokens live in `typography.css`**, color/spacing/motion tokens live in `tokens.css` — know which file to extend
