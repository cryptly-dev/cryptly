import axios, { AxiosError, type AxiosInstance } from "axios";
import { readAuthState, writeAuthState } from "../config/auth-store.js";
import { defaultApiUrl } from "../config/paths.js";

export interface ApiClient {
  axios: AxiosInstance;
  getJwt(): string | null;
}

interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
}

/**
 * Returns an axios instance pre-configured with the user's JWT and a 401-retry
 * interceptor that refreshes the JWT using the stored refresh token. Refresh
 * results are persisted back to disk so the next CLI invocation starts with a
 * fresh refresh token (matches the rotating-refresh model the web uses).
 */
export async function createAuthedClient(): Promise<ApiClient> {
  const auth = await readAuthState();
  if (!auth) {
    throw new NotAuthenticatedError();
  }

  let jwt: string | null = null;

  const instance = axios.create({
    baseURL: defaultApiUrl(),
    timeout: 30_000,
  });

  const refreshOnce = async (): Promise<void> => {
    const current = await readAuthState();
    if (!current) {
      throw new NotAuthenticatedError();
    }
    const response = await axios.post<TokenRefreshResponse>(
      `${defaultApiUrl()}/auth/refresh`,
      { refreshToken: current.refreshToken },
      { timeout: 30_000 },
    );
    jwt = response.data.token;
    await writeAuthState({ ...current, refreshToken: response.data.refreshToken });
  };

  instance.interceptors.request.use(async (config) => {
    if (!jwt) {
      await refreshOnce();
    }
    config.headers.Authorization = `Bearer ${jwt}`;
    return config;
  });

  instance.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
      const original = error.config as
        | (typeof error.config & { _cryptlyRetry?: boolean })
        | undefined;
      if (error.response?.status === 401 && original && !original._cryptlyRetry) {
        original._cryptlyRetry = true;
        try {
          jwt = null;
          await refreshOnce();
          original.headers!.Authorization = `Bearer ${jwt}`;
          return instance.request(original);
        } catch {
          throw new NotAuthenticatedError();
        }
      }
      throw error;
    },
  );

  return {
    axios: instance,
    getJwt: () => jwt,
  };
}

export class NotAuthenticatedError extends Error {
  constructor() {
    super("Not authenticated. Run `cryptly login` to get started.");
    this.name = "NotAuthenticatedError";
  }
}
