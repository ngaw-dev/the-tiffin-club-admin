# Design System — The Tiffin Club Admin

This file is the single source of truth for design decisions in the admin
app. Read it before building UI; append to it after.

## Product

- **Admin console** for The Tiffin Club (internal): orders, menus, and
  operations management. Desktop-first; density and glanceable data over
  appetite-driven marketing polish (that's the storefront app's job).
- Sibling storefront app: `../the-tiffin-club-web` (own DESIGN.md).

## Design Tokens

shadcn CSS variables (`oklch`), neutral base color, light + dark, mapped
through `@theme inline` in `app/globals.css` (Tailwind CSS v4 — no
`tailwind.config.ts`):

| Token                             | Light              | Dark              | Usage                     |
| --------------------------------- | ------------------ | ----------------- | ------------------------- |
| `--background` / `--foreground`   | white / near-black | `#0a0a0a` / light | Page                      |
| `--primary`                       | near-black         | near-white        | CTAs, active states       |
| `--secondary` / `--muted`         | neutral 97%        | neutral 27%       | Chips, subtle surfaces    |
| `--destructive`                   | red                | red               | Errors, destructive acts  |
| `--border` / `--input` / `--ring` | neutral scale      | neutral scale     | Standard chrome           |
| `--sidebar-*`                     | neutral scale      | neutral scale     | Admin sidebar (ticket 03) |
| `--radius`                        | `0.625rem`         | —                 | Radii scale (sm→4xl)      |

Typography: Geist Sans (default) / Geist Mono for IDs and codes.

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

## Decision Log

| Date       | Decision                                                                                                                                            | Rationale                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 2026-11-16 | ESLint/Prettier dropped in favor of oxlint + oxfmt                                                                                                  | Faster, fewer deps; matches repo scripts `lint:ox` / `format`                                             |
| 2026-11-16 | shadcn/ui + @shadcnblocks premium blocks as component source of truth (mirrors storefront app)                                                      | Consistency, speed, premium quality                                                                       |
| 2026-11-16 | Tailwind v4 CSS-variable tokens, neutral base, no `tailwind.config.ts`                                                                              | Tailwind v4 `@theme inline` replaces config file                                                          |
| 2026-11-16 | Admin shell = shadcn `sidebar` primitive + Next `<Link>` w/ `usePathname` active state; mobile via sidebar's built-in Sheet; nav buttons `min-h-11` | @shadcnblocks shells don't do real routing; primitive composition is the smallest correct fit (ticket 03) |
