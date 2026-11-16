# 04: Record a payment

**What it build:** Staff can record a manual cash payment against an order from the order detail page, entering the amount in dollars (sent as integer cents). Payments list newest first. No refund, delete, or edit affordances anywhere — payments are immutable (ADR 0001).

**Blocked by:** 03 (Order detail + status change)

**Status:** ready-for-agent

- [ ] "Record cash payment" form on order detail: `POST /payments` with `{ order_id, amount }` in cents
- [ ] Dollar input converted precisely to cents; validation of "exceeds outstanding balance" 422 surfaced clearly
- [ ] Payments shown newest first (`-paid_at` default)
- [ ] No refund/delete/fail UI anywhere in the app
