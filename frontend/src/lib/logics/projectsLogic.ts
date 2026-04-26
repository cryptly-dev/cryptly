import { actions, connect, kea, listeners, path, selectors } from "kea";

import { loaders } from "kea-loaders";
import { subscriptions } from "kea-subscriptions";
import { ProjectsApi, type Project } from "../api/projects.api";
import { UserApi } from "../api/user.api";
import { AsymmetricCrypto } from "../crypto/crypto.asymmetric";
import { SymmetricCrypto } from "../crypto/crypto.symmetric";
import type { ProjectSettings } from "../project-settings";
import { authLogic } from "./authLogic";

import type { projectsLogicType } from "./projectsLogicType";

export const projectsLogic = kea<projectsLogicType>([
  path(["src", "lib", "logics", "projectsLogic"]),

  connect({
    values: [authLogic, ["jwtToken", "userData"]],
    actions: [authLogic, ["loadUserData"]],
  }),

  actions({
    addProject: (
      project: { name: string; settings: ProjectSettings },
      navigateCallback?: (projectId: string) => void,
    ) => ({ project, navigateCallback }),
    readProjectById: (projectId: string) => ({ projectId }),
    loadProjects: true,
    deleteProject: (projectId: string) => ({ projectId }),
    finalizeProjectsOrder: (projects: Project[]) => ({ projects }),
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
  }),

  listeners(({ values, asyncActions, actions }) => ({
    addProject: async ({ project, navigateCallback }): Promise<void> => {
      const projectKey = await SymmetricCrypto.generateProjectKey();

      const content = `# Define your secrets below. Example:\nAPI_KEY="your-value-here"\nDATABASE_URL="postgres://..."`;

      const contentEncrypted = await SymmetricCrypto.encrypt(
        content,
        projectKey,
      );

      const projectKeyEncrypted = await AsymmetricCrypto.encrypt(
        projectKey,
        values.userData!.publicKey!,
      );

      const proj = await ProjectsApi.createProject(values.jwtToken!, {
        encryptedSecretsKeys: {
          [values.userData!.id]: projectKeyEncrypted,
        },
        encryptedSecrets: contentEncrypted,
        name: project.name,
        settings: project.settings,
      });

      await UserApi.updateMe(values.jwtToken!, {
        projectCreationDefaults: project.settings,
      });

      await asyncActions.loadProjects();
      await actions.loadUserData();

      if (navigateCallback) {
        navigateCallback(proj.id);
      }
    },
    deleteProject: async ({ projectId }): Promise<void> => {
      await ProjectsApi.deleteProject(values.jwtToken!, projectId);
      await asyncActions.loadProjects();
    },
    finalizeProjectsOrder: async ({ projects }) => {
      const projectIds = projects.map((p) => p.id);
      await UserApi.updateProjectsOrder(values.jwtToken!, projectIds);
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
