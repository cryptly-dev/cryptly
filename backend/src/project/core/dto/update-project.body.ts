import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  ENCRYPTED_SECRETS_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
} from '../../../shared/constants/validation';
import { SecurityLevel } from '../../../shared/types/security-level.enum';

export class UpdateProjectBody {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(PROJECT_NAME_MAX_LENGTH)
  public name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(ENCRYPTED_SECRETS_MAX_LENGTH)
  public encryptedSecrets?: string;

  @ApiProperty({ required: false, enum: SecurityLevel })
  @IsEnum(SecurityLevel)
  @IsOptional()
  public securityLevel?: SecurityLevel;
}
