import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../core/decorators/is-public';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocalAuthLoginService } from './local-auth-login.service';
import { LocalLoginBody } from './dto/local-login.body';
import { TokenResponse } from '../../shared/responses/token.response';

@Public()
@Controller('auth/local')
@ApiTags('Auth (local)')
export class LocalAuthController {
  constructor(private readonly loginService: LocalAuthLoginService) {}

  @Post('login')
  @ApiResponse({ type: TokenResponse })
  public async login(@Body() payload: LocalLoginBody): Promise<TokenResponse> {
    return this.loginService.login(payload);
  }
}
