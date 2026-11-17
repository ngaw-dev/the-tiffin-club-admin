# 04: Menu page native date/time inputs → DateTimeField

**What to build:** The menu page's native date and time inputs are replaced with the amolsw DateTimeField picker. Existing validation semantics (date format, time format, required rules) are preserved, now enforced by the component rather than manual regex.

**Blocked by:** 01 — Install amolsw registry & normalize imports.

**Status:** ready-for-agent

- [ ] All date/time inputs on the menu page use DateTimeField
- [ ] Saving a menu item with valid date/time works end-to-end
- [ ] Invalid dates cannot be submitted
- [ ] Build and lint pass
