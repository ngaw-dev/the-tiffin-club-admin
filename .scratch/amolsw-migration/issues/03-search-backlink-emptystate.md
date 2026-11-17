# 03: Mechanical swaps — SearchInput, BackLink, EmptyState

**What to build:** The top-bar global search uses amolsw SearchInput, all "← Back to …" links on detail pages use BackLink, and every inline "No X match" empty-state paragraph uses EmptyState. Visual parity or improvement; no behavior change anywhere.

**Blocked by:** 01 — Install amolsw registry & normalize imports.

**Status:** ready-for-agent

- [ ] Top-bar search renders via amolsw SearchInput
- [ ] All back links (customer detail, order detail) render via BackLink
- [ ] All list empty states render via EmptyState with icon and appropriate message
- [ ] Build and lint pass
