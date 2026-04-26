import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CliSessionStatus } from '../core/entities/cli-session-status.enum';

export class PollCliSessionResponse {
  @ApiProperty({ enum: CliSessionStatus })
  status: CliSessionStatus;

  @ApiPropertyOptional()
  jwt?: string;

  @ApiPropertyOptional()
  refreshToken?: string;

  @ApiPropertyOptional({ description: 'RSA-OAEP-encrypted ephemeral AES key' })
  wrappedKey?: string;

  @ApiPropertyOptional({ description: 'AES-GCM-encrypted user private key (PKCS8)' })
  encryptedPrivateKey?: string;

  @ApiPropertyOptional()
  userId?: string;
}
