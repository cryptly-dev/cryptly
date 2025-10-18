import axios from "axios";
import type { SuggestedUser } from "./user.api";

export enum ProjectMemberRole {
  Read = "read",
  Write = "write",
  Admin = "admin",
}

export interface ProjectMember {
  id: string;
  email?: string;
  avatarUrl: string;
  displayName?: string;
  role: ProjectMemberRole;
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  encryptedSecretsKeys: Record<string, string>;
  encryptedSecrets: string;
  members: ProjectMember[];
  updatedAt: string;
  integrations: {
    githubInstallationId: number;
  };
}

interface BaseVersion {
  id: string;
  createdAt: string;
  updatedAt: string;
  author: ProjectMember;
}

export interface EncryptedVersion extends BaseVersion {
  encryptedSecrets: string;
}

export interface DecryptedVersion extends BaseVersion {
  content: string;
}

export interface CreateProjectDto {
  name: string;
  encryptedSecrets: string;
  encryptedSecretsKeys: Record<string, string>;
}

export interface UpdateProjectContentDto {
  encryptedSecrets: string;
}

export interface UpdateProjectDto {
  name?: string;
  githubInstallationId?: number | null;
}

export interface RemoveMemberDto {
  projectId: string;
  memberId: string;
}

export interface UpdateMemberRoleDto {
  projectId: string;
  memberId: string;
  role: ProjectMemberRole;
}

export interface ProjectSearchResponse {
  id: string;
  name: string;
  encryptedSecretsKeys: Record<string, string>;
  encryptedSecrets: string;
}

export class ProjectsApi {
  public static async getProject(
    jwtToken: string,
    projectId: string
  ): Promise<Project> {
    const response = await axios.get<Project>(`/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    return response.data;
  }

  public static async getProjectVersions(
    jwtToken: string,
    projectId: string
  ): Promise<EncryptedVersion[]> {
    const response = await axios.get<EncryptedVersion[]>(
      `/projects/${projectId}/history`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    return response.data;
  }

  public static async getProjects(jwtToken: string): Promise<Project[]> {
    const response = await axios.get<Project[]>("/users/me/projects", {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    return response.data;
  }

  public static async searchProjects(
    jwtToken: string
  ): Promise<ProjectSearchResponse[]> {
    const response = await axios.get<ProjectSearchResponse[]>(
      "/users/me/projects/search",
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    return response.data;
  }

  public static async createProject(
    jwtToken: string,
    dto: CreateProjectDto
  ): Promise<Project> {
    const response = await axios.post<Project>("/projects", dto, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    return response.data;
  }

  public static async deleteProject(
    jwtToken: string,
    projectId: string
  ): Promise<void> {
    await axios.delete(`/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
  }

  public static async updateProjectContent(
    jwtToken: string,
    projectId: string,
    dto: UpdateProjectContentDto
  ): Promise<void> {
    await axios.patch(
      `/projects/${projectId}`,
      { encryptedSecrets: dto.encryptedSecrets },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
  }

  public static async updateProject(
    jwtToken: string,
    projectId: string,
    dto: UpdateProjectDto
  ): Promise<Project> {
    const response = await axios.patch<Project>(`/projects/${projectId}`, dto, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  }

  public static async removeMember(
    jwtToken: string,
    dto: RemoveMemberDto
  ): Promise<void> {
    await axios.delete(`/projects/${dto.projectId}/members/${dto.memberId}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
  }

  public static async updateMemberRole(
    jwtToken: string,
    dto: UpdateMemberRoleDto
  ): Promise<Project> {
    const response = await axios.patch<Project>(
      `/projects/${dto.projectId}/members/${dto.memberId}`,
      { role: dto.role },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return response.data;
  }

  public static async getSuggestedUsers(
    jwtToken: string,
    projectId: string
  ): Promise<SuggestedUser[]> {
    const response = await axios.get<SuggestedUser[]>(
      `/projects/${projectId}/suggested-users`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return response.data;
  }

  public static async addEncryptedSecretsKey(
    jwtToken: string,
    projectId: string,
    userId: string,
    encryptedSecretsKey: string
  ): Promise<void> {
    await axios.post(
      `/projects/${projectId}/encrypted-secrets-keys`,
      {
        userId,
        encryptedSecretsKey,
      },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
  }
}
