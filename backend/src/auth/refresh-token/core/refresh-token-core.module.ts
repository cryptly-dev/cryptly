import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomJwtModule } from '../../custom-jwt/custom-jwt.module';
import { RefreshTokenReadModule } from '../read/refresh-token-read.module';
import { RefreshTokenWriteModule } from '../write/refresh-token-write.module';
import { RefreshTokenEntity, RefreshTokenSchema } from './entities/refresh-token.entity';
import { RefreshTokenCoreController } from './refresh-token-core.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshTokenEntity.name, schema: RefreshTokenSchema },
    ]),
    RefreshTokenReadModule,
    RefreshTokenWriteModule,
    CustomJwtModule,
  ],
  controllers: [RefreshTokenCoreController],
})
export class RefreshTokenCoreModule {}
