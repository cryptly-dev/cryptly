import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshTokenEntity,
  RefreshTokenSchema,
} from '../core/entities/refresh-token.entity';
import { RefreshTokenWriteService } from './refresh-token-write.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshTokenEntity.name, schema: RefreshTokenSchema },
    ]),
  ],
  providers: [RefreshTokenWriteService],
  exports: [RefreshTokenWriteService],
})
export class RefreshTokenWriteModule {}
