import { browser } from "$app/environment";
import { keystore } from "$lib/auth/keystore";
import {
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
