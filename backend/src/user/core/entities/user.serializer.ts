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
      displayName: entity.displayName,
      privateKeyEncrypted: entity.privateKeyEncrypted,
      publicKey: entity.publicKey,
      projectsOrder: entity.projectsOrder || [],
    };
  }

  public static serialize(
    normalized: UserNormalized,
    params?: UserSerializerParams,
  ): UserSerialized {
    const result: UserSerialized = {
      id: normalized.id,
      authMethod: normalized.authMethod,
      avatarUrl: normalized.avatarUrl,
      displayName: normalized.displayName,
      privateKeyEncrypted: normalized.privateKeyEncrypted,
      publicKey: normalized.publicKey,
    };

    if (params?.showEmailAddress) {
      result.email = normalized.email;
    }

    return result;
  }

  public static serializePartial(
    normalized: UserPartialNormalized,
    params?: UserSerializerParams,
  ): UserPartialSerialized {
    const result: UserPartialSerialized = {
      id: normalized.id,
      avatarUrl: normalized.avatarUrl,
      displayName: normalized.displayName,
      publicKey: normalized.publicKey,
    };

    if (params?.showEmailAddress) {
      result.email = normalized.email;
    }

    return result;
  }
}
