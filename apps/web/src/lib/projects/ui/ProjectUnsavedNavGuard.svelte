<script lang="ts">
  import { browser } from "$app/environment";
  import { beforeNavigate, goto } from "$app/navigation";
  import { tick } from "svelte";
  import { fade } from "svelte/transition";
  import { Command } from "lucide-svelte";
  import { secretsEditorNavGuard } from "$lib/secrets/secrets-editor-nav-guard.svelte";

  let dialogOpen = $state(false);
  let saving = $state(false);
  let saveFailed = $state(false);
  let pendingDestination = $state<string | null>(null);
  let snapshot = $state({ projectName: "", externallyUpdated: false });
  let firstButton: HTMLButtonElement | undefined = $state();

  const kbdClass =
    "pointer-events-none inline-flex h-6 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm border-0 bg-primary-foreground/20 px-1.5 font-sans text-xs font-medium text-primary-foreground";

  const canSave = $derived(
    !saving && !secretsEditorNavGuard.readOnly && !snapshot.externallyUpdated,
  );

  function shouldBlockNavigation(fromUrl: URL, toUrl: URL): boolean {
    if (!secretsEditorNavGuard.isDirty) return false;
    const fromPath = fromUrl.pathname;
    const toPath = toUrl.pathname;
    if (!fromPath.startsWith("/app/project/")) return false;
    const fromParts = fromPath.split("/");
    const fromId = fromParts[3];
    if (!fromId) return false;
    if (toPath.startsWith("/app/project/")) {
      const toId = toPath.split("/")[3];
      if (toId === fromId) return false;
    }
    return true;
  }

  beforeNavigate((navigation) => {
    if (!navigation.to) return;
    if (
      !shouldBlockNavigation(
        navigation.from?.url ??
          new URL(browser ? window.location.href : "http://localhost"),
        navigation.to.url,
      )
    ) {
      return;
    }
    navigation.cancel();
    pendingDestination = navigation.to.url.href;
    snapshot = {
      projectName: secretsEditorNavGuard.projectName,
      externallyUpdated: secretsEditorNavGuard.externallyUpdated,
    };
    saveFailed = false;
    dialogOpen = true;
    void tick().then(() => firstButton?.focus());
  });

  $effect(() => {
    if (!browser || !secretsEditorNavGuard.isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  });

  $effect(() => {
    if (!dialogOpen) return;
    // Capture phase so the editor's own ⌘S handler doesn't also fire.
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        event.stopImmediatePropagation();
        void handleSave();
      } else if (event.key === "Escape" && !saving) {
        event.preventDefault();
        closeDialog();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  });

  function closeDialog() {
    dialogOpen = false;
    pendingDestination = null;
    saveFailed = false;
  }

  async function proceed() {
    const dest = pendingDestination;
    closeDialog();
    // Let the editor's dirty flag settle so the guard doesn't block its own navigation.
    await tick();
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- dest is the already-resolved URL of the blocked navigation
    if (dest) void goto(dest);
  }

  async function handleSave() {
    if (!canSave || !secretsEditorNavGuard.save) return;
    saving = true;
    saveFailed = false;
    try {
      const ok = await secretsEditorNavGuard.save();
      if (!ok) {
        saveFailed = true;
        return;
      }
      await proceed();
    } finally {
      saving = false;
    }
  }

  async function handleDiscard() {
    secretsEditorNavGuard.discard?.();
    await proceed();
  }
</script>

{#if dialogOpen}
  <button
    type="button"
    aria-label="Keep editing"
    tabindex="-1"
    class="fixed inset-0 z-50 cursor-default bg-black/80 backdrop-blur-[2px]"
    transition:fade={{ duration: 200 }}
    onclick={() => {
      if (!saving) closeDialog();
    }}
  ></button>
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="unsaved-title"
    aria-describedby="unsaved-description"
    class="fixed top-[15vh] left-1/2 z-50 grid max-h-[85vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg sm:max-w-lg"
    transition:fade={{ duration: 200 }}
  >
    <div class="flex flex-col gap-2 text-left">
      <h2 id="unsaved-title" class="text-lg leading-none font-semibold">
        Save your changes?
      </h2>
      <p id="unsaved-description" class="text-sm text-muted-foreground">
        {#if snapshot.projectName}
          You have unsaved edits to <span class="font-medium text-foreground"
            >{snapshot.projectName}</span
          >. Save now, discard them, or keep editing.
        {:else}
          You have unsaved edits. Save now, discard them, or keep editing.
        {/if}
      </p>
    </div>

    {#if snapshot.externallyUpdated}
      <p class="text-sm text-amber-400">
        This project was updated elsewhere. Refresh to load the latest version
        before saving.
      </p>
    {/if}

    {#if saveFailed}
      <p class="text-sm text-destructive">Could not save. Try again.</p>
    {/if}

    <div class="flex flex-col gap-3">
      <div class="flex w-full flex-wrap items-center justify-end gap-2">
        <button
          bind:this={firstButton}
          type="button"
          class="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium shadow-xs transition-all hover:bg-neutral-700 disabled:pointer-events-none disabled:opacity-50"
          onclick={closeDialog}
          disabled={saving}
        >
          Keep editing
        </button>
        <button
          type="button"
          class="inline-flex h-9 cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-destructive transition-all hover:bg-neutral-800 disabled:pointer-events-none disabled:opacity-50"
          onclick={() => void handleDiscard()}
          disabled={saving}
        >
          Discard changes
        </button>
        <button
          type="button"
          aria-label="Save"
          class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border bg-primary px-4 font-semibold whitespace-nowrap text-primary-foreground transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          onclick={() => void handleSave()}
          disabled={!canSave}
        >
          {#if saving}
            <span
              aria-label="Saving"
              class="inline-block size-4 animate-spin rounded-full border-2 border-primary-foreground/60 border-t-transparent"
            ></span>
            Saving...
          {:else}
            <span>Save</span>
            <span class="inline-flex items-center gap-1 opacity-90">
              <kbd class={kbdClass}><Command class="size-3" /></kbd>
              <kbd class={kbdClass}>S</kbd>
            </span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
