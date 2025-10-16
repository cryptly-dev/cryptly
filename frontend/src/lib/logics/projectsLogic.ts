import {
  actions,
  connect,
  kea,
  listeners,
  path,
  reducers,
  selectors,
} from "kea";

import { loaders } from "kea-loaders";
import { subscriptions } from "kea-subscriptions";
import { ProjectsApi, type Project } from "../api/projects.api";
import { AsymmetricCrypto } from "../crypto/crypto.asymmetric";
import { SymmetricCrypto } from "../crypto/crypto.symmetric";
import { authLogic } from "./authLogic";
import type { projectsLogicType } from "./projectsLogicType";

export const projectsLogic = kea<projectsLogicType>([
  path(["src", "lib", "logics", "projectsLogic"]),

  connect({
    values: [authLogic, ["jwtToken", "userData"]],
  }),

  actions({
    addProject: (
      project: { name: string },
      navigateCallback?: (projectId: string) => void
    ) => ({ project, navigateCallback }),
    readProjectById: (projectId: string) => ({ projectId }),
    loadProjects: true,
    deleteProject: (projectId: string) => ({ projectId }),
    reorderProjects: (projects: Project[]) => ({ projects }),
    setProjectOrder: (projectIds: string[]) => ({ projectIds }),
  }),

  loaders(({ values }) => ({
    projects: [
      undefined as Project[] | undefined,
      {
        loadProjects: async () => {
          const projects = await ProjectsApi.getProjects(values.jwtToken!);
          return projects;
        },
      },
    ],
  })),

  reducers({
    projectOrder: [
      [] as string[],
      { persist: true },
      {
        setProjectOrder: (
          _: string[],
          { projectIds }: { projectIds: string[] }
        ) => projectIds,
        loadProjectsSuccess: (
          state: string[],
          { projects }: { projects?: Project[] }
        ) => {
          if (!projects) return state;

          // If we have a saved order, keep it and add any new projects to the end
          if (state.length > 0) {
            const existingIds = new Set(state);
            const newProjectIds = projects
              .map((p: Project) => p.id)
              .filter((id: string) => !existingIds.has(id));
            return [
              ...state.filter((id: string) =>
                projects.some((p: Project) => p.id === id)
              ),
              ...newProjectIds,
            ];
          }

          // Initial order based on server response
          return projects.map((p: Project) => p.id);
        },
        deleteProject: (
          state: string[],
          { projectId }: { projectId: string }
        ) => {
          return state.filter((id: string) => id !== projectId);
        },
      },
    ],
  }),

  selectors({
    readProjectById: [
      (state) => [state.projects],
      (projects) =>
        (id: string): Project | undefined => {
          return projects?.find((project) => {
            return project.id === id;
          });
        },
    ],
    sortedProjects: [
      (state) => [state.projects, state.projectOrder],
      (projects, projectOrder): Project[] | undefined => {
        if (!projects) return undefined;

        if (!projectOrder || projectOrder.length === 0) {
          return projects;
        }

        // Sort projects based on the order array
        const projectMap = new Map(projects.map((p) => [p.id, p]));
        const sorted = projectOrder
          .map((id) => projectMap.get(id))
          .filter((p): p is Project => p !== undefined);

        // Add any projects not in the order (shouldn't happen, but just in case)
        const orderedIds = new Set(projectOrder);
        const remaining = projects.filter((p) => !orderedIds.has(p.id));

        return [...sorted, ...remaining];
      },
    ],
  }),

  listeners(({ values, asyncActions, actions }) => ({
    addProject: async ({ project, navigateCallback }): Promise<void> => {
      const projectKey = await SymmetricCrypto.generateProjectKey();

      const content = `KEY="value"`;
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
        name: project.name,
      });

      await asyncActions.loadProjects();

      if (navigateCallback) {
        navigateCallback(proj.id);
      }
    },
    deleteProject: async ({ projectId }): Promise<void> => {
      await ProjectsApi.deleteProject(values.jwtToken!, projectId);
      await actions.loadProjects();
    },
    reorderProjects: ({ projects }) => {
      const projectIds = projects.map((p) => p.id);
      actions.setProjectOrder(projectIds);
    },
  })),

  subscriptions(({ actions }) => ({
    userData: (newUserData) => {
      if (!newUserData) {
        return;
      }
      actions.loadProjects();
    },
  })),
]);
