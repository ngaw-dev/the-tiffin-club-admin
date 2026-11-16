# 09: Live dashboard

**What it build:** The `/` dashboard shows real data instead of hard-coded stats: today's menu and its ordering window, open orders, and today's payments. Reuses the list-fetching patterns from the orders and menus pages.

**Blocked by:** 02 (Orders list), 06 (Menus — list, create, edit publish/cutoff)

**Status:** ready-for-agent

- [ ] Today's menu from `GET /menus` filtered by date, with cutoff/ordering window from settings
- [ ] Open-orders count from the orders list
- [ ] Today's payments summary
- [ ] No hard-coded numbers, dates, or "Open · 09:00–16:30"-style badges remain
