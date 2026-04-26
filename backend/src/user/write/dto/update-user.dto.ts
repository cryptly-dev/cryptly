import { ProjectSettings } from '../../../shared/types/project-settings';

export class UpdateUserDto {
  public displayName?: string;
  public publicKey?: string;
  public privateKeyEncrypted?: string;
  public projectsOrder?: string[];
  public projectCreationDefaults?: ProjectSettings;
}
