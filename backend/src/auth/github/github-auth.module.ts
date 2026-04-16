import { Module } from '@nestjs/common';
import { GithubAuthLoginService } from './github-auth-login.service';
import { UserReadModule } from '../../user/read/user-read.module';
import { UserWriteModule } from '../../user/write/user-write.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { GithubAuthController } from './github-auth.controller';
import { GithubAuthDataService } from './github-auth-data.service';
import { RefreshTokenWriteModule } from '../refresh-token/write/refresh-token-write.module';

@Module({
  imports: [UserReadModule, UserWriteModule, CustomJwtModule, RefreshTokenWriteModule],
  controllers: [GithubAuthController],
  providers: [GithubAuthLoginService, GithubAuthDataService],
})
export class GithubAuthModule {}
