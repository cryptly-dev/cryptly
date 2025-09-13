import { UserEntity } from './user.entity';
import { UserNormalized, UserSerialized } from './user.interface';

export class UserSerializer {
  public static normalize(entity: UserEntity): UserNormalized {
    return {
      id: entity._id.toString(),
      authMethod: entity.authMethod,
      email: entity.email,
      avatarUrl: entity.avatarUrl,
    };
  }

  public static serialize(normalized: UserNormalized): UserSerialized {
    return {
      id: normalized.id,
      authMethod: normalized.authMethod,
      email: normalized.email,
      avatarUrl: normalized.avatarUrl,
    };
  }
}
