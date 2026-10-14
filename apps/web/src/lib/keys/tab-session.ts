// Unlocked keys live in IndexedDB, which outlives tabs. A new document may keep
// using them only while the unlock is still "open": another Cryptly tab is alive
// (every tab holds a shared Web Lock until it goes away), or this same tab had a
// live Cryptly page moments ago, i.e. it is reloading or navigating (a heartbeat
// in sessionStorage, which dies with the tab). Once every tab is closed, the
// next one starts locked.

const OPEN_TAB_LOCK = "cryptly:open-tab";
const RESUME_UNTIL_STORAGE_KEY = "cryptly:tab-resume-until";
const RESUME_GRACE_MS = 30 * 1000;
// Refreshed while the page lives rather than on pagehide alone: Chrome can load
// the next page in a new process before the old page's pagehide writes land.
const HEARTBEAT_MS = 10 * 1000;

function readResumeUntil(): number {
  try {
    const value = Number(sessionStorage.getItem(RESUME_UNTIL_STORAGE_KEY));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function extendResume(ms: number) {
  try {
    const until = Math.max(readResumeUntil(), Date.now() + ms);
    sessionStorage.setItem(RESUME_UNTIL_STORAGE_KEY, String(until));
  } catch {
    // Without sessionStorage the next load in this tab starts locked.
  }
}

function clearResume() {
  try {
    sessionStorage.removeItem(RESUME_UNTIL_STORAGE_KEY);
  } catch {
    // ignore storage cleanup failures
  }
}

function heartbeat() {
  extendResume(RESUME_GRACE_MS);
}

// Chrome reloads tabs it discarded to save memory; the tab itself never closed.
function wasDiscarded(): boolean {
  return (
    (document as Document & { wasDiscarded?: boolean }).wasDiscarded === true
  );
}

async function isAnotherTabOpen(locks: LockManager): Promise<boolean> {
  try {
    const { held = [] } = await locks.query();
    return held.some((lock) => lock.name === OPEN_TAB_LOCK);
  } catch {
    return false;
  }
}

/** Keeps this tab unlocked through a same-tab round trip to another site. */
export function keepUnlockedWhileAway(ms: number) {
  extendResume(ms);
}

/**
 * Registers this document as an open Cryptly tab. Resolves to false when every
 * tab was closed since keys were last stored, meaning they must be discarded.
 */
export async function joinTabSession(): Promise<boolean> {
  const resumesThisTab = Date.now() <= readResumeUntil() || wasDiscarded();
  // Drop any longer allowance (e.g. a GitHub round trip) once it is used.
  clearResume();
  heartbeat();
  setInterval(heartbeat, HEARTBEAT_MS);
  window.addEventListener("pagehide", heartbeat);
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    clearResume();
    heartbeat();
  });
  document.addEventListener("visibilitychange", heartbeat);

  const locks = navigator.locks as LockManager | undefined;
  if (!locks) return resumesThisTab;

  const anotherTabOpen = await isAnotherTabOpen(locks);
  // Never released: the browser drops it when this document is destroyed.
  void locks
    .request(OPEN_TAB_LOCK, { mode: "shared" }, () => new Promise(() => {}))
    .catch(() => undefined);

  return resumesThisTab || anotherTabOpen;
}
