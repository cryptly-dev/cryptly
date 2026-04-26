import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PROJECT_LINK_FILE, PROJECT_LOCK_FILE } from "./paths.js";

export interface ProjectLink {
  projectId: string;
  /** Local file path the project's secrets are mirrored to. Relative to repo root. */
  file: string;
}

export interface ProjectLockState {
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

export async function readProjectLock(cwd: string): Promise<ProjectLockState | null> {
  const path = join(cwd, PROJECT_LOCK_FILE);
  try {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw) as ProjectLockState;
  } catch (e: any) {
    if (e?.code === "ENOENT") return null;
    throw e;
  }
}

export async function writeProjectLock(cwd: string, lock: ProjectLockState): Promise<void> {
  const path = join(cwd, PROJECT_LOCK_FILE);
  await writeFile(path, JSON.stringify(lock, null, 2) + "\n");
}

export async function clearProjectLock(cwd: string): Promise<void> {
  await rm(join(cwd, PROJECT_LOCK_FILE), { force: true });
}
