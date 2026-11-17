# 4. List Pages Are Server-Driven DataTables

Date: 2026-11-17
Status: Accepted

## Context

Every admin list page (Orders, Customers, Payments) needs the same handful of
behaviours: filtering, column sorting, pagination, loading skeletons, empty
states, and error handling — all against a Laravel API whose list endpoints
speak Spatie query-builder params (`filter[...]`, `sort` with a `-` prefix,
`page`, `per_page`) and return a ListEnvelope (`{ data, links, meta }`).

The amolsw component registry ships a TanStack Table-based DataTable plus the
surrounding primitives (SearchInput, SingleSelect, Pagination, EmptyState,
ToastProvider). The question was how much of it to adopt and where the
fetching/state ownership should live.

## Decision

All admin list pages are built on the amolsw DataTable running TanStack Table
in manual (server) mode, composed through one reusable wrapper:
`components/amolsw/data-table/server-data-table.tsx` (`ServerDataTable` +
`useServerTableQuery`).

- The table never sorts or paginates locally. It renders exactly what the API
  returned; sorting, filtering, and pagination all trigger a refetch.
- Filter, sort, page, and per_page state lives in the URL querystring, so
  filtered views are shareable and back/forward works (`popstate` handling in
  the wrapper; state changes use `replaceState` to avoid history spam).
- Text search applies live through a ~300 ms debounce; select filters apply
  instantly on change. There is no draft/applied filter split and no
  Apply/Reset buttons.
- The wrapper serializes table state to Spatie query-builder params
  client-side; pages map their endpoint's supported filters in `fetchPage`.
- Zero backend changes: the API already supported everything needed.

## Alternatives considered

- **Presentational-only adoption** (use the DataTable for rendering, keep each
  page's bespoke fetch/filter/pagination code). Rejected: it preserves the
  duplication the migration set out to remove, and each page had already
  drifted (Orders had a draft/applied pattern, others applied filters
  inconsistently).
- **Full rewrite of the list pages from scratch** (no amolsw dependency).
  Rejected: the registry components are maintained upstream and already match
  the design system; a bespoke table would re-solve skeletons, empty states,
  pagination windows, and comboboxes for no gain.
- **Server Components with client templates** (Next.js RSC data fetching,
  DataTable as a pure client leaf). Deferred, not rejected: the API client is
  bearer-token based with localStorage sessions, so client-side fetching is
  the honest fit today. The wrapper's `fetchPage` seam is where an RSC or
  server-action fetch could slot in later without rewriting pages.

## Consequences

- New list pages clone the wrapper (columns + `fetchPage` + `useServerTableQuery`
  config) rather than re-implementing filter/pagination plumbing.
- Endpoints without free-text search (Orders, Payments) map the search box to
  a concrete filter in `fetchPage` (numeric customer ID); pages decide that
  mapping, not the wrapper.
- TanStack's sort cycle is clamped to asc → desc (no third "unsorted" state),
  because the API's `sort` param is always present.
- The debounced search URL param (`q`) is intentionally omitted from history
  entries while typing; only settled state is addressable.
