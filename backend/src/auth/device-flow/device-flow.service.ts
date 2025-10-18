import { Injectable } from '@nestjs/common';
import { Device } from './dto/device.interface';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DeviceFlowService {
  private devices: Record<string, Record<string, Device>> = {};
  private readonly STALE_DEVICE_THRESHOLD_MS = 10000;

  public ping(userId: string, deviceId: string, deviceName?: string): void {
    if (!this.devices[userId]) {
      this.devices[userId] = {};
    }

    this.devices[userId][deviceId] = {
      deviceId,
      deviceName,
      lastActivityDate: new Date(),
    };
  }

  public getDevices(userId: string): Device[] {
    const userDevices = this.devices[userId];
    if (!userDevices) {
      return [];
    }

    return Object.values(userDevices);
  }

  @Cron(CronExpression.EVERY_SECOND)
  public removeStaleDevices(): void {
    const now = new Date();
    const threshold = now.getTime() - this.STALE_DEVICE_THRESHOLD_MS;

    for (const userId in this.devices) {
      const userDevices = this.devices[userId];

      for (const deviceId in userDevices) {
        const device = userDevices[deviceId];
        if (device.lastActivityDate.getTime() < threshold) {
          delete userDevices[deviceId];
        }
      }

      if (Object.keys(userDevices).length === 0) {
        delete this.devices[userId];
      }
    }
  }
}
