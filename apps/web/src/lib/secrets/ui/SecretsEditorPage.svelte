<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { EventSource } from "eventsource";
  import { onDestroy } from "svelte";
  import { MediaQuery } from "svelte/reactivity";
  import { fade } from "svelte/transition";
  import { toast } from "svelte-sonner";
  import { ChevronRight, Command } from "lucide-svelte";
  import { ApiResponseError } from "$lib/api/backend";
  import { AsymmetricCrypto } from "$lib/auth/asymmetric-crypto";
  import {
    normalizeProjectSettings,
    type ProjectRevealOn,
  } from "$lib/auth/domain/project-settings";
  import { keystore } from "$lib/auth/keystore";
  import { createAuthedFetch } from "$lib/auth/token-refresh";
  import { SymmetricCrypto } from "$lib/auth/symmetric-crypto";
  import { IntegrationsApi, type Integration } from "$lib/api/integrations.api";
  import { ProjectsApi } from "$lib/projects/projects.api";
  import { publicEnv } from "$lib/shared/env/public-env";
  import { secretsEditorNavGuard } from "$lib/secrets/secrets-editor-nav-guard.svelte";
  import SecretsFileEditor from "$lib/secrets/monaco/SecretsFileEditor.svelte";
  import GithubSyncToast from "$lib/integrations/ui/GithubSyncToast.svelte";
  import {
    accountLoadErrorMessage,
    auth,
    loadUserData,
  } from "$lib/stores/auth.svelte";
  import { keyAuth } from "$lib/stores/key.svelte";
  import {
    ftux,
    ftuxUserMadeEdit,
    ftuxUserSaved,
    startFTUX,
  } from "$lib/stores/ftux.svelte";
  import FtuxPopover from "$lib/shared/ui/FtuxPopover.svelte";
  import { cn } from "$lib/utils";

  let {
    projectId,
    projectName = "",
    changedBy = null,
    active = true,
    onSaved,
    onConnectIntegrations,
  }: {
    projectId: string;
    projectName?: string;
    /** Mobile footer label, e.g. "Changed by you just now". */
    changedBy?: string | null;
    /** False while another project tab is shown; the editor stays mounted so unsaved edits survive. */
    active?: boolean;
    onSaved?: () => void | Promise<void>;
    onConnectIntegrations?: () => void;
  } = $props();

  const EVENTS_RECONNECT_MS = 3000;
  const mobile = new MediaQuery("(max-width: 767px)");

  let loadPhase = $state<
    "loading" | "ready" | "locked" | "error" | "forbidden"
  >("loading");
  let loadMessage = $state<string | null>(null);
  let doc = $state("");
  let baseline = $state("");
  let aesKey = $state<CryptoKey | null>(null);
  let readOnly = $state(false);
  let saving = $state(false);
  let pushing = $state(false);
  let integrations = $state<Integration[]>([]);
  let isExternallyUpdated = $state(false);
  let projectEvents: EventSource | null = null;
  let projectEventsReconnect: ReturnType<typeof setTimeout> | null = null;
  let showSlideToConfirm = $state(false);
  let slideProgress = $state(0);
  let slideDragging = $state(false);
  let slideConfirmed = $state(false);
  let slideTrackWidth = $state(280);
  let slideTrackEl: HTMLDivElement | undefined = $state();

  let revealOn = $state<ProjectRevealOn>("hover");

  /** Monaco / OS paste can change CRLF; avoids false "dirty" after save. */
  const normalizeEditorText = (text: string) => text.replace(/\r\n?/g, "\n");
  const isDirty = $derived(
    normalizeEditorText(doc) !== normalizeEditorText(baseline),
  );
  const saveDisabled = $derived(
    saving || !isDirty || readOnly || !aesKey || isExternallyUpdated,
  );
  const hasGithubIntegration = $derived(integrations.length > 0);
  const pushDisabled = $derived(
    isDirty ||
      saving ||
      pushing ||
      readOnly ||
      isExternallyUpdated ||
      !hasGithubIntegration,
  );
  const saveDisabledReason = $derived.by(() => {
    if (readOnly) return "You don't have permission to edit";
    if (isExternallyUpdated)
      return "Project was updated externally. Refresh first.";
    if (!isDirty && !saving) return "No unsaved changes";
    return undefined;
  });
  const pushDisabledReason = $derived.by(() => {
    if (readOnly) return "You don't have permission to push";
    if (!hasGithubIntegration) return "No GitHub repository connected";
    if (isDirty) return "Save your changes first";
    if (isExternallyUpdated)
      return "Project was updated externally. Refresh first.";
    return undefined;
  });
  const showSaveShortcut = $derived(
    isDirty &&
      !saving &&
      !isExternallyUpdated &&
      !readOnly &&
      !showSlideToConfirm &&
      ftux.step !== "save",
  );
  const slideMaxX = $derived(Math.max(0, slideTrackWidth - 42));
  const slideX = $derived(slideProgress * slideMaxX);

  function clearDecryptedState(nextPhase: typeof loadPhase = "locked") {
    closeProjectEvents();
    removeSlideListeners();
    aesKey = null;
    baseline = "";
    doc = "";
    saving = false;
    pushing = false;
    isExternallyUpdated = false;
    showSlideToConfirm = false;
    resetSlideConfirm();
    loadPhase = nextPhase;
    loadMessage =
      nextPhase === "locked"
        ? "This browser is locked. Unlock with your passphrase (same as the main app) to decrypt project keys."
        : null;
  }

  async function loadProjectFor(pid: string) {
    const loadRevision = keyAuth.revision;
    loadPhase = "loading";
    loadMessage = null;
    isExternallyUpdated = false;
    closeProjectEvents();
    aesKey = null;
    baseline = "";
    doc = "";
    integrations = [];
    const jwt = auth.jwtToken;
    if (!jwt) {
      void goto(resolve("/app/login"));
      return;
    }
    const ok = await loadUserData();
    if (!ok || !auth.userData) {
      if (!auth.jwtToken) return;
      loadPhase = "error";
      loadMessage = accountLoadErrorMessage();
      return;
    }
    const activeJwt = auth.jwtToken;
    if (!activeJwt) {
      void goto(resolve("/app/login"));
      return;
    }
    const userId = auth.userData.id;

    let project;
    try {
      project = await ProjectsApi.getProject(activeJwt, pid);
    } catch (e) {
      if (e instanceof ApiResponseError && e.status === 404) {
        void goto(resolve("/app/project"), { replaceState: true });
        return;
      }
      loadPhase = "error";
      loadMessage = e instanceof Error ? e.message : "Failed to load project";
      return;
    }

    revealOn = normalizeProjectSettings(project.settings).revealOn;
    try {
      integrations = await IntegrationsApi.getIntegrationsForProject(
        activeJwt,
        pid,
      );
    } catch {
      integrations = [];
    }

    const member = project.members?.find((m) => m.id === userId);
    readOnly = member?.role === "read";

    const encKeyForUser = project.encryptedSecretsKeys?.[userId];
    if (!encKeyForUser) {
      loadPhase = "forbidden";
      loadMessage = "You do not have a secrets key for this project.";
      return;
    }

    let key = await keystore.getProjectKey(project.id);
    if (loadRevision !== keyAuth.revision || !keyAuth.hasMasterKey) {
      clearDecryptedState();
      return;
    }
    if (!key) {
      const masterKey = await keystore.getMasterKey();
      if (!masterKey) {
        clearDecryptedState();
        return;
      }
      try {
        const projectKeyB64 = await AsymmetricCrypto.decryptWithKey(
          encKeyForUser,
          masterKey,
        );
        key = await SymmetricCrypto.importAesKey(projectKeyB64);
        if (loadRevision !== keyAuth.revision || !keyAuth.hasMasterKey) {
          clearDecryptedState();
          return;
        }
        await keystore.setProjectKey(project.id, key);
      } catch {
        loadPhase = "error";
        loadMessage =
          "Could not decrypt the project key. Try unlocking again or re-login.";
        return;
      }
    }

    aesKey = key;

    try {
      const content = await SymmetricCrypto.decryptWithKey(
        project.encryptedSecrets,
        key,
      );
      if (loadRevision !== keyAuth.revision || !keyAuth.hasMasterKey) {
        clearDecryptedState();
        return;
      }
      doc = content;
      baseline = content;
    } catch {
      loadPhase = "error";
      loadMessage = "Could not decrypt project secrets.";
      return;
    }

    loadPhase = "ready";
    openProjectEvents(pid, key);
  }

  $effect(() => {
    void loadProjectFor(projectId);
  });

  $effect(() => {
    if (keyAuth.hasMasterKey) return;
    clearDecryptedState();
  });

  $effect(() => {
    if (loadPhase !== "locked" || !keyAuth.hasMasterKey) return;
    void loadProjectFor(projectId);
  });

  onDestroy(() => {
    closeProjectEvents();
    removeSlideListeners();
    secretsEditorNavGuard.isDirty = false;
    secretsEditorNavGuard.externallyUpdated = false;
    secretsEditorNavGuard.save = null;
    secretsEditorNavGuard.discard = null;
    secretsEditorNavGuard.push = null;
  });

  async function saveNow(opts?: {
    suppressFailureToast?: boolean;
  }): Promise<boolean> {
    if (saveDisabled) return false;
    const key = aesKey;
    const content = doc;
    const saveRevision = keyAuth.revision;
    if (!key) return false;
    const jwt = auth.jwtToken;
    if (!jwt) return false;
    saving = true;
    try {
      if (saveRevision !== keyAuth.revision || !keyAuth.hasMasterKey)
        return false;
      const encrypted = await SymmetricCrypto.encryptWithKey(content, key);
      if (saveRevision !== keyAuth.revision || !keyAuth.hasMasterKey)
        return false;
      await ProjectsApi.updateProjectContent(jwt, projectId, {
        encryptedSecrets: encrypted,
      });
      baseline = content;
      ftuxUserSaved();
      await onSaved?.();
      return true;
    } catch {
      if (!opts?.suppressFailureToast) {
        toast.error("Failed to save", { richColors: true });
      }
      return false;
    } finally {
      saving = false;
    }
  }

  function closeProjectEvents() {
    if (projectEventsReconnect) {
      clearTimeout(projectEventsReconnect);
      projectEventsReconnect = null;
    }
    projectEvents?.close();
    projectEvents = null;
  }

  function openProjectEvents(pid: string, key: CryptoKey) {
    if (!auth.jwtToken || projectEvents) return;
    const url = `${publicEnv.apiUrl.replace(/\/$/, "")}/projects/${pid}/events`;
    const es = new EventSource(url, {
      fetch: createAuthedFetch(() => auth.jwtToken),
    });
    es.onmessage = (event) => {
      void handleProjectEvent(event.data as string, key);
    };
    es.onerror = () => {
      es.close();
      if (projectEvents !== es) return;
      projectEvents = null;
      // Keep listening after drops so "updated elsewhere" still protects unsaved edits.
      projectEventsReconnect = setTimeout(() => {
        projectEventsReconnect = null;
        if (aesKey === key && projectId === pid && auth.jwtToken)
          openProjectEvents(pid, key);
      }, EVENTS_RECONNECT_MS);
    };
    projectEvents = es;
  }

  async function handleProjectEvent(data: string, key: CryptoKey) {
    try {
      const event = JSON.parse(data) as { newEncryptedSecrets?: string };
      if (!event.newEncryptedSecrets) return;
      if (isDirty) {
        isExternallyUpdated = true;
        return;
      }
      const next = await SymmetricCrypto.decryptWithKey(
        event.newEncryptedSecrets,
        key,
      );
      doc = next;
      baseline = next;
    } catch {
      // Manual reload remains available if a malformed or undecryptable event arrives.
    }
  }

  $effect(() => {
    secretsEditorNavGuard.isDirty = loadPhase === "ready" && isDirty;
  });

  $effect(() => {
    secretsEditorNavGuard.externallyUpdated = isExternallyUpdated;
  });

  $effect(() => {
    secretsEditorNavGuard.saving = saving;
    secretsEditorNavGuard.pushing = pushing;
    secretsEditorNavGuard.hasIntegrations = hasGithubIntegration;
  });

  $effect(() => {
    // The legacy app only runs the tour on desktop.
    if (
      loadPhase === "ready" &&
      active &&
      window.matchMedia("(min-width: 768px)").matches
    )
      startFTUX();
  });

  $effect(() => {
    if (isDirty) ftuxUserMadeEdit();
  });

  $effect(() => {
    secretsEditorNavGuard.readOnly = readOnly;
  });

  $effect(() => {
    secretsEditorNavGuard.projectName = projectName;
  });

  $effect(() => {
    if (loadPhase !== "ready") {
      secretsEditorNavGuard.save = null;
      secretsEditorNavGuard.discard = null;
      secretsEditorNavGuard.push = null;
      return;
    }
    secretsEditorNavGuard.save = async () =>
      saveNow({ suppressFailureToast: true });
    secretsEditorNavGuard.discard = () => {
      doc = baseline;
    };
    secretsEditorNavGuard.push = pushToGithub;
  });

  function onDocChange(v: string) {
    doc = v;
  }

  function onGlobalKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      if (active) void saveNow();
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
    const nextProgress = Math.max(
      0,
      Math.min(1, (clientX - rect.left - 21) / maxX),
    );
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
    if (typeof window === "undefined") return;
    window.removeEventListener("pointermove", onSlidePointerMove);
    window.removeEventListener("pointerup", onSlidePointerUp);
    window.removeEventListener("pointercancel", onSlidePointerUp);
  }

  function startSlideDrag(event: PointerEvent) {
    if (slideConfirmed) return;
    event.preventDefault();
    slideTrackWidth = slideTrackEl?.offsetWidth ?? 280;
    slideDragging = true;
    removeSlideListeners();
    window.addEventListener("pointermove", onSlidePointerMove);
    window.addEventListener("pointerup", onSlidePointerUp);
    window.addEventListener("pointercancel", onSlidePointerUp);
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
    const content = doc;
    const pushRevision = keyAuth.revision;
    pushing = true;
    try {
      if (pushRevision !== keyAuth.revision || !keyAuth.hasMasterKey) return;
      await IntegrationsApi.pushSecrets(jwt, integrations, content);
      if (publicEnv.githubLocalMock) {
        toast.success("Pushed to GitHub (local mock — no secrets sent)", {
          richColors: true,
        });
      }
      toast.custom(GithubSyncToast, { componentProps: { ok: true } });
    } catch {
      toast.custom(GithubSyncToast, { componentProps: { ok: false } });
    } finally {
      pushing = false;
      showSlideToConfirm = false;
    }
  }

  $effect(() => {
    if (!showSlideToConfirm) resetSlideConfirm();
  });

  const pillButtonBase =
    "flex items-center gap-2.5 px-6 py-3 transition-all duration-200 cursor-pointer disabled:cursor-default rounded-full";
  const kbdClass =
    "pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-md bg-white/20 px-1 font-sans text-xs font-medium text-white";
  const ftuxKbdClass =
    "pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm bg-background/10 px-1 font-sans text-xs font-medium text-white";
  const tooltipBoxClass =
    "whitespace-nowrap rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md";
  /** Hover tooltip that stays open while the pointer travels onto it (the padding bridges the gap). */
  const hoverTooltipClass = (groupHover: string) =>
    cn(
      "invisible absolute bottom-full left-1/2 z-[100] -translate-x-1/2 pb-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover/save:delay-200 group-hover/push:delay-200",
      groupHover,
    );
</script>

<svelte:window onkeydown={onGlobalKeydown} />

{#if loadPhase === "loading"}
  <div
    class="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground"
  >
    Loading project…
  </div>
{:else if loadPhase === "error" || loadPhase === "forbidden"}
  <div
    class="rounded-lg border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground"
  >
    {loadMessage ?? "Something went wrong."}
  </div>
{:else if loadPhase === "locked"}
  <!-- The unlock dialog covers this state (prod shows an empty editor area). -->
{:else if loadPhase === "ready"}
  <section class="relative h-full min-h-0">
    {#if isExternallyUpdated}
      <div
        class="absolute top-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 shadow-lg"
      >
        This project was updated elsewhere. Refresh the project before saving or
        pushing.
      </div>
    {/if}
    {#key revealOn}
      <SecretsFileEditor
        height="100%"
        value={doc}
        onChange={onDocChange}
        {revealOn}
        {readOnly}
        fontSize={mobile.current ? 16 : 14}
        padding={mobile.current
          ? { top: 12, bottom: 80 }
          : { top: 16, bottom: 80 }}
        lineNumbersMinChars={mobile.current ? 3 : undefined}
      />
    {/key}
    {#if changedBy}
      <div
        class="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center md:hidden"
        transition:fade={{ duration: 100 }}
      >
        <span
          class="rounded-full border border-border/50 bg-card/80 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur"
        >
          {changedBy}
        </span>
      </div>
    {/if}
    {#if active && ftux.step === "editor"}
      <FtuxPopover
        arrow="bottom"
        class="top-[176px] left-1/2 -translate-x-1/2 -translate-y-full"
      >
        <div>Store API keys, tokens, and sensitive data.</div>
        <div>Everything is end-to-end encrypted.</div>
      </FtuxPopover>
    {/if}
    <div
      class="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center md:flex"
    >
      <div
        class="pointer-events-auto relative flex items-center rounded-full border border-[#2a2a2a] bg-[#1e1e1e] p-1.5 shadow-[4px_4px_12px_rgba(0,0,0,0.4),-4px_-4px_12px_rgba(255,255,255,0.03)]"
      >
        {#if active && ftux.step === "save"}
          <FtuxPopover
            arrow="bottom"
            class="bottom-full left-1/2 mb-[18px] -translate-x-1/2"
          >
            Click Save or press <kbd class={ftuxKbdClass}
              ><Command class="size-3" /></kbd
            >
            +
            <kbd class={ftuxKbdClass}>S</kbd>. Your data is encrypted before it
            ever leaves your device.
          </FtuxPopover>
        {/if}
        <div class="group/save relative inline-flex">
          <button
            type="button"
            onclick={() => void saveNow()}
            disabled={saveDisabled}
            class={cn(
              pillButtonBase,
              saveDisabled
                ? "text-base font-medium text-neutral-600"
                : "bg-white text-[17px] font-semibold text-black hover:bg-neutral-100",
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
          {#if active && showSaveShortcut}
            <div
              class="pointer-events-none absolute bottom-full left-1/2 z-[100] mb-2 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-popover px-3 py-2 text-sm whitespace-nowrap text-popover-foreground shadow-md"
              transition:fade={{ duration: 150 }}
            >
              <kbd class={kbdClass}><Command class="size-3" /></kbd>
              <span>+</span>
              <kbd class={kbdClass}>S</kbd>
            </div>
          {:else if saveDisabledReason}
            <div
              class={hoverTooltipClass(
                "group-hover/save:visible group-hover/save:opacity-100",
              )}
            >
              <div class={tooltipBoxClass}>{saveDisabledReason}</div>
            </div>
          {/if}
        </div>

        <div class="my-2 w-px self-stretch bg-neutral-700/30"></div>

        <div class="group/push relative inline-flex">
          <button
            type="button"
            onclick={handlePushClick}
            disabled={pushDisabled}
            class={cn(
              pillButtonBase,
              pushDisabled
                ? "text-base font-medium text-neutral-600"
                : "bg-white text-[17px] font-semibold text-black hover:bg-neutral-100",
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
          {#if pushDisabledReason && !showSlideToConfirm}
            <div
              class={hoverTooltipClass(
                "group-hover/push:visible group-hover/push:opacity-100",
              )}
            >
              <div class={tooltipBoxClass}>
                {pushDisabledReason}{#if !hasGithubIntegration && !readOnly && onConnectIntegrations}.
                  <button
                    type="button"
                    class="cursor-pointer underline underline-offset-2 hover:text-white focus:outline-none"
                    onclick={onConnectIntegrations}
                  >
                    Connect now?
                  </button>
                {/if}
              </div>
            </div>
          {/if}

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
                      "absolute top-[2px] left-[1px] z-10 flex h-10 w-10 touch-none items-center justify-center rounded-full bg-background shadow-sm transition-colors duration-200",
                      slideDragging
                        ? "cursor-grabbing"
                        : "cursor-grab hover:bg-accent",
                    )}
                    style={`transform: translateX(${slideX}px) ${slideDragging ? "scale(1.05)" : "scale(1)"}; transition: ${slideDragging ? "background-color 200ms" : "transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 200ms"};`}
                    onpointerdown={startSlideDrag}
                  >
                    <ChevronRight
                      class={cn(
                        "size-5 transition-colors duration-200",
                        slideConfirmed ? "text-green-600" : "",
                      )}
                    />
                  </button>
                  <div
                    class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
                  >
                    <span class="text-sm font-normal text-muted-foreground"
                      >Slide to confirm</span
                    >
                    <div
                      class="absolute inset-0 flex items-center justify-center overflow-hidden"
                      style={`clip-path: inset(0 ${100 - slideProgress * 100}% 0 0)`}
                    >
                      <span class="text-sm font-normal text-green-600"
                        >Slide to confirm</span
                      >
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
