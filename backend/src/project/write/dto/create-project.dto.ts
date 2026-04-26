import { ProjectSettings } from '../../../shared/types/project-settings';

export class CreateProjectDto {
  public name: string;
  public encryptedSecretsKeys: Record<string, string>;
  public encryptedSecrets: string;
  public settings: ProjectSettings;
}
