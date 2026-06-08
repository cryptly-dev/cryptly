import { invitationsService } from '../../infrastructure/invitations.service';

export async function acceptInvitationCommand(invitationId: string, newSecretsKey: string): Promise<void> {
  await invitationsService.acceptInvitation(invitationId, newSecretsKey);
}
