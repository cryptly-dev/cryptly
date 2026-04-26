import { ApiProperty } from '@nestjs/swagger';

export class StartCliSessionResponse {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  approveUrl: string;

  @ApiProperty({ description: 'Unix milliseconds at which this session expires.' })
  expiresAt: number;
}
