<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { untrack } from "svelte";
  import HistoryView from "$lib/history/ui/HistoryView.svelte";
  import { loadHistory } from "$lib/history/history.svelte";
  import { projectPath } from "$lib/paths";
  import type { ProjectTab } from "$lib/projects/project-tab";
  import ProjectUnsavedNavGuard from "$lib/projects/ui/ProjectUnsavedNavGuard.svelte";
  import ProjectSettingsView from "$lib/projects/ui/settings/ProjectSettingsView.svelte";
  import SecretsView from "$lib/secrets/ui/SecretsView.svelte";
  import { refreshProjects, shell } from "$lib/shell/shell.svelte";
  import { keyAuth } from "$lib/stores/key.svelte";

  let { projectId, tab }: { projectId: string; tab: ProjectTab } = $props();

  const project = $derived(
    shell.projects?.find((p) => p.id === projectId) ?? null,
  );

  // Not in the list: re-fetch once (created or joined elsewhere), then fall back to the
  // first project, keeping the tab.
  let refreshedFor = "";
  function fallBack() {
    const first = shell.projects?.[0];
    void goto(resolve(first ? projectPath(first.id, tab) : "/app/project"), {
      replaceState: true,
    });
  }
  $effect(() => {
    if (!shell.projects || project) return;
    const id = projectId;
    if (refreshedFor === id) return untrack(fallBack);
    refreshedFor = id;
    void refreshProjects().catch(() => {
      if (projectId === id) fallBack();
    });
  });

  // History feeds the History tab, the Settings sync status and Restore; load it per project
  // and again after unlocking.
  const historyKey = $derived(
    project && keyAuth.hasMasterKey
      ? `${project.id}:${keyAuth.revision}`
      : null,
  );
  $effect(() => {
    if (!historyKey) return;
    untrack(() => {
      if (project) void loadHistory(project);
    });
  });
</script>

<svelte:head>
  <title>{project ? `${project.name} · Cryptly` : "Cryptly"}</title>
</svelte:head>

<ProjectUnsavedNavGuard />

{#if !project}
  <p role="status" class="grid flex-1 place-items-center text-fg3">
    Loading project…
  </p>
{:else}
  <!-- Secrets stays mounted on every tab (only hidden) so unsaved edits survive tab switches. -->
  <div class={tab === "secrets" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
    <SecretsView {project} active={tab === "secrets"} />
  </div>
  {#if tab === "history"}
    <HistoryView {project} />
  {:else if tab === "settings"}
    <ProjectSettingsView {project} />
  {/if}
{/if}
