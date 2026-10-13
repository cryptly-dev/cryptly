import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import {
  InvitationsApi,
  type PersonalInvitation,
} from "$lib/invitations/invitations.api";
import { ProjectsApi, type Project } from "$lib/projects/projects.api";
import {
  accountLoadErrorMessage,
  auth,
  loadUserData,
} from "$lib/stores/auth.svelte";

/**
 * App shell state shared by the sidebar and every page in the panel. Projects come from one
 * list request; pages read their project from here and write updates back so the sidebar,
 * breadcrumbs and settings stay in sync.
 */
export const shell = $state({
  projects: null as Project[] | null,
  /** Direct invitations waiting for this user (the sidebar's Invitations row). */
  invitations: [] as PersonalInvitation[],
  loading: false,
  loadError: null as string | null,
});

let loadSeq = 0;

export async function loadShell(): Promise<void> {
  const seq = ++loadSeq;
  if (!auth.jwtToken) {
    void goto(resolve("/app/login"));
    return;
  }
  shell.loading = true;
  shell.loadError = null;
  try {
    const ok = await loadUserData();
    if (seq !== loadSeq) return;
    if (!ok) {
      if (auth.jwtToken) shell.loadError = accountLoadErrorMessage();
      return;
    }
    const jwt = auth.jwtToken;
    if (!jwt) return;
    void loadInvitations();
    const projects = await ProjectsApi.getProjects(jwt);
    if (seq !== loadSeq) return;
    shell.projects = dedupe(projects);
  } catch (error) {
    if (seq !== loadSeq) return;
    shell.loadError =
      error instanceof Error ? error.message : "Failed to load projects";
  } finally {
    if (seq === loadSeq) shell.loading = false;
  }
}

/** Re-fetch the project list without showing the loading state. */
export async function refreshProjects(): Promise<void> {
  const jwt = auth.jwtToken;
  if (!jwt) return;
  const projects = dedupe(await ProjectsApi.getProjects(jwt));
  // A list-shaped write even when nothing changed, so pages waiting on it re-evaluate.
  shell.projects = projects;
}

/** Replace a project in place; a new project goes first, like the server orders it. */
export function upsertProject(project: Project) {
  const list = shell.projects ?? [];
  shell.projects = list.some((p) => p.id === project.id)
    ? list.map((p) => (p.id === project.id ? project : p))
    : [project, ...list];
}

export async function loadInvitations(): Promise<void> {
  const jwt = auth.jwtToken;
  if (!jwt) return;
  try {
    const invitations = await InvitationsApi.getMyPersonalInvitations(jwt);
    if (auth.jwtToken === jwt) shell.invitations = invitations;
  } catch {
    // Keep the last known list; the next shell load retries.
  }
}

export function removeProject(projectId: string) {
  shell.projects = (shell.projects ?? []).filter((p) => p.id !== projectId);
}

export function clearShell() {
  loadSeq++;
  shell.projects = null;
  shell.invitations = [];
  shell.loading = false;
  shell.loadError = null;
}

function dedupe(list: Project[]): Project[] {
  return list.filter(
    (p, index) => list.findIndex((other) => other.id === p.id) === index,
  );
}
