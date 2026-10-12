import { browser } from "$app/environment";

export const KEY_LOCKED_AT_STORAGE_KEY = "cryptly:key-locked-at";
/** Written after a passphrase change so other tabs reload the encrypted private key. */
export const PASSPHRASE_CHANGED_STORAGE_KEY = "cryptly:passphrase-changed-at";

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

export function broadcastPassphraseChanged() {
  if (!browser) return;
  localStorage.setItem(PASSPHRASE_CHANGED_STORAGE_KEY, String(Date.now()));
}
