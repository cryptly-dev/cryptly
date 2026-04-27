import type { ProjectSettings } from "$lib/auth/domain/project-settings";
import { publicEnv } from "$lib/shared/env/public-env";

const baseUrl = () => publicEnv.apiUrl.replace(/\/$/, "");

function authHeaders(jwt: string) {
  return { Authorization: `Bearer ${jwt}` };
}

export interface ProjectMember {
  id: string;
  email?: string;
  avatarUrl: string;
  displayName: string;
  role: string;
}

export interface SuggestedUser {
  id: string;
  email?: string;
  avatarUrl?: string;
  displayName: string;
  publicKey?: string;
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  encryptedSecretsKeys: Record<string, string>;
  encryptedSecrets: string;
  members: ProjectMember[];
  updatedAt: string;
  settings: ProjectSettings;
  integrations: { githubInstallationId: number };
}

export interface EncryptedVersion {
  id: string;
  createdAt: string;
  updatedAt: string;
  author: ProjectMember;
  encryptedSecrets: string;
}

export interface CreateProjectDto {
  name: string;
  encryptedSecrets: string;
  encryptedSecretsKeys: Record<string, string>;
  settings: ProjectSettings;
}

export interface UpdateProjectContentDto {
  encryptedSecrets: string;
}

export interface UpdateProjectDto {
  name?: string;
  settings?: ProjectSettings;
}

export class ProjectsApi {
  static async getProjects(jwtToken: string): Promise<Project[]> {
    const res = await fetch(`${baseUrl()}/users/me/projects`, {
      headers: { ...authHeaders(jwtToken) },
    });
    if (!res.ok) {
      throw new Error("Failed to load projects");
    }
    return res.json() as Promise<Project[]>;
  }

  static async getProject(
    jwtToken: string,
    projectId: string,
  ): Promise<Project> {
    const res = await fetch(`${baseUrl()}/projects/${projectId}`, {
      headers: { ...authHeaders(jwtToken) },
    });
    if (res.status === 404) {
      throw new Error("PROJECT_NOT_FOUND");
    }
    if (!res.ok) {
      throw new Error("Failed to load project");
    }
    return res.json() as Promise<Project>;
  }

  static async getProjectVersions(
    jwtToken: string,
    projectId: string,
  ): Promise<EncryptedVersion[]> {
    const res = await fetch(`${baseUrl()}/projects/${projectId}/history`, {
      headers: { ...authHeaders(jwtToken) },
    });
    if (!res.ok) {
      throw new Error("Failed to load project history");
    }
    return res.json() as Promise<EncryptedVersion[]>;
  }

  static async updateProjectContent(
    jwtToken: string,
    projectId: string,
    dto: UpdateProjectContentDto,
  ): Promise<void> {
    const res = await fetch(`${baseUrl()}/projects/${projectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(jwtToken),
      },
      body: JSON.stringify({ encryptedSecrets: dto.encryptedSecrets }),
    });
    if (!res.ok) {
      throw new Error("Failed to save project");
    }
  }

  static async updateProject(
    jwtToken: string,
    projectId: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const res = await fetch(`${baseUrl()}/projects/${projectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(jwtToken),
      },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      throw new Error("Failed to update project");
    }
    return res.json() as Promise<Project>;
  }

  static async createProject(
    jwtToken: string,
    dto: CreateProjectDto,
  ): Promise<Project> {
    const res = await fetch(`${baseUrl()}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(jwtToken),
      },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      throw new Error("Failed to create project");
    }
    return res.json() as Promise<Project>;
  }

  static async deleteProject(jwtToken: string, projectId: string): Promise<void> {
    const res = await fetch(`${baseUrl()}/projects/${projectId}`, {
      method: "DELETE",
      headers: { ...authHeaders(jwtToken) },
    });
    if (!res.ok) {
      throw new Error("Failed to delete project");
    }
  }

  static async removeMember(
    jwtToken: string,
    dto: { projectId: string; memberId: string },
  ): Promise<void> {
    const res = await fetch(`${baseUrl()}/projects/${dto.projectId}/members/${dto.memberId}`, {
      method: "DELETE",
      headers: { ...authHeaders(jwtToken) },
    });
    if (!res.ok) {
      throw new Error("Failed to remove member");
    }
  }

  static async updateMemberRole(
    jwtToken: string,
    dto: { projectId: string; memberId: string; role: "read" | "write" | "admin" },
  ): Promise<void> {
    const res = await fetch(`${baseUrl()}/projects/${dto.projectId}/members/${dto.memberId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(jwtToken),
      },
      body: JSON.stringify({ role: dto.role }),
    });
    if (!res.ok) {
      throw new Error("Failed to update member role");
    }
  }

  static async getSuggestedUsers(jwtToken: string, projectId: string): Promise<SuggestedUser[]> {
    const res = await fetch(`${baseUrl()}/projects/${projectId}/suggested-users`, {
      headers: { ...authHeaders(jwtToken) },
    });
    if (!res.ok) {
      throw new Error("Failed to load suggested users");
    }
    return res.json() as Promise<SuggestedUser[]>;
  }

  static async addEncryptedSecretsKey(
    jwtToken: string,
    projectId: string,
    userId: string,
    encryptedSecretsKey: string,
  ): Promise<void> {
    const res = await fetch(`${baseUrl()}/projects/${projectId}/encrypted-secrets-keys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(jwtToken),
      },
      body: JSON.stringify({ userId, encryptedSecretsKey }),
    });
    if (!res.ok) {
      throw new Error("Failed to add encrypted secrets key");
    }
  }
}

export type { ProjectSummary } from "./domain/project-summary";
