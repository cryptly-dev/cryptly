<script lang="ts">
  import { ChevronDown } from "lucide-svelte";
  import { fade } from "svelte/transition";
  import { secretsEditorNavGuard as editor } from "$lib/secrets/secrets-editor-nav-guard.svelte";
  import GitHubIcon from "$lib/shared/ui/GitHubIcon.svelte";
  import { cn } from "$lib/utils";

  let menuOpen = $state(false);

  const saveDisabled = $derived(
    editor.saving ||
      !editor.isDirty ||
      editor.externallyUpdated ||
      editor.readOnly ||
      !editor.save,
  );
  const pushEnabled = $derived(
    !editor.isDirty &&
      !editor.pushing &&
      !editor.externallyUpdated &&
      editor.hasIntegrations &&
      !editor.readOnly,
  );
  const saved = $derived(!editor.isDirty && !editor.saving);
  const pushReason = $derived.by(() => {
    if (editor.readOnly) return "Read-only access";
    if (!editor.hasIntegrations) return "No GitHub repo connected";
    if (editor.isDirty) return "Save your changes first";
    if (editor.externallyUpdated) return "Refresh first — updated elsewhere";
    return null;
  });

  function push() {
    if (!pushEnabled) return;
    menuOpen = false;
    void editor.push?.();
  }
</script>

<div class="relative inline-flex items-stretch">
  <div class="inline-flex items-stretch overflow-hidden rounded-md">
    <button
      type="button"
      disabled={saveDisabled}
      class={cn(
        "inline-flex h-8 min-w-[68px] items-center justify-center px-3 text-sm font-medium whitespace-nowrap transition-colors",
        saveDisabled
          ? "bg-neutral-800 text-neutral-500"
          : "cursor-pointer bg-white text-black hover:bg-neutral-100",
      )}
      onclick={() => void editor.save?.()}
    >
      {#if editor.saving}
        <span
          aria-label="Saving"
          class="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        ></span>
      {:else if saved}
        <span>Saved</span>
      {:else}
        <span>Save</span>
      {/if}
    </button>
    <button
      type="button"
      aria-label="More actions"
      class={cn(
        "inline-flex h-8 cursor-pointer items-center justify-center border-l px-1.5 transition-colors",
        saveDisabled
          ? "border-neutral-700 bg-neutral-800 text-neutral-500"
          : "border-black/10 bg-white text-black hover:bg-neutral-100",
      )}
      onclick={() => (menuOpen = !menuOpen)}
    >
      <ChevronDown class="size-4" />
    </button>
  </div>
  {#if menuOpen}
    <button
      type="button"
      aria-label="Close menu"
      tabindex="-1"
      class="fixed inset-0 z-40 cursor-default"
      onclick={() => (menuOpen = false)}
    ></button>
    <div
      role="menu"
      class="absolute top-full right-0 z-50 mt-1.5 w-56 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      transition:fade={{ duration: 120 }}
    >
      <button
        type="button"
        role="menuitem"
        disabled={!pushEnabled}
        class="relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none select-none hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        onclick={push}
      >
        {#if editor.pushing}
          <span
            class="mr-2 inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          ></span>
        {:else}
          <GitHubIcon class="mr-2 size-4 text-muted-foreground" />
        {/if}
        <span class="flex min-w-0 flex-col">
          <span>Push to GitHub</span>
          {#if !pushEnabled && pushReason}
            <span class="truncate text-[11px] text-muted-foreground"
              >{pushReason}</span
            >
          {/if}
        </span>
      </button>
    </div>
  {/if}
</div>
