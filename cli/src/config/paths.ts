import { homedir } from "node:os";
import { join } from "node:path";

export const CONFIG_DIR = join(homedir(), ".cryptly");
export const AUTH_FILE = join(CONFIG_DIR, "auth.json");

export const PROJECT_LINK_FILE = ".cryptly";
export const PROJECT_LOCK_FILE = ".cryptly.lock";

export function defaultApiUrl(): string {
  return process.env.CRYPTLY_API_URL ?? "https://api.cryptly.dev";
}

export function defaultAppUrl(): string {
  return process.env.CRYPTLY_APP_URL ?? "https://cryptly.dev";
}
