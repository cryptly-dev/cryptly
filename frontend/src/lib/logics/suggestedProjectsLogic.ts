import {
  actions,
  connect,
  kea,
  listeners,
  path,
  reducers,
  selectors,
} from "kea";
import { subscriptions } from "kea-subscriptions";
import {
  IntegrationsApi,
  type Installation,
  type Repository,
} from "../api/integrations.api";
import { ProjectsApi, type Project } from "../api/projects.api";
import { AsymmetricCrypto } from "../crypto/crypto.asymmetric";
import { SymmetricCrypto } from "../crypto/crypto.symmetric";
import { authLogic } from "./authLogic";
import { projectsLogic } from "./projectsLogic";

import type { suggestedProjectsLogicType } from "./suggestedProjectsLogicType";

export interface RepoWithInstallation extends Repository {
  installationEntityId: string;
}

function tokenize(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[.\-_\s]+/)
    .filter((t) => t.length > 0);
}

export const suggestedProjectsLogic = kea<suggestedProjectsLogicType>([
  path(["src", "lib", "logics", "suggestedProjectsLogic"]),

  connect({
    values: [
      authLogic,
      ["jwtToken", "userData"],
      projectsLogic,
      ["projects"],
    ],
  }),

  actions({
    loadSuggestions: true,
    setInstallations: (installations: Installation[]) => ({ installations }),
    setAllRepositories: (allRepositories: RepoWithInstallation[]) => ({
      allRepositories,
    }),
    setLoading: (loading: boolean) => ({ loading }),
    acceptSuggestion: (
      repo: RepoWithInstallation,
      navigateCallback?: (projectId: string) => void
    ) => ({ repo, navigateCallback }),
    setAcceptingRepoId: (repoId: number | null) => ({ repoId }),
    dismissSuggestion: (repoId: number) => ({ repoId }),
  }),

  reducers({
    installations: [
      [] as Installation[],
      {
        setInstallations: (_, { installations }: { installations: Installation[] }) => installations,
      },
    ],
    allRepositories: [
      [] as RepoWithInstallation[],
      {
        setAllRepositories: (
          _: RepoWithInstallation[],
          { allRepositories }: { allRepositories: RepoWithInstallation[] }
        ) => allRepositories,
      },
    ],
    loading: [
      false as boolean,
      {
        setLoading: (_: boolean, { loading }: { loading: boolean }) => loading,
        loadSuggestions: () => true,
      },
    ],
    acceptingRepoId: [
      null as number | null,
      {
        setAcceptingRepoId: (_: number | null, { repoId }: { repoId: number | null }) => repoId,
      },
    ],
    dismissedRepoIds: [
      [] as number[],
      {
        dismissSuggestion: (state: number[], { repoId }: { repoId: number }) => [
          ...state,
          repoId,
        ],
      },
    ],
  }),

  selectors({
    suggestedProjects: [
      (s: any) => [s.allRepositories, s.projects, s.dismissedRepoIds],
      (
        allRepositories: RepoWithInstallation[],
        projects: Project[] | undefined,
        dismissedRepoIds: number[]
      ): RepoWithInstallation[] => {
        if (allRepositories.length === 0) return [];

        const dismissedSet = new Set(dismissedRepoIds);

        const normalize = (name: string) => tokenize(name).join(" ");
        const projectNormalized = new Set(
          (projects || []).map((p) => normalize(p.name))
        );

        return allRepositories
          .filter((repo) => {
            if (dismissedSet.has(repo.id)) return false;
            return !projectNormalized.has(normalize(repo.name));
          })
          .sort((a, b) => b.id - a.id) // Higher ID = newer repo
          .slice(0, 2);
      },
    ],
    hasInstallations: [
      (s: any) => [s.installations],
      (installations: Installation[]) => installations.length > 0,
    ],
  }),

  listeners(({ actions, values }) => ({
    loadSuggestions: async () => {
      try {
        const installations =
          await IntegrationsApi.getInstallationAvailableForUser(
            values.jwtToken!
          );
        actions.setInstallations(installations);

        if (installations.length === 0) {
          actions.setLoading(false);
          return;
        }

        const allRepos: RepoWithInstallation[] = [];
        const results = await Promise.all(
          installations.map(async (installation) => {
            const repos = await IntegrationsApi.getRepositories(
              values.jwtToken!,
              installation.id
            );
            return repos.map((repo) => ({
              ...repo,
              installationEntityId: installation.id,
            }));
          })
        );
        for (const repos of results) {
          allRepos.push(...repos);
        }

        actions.setAllRepositories(allRepos);
      } catch (e) {
        console.error("Failed to load suggested projects:", e);
      } finally {
        actions.setLoading(false);
      }
    },

    acceptSuggestion: async ({ repo, navigateCallback }) => {
      actions.setAcceptingRepoId(repo.id);

      try {
        // 1. Create project
        const projectKey = await SymmetricCrypto.generateProjectKey();
        const content = `# Secrets are masked by default - hover or click to reveal.\nKEY="value"\n\n# Prefix a key with _ for maximum security: the value will never be shown in the editor.\n# Click to copy is the only way to retrieve it.\n__TOP_SECRET__="change-me"`;
        const contentEncrypted = await SymmetricCrypto.encrypt(
          content,
          projectKey
        );
        const projectKeyEncrypted = await AsymmetricCrypto.encrypt(
          projectKey,
          values.userData!.publicKey!
        );

        const proj = await ProjectsApi.createProject(values.jwtToken!, {
          encryptedSecretsKeys: {
            [values.userData!.id]: projectKeyEncrypted,
          },
          encryptedSecrets: contentEncrypted,
          name: repo.name,
        });

        // 2. Create integration
        await IntegrationsApi.createIntegration(values.jwtToken!, {
          projectId: proj.id,
          repositoryId: repo.id,
          installationEntityId: repo.installationEntityId,
        });

        // 3. Reload projects list and navigate
        await projectsLogic.asyncActions.loadProjects();

        if (navigateCallback) {
          navigateCallback(proj.id);
        }
      } catch (e) {
        console.error("Failed to accept suggestion:", e);
      } finally {
        actions.setAcceptingRepoId(null);
      }
    },
  })),

  subscriptions(({ actions }: any) => ({
    userData: (userData: any) => {
      if (userData) {
        actions.loadSuggestions();
      }
    },
  })),
]);
