<script lang="ts">
  import { goto } from '$app/navigation';
  import { tick } from 'svelte';
  import { animate } from 'motion';
  import { ArrowRight } from 'lucide-svelte';
  import { AsymmetricCrypto } from '$lib/auth/asymmetric-crypto';
  import {
    DEFAULT_PROJECT_SETTINGS,
    normalizeProjectSettings,
    type ProjectSettings,
  } from '$lib/auth/domain/project-settings';
  import { SymmetricCrypto } from '$lib/auth/symmetric-crypto';
  import { UserApi } from '$lib/auth/user.api';
  import { ProjectsApi, type Project } from '$lib/projects/projects.api';
  import ShellLoader from '$lib/shared/ui/ShellLoader.svelte';
  import { accountLoadErrorMessage, auth, loadUserData } from '$lib/stores/auth.svelte';

  let projects = $state<Project[] | null>(null);
  let projectsLoading = $state(true);
  let loadError = $state<string | null>(null);
  let profileLoading = $state(true);
  let profileError = $state<string | null>(null);
  let createError = $state<string | null>(null);

  let name = $state('');
  let submitting = $state(false);
  let emptyMotionEl: HTMLDivElement | undefined = $state();
  let nameInput: HTMLInputElement | undefined = $state();

  async function loadProjects() {
    const jwt = auth.jwtToken;
    if (!jwt) {
      projectsLoading = false;
      projects = null;
      return;
    }
    projectsLoading = true;
    loadError = null;
    try {
      projects = await ProjectsApi.getProjects(jwt);
    } catch {
      loadError = 'Failed to load projects';
      projects = [];
    } finally {
      projectsLoading = false;
    }
  }

  $effect(() => {
    if (!auth.jwtToken) {
      void goto('/app/login');
      return;
    }
    void (async () => {
      profileLoading = true;
      profileError = null;
      const ok = await loadUserData();
      profileLoading = false;
      if (!ok || !auth.userData) {
        if (!auth.jwtToken) return;
        profileError = accountLoadErrorMessage();
      }
      await loadProjects();
    })();
  });

  $effect(() => {
    if (profileLoading || projectsLoading || projects === null) return;
    if (projects.length > 0) {
      const sorted = [...projects].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      const targetId = sorted[0]!.id;
      void goto(`/app/project/${targetId}`, { replaceState: true });
    }
  });

  $effect(() => {
    if (profileLoading || projectsLoading || !projects || projects.length !== 0) return;
    void tick().then(() => {
      nameInput?.focus();
      if (emptyMotionEl) {
        void animate(
          emptyMotionEl,
          { opacity: [0, 1], y: [14, 0] },
          { duration: 0.55, ease: [0, 0.55, 0.45, 1] },
        );
      }
    });
  });

  async function handleCreate(e: Event) {
    e.preventDefault();
    const trimmed = name.trim();
    const jwt = auth.jwtToken;
    const user = auth.userData;
    createError = null;
    if (!trimmed || submitting || !jwt) return;
    if (!user?.publicKey) {
      createError = 'Encryption keys are not ready. Finish passphrase setup first.';
      return;
    }

    submitting = true;
    try {
      const settings: ProjectSettings = normalizeProjectSettings(
        user.projectCreationDefaults ?? DEFAULT_PROJECT_SETTINGS,
      );
      const projectKey = await SymmetricCrypto.generateProjectKey();
      const content = `# Define your secrets below. Example:\nAPI_KEY="your-value-here"\nDATABASE_URL="postgres://..."`;
      const contentEncrypted = await SymmetricCrypto.encrypt(content, projectKey);
      const projectKeyEncrypted = await AsymmetricCrypto.encrypt(projectKey, user.publicKey);

      const proj = await ProjectsApi.createProject(jwt, {
        name: trimmed,
        encryptedSecrets: contentEncrypted,
        encryptedSecretsKeys: { [user.id]: projectKeyEncrypted },
        settings,
      });

      await UserApi.updateMe(jwt, { projectCreationDefaults: settings });
      await loadUserData();
      await goto(`/app/project/${proj.id}`, { replaceState: true });
    } catch {
      submitting = false;
      createError = 'Could not create project. Try again or check the API and your connection.';
    }
  }
</script>

{#if loadError}
  <div class="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background p-6">
    <p class="max-w-md text-center text-sm text-muted-foreground">{loadError}</p>
    <button
      type="button"
      class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      onclick={() => void loadProjects()}
    >
      Retry
    </button>
  </div>
{:else if profileError}
  <div class="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background p-6">
    <p class="max-w-md text-center text-sm text-muted-foreground">{profileError}</p>
    <button
      type="button"
      class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      onclick={() => {
        profileError = null;
        void (async () => {
          profileLoading = true;
          const ok = await loadUserData();
          profileLoading = false;
          if (!ok || !auth.userData) {
            if (!auth.jwtToken) return;
            profileError = accountLoadErrorMessage();
            return;
          }
          await loadProjects();
        })();
      }}
    >
      Retry
    </button>
  </div>
{:else if !profileLoading && !projectsLoading && projects && projects.length === 0}
  <div class="flex min-h-screen items-center justify-center bg-background p-8">
    <div bind:this={emptyMotionEl} class="w-full max-w-md" style="opacity:0;transform:translateY(14px)">
      <div class="mb-10">
        <div class="mb-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground/60">New project</div>
        <h1 class="text-[34px] font-semibold leading-[1.05] tracking-tight text-foreground md:text-[40px]">
          Name your first <span class="text-muted-foreground">project.</span>
        </h1>
        <p class="mt-5 text-[15px] leading-[1.7] text-muted-foreground">
          Secrets you store in it are encrypted in your browser — before they leave your machine.
        </p>
      </div>

      {#if !auth.userData?.publicKey}
        <p class="mb-4 text-sm text-amber-200/90">
          Set up your passphrase and keys to create a project.{' '}
          <a href="/app/set-passphrase" class="underline underline-offset-2 hover:text-foreground"
            >Continue setup</a
          >
        </p>
      {/if}
      {#if createError}
        <p class="mb-3 text-sm text-destructive">{createError}</p>
      {/if}
      <form onsubmit={handleCreate}>
        <div class="relative">
          <input
            bind:this={nameInput}
            type="text"
            bind:value={name}
            placeholder="checkout-api"
            disabled={submitting}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck={false}
            class="h-12 w-full rounded-lg border border-border/60 bg-neutral-900/40 pl-4 pr-14 text-[15px] text-foreground transition-colors placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-neutral-900/60 focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!name.trim() || submitting || !auth.userData?.publicKey}
            aria-label="Create project"
            class="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {#if submitting}
              <span
                class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
              ></span>
            {:else}
              <ArrowRight class="h-4 w-4" />
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{:else}
  <ShellLoader class="h-screen w-screen" />
{/if}
