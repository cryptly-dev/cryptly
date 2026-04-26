import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ProjectRevealOn } from '../../../shared/types/project-settings';

class ProjectCreationDefaultsBody {
  @ApiProperty({ enum: ProjectRevealOn })
  @IsEnum(ProjectRevealOn)
  public revealOn: ProjectRevealOn;
}

export class UpdateUserBody {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @ApiProperty({ required: false })
  public displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  @ApiProperty({ required: false })
  public publicKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  @ApiProperty({ required: false })
  public privateKeyEncrypted?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false, type: [String] })
  public projectsOrder?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectCreationDefaultsBody)
  @ApiProperty({ required: false, type: ProjectCreationDefaultsBody })
  public projectCreationDefaults?: ProjectCreationDefaultsBody;
}
