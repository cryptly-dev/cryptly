import { Injectable, Logger, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common';
import { CustomJwtService } from '../custom-jwt/custom-jwt.service';
import { UserReadService } from '../../user/read/user-read.service';
import { UserWriteService } from '../../user/write/user-write.service';
import { AuthMethod } from '../../user/core/enum/auth-method.enum';
import { TokenResponse } from '../../shared/responses/token.response';
import { LocalLoginBody } from './dto/local-login.body';
import { getEnvConfig } from '../../shared/config/env-config';
import { RefreshTokenWriteService } from '../refresh-token/write/refresh-token-write.service';
import { ProductAnalyticsService } from '../../shared/posthog/product-analytics.service';

@Injectable()
export class LocalAuthLoginService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LocalAuthLoginService.name);

  constructor(
    private readonly jwtService: CustomJwtService,
    private readonly userReadService: UserReadService,
    private readonly userWriteService: UserWriteService,
    private readonly refreshTokenWriteService: RefreshTokenWriteService,
    private readonly productAnalytics: ProductAnalyticsService,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    if (!getEnvConfig().auth.allowLocalLogin) {
      return;
    }

    const promoted = await this.userWriteService.promoteAllLocalUsersToAdmin();
    if (promoted > 0) {
      this.logger.log(`Promoted ${promoted} local user(s) to admin`);
    }
  }

  public async login(dto: LocalLoginBody): Promise<TokenResponse> {
    const config = getEnvConfig();

    if (!config.auth.allowLocalLogin) {
      this.logger.error('Local login is not enabled');
      throw new UnauthorizedException('Local login is not enabled');
    }

    this.logger.log(`Local login attempt for email: ${dto.email}`);

    const user = await this.userReadService.readByEmail(dto.email);

    if (user === null) {
      const newUser = await this.userWriteService.create({
        authMethod: AuthMethod.Local,
        email: dto.email,
        avatarUrl: undefined,
      });

      this.logger.log(`Created new user for local login`, { email: dto.email, userId: newUser.id });

      const token = await this.jwtService.sign({ id: newUser.id });
      const refreshToken = (await this.refreshTokenWriteService.issue(newUser.id)).rawToken;
      this.productAnalytics.loggedIn(newUser.id, dto.email, 'local');

      return {
        token,
        refreshToken,
        isNewUser: true,
      };
    }

    this.logger.log(`Logged in existing user via local auth`, {
      email: dto.email,
      userId: user.id,
    });

    const token = await this.jwtService.sign({ id: user.id });
    const refreshToken = (await this.refreshTokenWriteService.issue(user.id)).rawToken;
    this.productAnalytics.loggedIn(user.id, user.email ?? dto.email, 'local');

    return {
      token,
      refreshToken,
      isNewUser: false,
    };
  }
}
