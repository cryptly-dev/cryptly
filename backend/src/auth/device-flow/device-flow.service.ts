import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { APPROVERS_LIST, DeviceEvent } from '../events/device-event.enum';
import { DeviceMessageEvent } from './dto/device-message.event';
import { Device } from './dto/device.interface';

@Injectable()
export class DeviceFlowService {
  private devices: Record<string, Record<string, Device>> = {};

  public constructor(private readonly eventEmitter: EventEmitter2) {}

  public connectApprover(userId: string, deviceId: string, deviceName: string): void {
    if (!this.devices[userId]) {
      this.devices[userId] = {};
    }

    this.devices[userId][deviceId] = {
      deviceId,
      deviceName,
      lastActivityDate: new Date(),
    };

    this.broadcastDevicesChanged(userId, deviceId);
  }

  public disconnectApprover(userId: string, deviceId: string): void {
    const userDevices = this.devices[userId];
    if (!userDevices) {
      return;
    }

    delete userDevices[deviceId];

    if (Object.keys(userDevices).length === 0) {
      delete this.devices[userId];
    }

    this.broadcastDevicesChanged(userId, deviceId);
  }

  public getApprovers(userId: string): Device[] {
    const userDevices = this.devices[userId];
    if (!userDevices) {
      return [];
    }

    return Object.values(userDevices);
  }

  private broadcastDevicesChanged(targetUserId: string, targetDeviceId: string): void {
    const event = new DeviceMessageEvent(targetDeviceId, targetUserId, {
      type: APPROVERS_LIST,
      approvers: this.getApprovers(targetUserId),
    });
    this.eventEmitter.emit(DeviceEvent.DevicesChanged, event);
  }
}
