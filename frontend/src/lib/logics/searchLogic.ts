import { actions, connect, kea, listeners, path, reducers, selectors } from "kea";
import { loaders } from "kea-loaders";
import type { searchLogicType } from "./searchLogicType";
import { ProjectsApi, type ProjectSearchResponse } from "../api/projects.api";
import { SymmetricCrypto } from "../crypto/crypto.symmetric";
import { AsymmetricCrypto } from "../crypto/crypto.asymmetric";
import { keystore } from "../crypto/keystore";
import { authLogic } from "./authLogic";
import { keyLogic } from "./keyLogic";

export interface SearchableProject {
  id: string;
  name: string;
  decryptedContent: string;
}

export const searchLogic = kea<searchLogicType>([
  path(["src", "lib", "logics", "searchLogic"]),

  connect({
    values: [
      authLogic, ["jwtToken", "userData"],
      keyLogic, ["hasMasterKey"],
    ],
  }),

  actions({
    setSearchQuery: (query: string) => ({ query }),
    startSearch: true,
    clearSearch: true,
    loadSearchableProjects: true,
  }),

  reducers({
    searchQuery: [
      "",
      {
        setSearchQuery: (_, { query }) => query,
        clearSearch: () => "",
      },
    ],
    searchActive: [
      false,
      {
        startSearch: () => true,
        clearSearch: () => false,
      },
    ],
  }),

  loaders(({ values }) => ({
    searchableProjects: [
      [] as SearchableProject[],
      {
        loadSearchableProjects: async () => {
          if (!values.jwtToken || !values.hasMasterKey || !values.userData) {
            return [];
          }

          const masterKey = await keystore.getMasterKey();
          if (!masterKey) return [];

          try {
            const projects = await ProjectsApi.searchProjects(values.jwtToken);

            const decryptedProjects = await Promise.all(
              projects.map(async (project: ProjectSearchResponse) => {
                try {
                  const encryptedProjectKey =
                    project.encryptedSecretsKeys[values.userData!.id];
                  if (!encryptedProjectKey) {
                    return {
                      id: project.id,
                      name: project.name,
                      decryptedContent: "",
                    };
                  }

                  let aesKey = await keystore.getProjectKey(project.id);
                  if (!aesKey) {
                    const projectKeyBase64 =
                      await AsymmetricCrypto.decryptWithKey(
                        encryptedProjectKey,
                        masterKey
                      );
                    aesKey = await SymmetricCrypto.importAesKey(
                      projectKeyBase64
                    );
                    await keystore.setProjectKey(project.id, aesKey);
                  }

                  const decryptedContent =
                    await SymmetricCrypto.decryptWithKey(
                      project.encryptedSecrets,
                      aesKey
                    );

                  return {
                    id: project.id,
                    name: project.name,
                    decryptedContent,
                  };
                } catch {
                  return {
                    id: project.id,
                    name: project.name,
                    decryptedContent: "",
                  };
                }
              })
            );

            return decryptedProjects;
          } catch {
            return [];
          }
        },
      },
    ],
  })),

  selectors({
    isSearching: [
      (s) => [s.searchQuery, s.searchActive],
      (searchQuery, searchActive) => searchActive || searchQuery.trim().length > 0,
    ],
    searchResults: [
      (s) => [s.searchableProjects, s.searchQuery],
      (searchableProjects, searchQuery) => {
        if (!searchableProjects || !searchQuery.trim()) return [];
        
        const query = searchQuery.toLowerCase().trim();
        return searchableProjects.filter((project) =>
          project.name.toLowerCase().includes(query) ||
          project.decryptedContent.toLowerCase().includes(query)
        );
      },
    ],
  }),

  listeners(({ actions, values }) => ({
    setSearchQuery: ({ query }) => {
      // Load searchable projects when user starts typing (if not already loaded)
      if (query.trim() && values.searchableProjects.length === 0 && !values.searchableProjectsLoading) {
        actions.loadSearchableProjects();
      }
    },
  })),
]);
