import { ProjectSettings } from '../../../shared/types/project-settings';

export class UpdateProjectDto {
  public name?: string;
  public encryptedSecrets?: string;
  public settings?: ProjectSettings;
}
