<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { projectPath } from "$lib/paths";
  import { ProjectsApi, type Project } from "$lib/projects/projects.api";
  import { removeProject, shell } from "$lib/shell/shell.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import Button from "$lib/ui/Button.svelte";
  import SettingsItem from "$lib/ui/SettingsItem.svelte";
  import Well from "$lib/ui/Well.svelte";
  import ConfirmDialog from "./ConfirmDialog.svelte";

  let { project, isAdmin }: { project: Project; isAdmin: boolean } = $props();

  let confirmOpen = $state(false);

  async function deleteOrLeave() {
    const jwt = auth.jwtToken;
    const userId = auth.userData?.id;
    if (!jwt || !userId) throw new Error("Signed out");
    const projectId = project.id;
    if (isAdmin) {
      await ProjectsApi.deleteProject(jwt, projectId);
    } else {
      await ProjectsApi.removeMember(jwt, { projectId, memberId: userId });
    }
    const next = shell.projects?.find((p) => p.id !== projectId);
    // Navigate first so the page never renders without its project.
    await goto(next ? resolve(projectPath(next.id)) : resolve("/app/project"), {
      replaceState: true,
    });
    removeProject(projectId);
  }
</script>

{#snippet deleteAction()}
  <Button variant="danger" size="sm" onclick={() => (confirmOpen = true)}
    >{isAdmin ? "Delete project" : "Leave project"}</Button
  >
{/snippet}

<Well id="danger" title="Danger zone" danger>
  <SettingsItem label={isAdmin ? "Delete" : "Leave"} actions={deleteAction}>
    <span
      >{isAdmin
        ? "Removes the project and every version, for all members."
        : "Remove yourself from this project."}</span
    >
  </SettingsItem>
</Well>

{#if isAdmin}
  <ConfirmDialog
    bind:open={confirmOpen}
    title={`Delete ${project.name}?`}
    description="This removes every secret and version for all members. It can't be undone."
    confirmLabel="Delete project"
    confirmText={project.name}
    error="Failed to delete project"
    onconfirm={deleteOrLeave}
  />
{:else}
  <ConfirmDialog
    bind:open={confirmOpen}
    title={`Leave ${project.name}?`}
    description="You lose access to this project and its secrets, and need a new invitation to rejoin."
    confirmLabel="Leave project"
    error="Failed to leave project"
    onconfirm={deleteOrLeave}
  />
{/if}
