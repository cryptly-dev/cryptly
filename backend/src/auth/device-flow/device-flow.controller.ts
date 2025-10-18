import { Body, Controller, Get, Post, Query, Sse } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, filter, map } from 'rxjs';
import { CurrentUserId } from '../core/decorators/current-user-id.decorator';
import { DeviceFlowService } from './device-flow.service';
import { PingBody } from './dto/ping.body';
import { DevicesResponse } from './dto/devices.response';
import { SendMessageBody } from './dto/send-message.body';
import { DeviceMessageEvent } from './dto/device-message.event';

@Controller('auth/device-flow')
@ApiTags('Auth (device-flow)')
export class DeviceFlowController {
  constructor(
    private readonly deviceFlowService: DeviceFlowService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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

  @Sse('messages')
  public streamMessages(
    @CurrentUserId() userId: string,
    @Query('deviceId') deviceId: string,
  ): Observable<{ data: any }> {
    return fromEvent(this.eventEmitter, 'device.message').pipe(
      filter((event: DeviceMessageEvent) => {
        return event.userId === userId && event.deviceId === deviceId;
      }),
      map((event: DeviceMessageEvent) => ({
        data: event.message,
      })),
    );
  }

  @Post('send-message')
  public async sendMessage(
    @CurrentUserId() userId: string,
    @Body() payload: SendMessageBody,
  ): Promise<void> {
    const event = new DeviceMessageEvent(payload.deviceId, userId, payload.message);
    this.eventEmitter.emit('device.message', event);
  }
}
