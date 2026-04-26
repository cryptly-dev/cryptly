<script lang="ts">
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { AsymmetricCrypto } from '$lib/auth/asymmetric-crypto';
  import {
    normalizeProjectSettings,
    type ProjectRevealOn
  } from '$lib/auth/domain/project-settings';
  import { keystore } from '$lib/auth/keystore';
  import { SymmetricCrypto } from '$lib/auth/symmetric-crypto';
  import { ProjectsApi } from '$lib/projects/projects.api';
  import SecretsFileEditor from '$lib/secrets/monaco/SecretsFileEditor.svelte';
  import { auth, loadUserData } from '$lib/stores/auth.svelte';

  let { projectId }: { projectId: string } = $props();

  let loadPhase = $state<'loading' | 'ready' | 'locked' | 'error' | 'forbidden'>('loading');
  let loadMessage = $state<string | null>(null);
  let projectName = $state('');
  let doc = $state('');
  let baseline = $state('');
  let aesKey = $state<CryptoKey | null>(null);
  let readOnly = $state(false);
  let saving = $state(false);
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  let revealOn = $state<ProjectRevealOn>('hover');

  const isDirty = $derived(doc !== baseline);

  async function loadProjectFor(pid: string) {
    loadPhase = 'loading';
    loadMessage = null;
    aesKey = null;
    baseline = '';
    doc = '';
    const jwt = auth.jwtToken;
    if (!jwt) {
      void goto('/app/login');
      return;
    }
    const ok = await loadUserData();
    if (!ok || !auth.userData) {
      loadPhase = 'error';
      loadMessage = 'Could not load your account.';
      return;
    }
    const userId = auth.userData.id;

    let project;
    try {
      project = await ProjectsApi.getProject(jwt, pid);
    } catch (e) {
      if (e instanceof Error && e.message === 'PROJECT_NOT_FOUND') {
        void goto('/app/project', { replaceState: true });
        return;
      }
      loadPhase = 'error';
      loadMessage = e instanceof Error ? e.message : 'Failed to load project';
      return;
    }

    projectName = project.name;
    revealOn = normalizeProjectSettings(project.settings).revealOn;

    const member = project.members?.find((m) => m.id === userId);
    readOnly = member?.role === 'read';

    const encKeyForUser = project.encryptedSecretsKeys?.[userId];
    if (!encKeyForUser) {
      loadPhase = 'forbidden';
      loadMessage = 'You do not have a secrets key for this project.';
      return;
    }

    let key = await keystore.getProjectKey(project.id);
    if (!key) {
      const masterKey = await keystore.getMasterKey();
      if (!masterKey) {
        loadPhase = 'locked';
        loadMessage =
          'This browser is locked. Unlock with your passphrase (same as the main app) to decrypt project keys.';
        return;
      }
      try {
        const projectKeyB64 = await AsymmetricCrypto.decryptWithKey(encKeyForUser, masterKey);
        key = await SymmetricCrypto.importAesKey(projectKeyB64);
        await keystore.setProjectKey(project.id, key);
      } catch {
        loadPhase = 'error';
        loadMessage = 'Could not decrypt the project key. Try unlocking again or re-login.';
        return;
      }
    }

    aesKey = key;

    try {
      const content = await SymmetricCrypto.decryptWithKey(project.encryptedSecrets, key);
      doc = content;
      baseline = content;
    } catch {
      loadPhase = 'error';
      loadMessage = 'Could not decrypt project secrets.';
      return;
    }

    loadPhase = 'ready';
  }

  $effect(() => {
    void loadProjectFor(projectId);
  });

  function clearSaveTimer() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
  }

  onDestroy(() => {
    clearSaveTimer();
  });

  const SAVE_DEBOUNCE_MS = 1500;

  async function saveNow(opts?: { silent?: boolean }) {
    clearSaveTimer();
    if (!aesKey || readOnly || !isDirty) return;
    const jwt = auth.jwtToken;
    if (!jwt) return;
    saving = true;
    try {
      const encrypted = await SymmetricCrypto.encryptWithKey(doc, aesKey);
      await ProjectsApi.updateProjectContent(jwt, projectId, { encryptedSecrets: encrypted });
      baseline = doc;
      if (!opts?.silent) {
        toast.success('Saved');
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      saving = false;
    }
  }

  function onDocChange(v: string) {
    doc = v;
    if (readOnly || !aesKey) return;
    clearSaveTimer();
    saveTimer = setTimeout(() => {
      saveTimer = null;
      void saveNow({ silent: true });
    }, SAVE_DEBOUNCE_MS);
  }

  function onGlobalKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      if (isDirty && !readOnly) void saveNow();
    }
  }
</script>

<svelte:window onkeydown={onGlobalKeydown} />

{#if loadPhase === 'loading'}
  <div class="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
    Loading project…
  </div>
{:else if loadPhase === 'error' || loadPhase === 'forbidden'}
  <div class="rounded-lg border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
    {loadMessage ?? 'Something went wrong.'}
  </div>
{:else if loadPhase === 'locked'}
  <div class="max-w-md space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-6 text-sm">
    <p class="text-foreground">Browser locked</p>
    <p class="text-muted-foreground">{loadMessage}</p>
    <p class="text-muted-foreground">
      After you unlock the vault in this tab, <button
        type="button"
        class="text-primary underline"
        onclick={() => void loadProjectFor(projectId)}>reload this project</button
      >.
    </p>
  </div>
{:else if loadPhase === 'ready'}
  <section class="grid gap-4">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">{projectName}</h1>
        <p class="text-sm text-muted-foreground">
          {#if readOnly}
            Read-only (your role in this project)
          {:else if saving}
            Saving…
          {:else if isDirty}
            Unsaved changes — debounced auto-save, or <kbd class="rounded bg-muted px-1.5 py-0.5 text-xs"
              >⌘S</kbd
            >
          {:else}
            Up to date
          {/if}
        </p>
      </div>
      {#if !readOnly}
        <button
          type="button"
          class="rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm hover:bg-muted/40 disabled:opacity-50"
          disabled={!isDirty || saving}
          onclick={() => void saveNow()}
        >
          Save now
        </button>
      {/if}
    </div>
    {#key revealOn}
      <SecretsFileEditor
        height="min(55vh, 520px)"
        value={doc}
        onChange={onDocChange}
        {revealOn}
        readOnly={readOnly}
      />
    {/key}
  </section>
{/if}
