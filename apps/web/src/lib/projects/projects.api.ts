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

export interface CreateProjectDto {
  name: string;
  encryptedSecrets: string;
  encryptedSecretsKeys: Record<string, string>;
  settings: ProjectSettings;
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
}

export type { ProjectSummary } from "./domain/project-summary";
