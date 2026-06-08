import { browser } from "$app/environment";
import { AuthApi, AuthRequestError } from "$lib/auth/auth-api";
import { AUTH_REFRESH_STORAGE_KEY } from "$lib/auth/kea-storage-keys";
import { auth, logout, setTokens } from "$lib/stores/auth.svelte";

export const REFRESH_URL = "/auth/refresh";

let refreshPromise: Promise<string> | null = null;

export function getStoredRefreshToken(): string | null {
  if (!browser || typeof localStorage === "undefined") {
    return null;
  }
  return localStorage.getItem(AUTH_REFRESH_STORAGE_KEY);
}

export function isLoggedIn(): boolean {
  return auth.jwtToken !== null;
}

export async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const storedRefreshToken = getStoredRefreshToken();
      if (!storedRefreshToken) {
        throw new AuthRequestError("No refresh token available", 401);
      }

      const result = await AuthApi.refresh(storedRefreshToken);
      if (!result.refreshToken) {
        throw new AuthRequestError("No refresh token in response", 401);
      }
      setTokens(result.token, result.refreshToken);
      return result.token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export function handleAuthFailure(): void {
  void logout();
}

export function shouldLogoutAfterRefreshFailure(error: unknown): boolean {
  if (!(error instanceof AuthRequestError)) return false;
  if (error.status === undefined) return false;
  return error.status >= 400 && error.status < 500;
}

export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export function createAuthedFetch(getToken: () => string | null): FetchLike {
  return async (input, init = {}) => {
    if (!isLoggedIn()) {
      return new Response(null, { status: 401 });
    }

    const attach = (token: string | null): RequestInit => ({
      ...init,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
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
    } catch (error) {
      if (shouldLogoutAfterRefreshFailure(error)) {
        handleAuthFailure();
      }
      return response;
    }
  };
}
