import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsString, MaxLength, ValidateNested } from 'class-validator';
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

  @ApiProperty({ type: ProjectSettingsBody })
  @ValidateNested()
  @Type(() => ProjectSettingsBody)
  public settings: ProjectSettingsBody;
}
