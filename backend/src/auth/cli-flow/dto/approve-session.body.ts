import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ApproveCliSessionBody {
  @ApiProperty({ description: 'RSA-OAEP-encrypted ephemeral AES key (wraps the user private key)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  wrappedKey: string;

  @ApiProperty({ description: 'AES-GCM-encrypted user private key (PKCS8)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8192)
  encryptedPrivateKey: string;
}
