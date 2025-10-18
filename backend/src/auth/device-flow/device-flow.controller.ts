import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../core/decorators/current-user-id.decorator';
import { DeviceFlowService } from './device-flow.service';
import { PingBody } from './dto/ping.body';
import { DevicesResponse } from './dto/devices.response';

@Controller('auth/device-flow')
@ApiTags('Auth (device-flow)')
export class DeviceFlowController {
  constructor(private readonly deviceFlowService: DeviceFlowService) {}

  @Post('ping')
  public async ping(@CurrentUserId() userId: string, @Body() payload: PingBody): Promise<void> {
    this.deviceFlowService.ping(userId, payload.deviceId, payload.deviceName);
  }

  @Get('devices')
  @ApiResponse({ type: DevicesResponse })
  public async getDevices(@CurrentUserId() userId: string): Promise<DevicesResponse> {
    const devices = this.deviceFlowService.getDevices(userId);
    return { devices };
  }
}
