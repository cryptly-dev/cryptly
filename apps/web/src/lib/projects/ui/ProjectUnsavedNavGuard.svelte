<script lang="ts">
  import { browser } from '$app/environment';
  import { beforeNavigate, goto } from '$app/navigation';
  import { secretsEditorNavGuard } from '$lib/secrets/secrets-editor-nav-guard.svelte';

  let dialogOpen = $state(false);
  let saving = $state(false);
  let saveFailed = $state(false);
  let pendingDestination = $state<string | null>(null);

  function shouldBlockNavigation(fromUrl: URL, toUrl: URL): boolean {
    if (!secretsEditorNavGuard.isDirty) return false;
    const fromPath = fromUrl.pathname;
    const toPath = toUrl.pathname;
    if (!fromPath.startsWith('/app/project/')) return false;
    const fromParts = fromPath.split('/');
    const fromId = fromParts[3];
    if (!fromId) return false;
    if (toPath.startsWith('/app/project/')) {
      const toId = toPath.split('/')[3];
      if (toId === fromId) return false;
    }
    return true;
  }

  beforeNavigate((navigation) => {
    if (!navigation.to) return;
    if (!shouldBlockNavigation(navigation.from?.url ?? new URL(browser ? window.location.href : 'http://localhost'), navigation.to.url)) {
      return;
    }
    navigation.cancel();
    pendingDestination = navigation.to.url.href;
    saveFailed = false;
    dialogOpen = true;
  });

  $effect(() => {
    if (!browser || !secretsEditorNavGuard.isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  });

  function closeDialog() {
    dialogOpen = false;
    pendingDestination = null;
    saveFailed = false;
  }

  async function handleSaveAndContinue() {
    if (!secretsEditorNavGuard.save || saving) return;
    const canSave = !secretsEditorNavGuard.readOnly;
    if (!canSave) return;
    saving = true;
    saveFailed = false;
    try {
      const ok = await secretsEditorNavGuard.save();
      if (!ok) {
        saveFailed = true;
        return;
      }
      const dest = pendingDestination;
      closeDialog();
      if (dest) void goto(dest);
    } finally {
      saving = false;
    }
  }

  function handleDiscard() {
    secretsEditorNavGuard.discard?.();
    const dest = pendingDestination;
    closeDialog();
    if (dest) void goto(dest);
  }

  const displayName = $derived(secretsEditorNavGuard.projectName);
</script>

{#if dialogOpen}
  <div class="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-title"
      class="w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-2xl"
    >
      <h2 id="unsaved-title" class="text-lg font-semibold">Save your changes?</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        {#if displayName}
          You have unsaved edits to <span class="font-medium text-foreground">{displayName}</span>. Save now,
          discard them, or keep editing.
        {:else}
          You have unsaved edits. Save now, discard them, or keep editing.
        {/if}
      </p>

      {#if saveFailed}
        <p class="mt-3 text-sm text-destructive">Could not save. Try again.</p>
      {/if}

      <div class="mt-6 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          class="h-10 rounded-md border border-border px-4 text-sm font-medium transition hover:bg-secondary"
          onclick={closeDialog}
          disabled={saving}
        >
          Keep editing
        </button>
        <button
          type="button"
          class="h-10 rounded-md px-4 text-sm font-medium text-destructive transition hover:bg-destructive/10"
          onclick={handleDiscard}
          disabled={saving}
        >
          Discard changes
        </button>
        <button
          type="button"
          class="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          onclick={() => void handleSaveAndContinue()}
          disabled={saving || secretsEditorNavGuard.readOnly}
        >
          {#if saving}
            <span class="inline-block size-4 animate-spin rounded-full border-2 border-primary-foreground/60 border-t-transparent"></span>
            Saving…
          {:else}
            Save &amp; continue
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
