import { browser } from '$app/environment';
import { publicEnv } from '$lib/shared/env/public-env';
import {
  handleAuthFailure,
  refreshAccessToken,
  shouldLogoutAfterRefreshFailure
} from './token-refresh';

let installed = false;
let nativeFetch: typeof fetch | null = null;

function requestUrl(input: RequestInfo | URL): URL | null {
  if (!browser) return null;
  const value = input instanceof Request ? input.url : input.toString();
  try {
    return new URL(value, window.location.href);
  } catch {
    return null;
  }
}

function isApiRequest(input: RequestInfo | URL): boolean {
  const url = requestUrl(input);
  if (!url) return false;
  const apiUrl = new URL(publicEnv.apiUrl, window.location.href);
  return url.origin === apiUrl.origin && url.pathname.startsWith(apiUrl.pathname.replace(/\/$/, ''));
}

function headersFor(input: RequestInfo | URL, init?: RequestInit): Headers {
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  return headers;
}

function hasBearerAuth(input: RequestInfo | URL, init?: RequestInit): boolean {
  const authorization = headersFor(input, init).get('authorization');
  return authorization?.toLowerCase().startsWith('bearer ') ?? false;
}

function withBearerToken(input: RequestInfo | URL, init: RequestInit | undefined, token: string): RequestInit {
  const headers = headersFor(input, init);
  headers.set('authorization', `Bearer ${token}`);
  return {
    ...init,
    headers
  };
}

export function installAuthFetchInterceptor(): void {
  if (!browser || installed) return;
  installed = true;
  nativeFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const response = await nativeFetch!(input, init);

    if (response.status !== 401 || !isApiRequest(input) || !hasBearerAuth(input, init)) {
      return response;
    }

    try {
      const token = await refreshAccessToken();
      const retryResponse = await nativeFetch!(input, withBearerToken(input, init, token));
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
