import { Body, Controller, Post, Query, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags } from '@nestjs/swagger';
import { Observable, filter, finalize, fromEvent, map, merge, startWith } from 'rxjs';
import { CurrentUserId } from '../core/decorators/current-user-id.decorator';
import { APPROVERS_LIST, DeviceEvent } from '../events/device-event.enum';
import { DeviceFlowService } from './device-flow.service';
import { DeviceFlowRole } from './dto/device-flow-role.enum';
import { DeviceMessageEvent } from './dto/device-message.event';
import { SendMessageBody } from './dto/send-message.body';

@Controller('auth/device-flow')
@ApiTags('Auth (device-flow)')
export class DeviceFlowController {
  constructor(
    private readonly deviceFlowService: DeviceFlowService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Sse('messages')
  public streamMessages(
    @CurrentUserId() userId: string,
    @Query('deviceId') deviceId: string,
    @Query('role') role: DeviceFlowRole,
    @Query('deviceName') deviceName: string,
  ): Observable<{ data: any }> {
    const isApprover = role === DeviceFlowRole.Approver;

    if (isApprover) {
      this.deviceFlowService.connectApprover(userId, deviceId, deviceName);
      return this.requests$(userId, deviceId);
    } else {
      return merge(this.approvals$(userId, deviceId), this.devices$(userId));
    }
  }

  private requests$(userId: string, deviceId: string): Observable<{ data: any }> {
    const stream$ = fromEvent(this.eventEmitter, DeviceEvent.ApprovalRequest).pipe(
      filter((event: DeviceMessageEvent) => {
        return event.userId === userId && event.deviceId === deviceId;
      }),
      map((event: DeviceMessageEvent) => ({ data: event.message })),
    );

    return stream$.pipe(
      finalize(() => {
        this.deviceFlowService.disconnectApprover(userId, deviceId);
      }),
    );
  }

  private approvals$(userId: string, deviceId: string): Observable<{ data: any }> {
    return fromEvent(this.eventEmitter, DeviceEvent.LoginApproved).pipe(
      filter((event: DeviceMessageEvent) => {
        return event.userId === userId && event.deviceId === deviceId;
      }),
      map((event: DeviceMessageEvent) => ({
        data: event.message,
      })),
    );
  }

  private devices$(userId: string): Observable<{ data: any }> {
    const approvers = this.deviceFlowService.getApprovers(userId);
    const initialEvent = { data: { type: APPROVERS_LIST, approvers } };

    return fromEvent(this.eventEmitter, DeviceEvent.DevicesChanged).pipe(
      filter((event: DeviceMessageEvent) => {
        return event.userId === userId;
      }),
      map((event: DeviceMessageEvent) => ({ data: event.message })),
      startWith(initialEvent),
    );
  }

  @Post('send-message')
  public async sendMessage(
    @CurrentUserId() userId: string,
    @Query('role') role: DeviceFlowRole,
    @Body() payload: SendMessageBody,
  ): Promise<void> {
    const eventType =
      role === DeviceFlowRole.Approver ? DeviceEvent.LoginApproved : DeviceEvent.ApprovalRequest;
    const event = new DeviceMessageEvent(payload.deviceId, userId, payload.message);
    this.eventEmitter.emit(eventType, event);
  }
}
