import { AuthApi } from "../api/auth.api";
import { authLogic } from "../logics/authLogic";

export const REFRESH_URL = "/auth/refresh";

let refreshPromise: Promise<string> | null = null;

export function getStoredRefreshToken(): string | null {
  return authLogic.findMounted()?.values.refreshToken ?? null;
}

export function isLoggedIn(): boolean {
  return Boolean(authLogic.findMounted()?.values.isLoggedIn);
}

export async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const storedRefreshToken = getStoredRefreshToken();
      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      const result = await AuthApi.refresh(storedRefreshToken);
      authLogic
        .findMounted()
        ?.actions.setTokens(result.token, result.refreshToken);
      return result.token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export function handleAuthFailure(): void {
  const mounted = authLogic.findMounted();
  if (mounted) {
    mounted.actions.logout();
    return;
  }

  // Fallback: authLogic not mounted, clear storage and hard-navigate
  localStorage.clear();
  window.location.href = "/app/login";
}

export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

export function createAuthedFetch(getToken: () => string | null): FetchLike {
  return async (input, init = {}) => {
    // Short-circuit after logout so neither the manual 3s reconnect nor the
    // eventsource polyfill's built-in auto-retry keeps hammering the server.
    if (!isLoggedIn()) {
      return new Response(null, { status: 401 });
    }

    const attach = (token: string | null): RequestInit => ({
      ...init,
      headers: {
        ...(init.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const response = await fetch(input, attach(getToken()));
    if (response.status !== 401) {
      return response;
    }

    try {
      const newToken = await refreshAccessToken();
      const retryResponse = await fetch(input, attach(newToken));
      if (retryResponse.status === 401) {
        handleAuthFailure();
      }
      return retryResponse;
    } catch {
      handleAuthFailure();
      return response;
    }
  };
}
