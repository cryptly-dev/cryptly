import { browser } from "$app/environment";
import { keystore } from "$lib/auth/keystore";
import {
  broadcastKeyLock,
  KEY_LOCKED_AT_STORAGE_KEY,
  markKeyLocked,
} from "$lib/stores/key-state.svelte";

let lockPromise: Promise<void> | null = null;

function lockThisTab() {
  if (lockPromise) return lockPromise;
  lockPromise = (async () => {
    try {
      await keystore.wipeAll();
    } finally {
      markKeyLocked();
      lockPromise = null;
    }
  })();
  return lockPromise;
}

// Keys are shared by every tab, so locking one locks them all.
function lockEveryTab() {
  void lockThisTab()
    .catch(() => undefined)
    .then(() => broadcastKeyLock());
}

function handleVisibilityChange() {
  if (document.visibilityState === "hidden") lockEveryTab();
}

function handleStorage(event: StorageEvent) {
  if (event.key !== KEY_LOCKED_AT_STORAGE_KEY || !event.newValue) return;
  void lockThisTab().catch(() => undefined);
}

/** Locks this tab as soon as another tab locks (e.g. on logout). */
export function followKeyLocks() {
  if (!browser) return;
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

/** Locks every tab as soon as this one loses focus. */
export function lockOnFocusLoss() {
  if (!browser) return;
  window.addEventListener("blur", lockEveryTab);
  // Mobile browsers don't always blur when the app goes to the background.
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    window.removeEventListener("blur", lockEveryTab);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}
