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

import { createPatch } from "diff";
import { toast } from "sonner";
import { loaders } from "kea-loaders";
import { subscriptions } from "kea-subscriptions";
import { IntegrationsApi, type Integration } from "../api/integrations.api";
import {
  ProjectsApi,
  ProjectMemberRole,
  type DecryptedVersion,
  type ProjectMember,
} from "../api/projects.api";
import { createAuthedFetch } from "../auth/tokenRefresh";
import { AsymmetricCrypto } from "../crypto/crypto.asymmetric";
import { keystore } from "../crypto/keystore";
import { SymmetricCrypto } from "../crypto/crypto.symmetric";
import { authLogic } from "./authLogic";
import { EventSourceWrapper } from "./EventSourceWrapper";
import { keyLogic } from "./keyLogic";
import type { projectLogicType } from "./projectLogicType";
import { projectsLogic } from "./projectsLogic";

const isGithubLocalMock = import.meta.env.VITE_GITHUB_LOCAL_MOCK === "true";

export interface ProjectLogicProps {
  projectId: string;
}

export interface DecryptedProject {
  id: string;
  name: string;
  content: string;
  aesKey: CryptoKey;
  members: ProjectMember[];
  updatedAt: string;
  securityLevel: string | null;
  integrations: {
    githubInstallationId: number;
  };
}

export interface SecretsUpdatedEvent {
  newEncryptedSecrets: string;
  projectId: string;
  user: {
    id: string;
    email: string;
    avatarUrl: string;
  };
  updatedAt: string;
}

export interface Patch {
  id: string;
  author: ProjectMember;
  createdAt: string;
  updatedAt: string;
  content: string;
}

const SYSTEM_AUTHOR_AVATAR =
  "https://api.dicebear.com/9.x/bottts-neutral/svg?scale=80&backgroundColor=546e7a,757575,6d4c41&seed=Avery";

/** Monaco / OS paste can change CRLF; avoids false "dirty" after save. */
function normalizeEditorText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export const projectLogic = kea<projectLogicType>([
  path(["src", "lib", "logics", "projectLogic"]),

  props({} as ProjectLogicProps),

  key((props) => props.projectId),

  connect({
    values: [
      keyLogic,
      ["hasMasterKey"],
      authLogic,
      ["userData", "jwtToken"],
      projectsLogic,
      ["projects"],
    ],
  }),

  actions({
    updateProjectContent: true,
    pushToIntegrations: true,
    setIsPushing: (isPushing: boolean) => ({ isPushing }),
    toggleHistoryView: true,
    setIsShowingHistory: (isShowingHistory: boolean) => ({ isShowingHistory }),
    selectHistoryChange: (changeId: string | null, patch: string | null) => ({
      changeId,
      patch,
    }),
    setPatches: (patches: Patch[]) => ({ patches }),
    computePatches: (versions: DecryptedVersion[]) => ({ versions }),
    setInputValue: (content: string) => ({ content }),
    setIsSubmitting: (isSubmitting: boolean) => ({ isSubmitting }),
    setIntegrations: (integrations: Integration[]) => ({ integrations }),
    handleSecretsUpdate: (secretsUpdatedEvent: SecretsUpdatedEvent) => ({
      secretsUpdatedEvent,
    }),
    setProjectData: (projectData: DecryptedProject | null) => ({ projectData }),
    syncProject: true,
    unsyncProject: true,
    openProjectStream: (projectId: string) => ({ projectId }),
    setSyncConnection: (connection: EventSourceWrapper | null) => ({
      connection,
    }),
    setIsExternallyUpdated: (isExternallyUpdated: boolean) => ({
      isExternallyUpdated,
    }),
  }),

  reducers({
    isExternallyUpdated: [
      false,
      {
        setIsExternallyUpdated: (_, { isExternallyUpdated }) =>
          isExternallyUpdated,
      },
    ],
    isPushing: [
      false as boolean,
      {
        setIsPushing: (_, { isPushing }) => isPushing,
      },
    ],
    syncConnection: [
      null as EventSourceWrapper | null,
      {
        setSyncConnection: (_, { connection }) => connection,
        unsyncProject: () => null,
      },
    ],
    shouldReconnect: [
      true,
      {
        syncProject: () => true,
        unsyncProject: () => false,
      },
    ],
    selectedHistoryChangeId: [
      null as string | null,
      {
        selectHistoryChange: (_, { changeId }) => changeId,
        toggleHistoryView: () => null,
      },
    ],
    patches: [
      [] as Patch[],
      {
        setPatches: (_, { patches }) => patches,
      },
    ],
    inputValue: [
      "" as string,
      {
        setInputValue: (_, { content }) => content,
      },
    ],
    isSubmitting: [
      false as boolean,
      {
        setIsSubmitting: (_, { isSubmitting }) => isSubmitting,
      },
    ],
    projectData: [
      null as DecryptedProject | null,
      {
        setProjectData: (_, { projectData }) => projectData,
      },
    ],
    isShowingHistory: [
      false as boolean,
      {
        selectHistoryChange: () => true,
        setIsShowingHistory: (_, { isShowingHistory }) => isShowingHistory,
        toggleHistoryView: (state) => !state,
      },
    ],
    integrations: [
      [] as Integration[],
      {
        setIntegrations: (_, { integrations }) => integrations,
      },
    ],
  }),

  loaders(({ values, props, actions }) => ({
    projectData: [
      null as DecryptedProject | null,
      {
        loadProjectData: async () => {
          const projectData = await ProjectsApi.getProject(
            values.jwtToken!,
            props.projectId,
          );

          let aesKey = await keystore.getProjectKey(projectData.id);
          if (!aesKey) {
            const masterKey = await keystore.getMasterKey();
            if (!masterKey) {
              throw new Error("Browser is locked");
            }
            const projectKeyBase64 = await AsymmetricCrypto.decryptWithKey(
              projectData.encryptedSecretsKeys![values.userData!.id]!,
              masterKey,
            );
            aesKey = await SymmetricCrypto.importAesKey(projectKeyBase64);
            await keystore.setProjectKey(projectData.id, aesKey);
          }

          const contentDecrypted = await SymmetricCrypto.decryptWithKey(
            projectData.encryptedSecrets!,
            aesKey,
          );
          actions.setInputValue(contentDecrypted);

          return {
            id: projectData.id!,
            name: projectData.name!,
            content: contentDecrypted,
            aesKey,
            members: projectData?.members!,
            updatedAt: projectData?.updatedAt!,
            securityLevel: projectData?.securityLevel ?? null,
            integrations: projectData?.integrations!,
          };
        },
      },
    ],
    projectVersions: [
      [] as DecryptedVersion[],
      {
        loadProjectVersions: async () => {
          const versions = await ProjectsApi.getProjectVersions(
            values.jwtToken!,
            props.projectId,
          );

          const myKey = values.projectData?.aesKey;

          if (!myKey) {
            return [];
          }

          const decryptedVersions: DecryptedVersion[] = [];

          for (const version of versions) {
            const contentDecrypted = await SymmetricCrypto.decryptWithKey(
              version.encryptedSecrets,
              myKey,
            );
            decryptedVersions.push({ ...version, content: contentDecrypted });
          }

          return decryptedVersions;
        },
      },
    ],
  })),

  events(({ values }) => ({
    beforeUnmount: () => {
      values.syncConnection?.close();
    },
  })),

  selectors(({ values }) => ({
    isEditorDirty: [
      (s) => [s.inputValue, s.projectData, s.projectDataLoading],
      (inputValue, projectData, projectDataLoading) => {
        if (projectDataLoading || !projectData) return false;
        return (
          normalizeEditorText(inputValue) !==
          normalizeEditorText(projectData.content)
        );
      },
    ],
    lastEditAuthor: [(s) => [s.patches], (patches) => patches[0]?.author],
    currentUserRole: [
      (s) => [s.projectData],
      (projectData) =>
        projectData?.members?.find(
          (member) => member.id === values.userData?.id,
        )?.role,
    ],
  })),

  listeners(({ values, actions, props, asyncActions }) => ({
    loadProjectDataSuccess: () => {
      actions.syncProject();
    },
    syncProject: async () => {
      if (!values.jwtToken || values.syncConnection) {
        return;
      }
      await actions.openProjectStream(props.projectId);
    },

    unsyncProject: () => {
      values.syncConnection?.close();
    },

    openProjectStream: async ({ projectId }: { projectId: string }) => {
      const connect = () => {
        const eventSource = new EventSourceWrapper({
          url: `${import.meta.env.VITE_API_URL}/projects/${projectId}/events`,
          fetch: createAuthedFetch(() => values.jwtToken),
        });

        eventSource.onMessage((event) => {
          try {
            const secretsUpdatedEvent = JSON.parse(event.data);

            if (values.isEditorDirty) {
              actions.setIsExternallyUpdated(true);
            } else {
              actions.handleSecretsUpdate(secretsUpdatedEvent);
            }
          } catch (e) {}
        });

        eventSource.onError(() => {
          eventSource.close();

          if (
            values.shouldReconnect &&
            authLogic.findMounted()?.values.isLoggedIn
          ) {
            setTimeout(() => {
              connect();
            }, 3000);
          }
        });

        actions.setSyncConnection(eventSource);
      };

      connect();
    },
    handleSecretsUpdate: async ({ secretsUpdatedEvent }) => {
      const { newEncryptedSecrets, updatedAt } = secretsUpdatedEvent;
      const aesKey = values.projectData?.aesKey;
      if (!aesKey) return;

      const contentDecrypted = await SymmetricCrypto.decryptWithKey(
        newEncryptedSecrets,
        aesKey,
      );

      actions.setInputValue(contentDecrypted);

      if (values.projectData) {
        actions.setProjectData({
          ...values.projectData,
          content: contentDecrypted,
          updatedAt: updatedAt,
        });
      }
    },
    updateProjectContent: async () => {
      actions.setIsSubmitting(true);
      try {
        const encryptedContent = await SymmetricCrypto.encryptWithKey(
          values.inputValue,
          values.projectData!.aesKey,
        );

        await ProjectsApi.updateProjectContent(
          values.jwtToken!,
          props.projectId,
          {
            encryptedSecrets: encryptedContent,
          },
        );
        actions.setIsExternallyUpdated(false);

        await Promise.all([
          asyncActions.loadProjectData(),
          asyncActions.loadProjectVersions(),
        ]);
      } catch (error) {
        toast.error("Failed to save", { richColors: true });
        throw error;
      } finally {
        actions.setIsSubmitting(false);
      }
    },
    pushToIntegrations: async () => {
      actions.setIsPushing(true);
      try {
        await IntegrationsApi.pushSecrets(
          values.jwtToken!,
          values.integrations,
          values.inputValue,
        );
        if (isGithubLocalMock) {
          toast.success("Pushed to GitHub (local mock — no secrets sent)", {
            richColors: true,
          });
        }
      } finally {
        actions.setIsPushing(false);
      }
    },
    computePatches: ({ versions }) => {
      if (versions.length === 0) {
        actions.setPatches([]);
        return;
      }

      const chronologicalVersions = [...versions].reverse();
      const patches: Patch[] = [];

      // Synthetic "system" entry for the very first version — it has no
      // predecessor, so render its full content as additions authored by
      // a synthetic System user.
      const firstVersion = chronologicalVersions[0];
      const initialContent = firstVersion.content
        .split("\n")
        .map((line) => `+${line}`)
        .join("\n");
      patches.push({
        id: `initial_${firstVersion.id}`,
        author: {
          id: "system",
          avatarUrl: SYSTEM_AUTHOR_AVATAR,
          displayName: "System",
          role: ProjectMemberRole.Read,
        },
        createdAt: firstVersion.createdAt,
        updatedAt: firstVersion.updatedAt,
        content: initialContent,
      });

      for (let i = 0; i < chronologicalVersions.length - 1; i++) {
        const oldVersion = chronologicalVersions[i];
        const newVersion = chronologicalVersions[i + 1];

        const patch = createPatch(
          `version_${i + 1}_to_${i + 2}`,
          oldVersion.content,
          newVersion.content,
        );

        const cleanPatch = patch
          .split("\n")
          .filter((line) => {
            if (
              line.startsWith("---") ||
              line.startsWith("+++") ||
              line.startsWith("@@") ||
              line.startsWith("Index:") ||
              line.startsWith("\\")
            ) {
              return false;
            }
            return line.match(/^[\+\-\s]/);
          })
          .join("\n");

        patches.push({
          id: newVersion.id,
          author: newVersion.author,
          createdAt: newVersion.createdAt,
          updatedAt: newVersion.updatedAt,
          content: cleanPatch,
        });
      }

      actions.setPatches(patches.reverse());
    },
  })),

  subscriptions(({ actions }) => ({
    hasMasterKey: (hasMasterKey) => {
      if (hasMasterKey) {
        actions.loadProjectData();
      }
    },
    projects: (newProjects) => {
      if (!newProjects || newProjects.length === 0) {
        return;
      }

      actions.loadProjectData();
    },
    projectData: (newProjectData) => {
      if (!newProjectData) {
        return;
      }

      actions.loadProjectVersions();
    },
    projectVersions: (versions) => {
      actions.computePatches(versions);
    },
  })),
]);
