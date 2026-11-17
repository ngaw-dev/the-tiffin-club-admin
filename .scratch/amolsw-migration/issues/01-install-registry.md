# 01: Install amolsw registry & normalize imports

**What to build:** All components from the shadcn GitHub registry `amolswnz/react-components` are installed in the project (components under `components/amolsw/`, hooks under `hooks/amolsw/`, utilities under `lib/amolsw/`), all npm dependencies install, any `@radix-ui/react-*` imports the registry emits are rewritten to the project's unified `radix-ui` package, missing shadcn ui primitives the registry depends on are added, and `pnpm build` passes. No page uses the new components yet.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] `pnpm dlx shadcn@latest add amolswnz/react-components` succeeds for all components
- [x] Only `radix-ui` package used for radix imports (no `@radix-ui/react-*` in package.json)
- [x] `pnpm lint:ox`, `pnpm test`, `pnpm build` all pass
