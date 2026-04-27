import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class StartCliSessionBody {
  @ApiProperty({ description: 'Base64 SPKI of the CLI temp RSA-OAEP public key' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  tempPublicKey: string;

  @ApiProperty({ description: 'Human-readable device label, e.g. "macbook-air · darwin"' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  deviceName: string;
}
