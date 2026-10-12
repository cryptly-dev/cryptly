<script lang="ts">
  import { Check, Copy } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import {
    normalizeProjectSettings,
    type ProjectRevealOn,
  } from "$lib/auth/domain/project-settings";
  import { ProjectsApi, type Project } from "$lib/projects/projects.api";
  import RevealOnPicker, {
    revealOnOption,
  } from "$lib/projects/ui/RevealOnPicker.svelte";
  import { upsertProject } from "$lib/shell/shell.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import Button from "$lib/ui/Button.svelte";
  import IconButton from "$lib/ui/IconButton.svelte";
  import SettingsItem from "$lib/ui/SettingsItem.svelte";
  import Well from "$lib/ui/Well.svelte";

  let { project, isAdmin }: { project: Project; isAdmin: boolean } = $props();

  let renaming = $state(false);
  let nameDraft = $state("");
  let savingName = $state(false);
  // Optimistic: follows the project, overridden while a change is being saved.
  let revealOn = $derived(normalizeProjectSettings(project.settings).revealOn);
  let savingRevealOn = $state(false);
  let copiedId = $state(false);

  const reveal = $derived(revealOnOption(revealOn));
  const nameValid = $derived(
    nameDraft.trim().length > 0 && nameDraft.trim() !== project.name,
  );

  function startRename() {
    nameDraft = project.name;
    renaming = true;
  }

  async function saveName() {
    const jwt = auth.jwtToken;
    if (!jwt || !nameValid || savingName) return;
    savingName = true;
    try {
      upsertProject(
        await ProjectsApi.updateProject(jwt, project.id, {
          name: nameDraft.trim(),
        }),
      );
      renaming = false;
    } catch {
      toast.error("Failed to rename project");
    } finally {
      savingName = false;
    }
  }

  async function saveRevealOn(next: ProjectRevealOn) {
    const jwt = auth.jwtToken;
    if (!jwt) return;
    const previous = normalizeProjectSettings(project.settings).revealOn;
    revealOn = next;
    savingRevealOn = true;
    try {
      upsertProject(
        await ProjectsApi.updateProject(jwt, project.id, {
          settings: { revealOn: next },
        }),
      );
    } catch {
      revealOn = previous;
      toast.error("Failed to save settings");
    } finally {
      savingRevealOn = false;
    }
  }

  async function copyId() {
    try {
      await navigator.clipboard.writeText(project.id);
      copiedId = true;
      setTimeout(() => (copiedId = false), 1500);
    } catch {
      toast.error("Could not copy to the clipboard");
    }
  }
</script>

{#snippet nameActions()}
  {#if renaming}
    <Button
      variant="ghost"
      size="sm"
      disabled={savingName}
      onclick={() => (renaming = false)}>Cancel</Button
    >
    <Button
      variant="primary"
      size="sm"
      disabled={!nameValid || savingName}
      onclick={() => void saveName()}>Save</Button
    >
  {:else}
    <Button size="sm" onclick={startRename}>Rename</Button>
  {/if}
{/snippet}

{#snippet revealActions()}
  <RevealOnPicker
    value={revealOn}
    disabled={savingRevealOn}
    onchange={(next) => void saveRevealOn(next)}
  />
{/snippet}

{#snippet idActions()}
  <IconButton label="Copy project ID" onclick={() => void copyId()}>
    {#if copiedId}
      <Check class="text-success" strokeWidth={1.75} />
    {:else}
      <Copy strokeWidth={1.75} />
    {/if}
  </IconButton>
{/snippet}

<Well id="general" title="General">
  <SettingsItem label="Name" actions={isAdmin ? nameActions : undefined}>
    {#if renaming}
      <input
        bind:value={nameDraft}
        {@attach (input) => input.select()}
        aria-label="Project name"
        autocomplete="off"
        spellcheck="false"
        data-1p-ignore
        disabled={savingName}
        class="-my-1 -ml-2 h-[30px] min-w-0 flex-1 rounded-lg bg-field px-2 shadow-field outline-none focus:shadow-[inset_0_0_0_1px_var(--fg3)]"
        onkeydown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void saveName();
          } else if (event.key === "Escape") {
            event.preventDefault();
            renaming = false;
          }
        }}
      />
    {:else}
      <span class="truncate">{project.name}</span>
    {/if}
  </SettingsItem>
  <SettingsItem label="Values" actions={isAdmin ? revealActions : undefined}>
    <span class="shrink-0">{reveal.label}</span>
    <span class="truncate text-[12.5px] text-fg3 max-md:hidden"
      >{reveal.description}</span
    >
  </SettingsItem>
  <SettingsItem label="ID" actions={idActions}>
    <span class="truncate mono text-[12.5px]">{project.id}</span>
  </SettingsItem>
</Well>
