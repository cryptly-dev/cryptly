export enum ProjectRevealOn {
  Always = 'always',
  Hover = 'hover',
  Never = 'never',
}

export class ProjectSettings {
  public revealOn: ProjectRevealOn;
}

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  revealOn: ProjectRevealOn.Hover,
};

export function normalizeProjectSettings(
  settings?: Partial<ProjectSettings> | null,
): ProjectSettings {
  return {
    revealOn: settings?.revealOn ?? DEFAULT_PROJECT_SETTINGS.revealOn,
  };
}
