# 07: Migrate Payments list to DataTable wrapper

**What to build:** The payments list page uses the shared server-mode DataTable wrapper (URL-synced state, instant SingleSelect filters, header-click sorting), keeping its totals row. Hand-rolled pagination, filter form, and sort select are deleted.

**Blocked by:** 05 — DataTable server-mode wrapper, proven on Orders.

**Status:** ready-for-agent

- [ ] Payments page renders via the shared DataTable wrapper
- [ ] Totals row preserved
- [ ] Hand-rolled pagination/filters/select code removed from the page
- [ ] Build, lint, tests pass
