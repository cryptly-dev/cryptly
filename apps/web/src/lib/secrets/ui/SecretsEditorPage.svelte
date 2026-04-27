<script lang="ts">
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { toast } from 'svelte-sonner';
  import { ChevronRight } from 'lucide-svelte';
  import { AsymmetricCrypto } from '$lib/auth/asymmetric-crypto';
  import {
    normalizeProjectSettings,
    type ProjectRevealOn
  } from '$lib/auth/domain/project-settings';
  import { keystore } from '$lib/auth/keystore';
  import { SymmetricCrypto } from '$lib/auth/symmetric-crypto';
  import { IntegrationsApi, type Integration } from '$lib/api/integrations.api';
  import { ProjectsApi } from '$lib/projects/projects.api';
  import { publicEnv } from '$lib/shared/env/public-env';
  import SecretsFileEditor from '$lib/secrets/monaco/SecretsFileEditor.svelte';
  import { accountLoadErrorMessage, auth, loadUserData } from '$lib/stores/auth.svelte';
  import { keyAuth } from '$lib/stores/key.svelte';
  import { cn } from '$lib/utils';

  let {
    projectId,
    onSaved,
    onConnectIntegrations
  }: {
    projectId: string;
    onSaved?: () => void | Promise<void>;
    onConnectIntegrations?: () => void;
  } = $props();

  let loadPhase = $state<'loading' | 'ready' | 'locked' | 'error' | 'forbidden'>('loading');
  let loadMessage = $state<string | null>(null);
  let doc = $state('');
  let baseline = $state('');
  let aesKey = $state<CryptoKey | null>(null);
  let readOnly = $state(false);
  let saving = $state(false);
  let pushing = $state(false);
  let integrations = $state<Integration[]>([]);
  let showSlideToConfirm = $state(false);
  let slideProgress = $state(0);
  let slideDragging = $state(false);
  let slideConfirmed = $state(false);
  let slideTrackWidth = $state(280);
  let slideTrackEl: HTMLDivElement | undefined = $state();

  let revealOn = $state<ProjectRevealOn>('hover');

  const isDirty = $derived(doc !== baseline);
  const saveDisabled = $derived(saving || !isDirty || readOnly || !aesKey);
  const hasGithubIntegration = $derived(integrations.length > 0);
  const pushDisabled = $derived(isDirty || saving || pushing || readOnly || !hasGithubIntegration);
  const pushDisabledReason = $derived.by(() => {
    if (readOnly) return "You don't have permission to push";
    if (!hasGithubIntegration) return 'You have no integrations';
    if (isDirty) return 'Save your changes first';
    if (saving) return 'Saving…';
    if (pushing) return 'Pushing…';
    return undefined;
  });
  const slideMaxX = $derived(Math.max(0, slideTrackWidth - 42));
  const slideX = $derived(slideProgress * slideMaxX);

  async function loadProjectFor(pid: string) {
    loadPhase = 'loading';
    loadMessage = null;
    aesKey = null;
    baseline = '';
    doc = '';
    integrations = [];
    const jwt = auth.jwtToken;
    if (!jwt) {
      void goto('/app/login');
      return;
    }
    const ok = await loadUserData();
    if (!ok || !auth.userData) {
      if (!auth.jwtToken) return;
      loadPhase = 'error';
      loadMessage = accountLoadErrorMessage();
      return;
    }
    const activeJwt = auth.jwtToken;
    if (!activeJwt) {
      void goto('/app/login');
      return;
    }
    const userId = auth.userData.id;

    let project;
    try {
      project = await ProjectsApi.getProject(activeJwt, pid);
    } catch (e) {
      if (e instanceof Error && e.message === 'PROJECT_NOT_FOUND') {
        void goto('/app/project', { replaceState: true });
        return;
      }
      loadPhase = 'error';
      loadMessage = e instanceof Error ? e.message : 'Failed to load project';
      return;
    }

    revealOn = normalizeProjectSettings(project.settings).revealOn;
    try {
      integrations = await IntegrationsApi.getIntegrationsForProject(activeJwt, pid);
    } catch {
      integrations = [];
    }

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

  $effect(() => {
    if (loadPhase !== 'locked' || !keyAuth.hasMasterKey) return;
    void loadProjectFor(projectId);
  });

  onDestroy(() => {
    removeSlideListeners();
  });

  async function saveNow(opts?: { silent?: boolean }) {
    if (saveDisabled) return;
    const key = aesKey;
    if (!key) return;
    const jwt = auth.jwtToken;
    if (!jwt) return;
    saving = true;
    try {
      const encrypted = await SymmetricCrypto.encryptWithKey(doc, key);
      await ProjectsApi.updateProjectContent(jwt, projectId, { encryptedSecrets: encrypted });
      baseline = doc;
      await onSaved?.();
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
  }

  function onGlobalKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      if (isDirty && !readOnly) void saveNow();
    }
  }

  function handlePushClick() {
    if (pushDisabled) return;
    showSlideToConfirm = true;
  }

  function cancelPushConfirm() {
    showSlideToConfirm = false;
  }

  function resetSlideConfirm() {
    slideProgress = 0;
    slideDragging = false;
    slideConfirmed = false;
    removeSlideListeners();
  }

  function updateSlideFromClientX(clientX: number) {
    const rect = slideTrackEl?.getBoundingClientRect();
    if (!rect) return;
    slideTrackWidth = rect.width;
    const maxX = Math.max(1, rect.width - 42);
    const nextProgress = Math.max(0, Math.min(1, (clientX - rect.left - 21) / maxX));
    slideProgress = nextProgress;
    if (nextProgress >= 0.97 && !slideConfirmed) {
      slideConfirmed = true;
      slideDragging = false;
      removeSlideListeners();
      setTimeout(() => {
        void pushToGithub();
      }, 200);
    }
  }

  function onSlidePointerMove(event: PointerEvent) {
    if (!slideDragging || slideConfirmed) return;
    updateSlideFromClientX(event.clientX);
  }

  function onSlidePointerUp() {
    if (slideConfirmed) return;
    slideDragging = false;
    slideProgress = 0;
    removeSlideListeners();
  }

  function removeSlideListeners() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('pointermove', onSlidePointerMove);
    window.removeEventListener('pointerup', onSlidePointerUp);
    window.removeEventListener('pointercancel', onSlidePointerUp);
  }

  function startSlideDrag(event: PointerEvent) {
    if (slideConfirmed) return;
    event.preventDefault();
    slideTrackWidth = slideTrackEl?.offsetWidth ?? 280;
    slideDragging = true;
    removeSlideListeners();
    window.addEventListener('pointermove', onSlidePointerMove);
    window.addEventListener('pointerup', onSlidePointerUp);
    window.addEventListener('pointercancel', onSlidePointerUp);
  }

  async function pushToGithub() {
    if (pushDisabled) {
      resetSlideConfirm();
      return;
    }
    const jwt = auth.jwtToken;
    if (!jwt) {
      resetSlideConfirm();
      return;
    }
    pushing = true;
    try {
      await IntegrationsApi.pushSecrets(jwt, integrations, doc);
      toast.success(
        publicEnv.githubLocalMock
          ? 'Pushed to GitHub (local mock — no secrets sent)'
          : 'Synced with GitHub'
      );
    } catch {
      toast.error('Failed to sync with GitHub');
    } finally {
      pushing = false;
      showSlideToConfirm = false;
    }
  }

  $effect(() => {
    if (!showSlideToConfirm) resetSlideConfirm();
  });

  const pillButtonBase =
    'flex items-center gap-2.5 px-6 py-3 transition-all duration-200 cursor-pointer disabled:cursor-default rounded-full';
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
  <div class="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
    <div class="max-w-sm px-6">
      <p class="font-medium text-foreground">Unlock your safe to edit secrets</p>
      <p class="mt-1">{loadMessage}</p>
    </div>
  </div>
{:else if loadPhase === 'ready'}
  <section class="relative h-full min-h-0">
    {#key revealOn}
      <SecretsFileEditor
        height="100%"
        value={doc}
        onChange={onDocChange}
        {revealOn}
        readOnly={readOnly}
      />
    {/key}
    <div class="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
      <div
        class="pointer-events-auto flex items-center rounded-full border border-[#2a2a2a] bg-[#1e1e1e] p-1.5 shadow-[4px_4px_12px_rgba(0,0,0,0.4),-4px_-4px_12px_rgba(255,255,255,0.03)]"
      >
        <button
          type="button"
          onclick={() => void saveNow()}
          disabled={saveDisabled}
          title={saveDisabled && !saving ? (readOnly ? "You don't have permission to edit" : 'No unsaved changes') : undefined}
          class={cn(
            pillButtonBase,
            saveDisabled
              ? 'text-base font-medium text-neutral-600'
              : 'bg-white text-[17px] font-semibold text-black hover:bg-neutral-100'
          )}
        >
          {#if saving}
            <span
              class="inline-block size-4 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-300"
            ></span>
            <span>Saving…</span>
          {:else if !isDirty}
            <span>Saved</span>
          {:else}
            <span>Save</span>
          {/if}
        </button>

        <div class="my-2 w-px self-stretch bg-neutral-700/30"></div>

        <div class="relative inline-flex">
          <button
            type="button"
            onclick={handlePushClick}
            disabled={pushDisabled}
            title={pushDisabledReason}
            class={cn(
              pillButtonBase,
              pushDisabled
                ? 'text-base font-medium text-neutral-600'
                : 'bg-white text-[17px] font-semibold text-black hover:bg-neutral-100'
            )}
          >
            {#if pushing}
              <span
                class="inline-block size-4 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-300"
              ></span>
              <span>Pushing…</span>
            {:else}
              <span>Push</span>
            {/if}
          </button>

          {#if showSlideToConfirm}
            <div
              class="absolute bottom-full left-1/2 z-[100] mb-2 w-[300px] -translate-x-1/2 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg"
              transition:fade={{ duration: 150 }}
            >
              <div class="space-y-3">
                <div
                  bind:this={slideTrackEl}
                  class="relative h-11 overflow-hidden rounded-full border border-border/50 bg-secondary/50"
                >
                  <div
                    class="absolute inset-y-0 left-0 bg-green-600/10"
                    style={`width: ${slideProgress * 100}%`}
                  ></div>
                  <button
                    type="button"
                    aria-label="Slide to confirm push"
                    class={cn(
                      'absolute left-[1px] top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 touch-none items-center justify-center rounded-full bg-background shadow-sm transition-colors duration-200',
                      slideDragging ? 'cursor-grabbing' : 'cursor-grab hover:bg-accent'
                    )}
                    style={`transform: translate(${slideX}px, -50%) ${slideDragging ? 'scale(1.05)' : 'scale(1)'}; transition: ${slideDragging ? 'background-color 200ms' : 'transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 200ms'};`}
                    onpointerdown={startSlideDrag}
                  >
                    <ChevronRight
                      class={cn(
                        'size-5 transition-colors duration-200',
                        slideConfirmed ? 'text-green-600' : ''
                      )}
                    />
                  </button>
                  <div class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
                    <span class="text-sm font-normal text-muted-foreground">Slide to confirm</span>
                    <div
                      class="absolute inset-0 flex items-center justify-center overflow-hidden"
                      style={`clip-path: inset(0 ${100 - slideProgress * 100}% 0 0)`}
                    >
                      <span class="text-sm font-normal text-green-600">Slide to confirm</span>
                    </div>
                  </div>
                </div>
                <div class="flex justify-center">
                  <button
                    type="button"
                    class="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    onclick={cancelPushConfirm}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>
{/if}
