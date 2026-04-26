import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { getEnvConfig } from '../../shared/config/env-config';
import { CurrentUserId } from '../core/decorators/current-user-id.decorator';
import { Public } from '../core/decorators/is-public';
import { CliFlowService } from './cli-flow.service';
import { ApproveCliSessionBody } from './dto/approve-session.body';
import { PollCliSessionResponse } from './dto/poll-session.response';
import { CliSessionInfoResponse } from './dto/session-info.response';
import { StartCliSessionBody } from './dto/start-session.body';
import { StartCliSessionResponse } from './dto/start-session.response';

@Controller('auth/cli-flow')
@ApiTags('Auth (cli-flow)')
export class CliFlowController {
  constructor(private readonly cliFlowService: CliFlowService) {}

  @Public()
  @Post('sessions')
  @ApiResponse({ type: StartCliSessionResponse })
  public async start(@Body() body: StartCliSessionBody): Promise<StartCliSessionResponse> {
    const { publicId, expiresAt } = await this.cliFlowService.start({
      tempPublicKey: body.tempPublicKey,
      deviceName: body.deviceName,
    });

    const approveUrl = `${getEnvConfig().webAppUrl}/app/cli-authorize?session=${publicId}`;

    return {
      sessionId: publicId,
      approveUrl,
      expiresAt: expiresAt.getTime(),
    };
  }

  @Get('sessions/:sessionId')
  @ApiBearerAuth()
  @ApiResponse({ type: CliSessionInfoResponse })
  public async info(@Param('sessionId') sessionId: string): Promise<CliSessionInfoResponse> {
    const session = await this.cliFlowService.getInfo(sessionId);
    return {
      sessionId: session.publicId,
      deviceName: session.deviceName,
      status: session.status,
      expiresAt: session.expiresAt.getTime(),
      tempPublicKey: session.tempPublicKey,
    };
  }

  @Post('sessions/:sessionId/approve')
  @ApiBearerAuth()
  public async approve(
    @CurrentUserId() userId: string,
    @Param('sessionId') sessionId: string,
    @Body() body: ApproveCliSessionBody,
  ): Promise<void> {
    await this.cliFlowService.approve({ publicId: sessionId, userId, body });
  }

  @Public()
  @Get('sessions/:sessionId/poll')
  @ApiResponse({ type: PollCliSessionResponse })
  public async poll(@Param('sessionId') sessionId: string): Promise<PollCliSessionResponse> {
    return this.cliFlowService.pollAndConsume(sessionId);
  }
}
