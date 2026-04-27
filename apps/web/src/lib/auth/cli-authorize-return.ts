import { browser } from "$app/environment";

/** sessionStorage: preserve `/app/cli-authorize?session=…` through OAuth (same tab). */
export const CLI_AUTHORIZE_RETURN_SESSION_KEY =
  "cryptly_cli_authorize_after_login" as const;

/** Backend uses 16 random bytes as hex (32 chars). */
const CLI_SESSION_ID_RE = /^[0-9a-f]{32}$/;

export function isValidCliSessionPublicId(id: string): boolean {
  return CLI_SESSION_ID_RE.test(id);
}

function pathnameOfReturn(pathWithSearch: string): string {
  const q = pathWithSearch.indexOf("?");
  return q >= 0 ? pathWithSearch.slice(0, q)! : pathWithSearch;
}

/** Same-origin path allowlist for post-login redirect (open-redirect safe). */
export function isAllowedCliAuthorizeReturn(pathWithSearch: string): boolean {
  if (!pathWithSearch.startsWith("/")) {
    return false;
  }
  if (pathnameOfReturn(pathWithSearch) !== "/app/cli-authorize") {
    return false;
  }
  const q = pathWithSearch.indexOf("?");
  const search = q >= 0 ? pathWithSearch.slice(q + 1) : "";
  const session = new URLSearchParams(search).get("session");
  return Boolean(session && isValidCliSessionPublicId(session));
}

export function persistCliAuthorizeReturn(pathWithSearch: string): void {
  if (!browser) {
    return;
  }
  if (!isAllowedCliAuthorizeReturn(pathWithSearch)) {
    return;
  }
  sessionStorage.setItem(CLI_AUTHORIZE_RETURN_SESSION_KEY, pathWithSearch);
}

/** Returns validated path (pathname + search) or null. Clears storage. */
export function readAndClearCliAuthorizeReturn(): string | null {
  if (!browser) {
    return null;
  }
  const raw = sessionStorage.getItem(CLI_AUTHORIZE_RETURN_SESSION_KEY);
  sessionStorage.removeItem(CLI_AUTHORIZE_RETURN_SESSION_KEY);
  if (!raw || !isAllowedCliAuthorizeReturn(raw)) {
    return null;
  }
  return raw;
}
