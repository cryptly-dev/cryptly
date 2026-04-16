import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokenEntity } from '../core/entities/refresh-token.entity';
import { RefreshTokenNormalized } from '../core/entities/refresh-token.interface';
import { RefreshTokenSerializer } from '../core/entities/refresh-token.serializer';

@Injectable()
export class RefreshTokenReadService {
  constructor(
    @InjectModel(RefreshTokenEntity.name)
    private readonly refreshTokenModel: Model<RefreshTokenEntity>,
  ) {}

  public async findByHash(tokenHash: string): Promise<RefreshTokenNormalized | null> {
    const token = await this.refreshTokenModel
      .findOne({ tokenHash })
      .lean<RefreshTokenEntity>()
      .exec();

    return token ? RefreshTokenSerializer.normalize(token) : null;
  }
}
