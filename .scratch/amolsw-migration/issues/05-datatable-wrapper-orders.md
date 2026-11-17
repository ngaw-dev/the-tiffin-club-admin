# 05: DataTable server-mode wrapper, proven on Orders

**What to build:** The orders list page is fully rebuilt on the amolsw DataTable running TanStack Table in manual (server) mode. Table state — filters, sort, page, per_page — lives in the URL querystring so filtered views are shareable and back-button-safe. Text filters (customer search) apply live via amolsw SearchInput + useDebounce (~300ms); select filters (status, fulfilment, customer, menu) apply instantly on change via SingleSelect. Sorting is header-click on all columns. State is serialized client-side to the API's Spatie query-builder params (`filter[...]`, `sort`, `page`, `per_page`); pagination consumes the Laravel ListEnvelope meta. Loading shows skeletons, empty results show EmptyState, fetch errors surface as toasts. The draft/applied filter pattern and Apply/Reset buttons are gone. Zero backend changes.

**Blocked by:** 01 — Install amolsw registry & normalize imports; 02 — ToastProvider at root.

**Status:** ready-for-agent

- [ ] Orders page renders via amolsw DataTable with server pagination/sorting
- [ ] Filter/sort/page state round-trips through the URL
- [ ] Text search debounces; selects apply instantly; no Apply/Reset buttons
- [ ] Sorting by clicking column headers on every sortable column
- [ ] Loading, empty, and error states render correctly
- [ ] Build, lint, tests pass
