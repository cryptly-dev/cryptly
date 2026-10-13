export type ProjectTab = "secrets" | "history" | "settings";

export const PROJECT_TABS: readonly { id: ProjectTab; label: string }[] = [
  { id: "secrets", label: "Secrets" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings" },
];
