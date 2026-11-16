# 03: Guard Menu deletion behind a 409

**What to build:** Deleting a Menu that any Order references fails with 409 (menu + items untouched), because orders keep snapshot prices but the menu is operational history. A menu with no orders still deletes cleanly together with its items.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] `DELETE /menus/{id}` with an existing order on the menu returns 409; menu and items remain
- [ ] Delete succeeds for a menu with no orders
- [ ] Tests cover both paths

*Note: work happens in the Laravel API repo (`the-tiffin-club-api`), admin menu controller + feature tests.*
