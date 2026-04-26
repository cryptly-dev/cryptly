import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import posthog from "posthog-js";
import { AuthApi } from "$lib/auth/auth-api";
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
});

let loadUserSeq = 0;

export async function loadUserData(): Promise<void> {
  const token = auth.jwtToken;
  if (!token) {
    auth.userData = null;
    return;
  }
  const seq = ++loadUserSeq;
  try {
    const data = await UserApi.getMe(token);
    if (seq !== loadUserSeq) {
      return;
    }
    auth.userData = data;
    if (data.email) {
      posthog.identify(data.id, { email: data.email });
    }
  } catch {
    if (seq !== loadUserSeq) {
      return;
    }
  }
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
  setJwtToken(jwt);
  setRefreshToken(refresh);
}

export function setUserData(data: User | null) {
  auth.userData = data;
}

export function reset() {
  setUserData(null);
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
  setRefreshToken(result.refreshToken);
  setJwtToken(result.token);
  return result.token;
}

export async function exchangeGithubCodeForJwt(
  githubCode: string,
): Promise<string | null> {
  const result = await AuthApi.loginGithub(githubCode);
  setRefreshToken(result.refreshToken);
  setJwtToken(result.token);
  return result.token;
}

export async function loginLocal(email: string): Promise<string | null> {
  const result = await AuthApi.loginLocal(email);
  setRefreshToken(result.refreshToken);
  setJwtToken(result.token);
  return result.token;
}
