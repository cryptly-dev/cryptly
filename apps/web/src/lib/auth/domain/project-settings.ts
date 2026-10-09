import type { Schemas } from "@packages/backend-sdk";

export type ProjectSettings = Schemas["ProjectSettingsSerialized"];
export type ProjectRevealOn = ProjectSettings["revealOn"];

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  revealOn: "hover",
};

export function normalizeProjectSettings(
  settings?: Partial<ProjectSettings> | null,
): ProjectSettings {
  return {
    revealOn: settings?.revealOn ?? DEFAULT_PROJECT_SETTINGS.revealOn,
  };
}
