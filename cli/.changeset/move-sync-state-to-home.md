---
"@cryptly/cli": patch
---

Sync-state cursor moved out of the repo: it now lives in
`~/.cryptly/sync/<projectId>.json` (mode `0600`) instead of a
`.cryptly.lock` file in the working directory. It's per-machine state and
never belonged near the repo. The committed `.cryptly` link file is
unchanged.
