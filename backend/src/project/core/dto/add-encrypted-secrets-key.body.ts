import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';
import { IsString, MaxLength } from 'class-validator';
import { ENCRYPTED_SECRETS_MAX_LENGTH } from 'src/shared/constants/validation';

export class AddEncryptedSecretsKeyBody {
  @ApiProperty()
  @IsString()
  public userId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  public encryptedSecretsKey: string;
}
