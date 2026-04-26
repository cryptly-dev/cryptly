import { hostname, platform, userInfo } from "node:os";

export function deviceName(): string {
  try {
    const host = hostname();
    const user = userInfo().username;
    return `${user}@${host} · ${platform()}`;
  } catch {
    return "cryptly cli";
  }
}
