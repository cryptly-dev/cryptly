import { ProjectSettings } from '../../../shared/types/project-settings';
import { BrowserLockOn } from '../../core/enum/browser-lock-on.enum';

export class UpdateUserDto {
  public displayName?: string;
  public publicKey?: string;
  public privateKeyEncrypted?: string;
  public projectsOrder?: string[];
  public projectCreationDefaults?: ProjectSettings;
  public lockBrowserOn?: BrowserLockOn;
}
