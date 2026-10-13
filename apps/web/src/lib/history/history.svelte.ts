import { browser } from "$app/environment";
import { SymmetricCrypto } from "$lib/auth/symmetric-crypto";
import { getUnlockedProjectKey } from "$lib/projects/project-key";
import { ProjectsApi, type Project } from "$lib/projects/projects.api";
import { auth } from "$lib/stores/auth.svelte";
import { keyAuth } from "$lib/stores/key.svelte";
import { diffSecrets, parseEnv, type SecretDiff } from "./diff";

export interface HistoryVersion {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Missing on the version Cryptly created together with the project. */
  author?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    email?: string;
  };
  /** Decrypted .env text of this version. In memory only, never sent anywhere. */
  content: string;
  /** Decrypted text of the version before it; null for the oldest kept version. */
  previous: string | null;
  /** Per-secret changes against `previous` (everything added for the oldest version). */
  diff: SecretDiff;
}

class HistoryStore {
  projectId = $state<string | null>(null);
  /** Newest first. Raw: replaced as a whole, never mutated in place. */
  versions = $state.raw<HistoryVersion[]>([]);
  loading = $state(false);
  /** The browser is locked, so nothing can be decrypted. */
  locked = $state(false);
  message = $state<string | null>(null);
}

/**
 * Decrypted version history of the open project, shared by the History tab, the GitHub sync
 * status in Settings, and the Secrets tab (which reloads it after a save). Decryption happens
 * in the browser; the plaintext is dropped as soon as the browser locks.
 */
export const history = new HistoryStore();

let seq = 0;

export async function loadHistory(project: Project): Promise<void> {
  const mySeq = ++seq;
  const revision = keyAuth.revision;
  const current = () =>
    mySeq === seq && revision === keyAuth.revision && keyAuth.hasMasterKey;

  if (history.projectId !== project.id) {
    history.projectId = project.id;
    history.versions = [];
  }
  if (!keyAuth.hasMasterKey) {
    dropDecrypted();
    return;
  }
  history.loading = true;
  history.locked = false;
  history.message = null;

  try {
    const jwt = auth.jwtToken;
    const userId = auth.userData?.id;
    if (!jwt || !userId) throw new Error("Signed out");
    if (!project.encryptedSecretsKeys?.[userId]) {
      history.versions = [];
      history.message = "You don't have a key for this project.";
      return;
    }
    const encrypted = await ProjectsApi.getProjectVersions(jwt, project.id);
    if (!current()) return;
    const key = await getUnlockedProjectKey(project);
    if (!current()) return;
    if (!key) {
      dropDecrypted();
      return;
    }
    const contents = await Promise.all(
      encrypted.map((v) =>
        SymmetricCrypto.decryptWithKey(v.encryptedSecrets, key).catch(() => ""),
      ),
    );
    if (!current()) return;

    // Oldest first, so each version diffs against the one before it.
    const chronological = encrypted
      .map((v, i) => ({ ...v, content: contents[i]! }))
      .reverse();
    const parsed = chronological.map((v) => parseEnv(v.content));
    history.versions = chronological
      .map(
        (v, i): HistoryVersion => ({
          id: v.id,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
          author:
            i === 0 && isCreation(v.createdAt, project) ? undefined : v.author,
          content: v.content,
          previous: chronological[i - 1]?.content ?? null,
          diff: diffSecrets(parsed[i - 1] ?? [], parsed[i]!),
        }),
      )
      .reverse();
  } catch {
    if (!current()) return;
    history.versions = [];
    history.message = "Check your connection and try again.";
  } finally {
    if (mySeq === seq) history.loading = false;
  }
}

export function clearHistory() {
  seq++;
  history.projectId = null;
  history.versions = [];
  history.loading = false;
  history.locked = false;
  history.message = null;
}

function dropDecrypted() {
  seq++;
  history.versions = [];
  history.loading = false;
  history.locked = true;
  history.message = null;
}

/**
 * The oldest version is the project's first one (shown as created by Cryptly) unless older
 * versions were pruned (the backend keeps the last 100), which shows as a later timestamp.
 */
function isCreation(createdAt: string, project: Project) {
  return Date.parse(createdAt) - Date.parse(project.createdAt) < 60_000;
}

if (browser) {
  // Plaintext must not outlive the unlocked browser, whichever tab is open.
  $effect.root(() => {
    $effect(() => {
      if (!keyAuth.hasMasterKey || !auth.jwtToken) dropDecrypted();
    });
  });
}
