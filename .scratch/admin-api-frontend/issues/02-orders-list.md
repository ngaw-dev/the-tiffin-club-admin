# 02: Orders list

**What it build:** Staff can browse real orders at `/orders`: filter by status, fulfilment, customer, or menu; sort by placed date or total; paginate. Each row shows customer, total in dollars, paid sum, and status badge.

**Blocked by:** 01 (API client + login/logout shell)

**Status:** ready-for-agent

- [ ] Fetches `GET /orders` with Spatie query-builder params (`filter[...]`, `sort` with `-` prefix, `page`, `per_page`)
- [ ] Filters: status, fulfilment, customer_id, menu_id
- [ ] Sorts: `placed_at`, `total`; default `-placed_at`
- [ ] Totals and paid sums displayed in dollars, converted from integer cents at the boundary
- [ ] Pagination controls using the list envelope's links/meta
