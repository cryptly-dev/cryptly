import type { ApiClient } from "./client.js";

export interface UserMe {
  id: string;
  email?: string;
  displayName: string;
  publicKey?: string;
  privateKeyEncrypted?: string;
}

export interface Project {
  id: string;
  name: string;
  encryptedSecretsKeys: Record<string, string>;
  encryptedSecrets: string;
  updatedAt: string;
}

export class UsersApi {
  public static async me(client: ApiClient): Promise<UserMe> {
    const response = await client.axios.get<UserMe>("/users/me");
    return response.data;
  }
}

export class ProjectsApi {
  public static async listMine(client: ApiClient): Promise<Project[]> {
    const response = await client.axios.get<Project[]>("/users/me/projects");
    return response.data;
  }

  public static async get(client: ApiClient, projectId: string): Promise<Project> {
    const response = await client.axios.get<Project>(`/projects/${projectId}`);
    return response.data;
  }

  public static async updateContent(
    client: ApiClient,
    projectId: string,
    encryptedSecrets: string,
  ): Promise<void> {
    await client.axios.patch(`/projects/${projectId}`, { encryptedSecrets });
  }
}

export interface FindProjectsByRepoMatch {
  projectId: string;
  projectName: string;
  integrationCount: number;
}

export class ExternalConnectionsApi {
  public static async findProjectsByRepo(
    client: ApiClient,
    owner: string,
    name: string,
  ): Promise<FindProjectsByRepoMatch[]> {
    const response = await client.axios.get<FindProjectsByRepoMatch[]>(
      "/users/me/external-connections/github/find-projects-by-repo",
      { params: { owner, name } },
    );
    return response.data;
  }
}

export class AuthApi {
  public static async logout(client: ApiClient, refreshToken: string): Promise<void> {
    await client.axios.post("/auth/logout", { refreshToken });
  }
}
