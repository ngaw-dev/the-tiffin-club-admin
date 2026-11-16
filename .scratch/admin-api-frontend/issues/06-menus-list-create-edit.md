# 06: Menus — list, create, edit publish/cutoff

**What it build:** The `/menu` page shows real menus from the API (newest first, filterable by date), replacing the hard-coded menu. Staff can create a menu for a date with an optional cutoff time, toggle publish, and change the cutoff via PATCH.

**Blocked by:** 01 (API client + login/logout shell)

**Status:** ready-for-agent

- [ ] `GET /menus` with `filter[menu_date]`, sort `-menu_date`, items included
- [ ] Create menu: `POST /menus` with `menu_date` (unique, 422 surfaced) and optional `cutoff_time` (HH:MM)
- [ ] Publish toggle and cutoff edit via `PATCH /menus/{id}`
- [ ] Hard-coded `DAILY_MENU` removed
