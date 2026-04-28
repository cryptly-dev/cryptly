import type { InvitationAcceptance } from '../../domain/invitation-acceptance';
import { invitationsService } from '../../infrastructure/invitations.service';

export async function getInvitationQuery(invitationId: string): Promise<InvitationAcceptance | null> {
  try {
    const invitation = await invitationsService.getInvitation(invitationId);

    return {
      invitationId: invitation.id,
      encryptedSecretsKey: invitation.temporarySecretsKey
    };
  } catch {
    return null;
  }
}
