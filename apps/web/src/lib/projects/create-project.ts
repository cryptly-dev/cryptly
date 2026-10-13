import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { toast } from "svelte-sonner";
import { track } from "$lib/analytics/logdash";
import { IntegrationsApi } from "$lib/api/integrations.api";
import { AsymmetricCrypto } from "$lib/auth/asymmetric-crypto";
import type { ProjectSettings } from "$lib/auth/domain/project-settings";
import { SymmetricCrypto } from "$lib/auth/symmetric-crypto";
import { UserApi } from "$lib/auth/user.api";
import { projectPath } from "$lib/paths";
import { ProjectsApi, type Project } from "$lib/projects/projects.api";
import { upsertProject } from "$lib/shell/shell.svelte";
import { auth, setUserData } from "$lib/stores/auth.svelte";

const STARTER_CONTENT = `# App\nAPI_KEY="your-value-here"\nDATABASE_URL="postgres://..."`;

/**
 * Creates a project end to end encrypted: a fresh AES project key encrypts the starter content
 * in the browser, and the key is wrapped with the user's public key, so the server only ever
 * stores ciphertext. Optionally connects a GitHub repository, remembers the settings as the
 * user's defaults, adds the project to the sidebar and opens it.
 */
export async function createEncryptedProject({
  name,
  settings,
  repo,
  replaceState = false,
}: {
  name: string;
  settings: ProjectSettings;
  repo?: { id: number; installationEntityId: string };
  replaceState?: boolean;
}): Promise<Project> {
  const jwt = auth.jwtToken;
  const user = auth.userData;
  if (!jwt || !user?.publicKey) {
    throw new Error("Finish passphrase setup first");
  }

  const projectKey = await SymmetricCrypto.generateProjectKey();
  const encryptedSecrets = await SymmetricCrypto.encrypt(
    STARTER_CONTENT,
    projectKey,
  );
  const wrappedKey = await AsymmetricCrypto.encrypt(projectKey, user.publicKey);

  const created = await ProjectsApi.createProject(jwt, {
    name,
    encryptedSecrets,
    encryptedSecretsKeys: { [user.id]: wrappedKey },
    settings,
  });
  track("project_created", { github_repo: Boolean(repo) });

  if (repo) {
    try {
      await IntegrationsApi.createIntegration(jwt, {
        projectId: created.id,
        repositoryId: repo.id,
        installationEntityId: repo.installationEntityId,
      });
    } catch {
      toast.error("Project created, but connecting the repository failed");
    }
  }

  if (user.projectCreationDefaults?.revealOn !== settings.revealOn) {
    UserApi.updateMe(jwt, { projectCreationDefaults: settings })
      .then((updated) => {
        if (auth.jwtToken === jwt) setUserData(updated);
      })
      .catch(() => undefined);
  }

  upsertProject(created);
  await goto(resolve(projectPath(created.id)), { replaceState });
  return created;
}
