import { createBackendClient } from "@packages/backend-sdk";
import { publicEnv } from "$lib/shared/env/public-env";

export { ApiResponseError, unwrap } from "@packages/backend-sdk";
export type { Schemas } from "@packages/backend-sdk";

export const backend = createBackendClient({
  baseUrl: publicEnv.apiUrl.replace(/\/$/, ""),
  // Resolve fetch per request so calls go through the auth refresh interceptor.
  fetch: (request) => globalThis.fetch(request),
});

export function bearer(jwtToken: string) {
  return { Authorization: `Bearer ${jwtToken}` };
}
