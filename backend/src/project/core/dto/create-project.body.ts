import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, MaxLength } from 'class-validator';
import {
  ENCRYPTED_SECRETS_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
} from '../../../shared/constants/validation';

export class CreateProjectBody {
  @ApiProperty()
  @IsString()
  @MaxLength(PROJECT_NAME_MAX_LENGTH)
  public name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(ENCRYPTED_SECRETS_MAX_LENGTH)
  public encryptedSecrets: string;

  @ApiProperty()
  @IsObject()
  public encryptedSecretsKeys: Record<string, string>;
}
