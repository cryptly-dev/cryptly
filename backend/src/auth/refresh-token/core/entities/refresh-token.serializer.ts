import { RefreshTokenEntity } from './refresh-token.entity';
import { RefreshTokenNormalized } from './refresh-token.interface';

export class RefreshTokenSerializer {
  public static normalize(entity: RefreshTokenEntity): RefreshTokenNormalized {
    return {
      id: entity._id.toString(),
      userId: entity.userId.toString(),
      tokenHash: entity.tokenHash,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
