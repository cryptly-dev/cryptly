import { browser } from "$app/environment";
import { goto } from "$app/navigation";

import { COMMON_INVITE_AFTER_LOGIN_KEY } from "$lib/auth/kea-storage-keys";

/** Same shape as kea-localstorage JSON values (string or null). */
export function readStoredInviteIdAfterLogin(): string | null {
  if (!browser) {
    return null;
  }
  const raw = localStorage.getItem(COMMON_INVITE_AFTER_LOGIN_KEY);
  if (raw == null) {
    return null;
  }
  try {
    const v = JSON.parse(raw) as unknown;
    if (typeof v === "string" && v.length > 0) {
      return v;
    }
  } catch {
    // ignore
  }
  return null;
}

export function persistInviteIdForAfterLogin(inviteId: string): void {
  if (!browser) {
    return;
  }
  localStorage.setItem(COMMON_INVITE_AFTER_LOGIN_KEY, JSON.stringify(inviteId));
}

/** Clears persisted invite redirect the way Kea does when `null` is stored. */
function clearStoredInviteAfterLogin(): void {
  if (!browser) {
    return;
  }
  localStorage.setItem(COMMON_INVITE_AFTER_LOGIN_KEY, JSON.stringify(null));
}

export async function gotoAfterLogin(): Promise<void> {
  const inviteId = readStoredInviteIdAfterLogin();
  if (inviteId) {
    clearStoredInviteAfterLogin();
    await goto(`/invite/${inviteId}`);
    return;
  }
  await goto("/app/project");
}
