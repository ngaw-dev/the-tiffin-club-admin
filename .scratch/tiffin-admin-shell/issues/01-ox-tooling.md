# 01: Replace ESLint with oxlint/oxfmt

**What to build:** The scaffold lints and formats with ox instead of ESLint. `pnpm lint:ox` and `pnpm format:check` pass on the untouched scaffold; ESLint deps and `eslint.config.mjs` removed; `components/ui/**` excluded in `.oxlintrc.json` / `.oxfmtrc.json` (for future shadcn output).

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] eslint deps and config removed
- [ ] oxlint + oxfmt installed, config files present, `components/ui/**` ignored
- [ ] `lint:ox`, `format`, `format:check` scripts work and pass
