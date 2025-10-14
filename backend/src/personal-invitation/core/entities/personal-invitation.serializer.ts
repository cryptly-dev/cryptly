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
  ): PersonalInvitationSerialized {
    return {
      id: normalized.id,
      projectId: normalized.projectId,
      role: normalized.role,
      author: {
        id: author.id,
        email: author.email,
        avatarUrl: author.avatarUrl,
      },
      invitedUser: {
        id: invitedUser.id,
        email: invitedUser.email,
        avatarUrl: invitedUser.avatarUrl,
      },
      createdAt: normalized.createdAt.toISOString(),
    };
  }
}
