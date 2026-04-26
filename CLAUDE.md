# cryptly — notes for coding agents

## About the project

Cryptly is a **zero-knowledge, end-to-end encrypted secrets management platform** (see [cryptly.dev](https://cryptly.dev) / [github.com/cryptly-dev/cryptly](https://github.com/cryptly-dev/cryptly)). Teams use it to store API keys, credentials, and other secrets, share them with collaborators, track version history, and sync to GitHub.

The core promise is that **the server never sees plaintext secrets or private keys**. All encryption happens client-side: user RSA-OAEP key pairs are generated in the browser, the private key is encrypted with a user passphrase before it ever leaves the device, and per-project symmetric keys are wrapped with the user's public key. Sharing (invitation links, direct invites) is built on top of these primitives without ever exposing plaintext to the backend.

### Security is the product

Because the whole value proposition is cryptographic, **security bugs are product bugs of the highest severity**. When working on anything that touches crypto, key storage, invitations, auth, or anything that could leak plaintext / keys / passphrases to the server or to logs:

- Be extra careful and explicit about what is encrypted, where, and with which key.
- Never add logging, telemetry, or error messages that could expose plaintext secrets, passphrases, private keys, or symmetric project keys.
- Never move decryption to the server or send unwrapped keys to it, even "temporarily".
- If something feels off about a crypto flow, stop and flag it rather than papering over it.

## Commands

This section tells coding agents exactly which commands to run to verify changes. **Do not improvise other commands** (`tsc -b`, `nest build --watch`, ad-hoc `jest` invocations, etc.) — use only what's listed here.

### Backend (`backend/`)

Two commands are all you need. Run them **at the very end**, once you're done editing, not iteratively while working.

```bash
# From backend/
pnpm test              # full jest suite
pnpm build             # nest build (compile check)
```

- To narrow the test run, pass a filter flag, e.g. `pnpm test invitations` or `pnpm test -- --testPathPattern=device-flow`. Jest flags after `--` are forwarded.
- `pnpm test` already runs with `--runInBand --forceExit`; don't second-guess those.
- If both `test` and `build` pass, the backend change is verified. There is no separate typecheck step.

### Frontend (`frontend/`)

One command. Run it **at the very end**.

```bash
# From frontend/
pnpm build
```

- `pnpm build` chains `tsc -b && vite build`, so it *is* the typecheck. Do not run `tsc` on its own.
- There is no frontend test suite. Do not add one unless explicitly asked.

### CLI (`cli/`)

```bash
# From cli/
pnpm test              # vitest run
pnpm build             # tsc --noEmit && tsup
```

- `pnpm build` chains the typecheck into the bundle step. Do not run `tsc` on its own.
- Both should pass at the end.

### Package manager

Backend, frontend, and the CLI all use **pnpm**. Each package has its own `pnpm-lock.yaml`; there is no workspace.
