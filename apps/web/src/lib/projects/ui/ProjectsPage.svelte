<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { toast } from "svelte-sonner";
  import { normalizeProjectSettings } from "$lib/auth/domain/project-settings";
  import { projectPath } from "$lib/paths";
  import { createEncryptedProject } from "$lib/projects/create-project";
  import type { Project } from "$lib/projects/projects.api";
  import { shell } from "$lib/shell/shell.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import Button from "$lib/ui/Button.svelte";

  /** `/app/project`: open the most recently updated project, or name the first one. */
  let name = $state("");
  let creating = $state(false);

  const latest = $derived(
    shell.projects?.reduce<Project | null>(
      (best, p) =>
        !best || Date.parse(p.updatedAt) > Date.parse(best.updatedAt)
          ? p
          : best,
      null,
    ) ?? null,
  );
  const empty = $derived(shell.projects?.length === 0);
  const keysReady = $derived(Boolean(auth.userData?.publicKey));

  // `creating`: the first project navigates to itself once it exists.
  $effect(() => {
    if (latest && !creating)
      void goto(resolve(projectPath(latest.id)), { replaceState: true });
  });

  async function create(event: SubmitEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || creating) return;
    creating = true;
    try {
      await createEncryptedProject({
        name: trimmed,
        settings: normalizeProjectSettings(
          auth.userData?.projectCreationDefaults,
        ),
        replaceState: true,
      });
    } catch {
      toast.error("Could not create project");
      creating = false;
    }
  }
</script>

<svelte:head>
  <title>Projects · Cryptly</title>
</svelte:head>

{#if empty}
  <div class="grid flex-1 place-items-center p-6">
    <form class="flex w-full max-w-[360px] flex-col gap-4" onsubmit={create}>
      <div>
        <h1 class="text-[15px] font-semibold">Name your first project</h1>
        <p class="mt-1 text-fg3">
          Secrets you store in it are encrypted in your browser, before they
          leave your machine.
        </p>
      </div>
      {#if !keysReady}
        <p class="text-[12.5px] text-warning">
          Set up your passphrase first.
          <a href={resolve("/app/set-passphrase")} class="underline"
            >Continue setup</a
          >
        </p>
      {/if}
      <div class="flex gap-2">
        <!-- svelte-ignore a11y_autofocus -->
        <input
          bind:value={name}
          autofocus
          aria-label="Project name"
          placeholder="checkout-api"
          maxlength="200"
          autocomplete="off"
          spellcheck="false"
          data-1p-ignore
          disabled={creating || !keysReady}
          class="h-[30px] min-w-0 flex-1 rounded-[10px] bg-field px-2.5 text-[16px] shadow-field outline-none placeholder:text-ph focus:shadow-[inset_0_0_0_1px_var(--fg3)] disabled:opacity-60 md:text-[13px]"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!name.trim() || creating || !keysReady}
          >{creating ? "Creating…" : "Create"}</Button
        >
      </div>
    </form>
  </div>
{/if}
