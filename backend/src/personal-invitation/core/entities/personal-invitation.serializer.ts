import { UserPartialSerialized } from '../../../user/core/entities/user.interface';
import { PersonalInvitationEntity } from './personal-invitation.entity';
import {
  PersonalInvitationNormalized,
  PersonalInvitationSerialized,
} from './personal-invitation.interface';

export class PersonalInvitationSerializer {
  public static normalize(entity: PersonalInvitationEntity): PersonalInvitationNormalized {
    return {
      id: entity._id.toString(),
      projectId: entity.projectId.toString(),
      authorId: entity.authorId.toString(),
      invitedUserId: entity.invitedUserId.toString(),
      role: entity.role,
      createdAt: entity.createdAt,
    };
  }

  public static serialize(
    normalized: PersonalInvitationNormalized,
    author: UserPartialSerialized,
    invitedUser: UserPartialSerialized,
    projectName: string,
  ): PersonalInvitationSerialized {
    return {
      id: normalized.id,
      projectId: normalized.projectId,
      projectName,
      role: normalized.role,
      author: {
        id: author.id,
        avatarUrl: author.avatarUrl,
        displayName: author.displayName,
      },
      invitedUser: {
        id: invitedUser.id,
        avatarUrl: invitedUser.avatarUrl,
        displayName: invitedUser.displayName,
      },
      createdAt: normalized.createdAt.toISOString(),
    };
  }
}
