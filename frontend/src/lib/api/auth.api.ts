import axios from "axios";

export type JwtToken = string;

export interface LoginResult {
  token: string;
  refreshToken: string;
}

function isLocal(): boolean {
  return window.location.hostname === "localhost";
}

export class AuthApi {
  public static async loginGoogle(googleCode: string): Promise<LoginResult> {
    const response = await axios.post("/auth/google/login", {
      googleCode,
      forceLocalLogin: isLocal(),
    });

    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
    };
  }

  public static async loginGithub(githubCode: string): Promise<LoginResult> {
    const response = await axios.post("/auth/github/login", {
      githubCode,
      forceLocalLogin: isLocal(),
    });

    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
    };
  }

  public static async loginLocal(email: string): Promise<LoginResult> {
    const response = await axios.post("/auth/local/login", {
      email,
    });

    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
    };
  }

  public static async refresh(refreshToken: string): Promise<LoginResult> {
    const response = await axios.post("/auth/refresh", { refreshToken });

    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
    };
  }

  public static async logout(refreshToken: string): Promise<void> {
    await axios.post("/auth/logout", { refreshToken });
  }
}
