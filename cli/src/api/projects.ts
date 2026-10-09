import { unwrap, type Schemas } from "@packages/backend-sdk";
import type { ApiClient } from "./client.js";

export type UserMe = Schemas["UserSerialized"];
export type Project = Schemas["ProjectSerialized"];
export type FindProjectsByRepoMatch = Schemas["FindProjectsByRepoResponse"];

export class UsersApi {
  public static me(client: ApiClient): Promise<UserMe> {
    return unwrap(client.GET("/users/me"), "Failed to load your account");
  }
}

export class ProjectsApi {
  public static listMine(client: ApiClient): Promise<Project[]> {
    return unwrap(client.GET("/users/me/projects"), "Failed to load projects");
  }

  public static get(client: ApiClient, projectId: string): Promise<Project> {
    return unwrap(
      client.GET("/projects/{projectId}", { params: { path: { projectId } } }),
      "Failed to load project",
    );
  }

  public static async updateContent(
    client: ApiClient,
    projectId: string,
    encryptedSecrets: string,
  ): Promise<void> {
    await unwrap(
      client.PATCH("/projects/{projectId}", {
        params: { path: { projectId } },
        body: { encryptedSecrets },
      }),
      "Failed to save project",
    );
  }
}

export class ExternalConnectionsApi {
  public static findProjectsByRepo(
    client: ApiClient,
    owner: string,
    name: string,
  ): Promise<FindProjectsByRepoMatch[]> {
    return unwrap(
      client.GET("/users/me/external-connections/github/find-projects-by-repo", {
        params: { query: { owner, name } },
      }),
      "Failed to look up projects for this repository",
    );
  }
}
