import { browser } from "$app/environment";
import { keystore } from "$lib/auth/keystore";
import {
  broadcastKeyLock,
  KEY_LOCKED_AT_STORAGE_KEY,
  keyAuth,
  markKeyLocked,
} from "$lib/stores/key-state.svelte";

const AUTO_LOCK_AFTER_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"];
const LAST_ACTIVITY_STORAGE_KEY = "cryptly:key-last-activity-at";
const ACTIVITY_WRITE_THROTTLE_MS = 15 * 1000;

let lastActivityAt = 0;
let lastActivityWriteAt = 0;
let autoLockTimer: ReturnType<typeof setTimeout> | null = null;
let lockPromise: Promise<void> | null = null;

function clearAutoLockTimer() {
  if (!autoLockTimer) return;
  clearTimeout(autoLockTimer);
  autoLockTimer = null;
}

function isStale(now = Date.now()) {
  return lastActivityAt > 0 && now - lastActivityAt >= AUTO_LOCK_AFTER_MS;
}

function readStoredActivity(): number {
  if (!browser) return 0;
  const raw = localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY);
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function writeStoredActivity(value: number, { force = false } = {}) {
  if (!browser) return;
  if (!force && value - lastActivityWriteAt < ACTIVITY_WRITE_THROTTLE_MS) return;
  lastActivityWriteAt = value;
  localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(value));
}

function scheduleAutoLock() {
  clearAutoLockTimer();
  if (!browser || !keyAuth.hasMasterKey || lastActivityAt === 0) return;

  const remaining = Math.max(
    0,
    AUTO_LOCK_AFTER_MS - (Date.now() - lastActivityAt),
  );
  autoLockTimer = setTimeout(() => {
    void lockBrowserKeys().catch(() => undefined);
  }, remaining);
}

function recordActivity() {
  if (!browser || !keyAuth.hasMasterKey) return;
  lastActivityAt = Date.now();
  writeStoredActivity(lastActivityAt);
  scheduleAutoLock();
}

async function checkStaleBeforeActivity() {
  if (!keyAuth.hasMasterKey) return true;
  if (!isStale()) return false;
  await lockBrowserKeys().catch(() => undefined);
  return true;
}

function handleActivity() {
  void (async () => {
    if (await checkStaleBeforeActivity()) return;
    recordActivity();
  })();
}

function handleFocusOrVisibility() {
  void (async () => {
    if (await checkStaleBeforeActivity()) return;
    recordActivity();
  })();
}

function handleStorage(event: StorageEvent) {
  if (event.key === KEY_LOCKED_AT_STORAGE_KEY && event.newValue) {
    void lockBrowserKeys({ broadcast: false }).catch(() => undefined);
    return;
  }

  if (event.key === LAST_ACTIVITY_STORAGE_KEY && event.newValue) {
    const value = Number(event.newValue);
    if (!Number.isFinite(value) || value <= lastActivityAt) return;
    lastActivityAt = value;
    scheduleAutoLock();
  }
}

export function recordUnlockActivity() {
  if (!browser) return;
  lastActivityAt = Date.now();
  writeStoredActivity(lastActivityAt, { force: true });
  scheduleAutoLock();
}

export async function lockBrowserKeys({ broadcast = true } = {}) {
  if (lockPromise) return lockPromise;
  const lockedAt = Date.now();
  lockPromise = (async () => {
    try {
      await keystore.wipeAll();
    } finally {
      markKeyLocked();
      clearAutoLockTimer();
      if (broadcast) {
        broadcastKeyLock(lockedAt);
      }
      lockPromise = null;
    }
  })();
  return lockPromise;
}

export function startKeyAutoLock() {
  if (!browser || !keyAuth.hasMasterKey) return;

  const storedActivity = readStoredActivity();
  if (storedActivity === 0) {
    void lockBrowserKeys().catch(() => undefined);
    return;
  }
  lastActivityAt = storedActivity;
  if (isStale()) {
    void lockBrowserKeys().catch(() => undefined);
    return;
  }
  scheduleAutoLock();

  for (const eventName of ACTIVITY_EVENTS) {
    window.addEventListener(eventName, handleActivity, { passive: true });
  }
  window.addEventListener("focus", handleFocusOrVisibility);
  document.addEventListener("visibilitychange", handleFocusOrVisibility);
  window.addEventListener("storage", handleStorage);

  return () => {
    clearAutoLockTimer();
    for (const eventName of ACTIVITY_EVENTS) {
      window.removeEventListener(eventName, handleActivity);
    }
    window.removeEventListener("focus", handleFocusOrVisibility);
    document.removeEventListener("visibilitychange", handleFocusOrVisibility);
    window.removeEventListener("storage", handleStorage);
  };
}
