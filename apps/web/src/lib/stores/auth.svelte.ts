import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { AuthApi, AuthRequestError } from "$lib/auth/auth-api";
import {
  AUTH_JWT_STORAGE_KEY,
  AUTH_REFRESH_STORAGE_KEY,
} from "$lib/auth/kea-storage-keys";
import { UserApi, type User } from "$lib/auth/user.api";

function readKey(storageKey: string): string | null {
  if (!browser) return null;
  return localStorage.getItem(storageKey);
}

function writeKey(storageKey: string, value: string | null) {
  if (!browser) return;
  if (value === null) {
    localStorage.removeItem(storageKey);
  } else {
    localStorage.setItem(storageKey, value);
  }
}

export const auth = $state({
  jwtToken: readKey(AUTH_JWT_STORAGE_KEY) as string | null,
  refreshToken: readKey(AUTH_REFRESH_STORAGE_KEY) as string | null,
  userData: null as User | null,
  accountLoadError: null as null | "network" | "session" | "unknown",
});

let loadUserSeq = 0;

function isInvalidRefreshFailure(error: unknown): boolean {
  if (!(error instanceof AuthRequestError)) return false;
  if (error.status === undefined) return false;
  return error.status >= 400 && error.status < 500;
}

export async function loadUserData(): Promise<boolean> {
  const token = auth.jwtToken;
  auth.accountLoadError = null;
  if (!token) {
    auth.userData = null;
    return false;
  }
  const seq = ++loadUserSeq;
  try {
    let data: User;
    try {
      data = await UserApi.getMe(token);
    } catch {
      if (!auth.refreshToken) {
        auth.accountLoadError = "session";
        await logout();
        return false;
      }
      let refreshed;
      try {
        refreshed = await AuthApi.refresh(auth.refreshToken);
      } catch (error) {
        if (isInvalidRefreshFailure(error)) {
          auth.accountLoadError = "session";
          await logout();
        } else {
          auth.accountLoadError = "network";
        }
        return false;
      }
      if (!refreshed.refreshToken) {
        auth.accountLoadError = "session";
        await logout();
        return false;
      }
      setTokens(refreshed.token, refreshed.refreshToken);
      data = await UserApi.getMe(refreshed.token);
    }
    if (seq !== loadUserSeq) {
      return false;
    }
    auth.userData = data;
    return true;
  } catch {
    if (seq !== loadUserSeq) {
      return false;
    }
    auth.accountLoadError = auth.jwtToken ? "unknown" : "session";
    return false;
  }
}

export function accountLoadErrorMessage(): string {
  if (auth.accountLoadError === "network") {
    return "Cannot reach the Cryptly API. Check your connection and try again.";
  }
  if (auth.accountLoadError === "session") {
    return "Your session expired. Sign in again to continue.";
  }
  return "Could not load your account. Try again.";
}

export function setJwtToken(value: string | null) {
  auth.jwtToken = value;
  writeKey(AUTH_JWT_STORAGE_KEY, value);
  if (!browser) {
    return;
  }
  if (!value) {
    auth.userData = null;
    return;
  }
  void loadUserData();
}

export function setRefreshToken(value: string | null) {
  auth.refreshToken = value;
  writeKey(AUTH_REFRESH_STORAGE_KEY, value);
}

export function setTokens(jwt: string, refresh: string) {
  auth.accountLoadError = null;
  auth.refreshToken = refresh;
  writeKey(AUTH_REFRESH_STORAGE_KEY, refresh);
  auth.jwtToken = jwt;
  writeKey(AUTH_JWT_STORAGE_KEY, jwt);
}

export function setUserData(data: User | null) {
  auth.userData = data;
  if (data) auth.accountLoadError = null;
}

export function reset() {
  setUserData(null);
  auth.accountLoadError = null;
  setJwtToken(null);
  setRefreshToken(null);
}

export async function logout() {
  const currentRefresh = auth.refreshToken;
  reset();
  if (browser) {
    void goto("/app/login");
  }
  if (currentRefresh) {
    try {
      await AuthApi.logout(currentRefresh);
    } catch {
      // best effort
    }
  }
}

export async function exchangeGoogleCodeForJwt(
  googleCode: string,
): Promise<string | null> {
  const result = await AuthApi.loginGoogle(googleCode);
  setTokens(result.token, result.refreshToken);
  return result.token;
}

export async function exchangeGithubCodeForJwt(
  githubCode: string,
): Promise<string | null> {
  const result = await AuthApi.loginGithub(githubCode);
  setTokens(result.token, result.refreshToken);
  return result.token;
}

export async function loginLocal(email: string): Promise<string | null> {
  const result = await AuthApi.loginLocal(email);
  setTokens(result.token, result.refreshToken);
  return result.token;
}
