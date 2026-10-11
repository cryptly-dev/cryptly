import { browser } from "$app/environment";

// Logdash web analytics. The tracker is loaded in app.html through the /_ld proxy routes.
// Never pass emails, names, user IDs or other personal data as event names or props.

type EventProps = Record<string, string | number | boolean>;

interface Logdash {
  track(name: string, props?: EventProps): void;
  identify(userId: string | null): void;
}

declare global {
  interface Window {
    logdash?: Logdash;
  }
}

/** Runs now if the deferred tracker is ready, otherwise once its script has loaded. */
function whenReady(fn: (logdash: Logdash) => void): void {
  if (!browser) return;
  if (window.logdash) {
    fn(window.logdash);
    return;
  }
  document.querySelector('script[src="/_ld/script.js"]')?.addEventListener(
    "load",
    () => {
      if (window.logdash) fn(window.logdash);
    },
    { once: true },
  );
}

/** Opaque account ID only; the tracker hashes it in the browser. `null` on sign-out. */
export function identify(userId: string | null): void {
  whenReady((logdash) => logdash.identify(userId));
}

export function track(name: string, props?: EventProps): void {
  whenReady((logdash) => logdash.track(name, props));
}
