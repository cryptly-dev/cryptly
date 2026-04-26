import type { InvitationAcceptance } from '../../domain/invitation-acceptance';

export async function getInvitationQuery(invitationId: string): Promise<InvitationAcceptance | null> {
  return {
    invitationId,
    encryptedSecretsKey: ''
  };
}
