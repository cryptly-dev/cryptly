import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { getEnvConfig } from '../../../shared/config/env-config';
import { RefreshTokenEntity } from '../core/entities/refresh-token.entity';
import {
  generateRefreshToken,
  hashRefreshToken,
  parseDurationMs,
} from '../core/refresh-token.utils';

export interface IssuedRefreshToken {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
}

@Injectable()
export class RefreshTokenWriteService {
  constructor(
    @InjectModel(RefreshTokenEntity.name)
    private readonly refreshTokenModel: Model<RefreshTokenEntity>,
  ) {}

  public async issue(userId: string): Promise<IssuedRefreshToken> {
    const rawToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawToken);
    const expiresAt = this.getExpiresAt();

    await this.refreshTokenModel.create({
      userId: new Types.ObjectId(userId),
      tokenHash,
      expiresAt,
    });

    return { rawToken, tokenHash, expiresAt };
  }

  public async revokeById(id: string): Promise<void> {
    await this.refreshTokenModel.updateOne(
      { _id: new Types.ObjectId(id), revokedAt: null },
      { revokedAt: new Date() },
    );
  }

  public async revokeByHash(tokenHash: string): Promise<void> {
    await this.refreshTokenModel.updateOne(
      { tokenHash, revokedAt: null },
      { revokedAt: new Date() },
    );
  }

  public async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { userId: new Types.ObjectId(userId), revokedAt: null },
      { revokedAt: new Date() },
    );
  }

  private getExpiresAt(): Date {
    const expiresInMs = parseDurationMs(getEnvConfig().auth.refreshTokenExpiresIn);
    return new Date(Date.now() + expiresInMs);
  }
}
