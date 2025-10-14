import axios from "axios";
import type { ProjectMemberRole } from "./projects.api";
import type { SuggestedUser } from "./user.api";

export interface PersonalInvitation {
  id: string;
  projectId: string;
  author: SuggestedUser;
  invitedUser: SuggestedUser;
  role: ProjectMemberRole;
  createdAt: string;
}

export interface CreatePersonalInvitationDto {
  invitedUserId: string;
  role: ProjectMemberRole;
}

export class PersonalInvitationsApi {
  public static async getProjectPersonalInvitations(
    jwtToken: string,
    projectId: string
  ): Promise<PersonalInvitation[]> {
    const response = await axios.get<PersonalInvitation[]>(
      `/projects/${projectId}/personal-invitations`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return response.data;
  }

  public static async getMyPersonalInvitations(
    jwtToken: string
  ): Promise<PersonalInvitation[]> {
    const response = await axios.get<PersonalInvitation[]>(
      `/users/me/personal-invitations`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return response.data;
  }

  public static async createPersonalInvitation(
    jwtToken: string,
    projectId: string,
    dto: CreatePersonalInvitationDto
  ): Promise<PersonalInvitation> {
    const response = await axios.post<PersonalInvitation>(
      `/projects/${projectId}/personal-invitations`,
      dto,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return response.data;
  }

  public static async acceptPersonalInvitation(
    jwtToken: string,
    personalInvitationId: string
  ): Promise<void> {
    await axios.post(
      `/personal-invitations/${personalInvitationId}/accept`,
      {},
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
  }

  public static async deletePersonalInvitation(
    jwtToken: string,
    personalInvitationId: string
  ): Promise<void> {
    await axios.delete(`/personal-invitations/${personalInvitationId}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
  }

  public static async rejectPersonalInvitation(
    jwtToken: string,
    personalInvitationId: string
  ): Promise<void> {
    await axios.post(
      `/personal-invitations/${personalInvitationId}/reject`,
      {},
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
  }
}
