import {
  actions,
  connect,
  events,
  kea,
  key,
  listeners,
  path,
  props,
  reducers,
  selectors,
} from "kea";

import type { integrationsLogicType } from "./integrationsLogicType";
import { authLogic } from "./authLogic";
import { projectLogic, type DecryptedProject } from "./projectLogic";
import { loaders } from "kea-loaders";
import {
  IntegrationsApi,
  type Installation,
  type Integration,
  type Repository,
} from "../api/integrations.api";
import {
  suggestedProjectsLogic,
  type RepoWithInstallation,
} from "./suggestedProjectsLogic";

export type { RepoWithInstallation };

export interface SuggestedRepo {
  repo: RepoWithInstallation;
  score: number;
}

function tokenize(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[.\-_\s]+/)
    .filter((t) => t.length > 0);
}

function scoreSuggestion(
  repoName: string,
  projectTokens: string[]
): number {
  const repoTokens = tokenize(repoName);
  return projectTokens.filter((pt) =>
    repoTokens.some((rt) => rt.includes(pt) || pt.includes(rt))
  ).length;
}
import { subscriptions } from "kea-subscriptions";

export interface IntegrationsLogicProps {
  projectId: string;
}

export const integrationsLogic = kea<integrationsLogicType>([
  path(["src", "lib", "logics", "integrationsLogic"]),

  props({} as IntegrationsLogicProps),

  key((props) => props.projectId),

  connect({
    values: [
      authLogic,
      ["jwtToken"],
      projectLogic,
      ["projectData"],
      suggestedProjectsLogic,
      ["installations", "allRepositories", "loading"],
    ],
    actions: [projectLogic, ["loadProjectData", "setIntegrations"]],
  }),

  actions({
    removeInstallationFromProject: true,
    loadRepositories: true,
    loadIntegrations: true,
    createIntegration: (repositoryId: number, installationEntityId: string) => ({
      repositoryId,
      installationEntityId,
    }),
    removeIntegration: (integrationId: string) => ({ integrationId }),
    setRepositories: (repositories: Repository[]) => ({ repositories }),
    setLocalIntegrations: (integrations: Integration[]) => ({ integrations }),
    setSelectedInstallationEntityId: (installationEntityId: string) => ({
      installationEntityId,
    }),
  }),

  reducers({
    repositories: [
      [] as Repository[],
      {
        setRepositories: (_, { repositories }) => repositories,
      },
    ],
    integrations: [
      [] as Integration[],
      {
        setLocalIntegrations: (_, { integrations }) => integrations,
      },
    ],
    installation: [
      null as Installation | null,
      {
        setInstallation: (_, { installation }) => installation,
      },
    ],
    selectedInstallationEntityId: [
      null as string | null,
      {
        setSelectedInstallationEntityId: (_, { installationEntityId }) =>
          installationEntityId,
      },
    ],
  }),

  loaders(({ values, props }) => ({
    repositories: [
      [] as Repository[],
      {
        loadRepositories: async () => {
          if (!values.selectedInstallationEntityId) {
            return [];
          }

          const repositories = await IntegrationsApi.getRepositories(
            values.jwtToken!,
            values.selectedInstallationEntityId!
          );

          return repositories;
        },
      },
    ],
    integrations: [
      [] as Integration[],
      {
        loadIntegrations: async () => {
          const integrations = await IntegrationsApi.getIntegrationsForProject(
            values.jwtToken!,
            props.projectId
          );

          // never do this. This is so wrong
          projectLogic({
            projectId: props.projectId,
          }).actions.setIntegrations(integrations);

          return integrations;
        },
      },
    ],
  })),

  listeners(({ actions, values, props }) => ({
    createIntegration: async ({ repositoryId, installationEntityId }) => {
      await IntegrationsApi.createIntegration(values.jwtToken!, {
        projectId: props.projectId,
        repositoryId,
        installationEntityId: installationEntityId ?? values.selectedInstallationEntityId!,
      });

      actions.loadIntegrations();
    },
    removeIntegration: async ({ integrationId }) => {
      await IntegrationsApi.deleteIntegration(values.jwtToken!, integrationId);
      actions.loadIntegrations();
    },
    removeInstallationFromProject: async () => {
      await IntegrationsApi.deleteInstallationFromProject(
        values.jwtToken!,
        props.projectId
      );
      actions.loadProjectData();
    },
  })),

  selectors({
    githubInstallationId: [
      (s) => [s.projectData],
      (projectData: DecryptedProject) =>
        projectData?.integrations?.githubInstallationId,
    ],
    suggestedIntegrations: [
      (s) => [s.allRepositories, s.integrations, s.projectData],
      (
        allRepositories: RepoWithInstallation[],
        integrations: Integration[],
        projectData: DecryptedProject
      ): SuggestedRepo[] => {
        if (allRepositories.length === 0 || !projectData?.name) {
          return [];
        }

        const projectTokens = tokenize(projectData.name);
        if (projectTokens.length === 0) return [];

        const connectedRepoIds = new Set(integrations.map((i) => i.githubRepositoryId));

        const scored: SuggestedRepo[] = [];
        for (const repo of allRepositories) {
          if (connectedRepoIds.has(repo.id)) continue;
          const score = scoreSuggestion(repo.name, projectTokens);
          if (score > 0) {
            scored.push({ repo, score });
          }
        }
        return scored.sort((a, b) => b.score - a.score).slice(0, 3);
      },
    ],
    installationsLoading: [
      (s) => [s.loading],
      (loading: boolean) => loading,
    ],
    allRepositoriesLoading: [
      (s) => [s.loading],
      (loading: boolean) => loading,
    ],
  }),

  subscriptions(({ actions }) => ({
    githubInstallationId: (githubInstallationId) => {
      if (!githubInstallationId) {
        actions.setRepositories([]);
        actions.setIntegrations([]);

        return;
      }

      actions.loadIntegrations();
    },
    selectedInstallationEntityId: () => {
      actions.loadRepositories();
    },
  })),

  events(({ actions }) => ({
    afterMount: () => {
      actions.loadIntegrations();
    },
  })),
]);
