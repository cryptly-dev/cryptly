import { UserEntity } from './user.entity';
import {
  UserNormalized,
  UserPartialNormalized,
  UserPartialSerialized,
  UserSerialized,
} from './user.interface';

export interface UserSerializerParams {
  showEmailAddress?: boolean;
}

export class UserSerializer {
  public static normalize(entity: UserEntity): UserNormalized {
    return {
      id: entity._id.toString(),
      authMethod: entity.authMethod,
      email: entity.email,
      avatarUrl: entity.avatarUrl,
      displayName: entity.displayName || entity.email.split('@')[0],
      privateKeyEncrypted: entity.privateKeyEncrypted,
      publicKey: entity.publicKey,
      projectsOrder: entity.projectsOrder || [],
    };
  }

  public static serialize(
    normalized: UserNormalized,
    params?: UserSerializerParams,
  ): UserSerialized {
    return {
      id: normalized.id,
      authMethod: normalized.authMethod,
      ...(params?.showEmailAddress && { email: normalized.email }),
      avatarUrl: normalized.avatarUrl,
      displayName: normalized.displayName,
      privateKeyEncrypted: normalized.privateKeyEncrypted,
      publicKey: normalized.publicKey,
    };
  }

  public static serializePartial(
    normalized: UserPartialNormalized,
    params?: UserSerializerParams,
  ): UserPartialSerialized {
    return {
      id: normalized.id,
      ...(params?.showEmailAddress && { email: normalized.email }),
      avatarUrl: normalized.avatarUrl,
      displayName: normalized.displayName,
      publicKey: normalized.publicKey,
    };
  }
}
