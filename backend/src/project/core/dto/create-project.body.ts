import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsString, MaxLength } from 'class-validator';
import {
  ENCRYPTED_SECRETS_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
} from '../../../shared/constants/validation';
import { SecurityLevel } from '../../../shared/types/security-level.enum';

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

  @ApiProperty({ enum: SecurityLevel })
  @IsEnum(SecurityLevel)
  public securityLevel: SecurityLevel;
}
