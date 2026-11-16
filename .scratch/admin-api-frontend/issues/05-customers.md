# 05: Customers list + detail + edit

**What it build:** Staff can browse customers at `/customers` filtered by name, email, or suburb and sorted by name, seeing each customer's order count. Opening a customer shows their orders (with payments) newest first, and an inline edit form for name, email, phone, address, and suburb. No create/delete/blocking affordances.

**Blocked by:** 01 (API client + login/logout shell)

**Status:** ready-for-agent

- [ ] `/customers` list with filters and sort, showing `order_count`
- [ ] Customer detail with orders + payments, newest first
- [ ] Inline edit via `PATCH /customers/{id}` for name/email/phone/address/suburb
- [ ] No create, delete, or block UI
