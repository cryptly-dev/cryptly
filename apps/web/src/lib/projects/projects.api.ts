import { backend, bearer, unwrap, type Schemas } from "$lib/api/backend";

export type Project = Schemas["ProjectSerialized"];
export type ProjectMember = Schemas["ProjectMemberSerialized"];
export type ProjectRole = ProjectMember["role"];
export type SuggestedUser = Schemas["UserPartialSerialized"];
export type ProjectSearchResponse = Schemas["ProjectSearchResponse"];
export type EncryptedVersion = Schemas["ProjectSecretsVersionSerialized"];
export type CreateProjectDto = Schemas["CreateProjectBody"];
export type UpdateProjectDto = Schemas["UpdateProjectBody"];

const projectPath = (projectId: string) => ({ path: { projectId } });

export class ProjectsApi {
  static getProjects(jwtToken: string) {
    return unwrap(
      backend.GET("/users/me/projects", { headers: bearer(jwtToken) }),
      "Failed to load projects",
    );
  }

  static searchProjects(jwtToken: string) {
    return unwrap(
      backend.GET("/users/me/projects/search", { headers: bearer(jwtToken) }),
      "Failed to search projects",
    );
  }

  static getProject(jwtToken: string, projectId: string) {
    return unwrap(
      backend.GET("/projects/{projectId}", {
        params: projectPath(projectId),
        headers: bearer(jwtToken),
      }),
      "Failed to load project",
    );
  }

  static getProjectVersions(jwtToken: string, projectId: string) {
    return unwrap(
      backend.GET("/projects/{projectId}/history", {
        params: projectPath(projectId),
        headers: bearer(jwtToken),
      }),
      "Failed to load project history",
    );
  }

  static async updateProjectContent(
    jwtToken: string,
    projectId: string,
    dto: { encryptedSecrets: string },
  ): Promise<void> {
    await unwrap(
      backend.PATCH("/projects/{projectId}", {
        params: projectPath(projectId),
        headers: bearer(jwtToken),
        body: { encryptedSecrets: dto.encryptedSecrets },
      }),
      "Failed to save project",
    );
  }

  static updateProject(
    jwtToken: string,
    projectId: string,
    dto: UpdateProjectDto,
  ) {
    return unwrap(
      backend.PATCH("/projects/{projectId}", {
        params: projectPath(projectId),
        headers: bearer(jwtToken),
        body: dto,
      }),
      "Failed to update project",
    );
  }

  static createProject(jwtToken: string, dto: CreateProjectDto) {
    return unwrap(
      backend.POST("/projects", { headers: bearer(jwtToken), body: dto }),
      "Failed to create project",
    );
  }

  static deleteProject(jwtToken: string, projectId: string) {
    return unwrap(
      backend.DELETE("/projects/{projectId}", {
        params: projectPath(projectId),
        headers: bearer(jwtToken),
      }),
      "Failed to delete project",
    );
  }

  static removeMember(
    jwtToken: string,
    dto: { projectId: string; memberId: string },
  ) {
    return unwrap(
      backend.DELETE("/projects/{projectId}/members/{memberId}", {
        params: { path: dto },
        headers: bearer(jwtToken),
      }),
      "Failed to remove member",
    );
  }

  static updateMemberRole(
    jwtToken: string,
    dto: { projectId: string; memberId: string; role: ProjectRole },
  ) {
    return unwrap(
      backend.PATCH("/projects/{projectId}/members/{memberId}", {
        params: {
          path: { projectId: dto.projectId, memberId: dto.memberId },
        },
        headers: bearer(jwtToken),
        body: { role: dto.role },
      }),
      "Failed to update member role",
    );
  }

  static getSuggestedUsers(jwtToken: string, projectId: string) {
    return unwrap(
      backend.GET("/projects/{projectId}/suggested-users", {
        params: projectPath(projectId),
        headers: bearer(jwtToken),
      }),
      "Failed to load suggested users",
    );
  }

  static addEncryptedSecretsKey(
    jwtToken: string,
    projectId: string,
    userId: string,
    encryptedSecretsKey: string,
  ) {
    return unwrap(
      backend.POST("/projects/{projectId}/encrypted-secrets-keys", {
        params: projectPath(projectId),
        headers: bearer(jwtToken),
        body: { userId, encryptedSecretsKey },
      }),
      "Failed to add encrypted secrets key",
    );
  }
}
