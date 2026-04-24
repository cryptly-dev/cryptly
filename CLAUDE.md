# cryptly — commands for coding agents

This file tells coding agents (Claude Code and others) exactly which commands to run to verify changes. **Do not improvise other commands** (`tsc -b`, `nest build --watch`, ad-hoc `jest` invocations, etc.) — use only what's listed here.

## Backend (`backend/`)

Two commands are all you need. Run them **at the very end**, once you're done editing, not iteratively while working.

```bash
# From backend/
npm run test           # full jest suite
npm run build          # nest build (compile check)
```

- To narrow the test run, pass a filter flag, e.g. `npm run test -- invitations` or `npm run test -- --testPathPattern=device-flow`. Jest flags after `--` are forwarded.
- `npm run test` already runs with `--runInBand --forceExit`; don't second-guess those.
- If both `test` and `build` pass, the backend change is verified. There is no separate typecheck step.

## Frontend (`frontend/`)

One command. Run it **at the very end**.

```bash
# From frontend/
pnpm build
```

- `pnpm build` chains `tsc -b && vite build`, so it *is* the typecheck. Do not run `tsc` on its own.
- There is no frontend test suite. Do not add one unless explicitly asked.

## Package managers

- Backend uses **npm**.
- Frontend uses **pnpm**.

Don't swap them.
