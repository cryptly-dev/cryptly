import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../shared/types/role.enum';
import { Branded } from '../../../shared/types/branded';
import { ProjectRevealOn, ProjectSettings } from '../../../shared/types/project-settings';
import { UserPartialSerialized } from '../../../user/core/entities/user.interface';

export type EnvName = Branded<string, 'EnvName'>;

export class ProjectNormalized {
  public id: string;
  public name: string;
  public members: Record<string, Role>;
  public encryptedSecretsKeys: Record<string, string>;
  public settings: ProjectSettings;
  public createdAt: Date;
  public updatedAt: Date;
}

export class ProjectSettingsSerialized {
  @ApiProperty({ enum: ProjectRevealOn })
  public revealOn: ProjectRevealOn;
}

export class ProjectMemberSerialized extends UserPartialSerialized {
  @ApiProperty({ enum: Object.values(Role) })
  public role: Role;
}

export class ProjectSerialized {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  @ApiProperty({ type: [ProjectMemberSerialized] })
  public members: ProjectMemberSerialized[];

  @ApiProperty()
  public encryptedSecretsKeys: Record<string, string>;

  @ApiProperty()
  public encryptedSecrets: string;

  @ApiProperty({ type: ProjectSettingsSerialized })
  public settings: ProjectSettingsSerialized;

  @ApiProperty()
  public createdAt: string;

  @ApiProperty()
  public updatedAt: string;
}
