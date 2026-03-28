# Web Design System

## Source of Truth

All token definitions live in `styles/tokens.css`. Read that file for exact values. This document explains **how to use** the system, not what every value is.

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

Tokens live in `styles/tokens.css` (section 3). Components live in `components/ui/typography.tsx`.

**Page-level primitives:** `DisplayPage`, `TitlePage`, `SubTitlePage`, `SectionTitle`
**Supporting primitives:** `BodyBase`, `CodeSnippet`

Rules:
- Use typography primitives — don't hardcode `text-[...]` or raw `h1`-`h6`/`p` tags in app files
- Size tokens: `tokens.css` (`--type-size-*`)
- Leading/tracking/weight/family: `typography.tsx`
- Need a new treatment? Extend tokens + primitives, don't inline one-off classes

---

## Fonts

Three font stacks defined in `tokens.css`:
- `--font-display` — display/heading face (Mpex Sans Rounded)
- `--font-body` — body face (Mpex Sans)
- `--font-code` — monospace (JetBrains Mono)

Tailwind bridge: `font-sans` (body), `font-display`, `font-body`, `font-code`

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
3. **Delete every `dark:` prefixed class** — the token system handles dark mode via CSS variable swaps in `styles/tokens.css`. Tailwind `dark:` modifiers on individual classes are redundant and will produce conflicts.
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

Every `dark:` prefixed class in a generated shadcn component must be deleted. The semantic tokens in `styles/tokens.css` already define `:root` (light) and `.dark` (dark) variable values — the dark mode swap happens at the CSS variable level, not at the Tailwind class level. Keeping `dark:` classes will override the token swap and produce broken styling.

---

## Additional Primitives in tokens.css

These are available but not listed above in detail — check `tokens.css` for values:

- **Spacing:** `--space-*` (4px grid), `--space-section-md/lg`, `--space-container-padding`
- **Radius:** `--radius-none` through `--radius-full`
- **Z-index:** `--z-behind` through `--z-max`
- **Motion:** `--duration-*`, `--ease-*`, `--transition-*` (auto-disabled on `prefers-reduced-motion`)
- **Shadows:** `--shadow-xs` through `--shadow-2xl`, `--shadow-inset`
- **Focus rings:** `--focus-ring`, `--focus-ring-danger`, `--focus-ring-success`

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

All text sizes come from `tokens.css` and are exposed as Tailwind utilities through the `@theme inline` bridge.

**Available size utilities** (mapped from `--type-size-*` tokens):

| Utility | Token | Type |
|---|---|---|
| `text-display-page` | `--type-size-display-page` | fluid |
| `text-title-page` | `--type-size-title-page` | fluid |
| `text-display` | `--type-size-display` | fluid |
| `text-headline` | `--type-size-headline` | fluid |
| `text-section-title` | `--type-size-section-title` | fluid |
| `text-title` | `--type-size-title` | fluid |
| `text-subtitle-page` | `--type-size-subtitle-page` | fluid |
| `text-subtitle` | `--type-size-subtitle` | responsive (breakpoint) |
| `text-body` | `--type-size-body` | responsive (breakpoint) |
| `text-body-small` | `--type-size-body-small` | responsive (breakpoint) |
| `text-label` | `--type-size-label` | responsive (breakpoint) |
| `text-caption` | `--type-size-caption` | responsive (breakpoint) |
| `text-overline` | `--type-size-overline` | responsive (breakpoint) |
| `text-code` | `--type-size-code` | responsive (breakpoint) |

**Hard rules:**
- Use these token utilities — never raw `text-sm`, `text-base`, `text-lg`, `text-[...]`, or `sm:text-base`
- Typography primitives in `typography.tsx` already map to the correct token. Use the primitive, not the raw class
- If a size doesn't exist, add a token to `tokens.css` and expose it in `@theme inline`

**Which primitive for which context:**

| Context | Primitive | Size utility used internally |
|---|---|---|
| Hero/landing display | `DisplayPage` | `text-display-page` |
| Page title | `TitlePage` | `text-title-page` |
| Page subtitle | `SubTitlePage` | `text-subtitle-page` |
| Section heading | `SectionTitle` | `text-section-title` |
| General heading | `Title` | `text-section-title` |
| Body copy | `Body`, `BodyBase` | `text-body` |
| Small body | `BodySmall` | `text-body-small` |
| Form labels | `Label` | `text-label` |
| Captions/meta | `Caption` | `text-caption` |
| Inline code | `CodeSnippet` | inherits parent size |

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
7. **Always use token size utilities** (`text-body`, `text-label`) — never raw Tailwind sizes (`text-sm`, `text-base`)
