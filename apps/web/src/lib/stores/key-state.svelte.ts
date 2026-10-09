import { browser } from "$app/environment";

export const KEY_LOCKED_AT_STORAGE_KEY = "cryptly:key-locked-at";

export const keyAuth = $state({
  hasMasterKey: false,
  masterKeyHydrated: false,
  revision: 0,
});

function incrementRevision() {
  keyAuth.revision += 1;
}

export function setHasMasterKey(value: boolean) {
  keyAuth.hasMasterKey = value;
  incrementRevision();
}

export function markMasterKeyHydrated() {
  keyAuth.masterKeyHydrated = true;
  incrementRevision();
}

export function markKeyUnlocked() {
  keyAuth.hasMasterKey = true;
  keyAuth.masterKeyHydrated = true;
  incrementRevision();
}

export function markKeyLocked() {
  keyAuth.hasMasterKey = false;
  keyAuth.masterKeyHydrated = true;
  incrementRevision();
}

export function broadcastKeyLock(lockedAt = Date.now()) {
  if (!browser) return;
  localStorage.setItem(KEY_LOCKED_AT_STORAGE_KEY, String(lockedAt));
}
