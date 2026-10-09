import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageBody {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsNotEmpty()
  message: Record<string, unknown>;
}
