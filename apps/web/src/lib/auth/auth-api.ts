import { backend, unwrap } from "$lib/api/backend";

function isLocalhost(): boolean {
  return window.location.hostname === "localhost";
}

export class AuthApi {
  static loginGoogle(googleCode: string) {
    return unwrap(
      backend.POST("/auth/google/login", {
        body: { googleCode, forceLocalLogin: isLocalhost() },
      }),
      "Auth request failed",
    );
  }

  static loginGithub(githubCode: string) {
    return unwrap(
      backend.POST("/auth/github/login", {
        body: { githubCode, forceLocalLogin: isLocalhost() },
      }),
      "Auth request failed",
    );
  }

  static loginLocal(email: string) {
    return unwrap(
      backend.POST("/auth/local/login", { body: { email } }),
      "Auth request failed",
    );
  }

  static refresh(refreshToken: string) {
    return unwrap(
      backend.POST("/auth/refresh", { body: { refreshToken } }),
      "Token refresh failed",
    );
  }

  static logout(refreshToken: string) {
    return unwrap(
      backend.POST("/auth/logout", { body: { refreshToken } }),
      "Logout request failed",
    );
  }
}
