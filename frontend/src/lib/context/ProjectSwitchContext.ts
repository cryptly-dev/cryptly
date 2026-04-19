import { createContext } from "react";

export interface ProjectSwitchContextValue {
  /** The projectId whose data is currently rendered in the UI. */
  displayedProjectId: string;
  /** The projectId requested by the URL whose data is still loading, or null. */
  pendingProjectId: string | null;
  /** True while a project switch is in flight (pendingProjectId is not null). */
  isSwitching: boolean;
}

export const ProjectSwitchContext =
  createContext<ProjectSwitchContextValue | null>(null);
