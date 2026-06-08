import { publicEnv } from "$lib/shared/env/public-env";

export type { InvitationAcceptance } from "./domain/invitation-acceptance";

const baseUrl = () => publicEnv.apiUrl.replace(/\/$/, "");

function authHeaders(jwt: string) {
  return {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  };
}

export interface InvitationListItem {
  id: string;
  projectId: string;
  role: "read" | "write" | "admin";
  createdAt: string;
  temporaryPublicKey: string;
  temporaryPrivateKey: string;
  temporarySecretsKey: string;
  author: {
    id: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

export interface PersonalInvitationListItem {
  id: string;
  projectId: string;
  projectName: string;
  role: "read" | "write" | "admin";
  createdAt: string;
  author: {
    id: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };
  invitedUser: {
    id: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

export interface Invitation {
  id: string;
  projectId: string;
  authorId: string;
  temporaryPublicKey: string;
  temporaryPrivateKey: string;
  temporarySecretsKey: string;
  role: "read" | "write" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvitationDto {
  projectId: string;
  temporaryPublicKey: string;
  temporaryPrivateKey: string;
  temporarySecretsKey: string;
  role: "read" | "write" | "admin";
}

export interface AcceptInvitationDto {
  newSecretsKey: string;
}

export class InvitationsApi {
  static async getInvitation(
    jwtToken: string,
    invitationId: string,
  ): Promise<Invitation> {
    const res = await fetch(`${baseUrl()}/invitations/${invitationId}`, {
      headers: authHeaders(jwtToken),
    });
    if (!res.ok) {
      throw new Error("Failed to load invitation");
    }
    return res.json() as Promise<Invitation>;
  }

  static async getProjectInvitations(
    jwtToken: string,
    projectId: string,
  ): Promise<InvitationListItem[]> {
    const res = await fetch(`${baseUrl()}/projects/${projectId}/invitations`, {
      headers: authHeaders(jwtToken),
    });
    if (!res.ok) {
      throw new Error("Failed to load invitations");
    }
    return res.json() as Promise<InvitationListItem[]>;
  }

  static async deleteInvitation(
    jwtToken: string,
    invitationId: string,
  ): Promise<void> {
    const res = await fetch(`${baseUrl()}/invitations/${invitationId}`, {
      method: "DELETE",
      headers: authHeaders(jwtToken),
    });
    if (!res.ok) {
      throw new Error("Failed to revoke invitation");
    }
  }

  static async getProjectPersonalInvitations(
    jwtToken: string,
    projectId: string,
  ): Promise<PersonalInvitationListItem[]> {
    const res = await fetch(
      `${baseUrl()}/projects/${projectId}/personal-invitations`,
      {
        headers: authHeaders(jwtToken),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to load personal invitations");
    }
    return res.json() as Promise<PersonalInvitationListItem[]>;
  }

  static async deletePersonalInvitation(
    jwtToken: string,
    personalInvitationId: string,
  ): Promise<void> {
    const res = await fetch(
      `${baseUrl()}/personal-invitations/${personalInvitationId}`,
      {
        method: "DELETE",
        headers: authHeaders(jwtToken),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to revoke personal invitation");
    }
  }

  static async getMyPersonalInvitations(
    jwtToken: string,
  ): Promise<PersonalInvitationListItem[]> {
    const res = await fetch(`${baseUrl()}/users/me/personal-invitations`, {
      headers: authHeaders(jwtToken),
    });
    if (!res.ok) {
      throw new Error("Failed to load personal invitations");
    }
    return res.json() as Promise<PersonalInvitationListItem[]>;
  }

  static async createInvitation(
    jwtToken: string,
    dto: CreateInvitationDto,
  ): Promise<Invitation> {
    const res = await fetch(`${baseUrl()}/invitations`, {
      method: "POST",
      headers: authHeaders(jwtToken),
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      throw new Error("Failed to create invitation");
    }
    return res.json() as Promise<Invitation>;
  }

  static async acceptInvitation(
    jwtToken: string,
    invitationId: string,
    dto: AcceptInvitationDto,
  ): Promise<void> {
    const res = await fetch(`${baseUrl()}/invitations/${invitationId}/accept`, {
      method: "POST",
      headers: authHeaders(jwtToken),
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      throw new Error("Failed to accept invitation");
    }
  }

  static async createPersonalInvitation(
    jwtToken: string,
    projectId: string,
    dto: { invitedUserId: string; role: "read" | "write" | "admin" },
  ): Promise<void> {
    const res = await fetch(
      `${baseUrl()}/projects/${projectId}/personal-invitations`,
      {
        method: "POST",
        headers: authHeaders(jwtToken),
        body: JSON.stringify(dto),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to create personal invitation");
    }
  }

  static async acceptPersonalInvitation(
    jwtToken: string,
    personalInvitationId: string,
  ): Promise<void> {
    const res = await fetch(
      `${baseUrl()}/personal-invitations/${personalInvitationId}/accept`,
      {
        method: "POST",
        headers: authHeaders(jwtToken),
        body: JSON.stringify({}),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to accept personal invitation");
    }
  }

  static async rejectPersonalInvitation(
    jwtToken: string,
    personalInvitationId: string,
  ): Promise<void> {
    const res = await fetch(
      `${baseUrl()}/personal-invitations/${personalInvitationId}/reject`,
      {
        method: "POST",
        headers: authHeaders(jwtToken),
        body: JSON.stringify({}),
      },
    );
    if (!res.ok) {
      throw new Error("Failed to reject personal invitation");
    }
  }
}
