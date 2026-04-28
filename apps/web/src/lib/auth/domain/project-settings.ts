export type ProjectRevealOn = 'always' | 'hover' | 'never';

export interface ProjectSettings {
  revealOn: ProjectRevealOn;
}

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  revealOn: 'hover'
};

export function normalizeProjectSettings(
  settings?: Partial<ProjectSettings> | null
): ProjectSettings {
  return {
    revealOn: settings?.revealOn ?? DEFAULT_PROJECT_SETTINGS.revealOn
  };
}
