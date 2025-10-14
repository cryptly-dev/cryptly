import { Module } from '@nestjs/common';
import { CustomJwtModule } from '../../auth/custom-jwt/custom-jwt.module';
import { UserReadModule } from '../read/user-read.module';
import { UserWriteModule } from '../write/user-write.module';
import { UserCoreController } from './user-core.controller';

@Module({
  imports: [UserReadModule, UserWriteModule, CustomJwtModule],
  providers: [],
  controllers: [UserCoreController],
})
export class UserCoreModule {}
