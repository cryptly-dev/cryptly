import { Module } from '@nestjs/common';
import { LocalAuthController } from './local-auth.controller';
import { LocalAuthLoginService } from './local-auth-login.service';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { UserReadModule } from '../../user/read/user-read.module';
import { UserWriteModule } from '../../user/write/user-write.module';
import { RefreshTokenWriteModule } from '../refresh-token/write/refresh-token-write.module';

@Module({
  imports: [CustomJwtModule, UserReadModule, UserWriteModule, RefreshTokenWriteModule],
  controllers: [LocalAuthController],
  providers: [LocalAuthLoginService],
})
export class LocalAuthModule {}
