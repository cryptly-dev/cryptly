<script lang="ts">
  import { browser } from "$app/environment";
  import { beforeNavigate, goto } from "$app/navigation";
  import { tick } from "svelte";
  import { secretsEditorNavGuard } from "$lib/secrets/secrets-editor-nav-guard.svelte";
  import Button from "$lib/ui/Button.svelte";
  import Dialog from "$lib/ui/Dialog.svelte";
  import Kbd from "$lib/ui/Kbd.svelte";

  let dialogOpen = $state(false);
  let saving = $state(false);
  let saveFailed = $state(false);
  let pendingDestination = $state<string | null>(null);
  let snapshot = $state({ projectName: "", externallyUpdated: false });

  const canSave = $derived(
    !saving && !secretsEditorNavGuard.readOnly && !snapshot.externallyUpdated,
  );
  const canPush = $derived(
    secretsEditorNavGuard.hasIntegrations &&
      Boolean(secretsEditorNavGuard.push),
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
    // Capture phase so the editor's own ⌘S handler doesn't also fire. Esc is the dialog's.
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        event.stopImmediatePropagation();
        void handleSave();
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

  async function handleSave(push = false) {
    if (!canSave || !secretsEditorNavGuard.save) return;
    saving = true;
    saveFailed = false;
    try {
      const ok = await secretsEditorNavGuard.save();
      if (!ok) {
        saveFailed = true;
        return;
      }
      if (push) await secretsEditorNavGuard.push?.();
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

<Dialog
  bind:open={dialogOpen}
  title="Save your changes?"
  dismissible={!saving}
  onclose={closeDialog}
>
  <p class="-mt-3 text-fg3">
    {#if snapshot.projectName}
      You have unsaved edits to <span class="font-medium text-fg"
        >{snapshot.projectName}</span
      >. Save now, discard them, or keep editing.
    {:else}
      You have unsaved edits. Save now, discard them, or keep editing.
    {/if}
  </p>

  {#if snapshot.externallyUpdated}
    <p class="text-[12.5px] text-warning">
      This project was updated elsewhere. Refresh to load the latest version
      before saving.
    </p>
  {/if}

  {#if saveFailed}
    <p class="text-[12.5px] text-danger">Could not save. Try again.</p>
  {/if}

  <div class="flex flex-wrap items-center justify-end gap-2 pt-1">
    <Button variant="ghost" autofocus onclick={closeDialog} disabled={saving}
      >Keep editing</Button
    >
    <Button
      variant="danger"
      onclick={() => void handleDiscard()}
      disabled={saving}>Discard changes</Button
    >
    {#if canPush}
      <Button onclick={() => void handleSave(true)} disabled={!canSave}
        >Save & push</Button
      >
    {/if}
    <Button
      variant="primary"
      aria-label="Save"
      onclick={() => void handleSave()}
      disabled={!canSave}
    >
      {saving ? "Saving…" : "Save"}
      {#if !saving}<Kbd class="bg-transparent text-ph shadow-none">⌘S</Kbd>{/if}
    </Button>
  </div>
</Dialog>
