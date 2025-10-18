import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PingBody {
  @ApiProperty()
  @IsString()
  deviceId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deviceName?: string;
}
