# 05: Menu placeholder: daily Main + Extras

**What to build:** `/menu` shows a hardcoded daily menu mirroring `GET /menu/today`: date header, exactly one Main item card, an Extras table (name, description, price), and an ordering-window badge. Prices are stored in cents and rendered as dollars. Data is a static const; no network calls.

**Blocked by:** 03.

**Status:** ready-for-agent

- [ ] Main card + Extras table render from a hardcoded daily-menu const
- [ ] Prices in cents, displayed as currency
- [ ] Ordering-window badge shows open/closed/closing_soon state
