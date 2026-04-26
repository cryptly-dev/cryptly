import { env } from "$env/dynamic/public";

export interface PublicEnv {
  appUrl: string;
  apiUrl: string;
  googleClientId: string;
  githubClientId: string;
  posthogKey: string;
  allowLocalLogin: boolean;
  githubLocalMock: boolean;
}

export const publicEnv: PublicEnv = {
  // Default matches `apps/web` dev script: `vite dev --port 9090`
  appUrl: env.PUBLIC_APP_URL ?? "http://127.0.0.1:9090",
  apiUrl: env.PUBLIC_API_URL ?? "http://localhost:3000",
  googleClientId: env.PUBLIC_GOOGLE_CLIENT_ID ?? "",
  githubClientId: env.PUBLIC_GITHUB_CLIENT_ID ?? "",
  posthogKey: env.PUBLIC_POSTHOG_KEY ?? "",
  allowLocalLogin: env.PUBLIC_ALLOW_LOCAL_LOGIN === "true",
  githubLocalMock: env.PUBLIC_GITHUB_LOCAL_MOCK === "true",
};
