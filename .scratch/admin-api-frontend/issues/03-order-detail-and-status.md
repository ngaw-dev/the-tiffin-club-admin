# 03: Order detail + status change

**What it build:** Staff can open an order and see its items, payments, and customer. A status dropdown offers all five valid statuses (`confirmed`, `ready_for_pickup`, `out_for_delivery`, `completed`, `cancelled`) with free transitions — the backend is the rule-maker. Cancel is disabled with a "Order has recorded payments" tooltip when the paid sum > 0.

**Blocked by:** 02 (Orders list)

**Status:** ready-for-agent

- [ ] Order detail view incl. items, payments, customer
- [ ] Status dropdown with the five API-valid statuses; change via `PATCH /orders/{id}` with `{ status }`
- [ ] Cancel disabled + explanatory tooltip when paid sum > 0 (422 on cancel is also surfaced gracefully)
- [ ] Money in dollars (cents at the boundary only)
