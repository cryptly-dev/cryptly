import { browser } from "$app/environment";
import posthog from "posthog-js";
import { loadUserData, auth } from "$lib/stores/auth.svelte";
import { publicEnv } from "$lib/shared/env/public-env";

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T | undefined> {
  return Promise.race([
    promise,
    new Promise<undefined>((resolve) => {
      setTimeout(() => resolve(undefined), ms);
    }),
  ]);
}

export async function init(): Promise<void> {
  if (!browser) return;

  await withTimeout(document.fonts.ready, 3000);

  if (publicEnv.posthogKey) {
    posthog.init(publicEnv.posthogKey, {
      api_host: "https://eu.posthog.com",
    });
  }

  if (auth.jwtToken) {
    void loadUserData();
  }
}
