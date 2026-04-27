import { publicEnv } from '$lib/shared/env/public-env';

import type { AuthTokens } from './domain/auth-tokens';

const base = () => publicEnv.apiUrl.replace(/\/$/, '');

function isLocalhost(): boolean {
  return window.location.hostname === 'localhost';
}

function jsonInit(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

export interface LoginResult {
  token: string;
  refreshToken: string;
}

export class AuthRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'AuthRequestError';
  }
}

async function parseLogin(res: Response): Promise<LoginResult> {
  if (!res.ok) {
    throw new AuthRequestError('Auth request failed', res.status);
  }
  const data = (await res.json()) as { token: string; refreshToken: string };
  return { token: data.token, refreshToken: data.refreshToken };
}

/** Minimal port of frontend AuthApi using fetch and public API URL. */
export class AuthApi {
  static async loginGoogle(googleCode: string): Promise<LoginResult> {
    const res = await fetch(
      `${base()}/auth/google/login`,
      jsonInit({ googleCode, forceLocalLogin: isLocalhost() })
    );
    return parseLogin(res);
  }

  static async loginGithub(githubCode: string): Promise<LoginResult> {
    const res = await fetch(
      `${base()}/auth/github/login`,
      jsonInit({ githubCode, forceLocalLogin: isLocalhost() })
    );
    return parseLogin(res);
  }

  static async loginLocal(email: string): Promise<LoginResult> {
    const res = await fetch(
      `${base()}/auth/local/login`,
      jsonInit({ email })
    );
    return parseLogin(res);
  }

  static async refresh(refreshToken: string): Promise<AuthTokens> {
    const res = await fetch(
      `${base()}/auth/refresh`,
      jsonInit({ refreshToken })
    );
    if (!res.ok) {
      throw new AuthRequestError('Token refresh failed', res.status);
    }
    const data = (await res.json()) as { token: string; refreshToken: string };
    return { token: data.token, refreshToken: data.refreshToken };
  }

  static async logout(refreshToken: string): Promise<void> {
    const res = await fetch(
      `${base()}/auth/logout`,
      jsonInit({ refreshToken })
    );
    if (!res.ok) {
      throw new AuthRequestError('Logout request failed', res.status);
    }
  }
}
