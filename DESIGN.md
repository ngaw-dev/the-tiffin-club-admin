# Design System — The Tiffin Club Admin

This file is the single source of truth for design decisions in the admin
app. Read it before building UI; append to it after.

## Product

- **Admin console** for The Tiffin Club (internal): orders, menus, and
  operations management. Desktop-first; density and glanceable data over
  appetite-driven marketing polish (that's the storefront app's job).
- Sibling storefront app: `../the-tiffin-club-web` (own DESIGN.md).

## Design Tokens

shadcn CSS variables in hex, **light only** (no `.dark` block, no dark
variant), mapped through `@theme inline` in `app/globals.css` (Tailwind
CSS v4 — no `tailwind.config.ts`). Values are copied from the storefront's
`../the-tiffin-club-web/app/globals.css` `:root` — that file is the
source of truth (its DESIGN.md approximations drift; the CSS wins):

| Token                             | Light      | Usage                     |
| --------------------------------- | ---------- | ------------------------- |
| `--background` / `--foreground`   | `#faf7f2` / `#1f1b16` | Page           |
| `--primary`                       | `#c94a2c`  | CTAs, active states       |
| `--secondary` / `--muted`         | `#f3eee6` / `#efe9e0` | Chips, subtle surfaces |
| `--accent`                        | `#2f6f5e`  | Reserved for veg (storefront convention) |
| `--destructive`                   | `#b42318`  | Errors, destructive acts  |
| `--border` / `--input` / `--ring` | `#d1d9e0` / `rgba(31,27,22,.16)` / `#c94a2c` | Standard chrome |
| `--sidebar-*`                     | derived admin-local: sidebar `#f3eee6`, sidebar-border `#e5ddd0`, sidebar-primary `#c94a2c` | Admin sidebar |
| `--radius`                        | `0.5rem`   | Radii scale (sm→4xl)      |

Typography (skeleton-design trio, loaded via `next/font/google` in
`app/layout.tsx`): Poppins for headings (`--font-heading`), Source Sans 3
for body/default (`--font-sans`; renamed from Source Sans Pro), JetBrains
Mono for IDs and codes (`--font-mono`).

## Component Source of Truth

- **shadcn/ui** (`new-york` style, `neutral` base, lucide icons, CSS
  variables). Always use it; never hand-roll primitives shadcn provides.
  Aliases: `@/components/ui`, `@/components`, `@/lib/utils`, `@/hooks`.
- **Premium blocks: @shadcnblocks first** for page-level layouts
  (dashboard, sidebar shell, auth). Registered in `components.json` at
  `https://www.shadcnblocks.com/r/{name}`, auth via
  `SHADCNBLOCKS_API_KEY` env var. Custom composition only when no
  suitable block exists.
  - Note: key not yet present in this repo's environment — when added,
    search `@shadcnblocks` before building shell/dashboard layouts.
- `components/ui/**` and `components/shadcnblocks/**` are excluded from
  oxlint/oxfmt (generated code).

## Component Inventory

**shadcn/ui installed (2026-11-16):** button, card, table, badge,
separator.

**shadcn/ui added (2026-11-16, ticket 03):** sidebar (with sheet, tooltip,
skeleton, input, use-mobile hook). Admin shell composed from the sidebar
primitive + Next `<Link>`/`usePathname` in `components/layout/app-sidebar.tsx`
— @shadcnblocks application-shell blocks use client-state navigation, not
routes, so the primitive was composed instead.

**shadcn/ui added (2026-11-16, skeleton re-theme):** avatar, dropdown-menu.
Shell = sidebar primitive re-skinned to the skeleton app's layout metrics
(w-64/w-16 collapse, mobile drawer, sticky top bar with search /
notifications / user menu as static placeholders) in
`components/layout/top-bar.tsx` + `app-sidebar.tsx`.

## Decision Log

| Date       | Decision                                                                                                                                            | Rationale                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 2026-11-16 | ESLint/Prettier dropped in favor of oxlint + oxfmt                                                                                                  | Faster, fewer deps; matches repo scripts `lint:ox` / `format`                                             |
| 2026-11-16 | shadcn/ui + @shadcnblocks premium blocks as component source of truth (mirrors storefront app)                                                      | Consistency, speed, premium quality                                                                       |
| 2026-11-16 | Tailwind v4 CSS-variable tokens, neutral base, no `tailwind.config.ts`                                                                              | Tailwind v4 `@theme inline` replaces config file                                                          |
| 2026-11-16 | Admin shell = shadcn `sidebar` primitive + Next `<Link>` w/ `usePathname` active state; mobile via sidebar's built-in Sheet; nav buttons `min-h-11` | @shadcnblocks shells don't do real routing; primitive composition is the smallest correct fit (ticket 03) |
| 2026-11-16 | Re-themed to the skeleton app's dashboard design with the storefront terracotta palette, light-only; fonts = skeleton trio (Poppins / Source Sans 3 / JetBrains Mono) via `next/font` | One brand across web + admin; structure/patterns from `ci-cd-project-skeleton-v2/apps/backend`, colors from web `globals.css` (CSS is truth over its DESIGN.md); skeleton's raw gray/indigo classes tokenized rather than ported |
