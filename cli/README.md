# @cryptly/cli

End-to-end encrypted secrets, from your terminal.

```bash
pnpm add -g @cryptly/cli
# or: npx @cryptly/cli@latest

cryptly login           # one-time, opens a browser to authorize this device
cryptly link            # connect this directory to a cryptly project
cryptly pull            # write secrets to .env (or whatever you linked)
cryptly push            # send your local file back to cryptly
```

## How it works

Cryptly never sees your plaintext secrets. The CLI follows the same
zero-knowledge model as the web app:

- `cryptly login` generates an RSA temp keypair locally, opens the web app to
  approve, and the browser envelope-encrypts your private key for the CLI's
  temp public key. The plaintext private key never reaches the server, and
  your passphrase never leaves the browser.
- `cryptly pull` and `cryptly push` decrypt your project's symmetric key with
  your private key on disk, then encrypt/decrypt the secrets file locally.

Auth state is stored in `~/.cryptly/auth.json` with mode `0600`. The
project↔directory link lives in a committed `.cryptly` file, with a
`.cryptly.lock` (gitignore it) for last-pulled bookkeeping.

## Commands

- `cryptly login` — authorize this device.
- `cryptly logout` — wipe the local session.
- `cryptly whoami` — show the signed-in account.
- `cryptly link [--file <path>] [--pick]` — link this directory to a project.
  Tries to auto-detect from the git remote; pass `--pick` to force the picker.
- `cryptly pull [-y]` — pull remote secrets to the local file. Prompts on
  destructive changes; `-y` skips the prompt.
- `cryptly push [-y]` — push the local file. Warns if the remote moved since
  your last sync, and prompts on destructive changes.

## Environment

- `CRYPTLY_API_URL` — override the backend URL (defaults to
  `https://api.cryptly.dev`).
- `CRYPTLY_APP_URL` — override the web app URL (used in messages).
