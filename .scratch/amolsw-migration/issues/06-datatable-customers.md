# 06: Migrate Customers list to DataTable wrapper

**What to build:** The customers list page uses the same server-mode DataTable wrapper proven on orders (URL-synced state, live debounced name/email/suburb search, instant SingleSelect filters, header-click sorting). The page's hand-rolled pagination controls, filter form, and sort select are deleted.

**Blocked by:** 05 — DataTable server-mode wrapper, proven on Orders.

**Status:** ready-for-agent

- [ ] Customers page renders via the shared DataTable wrapper
- [ ] Hand-rolled pagination/filters/select code removed from the page
- [ ] Loading, empty, and error states render correctly
- [ ] Build, lint, tests pass
