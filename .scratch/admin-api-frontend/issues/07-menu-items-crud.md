# 07: Menu items CRUD

**What it build:** Staff can build out a day's menu: add, edit, and delete mains and extras with prices (entered in dollars, sent in cents) and sort order. Deleting a menu surfaces a clear 409 message when orders reference it.

**Blocked by:** 06 (Menus — list, create, edit publish/cutoff)

**Status:** ready-for-agent

- [ ] `POST /menus/{id}/items` with type (`main` | `extra`), name, description?, price (cents), sort_order?
- [ ] `PATCH /menus/{id}/items/{itemId}` for the same fields
- [ ] `DELETE /menus/{id}/items/{itemId}` — safe for existing orders (unit_price snapshot), noted in UI if helpful
- [ ] `DELETE /menus/{id}` with 409 "orders reference this menu" surfaced clearly
- [ ] Prices in dollars in the UI, cents at the boundary
