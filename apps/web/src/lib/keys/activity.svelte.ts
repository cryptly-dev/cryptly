import { browser } from "$app/environment";

const IDLE_LIMIT_MS = 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;
const RECORD_THROTTLE_MS = 5 * 1000;
const LAST_ACTIVE_STORAGE_KEY = "cryptly:last-active-at";
const ACTIVITY_EVENTS = [
  "pointerdown",
  "pointermove",
  "keydown",
  "wheel",
  "scroll",
  "focus",
];

export const activity = $state({ idle: false });

let onIdle: (() => void) | null = null;
let lastHandledAt = 0;

function readLastActive(): number | null {
  const value = Number(localStorage.getItem(LAST_ACTIVE_STORAGE_KEY));
  return value > 0 ? value : null;
}

function checkIdle() {
  const lastActive = readLastActive();
  const idle = lastActive !== null && Date.now() - lastActive >= IDLE_LIMIT_MS;
  activity.idle = idle;
  if (idle) onIdle?.();
}

export function recordActivity() {
  if (!browser) return;
  localStorage.setItem(LAST_ACTIVE_STORAGE_KEY, String(Date.now()));
  activity.idle = false;
}

function handleActivity() {
  const now = Date.now();
  if (now - lastHandledAt < RECORD_THROTTLE_MS) return;
  lastHandledAt = now;
  // Timers stop while a device sleeps, so the input that ends an absence must still lock.
  checkIdle();
  recordActivity();
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") handleActivity();
}

export function trackActivity() {
  if (!browser) return;
  if (readLastActive() === null) recordActivity();
  checkIdle();

  const interval = setInterval(checkIdle, CHECK_INTERVAL_MS);
  const options = { capture: true, passive: true };
  for (const event of ACTIVITY_EVENTS) {
    window.addEventListener(event, handleActivity, options);
  }
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    clearInterval(interval);
    for (const event of ACTIVITY_EVENTS) {
      window.removeEventListener(event, handleActivity, options);
    }
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

export function whenIdle(listener: () => void) {
  onIdle = listener;
  checkIdle();
  return () => {
    onIdle = null;
  };
}
