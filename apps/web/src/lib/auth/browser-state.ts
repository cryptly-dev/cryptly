import { browser } from '$app/environment';

const STATE_PREFIX = 'cryptly_browser_state:';
const STATE_TTL_MS = 10 * 60 * 1000;

type OAuthProvider = 'google' | 'github';

interface OAuthStateRecord {
  kind: 'oauth';
  provider: OAuthProvider;
  createdAt: number;
}

interface GitHubAppInstallStateRecord {
  kind: 'github-app-install';
  projectId: string;
  createdAt: number;
}

type BrowserStateRecord = OAuthStateRecord | GitHubAppInstallStateRecord;

function storageKey(state: string): string {
  return `${STATE_PREFIX}${state}`;
}

function isFresh(record: BrowserStateRecord): boolean {
  return Date.now() - record.createdAt <= STATE_TTL_MS;
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function writeState(record: BrowserStateRecord): string | null {
  if (!browser) return null;
  const state = generateNonce();
  try {
    sessionStorage.setItem(storageKey(state), JSON.stringify(record));
    return state;
  } catch {
    return null;
  }
}

function readAndClearState(state: string | null): BrowserStateRecord | null {
  if (!browser || !state) return null;
  const key = storageKey(state);
  try {
    const raw = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    if (!raw) return null;
    const record = JSON.parse(raw) as BrowserStateRecord;
    if (!record || typeof record !== 'object') return null;
    if (typeof record.createdAt !== 'number' || !isFresh(record)) return null;
    return record;
  } catch {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore storage cleanup failures
    }
    return null;
  }
}

export function createOAuthState(provider: OAuthProvider): string | null {
  return writeState({ kind: 'oauth', provider, createdAt: Date.now() });
}

export function consumeOAuthState(provider: OAuthProvider, state: string | null): boolean {
  const record = readAndClearState(state);
  return record?.kind === 'oauth' && record.provider === provider;
}

export function createGitHubAppInstallState(projectId: string): string | null {
  return writeState({ kind: 'github-app-install', projectId, createdAt: Date.now() });
}

export function consumeGitHubAppInstallState(state: string | null): string | null {
  const record = readAndClearState(state);
  if (record?.kind !== 'github-app-install') return null;
  if (typeof record.projectId !== 'string' || record.projectId.length === 0) return null;
  return record.projectId;
}
