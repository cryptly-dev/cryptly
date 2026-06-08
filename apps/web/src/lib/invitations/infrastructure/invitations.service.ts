import { backendClient } from '$lib/shared/shared.api';
import type { components } from '@packages/backend-sdk';

type InvitationSerialized = components['schemas']['InvitationSerialized'];

export const invitationsService = {
  async healthCheck(): Promise<boolean> {
    await backendClient.request('get', '/health');

    return true;
  },

  async getInvitation(invitationId: string): Promise<InvitationSerialized> {
    return backendClient.request('get', '/invitations/{id}', {
      params: {
        path: { id: invitationId }
      }
    }) as Promise<InvitationSerialized>;
  },

  async acceptInvitation(invitationId: string, newSecretsKey: string): Promise<void> {
    await backendClient.request('post', '/invitations/{id}/accept', {
      params: {
        path: { id: invitationId }
      },
      body: { newSecretsKey }
    });
  }
};
