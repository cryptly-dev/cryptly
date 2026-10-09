import { backend, bearer, unwrap, type Schemas } from "$lib/api/backend";

export type Invitation = Schemas["InvitationSerialized"];
export type PersonalInvitation = Schemas["PersonalInvitationSerialized"];
export type CreateInvitationDto = Schemas["CreateInvitationBody"];
export type AcceptInvitationDto = Schemas["AcceptInvitationBody"];
export type CreatePersonalInvitationDto =
  Schemas["CreatePersonalInvitationBody"];

const invitationPath = (id: string) => ({ path: { id } });
const personalInvitationPath = (personalInvitationId: string) => ({
  path: { personalInvitationId },
});

export class InvitationsApi {
  static getInvitation(jwtToken: string, invitationId: string) {
    return unwrap(
      backend.GET("/invitations/{id}", {
        params: invitationPath(invitationId),
        headers: bearer(jwtToken),
      }),
      "Failed to load invitation",
    );
  }

  static getProjectInvitations(jwtToken: string, projectId: string) {
    return unwrap(
      backend.GET("/projects/{projectId}/invitations", {
        params: { path: { projectId } },
        headers: bearer(jwtToken),
      }),
      "Failed to load invitations",
    );
  }

  static deleteInvitation(jwtToken: string, invitationId: string) {
    return unwrap(
      backend.DELETE("/invitations/{id}", {
        params: invitationPath(invitationId),
        headers: bearer(jwtToken),
      }),
      "Failed to revoke invitation",
    );
  }

  static getProjectPersonalInvitations(jwtToken: string, projectId: string) {
    return unwrap(
      backend.GET("/projects/{projectId}/personal-invitations", {
        params: { path: { projectId } },
        headers: bearer(jwtToken),
      }),
      "Failed to load personal invitations",
    );
  }

  static deletePersonalInvitation(
    jwtToken: string,
    personalInvitationId: string,
  ) {
    return unwrap(
      backend.DELETE("/personal-invitations/{personalInvitationId}", {
        params: personalInvitationPath(personalInvitationId),
        headers: bearer(jwtToken),
      }),
      "Failed to revoke personal invitation",
    );
  }

  static getMyPersonalInvitations(jwtToken: string) {
    return unwrap(
      backend.GET("/users/me/personal-invitations", {
        headers: bearer(jwtToken),
      }),
      "Failed to load personal invitations",
    );
  }

  static createInvitation(jwtToken: string, dto: CreateInvitationDto) {
    return unwrap(
      backend.POST("/invitations", { headers: bearer(jwtToken), body: dto }),
      "Failed to create invitation",
    );
  }

  static acceptInvitation(
    jwtToken: string,
    invitationId: string,
    dto: AcceptInvitationDto,
  ) {
    return unwrap(
      backend.POST("/invitations/{id}/accept", {
        params: invitationPath(invitationId),
        headers: bearer(jwtToken),
        body: dto,
      }),
      "Failed to accept invitation",
    );
  }

  static createPersonalInvitation(
    jwtToken: string,
    projectId: string,
    dto: CreatePersonalInvitationDto,
  ) {
    return unwrap(
      backend.POST("/projects/{projectId}/personal-invitations", {
        params: { path: { projectId } },
        headers: bearer(jwtToken),
        body: dto,
      }),
      "Failed to create personal invitation",
    );
  }

  static acceptPersonalInvitation(
    jwtToken: string,
    personalInvitationId: string,
  ) {
    return unwrap(
      backend.POST("/personal-invitations/{personalInvitationId}/accept", {
        params: personalInvitationPath(personalInvitationId),
        headers: bearer(jwtToken),
      }),
      "Failed to accept personal invitation",
    );
  }

  static rejectPersonalInvitation(
    jwtToken: string,
    personalInvitationId: string,
  ) {
    return unwrap(
      backend.POST("/personal-invitations/{personalInvitationId}/reject", {
        params: personalInvitationPath(personalInvitationId),
        headers: bearer(jwtToken),
      }),
      "Failed to reject personal invitation",
    );
  }
}
