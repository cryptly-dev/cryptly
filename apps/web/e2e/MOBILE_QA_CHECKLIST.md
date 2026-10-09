# Mobile QA checklist (pre-cutover)

Run on a real phone or Chrome DevTools device emulation (e.g. 375×812). Backend `WEB_APP_URL` should match the app origin you test.

## Auth & unlock

- [ ] Open `/`, go to `/app/login`, complete OAuth, finish passphrase setup if prompted.
- [ ] From another session or device flow: unlock browser via connected device + PIN when unlock dialog is shown.

## Project editor

- [ ] Open `/app/project/$id`, Editor tab: change a secret value, Save, then Push (with at least one GitHub integration; skip push if mock-only).

## Members & invites

- [ ] Members tab: create a link invite; copy link and optional code.
- [ ] As admin: Pending invitations lists link + personal rows; Revoke removes an entry without errors.

## Guards & navigation

- [ ] With unsaved edits in the editor, switch to another project from the sidebar — confirm dialog offers Save & continue / Discard / Keep editing; Save persists then navigates.
- [ ] With unsaved edits, reload the tab — browser warns before unload.

## CLI / parity notes

- [ ] `/app/cli-authorize` — session-based CLI approval still works for your environment (see CLI flow docs/runbook).

## Cutover-specific (when applicable)

- [ ] Accept a link invite at `/invite/$id` end-to-end.

Mark each box before flipping production `webAppUrl` to the Svelte deployment.
