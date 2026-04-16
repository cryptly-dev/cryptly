import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshTokenEntity,
  RefreshTokenSchema,
} from '../core/entities/refresh-token.entity';
import { RefreshTokenReadService } from './refresh-token-read.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshTokenEntity.name, schema: RefreshTokenSchema },
    ]),
  ],
  providers: [RefreshTokenReadService],
  exports: [RefreshTokenReadService],
})
export class RefreshTokenReadModule {}
