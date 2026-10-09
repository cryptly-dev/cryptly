import { createBackendClient, unwrap, type BackendClient } from "@packages/backend-sdk";
import { readAuthState, writeAuthState } from "../config/auth-store.js";
import { defaultApiUrl } from "../config/paths.js";

export type ApiClient = BackendClient;

const REQUEST_TIMEOUT_MS = 30_000;

function timedFetch(request: Request): Promise<Response> {
  return fetch(request, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
}

/** Client for endpoints that need no session (login, polling, logout). */
export function createPublicClient(): ApiClient {
  return createBackendClient({ baseUrl: defaultApiUrl(), fetch: timedFetch });
}

/**
 * Returns a client that sends the user's JWT and retries once on 401 after
 * refreshing it with the stored refresh token. Refresh results are persisted
 * back to disk so the next CLI invocation starts with a fresh refresh token
 * (matches the rotating-refresh model the web uses).
 */
export async function createAuthedClient(): Promise<ApiClient> {
  if (!(await readAuthState())) {
    throw new NotAuthenticatedError();
  }

  let jwt: string | null = null;

  const refreshOnce = async (): Promise<void> => {
    const current = await readAuthState();
    if (!current) {
      throw new NotAuthenticatedError();
    }
    const tokens = await unwrap(
      createPublicClient().POST("/auth/refresh", {
        body: { refreshToken: current.refreshToken },
      }),
      "Session refresh failed",
    );
    jwt = tokens.token;
    await writeAuthState({ ...current, refreshToken: tokens.refreshToken });
  };

  const send = (request: Request): Promise<Response> => {
    request.headers.set("Authorization", `Bearer ${jwt}`);
    return timedFetch(request);
  };

  return createBackendClient({
    baseUrl: defaultApiUrl(),
    fetch: async (request) => {
      if (!jwt) {
        await refreshOnce();
      }
      // A request body can only be read once, so keep a copy for the retry.
      const retry = request.clone();
      const response = await send(request);
      if (response.status !== 401) {
        return response;
      }
      try {
        jwt = null;
        await refreshOnce();
      } catch {
        throw new NotAuthenticatedError();
      }
      return send(retry);
    },
  });
}

export class NotAuthenticatedError extends Error {
  constructor() {
    super("Not authenticated. Run `cryptly login` to get started.");
    this.name = "NotAuthenticatedError";
  }
}
