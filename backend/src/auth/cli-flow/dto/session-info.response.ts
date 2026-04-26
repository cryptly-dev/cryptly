import { ApiProperty } from '@nestjs/swagger';
import { CliSessionStatus } from '../core/entities/cli-session-status.enum';

export class CliSessionInfoResponse {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  deviceName: string;

  @ApiProperty({ enum: CliSessionStatus })
  status: CliSessionStatus;

  @ApiProperty({ description: 'Unix milliseconds at which this session expires.' })
  expiresAt: number;

  @ApiProperty({ description: 'Base64 SPKI of the CLI temp public key — needed by the browser to wrap the private key.' })
  tempPublicKey: string;
}
