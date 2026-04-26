import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectRevealOn, ProjectSettings } from '../../../shared/types/project-settings';
import { AuthMethod } from '../enum/auth-method.enum';

export class UserPartialNormalized {
  public id: string;
  public email?: string;
  public avatarUrl: string;
  public displayName: string;
  public publicKey?: string;
}

export class UserNormalized extends UserPartialNormalized {
  public authMethod: AuthMethod;
  public privateKeyEncrypted?: string;
  public projectsOrder: string[];
  public projectCreationDefaults: ProjectSettings;
  public isAdmin: boolean;
}

export class ProjectCreationDefaultsSerialized {
  @ApiProperty({ enum: ProjectRevealOn })
  public revealOn: ProjectRevealOn;
}

export class UserPartialSerialized {
  @ApiProperty()
  public id: string;

  @ApiPropertyOptional()
  public email?: string;

  @ApiProperty()
  public avatarUrl: string;

  @ApiProperty()
  public displayName: string;

  @ApiPropertyOptional()
  public publicKey?: string;
}

export class UserSerialized extends UserPartialSerialized {
  @ApiProperty({ enum: AuthMethod })
  public authMethod: AuthMethod;

  @ApiPropertyOptional()
  public privateKeyEncrypted?: string;

  @ApiProperty({ type: ProjectCreationDefaultsSerialized })
  public projectCreationDefaults: ProjectCreationDefaultsSerialized;

  @ApiProperty()
  public isAdmin: boolean;
}
