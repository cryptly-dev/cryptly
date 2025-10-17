import { parse } from "dotenv";
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
import { ProjectsApi } from "../api/projects.api";
import { AsymmetricCrypto } from "../crypto/crypto.asymmetric";
import { SymmetricCrypto } from "../crypto/crypto.symmetric";
import { authLogic } from "./authLogic";
import { keyLogic } from "./keyLogic";
import type { searchLogicType } from "./searchLogicType";

export interface Secret {
  name: string;
  value: string;
  projectId: string;
  projectName: string;
}

export type SearchState = "loading" | "loaded";

export interface SearchResult {
  secret: Secret;
  score: number;
}

function calculateSimilarity(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  if (textLower.includes(queryLower)) {
    return 1.0;
  }

  const words = queryLower.split(/\s+/);
  let maxScore = 0;

  for (const word of words) {
    if (textLower.includes(word)) {
      maxScore = Math.max(maxScore, 0.7);
    }

    const textWords = textLower.split(/[_\s-]+/);
    for (const textWord of textWords) {
      if (textWord.includes(word) || word.includes(textWord)) {
        maxScore = Math.max(maxScore, 0.5);
      }
    }
  }

  return maxScore;
}

export const searchLogic = kea<searchLogicType>([
  path(["src", "lib", "logics", "searchLogic"]),

  connect({
    values: [
      keyLogic,
      ["privateKeyDecrypted"],
      authLogic,
      ["userData", "jwtToken"],
    ],
  }),

  actions({
    setSearchQuery: (query: string) => ({ query }),
    setState: (state: SearchState) => ({ state }),
    loadAllSecrets: true,
  }),

  reducers({
    searchQuery: [
      "" as string,
      {
        setSearchQuery: (_, { query }) => query,
      },
    ],
    state: [
      "loading" as SearchState,
      {
        setState: (_, { state }) => state,
      },
    ],
  }),

  loaders(({ values, actions }) => ({
    secrets: [
      [] as Secret[],
      {
        loadAllSecrets: async (): Promise<Secret[]> => {
          const privateKey = values.privateKeyDecrypted;
          const jwtToken = values.jwtToken;
          const userId = values.userData?.id;

          if (!privateKey || !jwtToken || !userId) {
            return [];
          }

          try {
            const searchProjects = await ProjectsApi.searchProjects(jwtToken);
            const allSecrets: Secret[] = [];

            for (const project of searchProjects) {
              try {
                const projectKeyDecrypted = await AsymmetricCrypto.decrypt(
                  project.encryptedSecretsKeys[userId],
                  privateKey
                );

                const contentDecrypted = await SymmetricCrypto.decrypt(
                  project.encryptedSecrets,
                  projectKeyDecrypted
                );

                const parsed = parse(contentDecrypted);

                for (const [key, value] of Object.entries(parsed)) {
                  allSecrets.push({
                    name: key,
                    value: value || "",
                    projectId: project.id,
                    projectName: project.name,
                  });
                }
              } catch (error) {
                console.error(
                  `Error loading secrets for project ${project.id}:`,
                  error
                );
              }
            }

            actions.setState("loaded");
            return allSecrets;
          } catch (error) {
            console.error("Error loading search projects:", error);
            actions.setState("loaded");
            return [];
          }
        },
      },
    ],
  })),

  selectors({
    searchResults: [
      (s) => [s.searchQuery, s.secrets],
      (searchQuery: string, secrets: Secret[]): SearchResult[] => {
        if (!searchQuery.trim()) {
          return [];
        }

        const results = secrets
          .map((secret) => ({
            secret,
            score: Math.max(
              calculateSimilarity(searchQuery, secret.name),
              calculateSimilarity(searchQuery, secret.value) * 0.8,
              calculateSimilarity(searchQuery, secret.projectName) * 0.6
            ),
          }))
          .filter((result) => result.score > 0.3)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        return results;
      },
    ],
  }),

  listeners(({ actions, values }) => ({
    afterMount: () => {
      if (
        values.privateKeyDecrypted &&
        values.jwtToken &&
        values.userData &&
        values.secrets.length === 0 &&
        !values.secretsLoading
      ) {
        actions.loadAllSecrets();
      }
    },
  })),

  subscriptions(({ actions, values }) => ({
    privateKeyDecrypted: (privateKey) => {
      if (
        privateKey &&
        values.jwtToken &&
        values.userData &&
        values.secrets.length === 0 &&
        !values.secretsLoading
      ) {
        actions.loadAllSecrets();
      }
    },
    userData: (userData) => {
      if (
        userData &&
        values.privateKeyDecrypted &&
        values.jwtToken &&
        values.secrets.length === 0 &&
        !values.secretsLoading
      ) {
        actions.loadAllSecrets();
      }
    },
  })),
]);
