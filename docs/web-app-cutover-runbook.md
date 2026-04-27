# Web app cutover and rollback (SvelteKit vs legacy React)

Production **`WEB_APP_URL`** (backend `EnvConfigs`) is used when the API builds links such as the CLI browser approval URL (`/app/cli-authorize?session=…`). The browser app itself is deployed separately (e.g. Cloudflare Workers for `apps/web`).

## Flip order (big-bang)

1. Deploy the Svelte app so `https://cryptly.dev` (or your canonical host) serves **`apps/web`** with the same path layout for OAuth callbacks (`/app/callbacks/oauth/*`).
2. Confirm IdP redirect URI allowlists match the **public** origin you serve.
3. Update backend **`WEB_APP_URL`** to that same public origin if it is not already.
4. Update human-facing docs (e.g. root README) so local `WEB_APP_URL` and “primary UI” match the Svelte dev story.

## Rollback

- **Web:** redeploy or repoint DNS/hosting to the **last known good** static Worker or asset bundle. Keep a **tag or artifact** for the legacy React app until `frontend/` is removed from the repo.
- **Backend:** if `WEB_APP_URL` was changed for the cutover, revert it so CLI approval links and any server-built URLs match the app users actually open.
- **CLI:** users mid-approval may need a fresh `cryptly login` if sessions expire during the switch.

## Local development and `WEB_APP_URL`

| Goal                                        | `WEB_APP_URL` (backend `.env`)                                                         | Browser app        |
| ------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------ |
| Exercise Svelte + CLI approve links         | `http://localhost:9090` (or `127.0.0.1:9090` — match `PUBLIC_APP_URL`)                 | `apps/web` on 9090 |
| Visual parity vs React (`pnpm test:parity`) | Point at whichever app you want links to open; parity compares 5173 vs 9090 explicitly | Both dev servers   |

## After-login return (`/app/cli-authorize`)

Post-login navigation uses **`gotoAfterLogin`**: a pending **invite** in localStorage wins; otherwise a **validated** `/app/cli-authorize?session=<hex>` path stored in **sessionStorage** is used; otherwise **`/app/project`**. The session id must match the backend’s 32-character hex public id (open-redirect safe allowlist).

## CI

`apps/web` is validated in GitHub Actions via `.github/workflows/web-ci.yml` (`pnpm --filter web check` and `build`). Scheduled builds for the legacy `frontend/` package are not included by default; consider adding them during the dual-tree period so rollback artifacts stay buildable.

## Retiring `frontend/`

Policy: keep **`frontend/`** until at least **three** stable production releases on Svelte without a major rollback, then remove the app and clean root scripts, skills, and CI references. Tag the final React deploy before removal for emergency archaeology.
