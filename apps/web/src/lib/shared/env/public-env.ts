import * as staticEnv from "$env/static/public";
import { dev } from "$app/environment";

// Inlined at build time (prod builds read apps/web/.env.production), so it works on any host
// without runtime env vars. Namespace import: unset vars stay undefined and fall back below.
const env: Partial<Record<string, string>> = staticEnv;

export interface PublicEnv {
  appUrl: string;
  apiUrl: string;
  googleClientId: string;
  githubClientId: string;
  allowLocalLogin: boolean;
  githubLocalMock: boolean;
}

export const publicEnv: PublicEnv = {
  // Default matches `apps/web` dev script: `vite dev --port 9090`
  appUrl: env.PUBLIC_APP_URL ?? "http://127.0.0.1:9090",
  apiUrl: env.PUBLIC_API_URL ?? "http://localhost:9050",
  googleClientId: env.PUBLIC_GOOGLE_CLIENT_ID ?? "",
  githubClientId: env.PUBLIC_GITHUB_CLIENT_ID ?? "",
  allowLocalLogin:
    env.PUBLIC_ALLOW_LOCAL_LOGIN === undefined
      ? dev
      : env.PUBLIC_ALLOW_LOCAL_LOGIN === "true",
  githubLocalMock: env.PUBLIC_GITHUB_LOCAL_MOCK === "true",
};
