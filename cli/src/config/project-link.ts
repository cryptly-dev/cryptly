import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  PROJECT_LINK_FILE,
  SYNC_STATE_DIR,
  syncStatePathFor,
} from "./paths.js";

export interface ProjectLink {
  projectId: string;
  /** Local file path the project's secrets are mirrored to. Relative to repo root. */
  file: string;
}

export interface ProjectSyncState {
  /** SHA-256 of the last `encryptedSecrets` we successfully pulled or pushed. */
  lastSyncedHash: string;
  lastSyncedAt: string;
}

export async function readProjectLink(cwd: string): Promise<ProjectLink | null> {
  const path = join(cwd, PROJECT_LINK_FILE);
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as Partial<ProjectLink>;
    if (!parsed.projectId || !parsed.file) {
      throw new Error(`Invalid ${PROJECT_LINK_FILE}: missing projectId or file`);
    }
    return { projectId: parsed.projectId, file: parsed.file };
  } catch (e: any) {
    if (e?.code === "ENOENT") return null;
    throw e;
  }
}

export async function writeProjectLink(cwd: string, link: ProjectLink): Promise<void> {
  const path = join(cwd, PROJECT_LINK_FILE);
  await writeFile(path, JSON.stringify(link, null, 2) + "\n");
}

export async function readProjectSyncState(
  projectId: string,
): Promise<ProjectSyncState | null> {
  try {
    const raw = await readFile(syncStatePathFor(projectId), "utf8");
    return JSON.parse(raw) as ProjectSyncState;
  } catch (e: any) {
    if (e?.code === "ENOENT") return null;
    throw e;
  }
}

export async function writeProjectSyncState(
  projectId: string,
  state: ProjectSyncState,
): Promise<void> {
  const path = syncStatePathFor(projectId);
  await mkdir(SYNC_STATE_DIR, { recursive: true, mode: 0o700 });
  await writeFile(path, JSON.stringify(state, null, 2) + "\n", { mode: 0o600 });
  await chmod(dirname(path), 0o700).catch(() => {});
  await chmod(path, 0o600).catch(() => {});
}
