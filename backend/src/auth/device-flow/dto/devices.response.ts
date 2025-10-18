import { ApiProperty } from '@nestjs/swagger';
import { Device } from './device.interface';

export class DevicesResponse {
  @ApiProperty()
  devices: Device[];
}
