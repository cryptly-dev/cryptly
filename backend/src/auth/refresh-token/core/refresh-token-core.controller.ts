import { Body, Controller, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokenResponse } from '../../../shared/responses/token.response';
import { Public } from '../../core/decorators/is-public';
import { CustomJwtService } from '../../custom-jwt/custom-jwt.service';
import { RefreshTokenReadService } from '../read/refresh-token-read.service';
import { RefreshTokenWriteService } from '../write/refresh-token-write.service';
import { RefreshBody } from './dto/refresh.body';
import { hashRefreshToken } from './refresh-token.utils';

@Public()
@Controller('auth')
@ApiTags('Auth (refresh)')
export class RefreshTokenCoreController {
  constructor(
    private readonly refreshTokenReadService: RefreshTokenReadService,
    private readonly refreshTokenWriteService: RefreshTokenWriteService,
    private readonly jwtService: CustomJwtService,
  ) {}

  @Post('refresh')
  @ApiResponse({ type: TokenResponse })
  public async refresh(@Body() body: RefreshBody): Promise<TokenResponse> {
    const tokenHash = hashRefreshToken(body.refreshToken);
    const existing = await this.refreshTokenReadService.findByHash(tokenHash);

    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existing.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (existing.revokedAt !== null) {
      // Reuse of a revoked token — possible theft. Revoke all tokens for the user.
      await this.refreshTokenWriteService.revokeAllForUser(existing.userId);
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    await this.refreshTokenWriteService.revokeById(existing.id);
    const issued = await this.refreshTokenWriteService.issue(existing.userId);

    return {
      token: await this.jwtService.sign({ id: existing.userId }),
      refreshToken: issued.rawToken,
    };
  }

  @Post('logout')
  @HttpCode(204)
  public async logout(@Body() body: RefreshBody): Promise<void> {
    const tokenHash = hashRefreshToken(body.refreshToken);
    await this.refreshTokenWriteService.revokeByHash(tokenHash);
  }
}
