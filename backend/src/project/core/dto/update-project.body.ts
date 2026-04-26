import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import {
  ENCRYPTED_SECRETS_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
} from '../../../shared/constants/validation';
import { ProjectRevealOn } from '../../../shared/types/project-settings';

class ProjectSettingsBody {
  @ApiProperty({ enum: ProjectRevealOn })
  @IsEnum(ProjectRevealOn)
  public revealOn: ProjectRevealOn;
}

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

  @ApiProperty({ required: false, type: ProjectSettingsBody })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectSettingsBody)
  public settings?: ProjectSettingsBody;
}
