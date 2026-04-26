import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { AUTH_FILE, CONFIG_DIR } from "./paths.js";

export interface AuthState {
  userId: string;
  displayName?: string;
  email?: string;
  refreshToken: string;
  /** Base64 PKCS8 of the user's RSA-OAEP private key. Decrypts project keys. */
  userPrivateKey: string;
  /** ISO-8601 of when this auth was established. */
  createdAt: string;
}

export async function readAuthState(): Promise<AuthState | null> {
  try {
    const raw = await readFile(AUTH_FILE, "utf8");
    return JSON.parse(raw) as AuthState;
  } catch (e: any) {
    if (e?.code === "ENOENT") return null;
    throw e;
  }
}

export async function writeAuthState(state: AuthState): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  await writeFile(AUTH_FILE, JSON.stringify(state, null, 2), { mode: 0o600 });
  // mkdir's mode is masked by umask on most systems — re-chmod just in case.
  await chmod(dirname(AUTH_FILE), 0o700).catch(() => {});
  await chmod(AUTH_FILE, 0o600).catch(() => {});
}

export async function clearAuthState(): Promise<void> {
  await rm(AUTH_FILE, { force: true });
}
