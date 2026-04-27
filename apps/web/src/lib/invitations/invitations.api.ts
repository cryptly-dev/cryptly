import { publicEnv } from '$lib/shared/env/public-env';

export type { InvitationAcceptance } from './domain/invitation-acceptance';

const baseUrl = () => publicEnv.apiUrl.replace(/\/$/, '');

function authHeaders(jwt: string) {
  return {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'application/json'
  };
}

export interface Invitation {
  id: string;
  projectId: string;
  authorId: string;
  temporaryPublicKey: string;
  temporaryPrivateKey: string;
  temporarySecretsKey: string;
  role: 'read' | 'write' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvitationDto {
  projectId: string;
  temporaryPublicKey: string;
  temporaryPrivateKey: string;
  temporarySecretsKey: string;
  role: 'read' | 'write' | 'admin';
}

export class InvitationsApi {
  static async createInvitation(jwtToken: string, dto: CreateInvitationDto): Promise<Invitation> {
    const res = await fetch(`${baseUrl()}/invitations`, {
      method: 'POST',
      headers: authHeaders(jwtToken),
      body: JSON.stringify(dto)
    });
    if (!res.ok) {
      throw new Error('Failed to create invitation');
    }
    return res.json() as Promise<Invitation>;
  }

  static async createPersonalInvitation(
    jwtToken: string,
    projectId: string,
    dto: { invitedUserId: string; role: 'read' | 'write' | 'admin' }
  ): Promise<void> {
    const res = await fetch(`${baseUrl()}/projects/${projectId}/personal-invitations`, {
      method: 'POST',
      headers: authHeaders(jwtToken),
      body: JSON.stringify(dto)
    });
    if (!res.ok) {
      throw new Error('Failed to create personal invitation');
    }
  }
}
