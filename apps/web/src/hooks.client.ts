import { browser } from "$app/environment";
import { loadUserData, auth } from "$lib/stores/auth.svelte";

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

  if (auth.jwtToken) {
    void loadUserData();
  }
}
