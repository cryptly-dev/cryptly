import { INestApplication } from '@nestjs/common';

import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomJwtService } from '../../src/auth/custom-jwt/custom-jwt.service';
import { UserEntity } from '../../src/user/core/entities/user.entity';
import { UserNormalized } from '../../src/user/core/entities/user.interface';
import { UserSerializer } from '../../src/user/core/entities/user.serializer';
import { AuthMethod } from '../../src/user/core/enum/auth-method.enum';

export class UserUtils {
  private userModel: Model<UserEntity>;
  private jwtService: CustomJwtService;

  constructor(private readonly app: INestApplication<any>) {
    this.userModel = this.app.get(getModelToken(UserEntity.name));
    this.jwtService = this.app.get(CustomJwtService);
  }

  public async getUser(): Promise<UserNormalized | null> {
    const user = await this.userModel.findOne();
    return user ? UserSerializer.normalize(user) : null;
  }

  public async createDefault(params?: { email?: string }): Promise<{
    user: UserNormalized;
    token: string;
  }> {
    const email = params?.email || `test-user-${Math.random()}@example.com`;
    const displayName = email.split('@')[0];

    const user = await this.userModel.create({
      email,
      avatarUrl: 'https://example.com/avatar.png',
      authMethod: AuthMethod.Google,
      displayName,
    });

    const token = await this.jwtService.sign({ id: user.id });

    return {
      user: UserSerializer.normalize(user),
      token,
    };
  }
}
