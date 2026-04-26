import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { RefreshTokenWriteModule } from '../refresh-token/write/refresh-token-write.module';
import { CliFlowController } from './cli-flow.controller';
import { CliFlowService } from './cli-flow.service';
import { CliSessionEntity, CliSessionSchema } from './core/entities/cli-session.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CliSessionEntity.name, schema: CliSessionSchema }]),
    CustomJwtModule,
    RefreshTokenWriteModule,
  ],
  controllers: [CliFlowController],
  providers: [CliFlowService],
  exports: [CliFlowService],
})
export class CliFlowModule {}
