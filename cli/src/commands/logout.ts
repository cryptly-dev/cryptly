import axios from "axios";
import { clearAuthState, readAuthState } from "../config/auth-store.js";
import { defaultApiUrl } from "../config/paths.js";
import { ok } from "../util/style.js";

export async function logoutCommand(): Promise<void> {
  const auth = await readAuthState();
  if (!auth) {
    process.stderr.write(`${ok("Already logged out.")}\n`);
    return;
  }

  // Best-effort revoke on the server. We always wipe the local file regardless.
  try {
    await axios.post(
      `${defaultApiUrl()}/auth/logout`,
      { refreshToken: auth.refreshToken },
      { timeout: 10_000 },
    );
  } catch {
    // ignore — local state will be cleared anyway
  }

  await clearAuthState();
  process.stderr.write(`${ok("Logged out.")}\n`);
}
