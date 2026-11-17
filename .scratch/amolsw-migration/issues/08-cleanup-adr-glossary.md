# 08: Cleanup, ADR, and glossary

**What to build:** All dead local code replaced by amolsw components is removed; the repo is fully green; the decision that list pages are TanStack manual-mode DataTables over Spatie query-builder params is recorded as an ADR (`docs/adr/`), and GLOSSARY.md gains the terms List Page, Applied Filters, and Query Envelope.

**Blocked by:** 02, 03, 04, 06, 07.

**Status:** ready-for-agent

- [ ] No dead/replaced component code remains
- [ ] `pnpm lint:ox`, `pnpm test`, `pnpm build` pass
- [ ] ADR recorded for the DataTable list-page architecture
- [ ] GLOSSARY.md updated with List Page, Applied Filters, Query Envelope
