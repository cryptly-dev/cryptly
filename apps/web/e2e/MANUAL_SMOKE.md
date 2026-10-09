# Manual smoke matrix (Svelte `apps/web`)

Run after meaningful auth, crypto, or shell changes. Adapt to your environment (local, staging, prod).

| Area              | Steps                                                      | Expect                                                                                  |
| ----------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| OAuth             | Sign in with Google and GitHub                             | `OAuthCallbackPage` completes; lands on invite, CLI return, or `/app/project`           |
| Local login       | `PUBLIC_ALLOW_LOCAL_LOGIN=true`: quick user or email       | JWT stored; projects load                                                               |
| App shell         | Open `/app/project` logged out                             | Redirect to `/app/login`                                                                |
| Projects          | Create project, open editor                                | No crypto errors; save works                                                            |
| CLI authorize     | `cryptly login` → open approve URL (needs real session id) | `/app/cli-authorize` loads device name; passphrase approve succeeds; CLI receives token |
| CLI + login       | Open approve URL logged out → complete OAuth               | Returns to `/app/cli-authorize?session=…` with valid session (same tab)                 |
| Invite            | Open `/invite/:id` with stored after-login invite          | Precedence: invite over CLI return when both set                                        |
| Secrets / history | Edit secrets; open history tab                             | History and search behave normally                                                      |

Pair with `pnpm test:parity` when both dev servers are up (see `visual-parity.spec.ts`).
