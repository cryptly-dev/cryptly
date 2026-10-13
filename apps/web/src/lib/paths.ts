import type { ProjectTab } from "$lib/projects/project-tab";

/**
 * In-app paths for project tabs and settings sections. Wrap them in `resolve()` from
 * `$app/paths` at the call site (`href={resolve(projectPath(id, "history"))}`); that's what
 * adds the base path and what the svelte/no-navigation-without-resolve lint looks for.
 */
export function projectPath(
  projectId: string,
  tab: ProjectTab = "secrets",
  section?: string,
): `/app/project/${string}` {
  const path = `/app/project/${encodeURIComponent(projectId)}${tab === "secrets" ? "" : `/${tab}`}`;
  return `${path}${section ? `#${section}` : ""}` as `/app/project/${string}`;
}

/** Account settings, optionally at a section (`#devices`). */
export function settingsPath(section?: string): "/app/settings" {
  return (
    section ? `/app/settings#${section}` : "/app/settings"
  ) as "/app/settings";
}
