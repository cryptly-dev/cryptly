import type { ApiClient } from "../api/client.js";
import { ProjectsApi, type Project } from "../api/projects.js";
import { readAuthState, type AuthState } from "../config/auth-store.js";
import {
  readProjectLink,
  type ProjectLink,
} from "../config/project-link.js";
import { AsymmetricCrypto } from "../crypto/asymmetric.js";
import { SymmetricCrypto } from "../crypto/symmetric.js";

export interface ProjectContext {
  auth: AuthState;
  link: ProjectLink;
  project: Project;
  /** Base64 AES-256 key for this project. */
  projectKey: string;
}

export async function loadProjectContext(
  client: ApiClient,
  cwd: string,
): Promise<ProjectContext> {
  const auth = await readAuthState();
  if (!auth) {
    throw new Error("Not authenticated. Run `cryptly login` first.");
  }
  const link = await readProjectLink(cwd);
  if (!link) {
    throw new Error("This directory isn't linked to a project. Run `cryptly link` first.");
  }
  const project = await ProjectsApi.get(client, link.projectId);
  const wrappedProjectKey = project.encryptedSecretsKeys[auth.userId];
  if (!wrappedProjectKey) {
    throw new Error(
      "You no longer have access to this project's key. Ask an admin to re-share it.",
    );
  }
  const projectKey = await AsymmetricCrypto.decrypt(wrappedProjectKey, auth.userPrivateKey);
  return { auth, link, project, projectKey };
}

export async function decryptSecrets(ctx: ProjectContext): Promise<string> {
  return SymmetricCrypto.decrypt(ctx.project.encryptedSecrets, ctx.projectKey);
}

export async function encryptSecrets(ctx: ProjectContext, plaintext: string): Promise<string> {
  return SymmetricCrypto.encrypt(plaintext, ctx.projectKey);
}
