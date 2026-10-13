<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { EventSource } from "eventsource";
  import { onDestroy, untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import { Check, Clipboard, Copy, Github, TriangleAlert } from "lucide-svelte";
  import { track } from "$lib/analytics/logdash";
  import { ApiResponseError } from "$lib/api/backend";
  import { IntegrationsApi, type Integration } from "$lib/api/integrations.api";
  import { normalizeProjectSettings } from "$lib/auth/domain/project-settings";
  import { SymmetricCrypto } from "$lib/auth/symmetric-crypto";
  import { createAuthedFetch } from "$lib/auth/token-refresh";
  import { loadHistory } from "$lib/history/history.svelte";
  import { getUnlockedProjectKey } from "$lib/projects/project-key";
  import { ProjectsApi, type Project } from "$lib/projects/projects.api";
  import ProjectTopbar from "$lib/projects/ui/ProjectTopbar.svelte";
  import { parseEnv, pasteEnv } from "$lib/secrets/env-doc";
  import SecretsFileEditor from "$lib/secrets/monaco/SecretsFileEditor.svelte";
  import { secretsEditorNavGuard as nav } from "$lib/secrets/secrets-editor-nav-guard.svelte";
  import { publicEnv } from "$lib/shared/env/public-env";
  import FtuxPopover from "$lib/shared/ui/FtuxPopover.svelte";
  import {
    accountLoadErrorMessage,
    auth,
    loadUserData,
  } from "$lib/stores/auth.svelte";
  import {
    ftux,
    ftuxUserMadeEdit,
    ftuxUserOpenedIntegrations,
    ftuxUserSaved,
    startFTUX,
  } from "$lib/stores/ftux.svelte";
  import { keyAuth } from "$lib/stores/key.svelte";
  import Button from "$lib/ui/Button.svelte";
  import Dialog from "$lib/ui/Dialog.svelte";
  import SearchField from "$lib/ui/SearchField.svelte";
  import Segmented from "$lib/ui/Segmented.svelte";
  import Well from "$lib/ui/Well.svelte";
  import SecretsTable, { typing } from "./SecretsTable.svelte";

  let { project, active }: { project: Project; active: boolean } = $props();

  type View = "table" | "env";
  const VIEW_KEY = "cryptly.secrets.view";
  const VIEWS = [
    { value: "table", label: "Table" },
    { value: "env", label: ".env" },
  ] as const;
  const EVENTS_RECONNECT_MS = 3000;

  const projectId = $derived(project.id);
  const revealOn = $derived(
    normalizeProjectSettings(project.settings).revealOn,
  );

  let view = $state<View>(
    localStorage.getItem(VIEW_KEY) === "env" ? "env" : "table",
  );
  let phase = $state<"loading" | "ready" | "locked" | "error" | "forbidden">(
    "loading",
  );
  let message = $state<string | null>(null);
  /** The decrypted `.env` text being edited, and the saved version it is compared with. */
  let doc = $state("");
  let baseline = $state("");
  let aesKey = $state.raw<CryptoKey | null>(null);
  let readOnly = $state(false);
  let saving = $state(false);
  let pushing = $state(false);
  let integrations = $state<Integration[]>([]);
  let externallyUpdated = $state(false);
  let filter = $state("");
  let copiedAll = $state(false);
  let pasteOpen = $state(false);
  let pasteText = $state("");
  let pasteGroup = $state(-1);
  let pasteError = $state<string | null>(null);
  let pushOpen = $state(false);
  let table: SecretsTable | undefined = $state();

  /** Table operations, newest last; each entry restores `before` while the doc still equals `after`. */
  let undoStack: { before: string; after: string }[] = [];
  /** Content of the save in flight: its own live event can arrive before the response. */
  let savingContent: string | null = null;
  let loadSeq = 0;
  let events: EventSource | null = null;
  let eventsRetry: ReturnType<typeof setTimeout> | null = null;

  const parsed = $derived(parseEnv(doc));
  // Monaco and OS paste can switch line endings; that alone is not a change.
  const isDirty = $derived(
    doc.replace(/\r\n?/g, "\n") !== baseline.replace(/\r\n?/g, "\n"),
  );
  const canSave = $derived(
    phase === "ready" &&
      isDirty &&
      !saving &&
      !readOnly &&
      !externallyUpdated &&
      aesKey !== null,
  );
  const pushBlocked = $derived(
    readOnly
      ? "You can't push with read access"
      : isDirty
        ? "Save your changes first"
        : externallyUpdated
          ? "Updated elsewhere. Reload first."
          : null,
  );
  const secretsLabel = $derived(
    `${parsed.secrets.length} secret${parsed.secrets.length === 1 ? "" : "s"}`,
  );
  const repos = $derived(
    integrations.map((i) =>
      i.repositoryData
        ? `${i.repositoryData.owner}/${i.repositoryData.name}`
        : "GitHub repository",
    ),
  );

  function edit(next: string) {
    if (next === doc) return;
    undoStack.push({ before: doc, after: next });
    if (undoStack.length > 100) undoStack.shift();
    doc = next;
  }

  function undo() {
    const last = undoStack.pop();
    if (!last) return;
    // The doc changed since (e.g. in the .env view): undoing would drop that, so forget instead.
    if (last.after !== doc) undoStack = [];
    else doc = last.before;
  }

  function clearDecrypted(next: typeof phase = "locked") {
    closeEvents();
    aesKey = null;
    doc = "";
    baseline = "";
    undoStack = [];
    savingContent = null;
    saving = false;
    pushing = false;
    externallyUpdated = false;
    pasteOpen = false;
    pasteText = "";
    pushOpen = false;
    phase = next;
    message = null;
  }

  async function load(pid: string) {
    const seq = ++loadSeq;
    const rev = keyAuth.revision;
    const stale = () => seq !== loadSeq;
    const locked = () => rev !== keyAuth.revision || !keyAuth.hasMasterKey;
    clearDecrypted("loading");
    integrations = [];
    if (!auth.jwtToken) return void goto(resolve("/app/login"));

    const ok = await loadUserData();
    if (stale()) return;
    if (!ok || !auth.userData) {
      if (!auth.jwtToken) return;
      phase = "error";
      message = accountLoadErrorMessage();
      return;
    }
    const jwt = auth.jwtToken;
    if (!jwt) return void goto(resolve("/app/login"));
    const userId = auth.userData.id;

    let fresh: Project;
    try {
      fresh = await ProjectsApi.getProject(jwt, pid);
    } catch (e) {
      if (stale()) return;
      if (e instanceof ApiResponseError && e.status === 404) {
        void goto(resolve("/app/project"), { replaceState: true });
        return;
      }
      phase = "error";
      message = e instanceof Error ? e.message : "Failed to load project";
      return;
    }
    if (stale()) return;
    readOnly = fresh.members?.find((m) => m.id === userId)?.role === "read";
    void refreshIntegrations(pid, seq);
    if (!fresh.encryptedSecretsKeys?.[userId]) {
      phase = "forbidden";
      message = "You don't have a key for this project's secrets.";
      return;
    }
    if (locked()) return clearDecrypted();

    let key: CryptoKey | null;
    let content: string;
    try {
      key = await getUnlockedProjectKey(fresh);
      if (stale()) return;
      if (!key || locked()) return clearDecrypted();
      content = await SymmetricCrypto.decryptWithKey(
        fresh.encryptedSecrets,
        key,
      );
    } catch {
      if (stale()) return;
      phase = "error";
      message =
        "Couldn't decrypt this project. Try unlocking again or signing in again.";
      return;
    }
    if (stale()) return;
    if (locked()) return clearDecrypted();
    aesKey = key;
    doc = content;
    baseline = content;
    phase = "ready";
    openEvents(pid, key, seq);
  }

  async function refreshIntegrations(pid: string, seq = loadSeq) {
    const jwt = auth.jwtToken;
    if (!jwt) return;
    try {
      const list = await IntegrationsApi.getIntegrationsForProject(jwt, pid);
      if (seq === loadSeq) integrations = list;
    } catch {
      // Push stays hidden; secrets work without it.
    }
  }

  $effect(() => {
    const pid = projectId;
    untrack(() => void load(pid));
  });

  $effect(() => {
    if (!keyAuth.hasMasterKey) untrack(() => clearDecrypted());
  });

  $effect(() => {
    if (phase === "locked" && keyAuth.hasMasterKey)
      untrack(() => void load(projectId));
  });

  // GitHub may have been connected in Settings meanwhile.
  $effect(() => {
    if (active && phase === "ready")
      untrack(() => void refreshIntegrations(projectId));
  });

  function closeEvents() {
    if (eventsRetry) clearTimeout(eventsRetry);
    eventsRetry = null;
    events?.close();
    events = null;
  }

  function openEvents(pid: string, key: CryptoKey, seq: number) {
    if (!auth.jwtToken || events) return;
    const es = new EventSource(
      `${publicEnv.apiUrl.replace(/\/$/, "")}/projects/${pid}/events`,
      { fetch: createAuthedFetch(() => auth.jwtToken) },
    );
    es.onmessage = (event) => void onProjectEvent(event.data, key, seq);
    es.onerror = () => {
      es.close();
      if (events !== es) return;
      events = null;
      // Keep listening after drops so "updated elsewhere" still protects unsaved edits.
      eventsRetry = setTimeout(() => {
        eventsRetry = null;
        if (seq === loadSeq && aesKey === key) openEvents(pid, key, seq);
      }, EVENTS_RECONNECT_MS);
    };
    events = es;
  }

  async function onProjectEvent(data: string, key: CryptoKey, seq: number) {
    try {
      const event = JSON.parse(data) as { newEncryptedSecrets?: string };
      if (!event.newEncryptedSecrets) return;
      const rev = keyAuth.revision;
      const next = await SymmetricCrypto.decryptWithKey(
        event.newEncryptedSecrets,
        key,
      );
      if (seq !== loadSeq || aesKey !== key || rev !== keyAuth.revision) return;
      // Our own save (or nothing new): not an update from elsewhere.
      if (next === baseline || next === doc || next === savingContent) return;
      if (isDirty) {
        externallyUpdated = true;
        return;
      }
      doc = next;
      baseline = next;
      undoStack = [];
      void loadHistory(project);
    } catch {
      // A malformed or undecryptable event: reloading the page still works.
    }
  }

  async function save(opts?: { quiet?: boolean }): Promise<boolean> {
    const key = aesKey;
    const jwt = auth.jwtToken;
    if (!canSave || !key || !jwt) return false;
    const content = doc;
    const rev = keyAuth.revision;
    const seq = loadSeq;
    // Locked or switched project meanwhile: never write decrypted text back.
    const stale = () =>
      seq !== loadSeq ||
      aesKey !== key ||
      rev !== keyAuth.revision ||
      !keyAuth.hasMasterKey;
    saving = true;
    savingContent = content;
    try {
      const encrypted = await SymmetricCrypto.encryptWithKey(content, key);
      if (stale()) return false;
      await ProjectsApi.updateProjectContent(jwt, projectId, {
        encryptedSecrets: encrypted,
      });
      if (stale()) return true;
      baseline = content;
      track("secrets_saved");
      ftuxUserSaved();
      void loadHistory(project);
      return true;
    } catch {
      if (!opts?.quiet) toast.error("Failed to save");
      return false;
    } finally {
      saving = false;
      savingContent = null;
    }
  }

  /** Pushes the saved version. `afterSave`: right after a save, newer edits don't block it. */
  async function push(opts?: { afterSave?: boolean }) {
    pushOpen = false;
    const jwt = auth.jwtToken;
    const blocked = opts?.afterSave
      ? readOnly
        ? "You can't push with read access"
        : externallyUpdated
          ? "Updated elsewhere. Reload first."
          : null
      : pushBlocked;
    if (blocked) {
      toast.error(`Not pushed: ${blocked}`);
      return;
    }
    if (pushing || !integrations.length || !jwt || !aesKey) return;
    const content = baseline;
    const rev = keyAuth.revision;
    pushing = true;
    try {
      if (rev !== keyAuth.revision || !keyAuth.hasMasterKey) return;
      await IntegrationsApi.pushSecrets(jwt, integrations, content);
      track("secrets_pushed", { integrations: integrations.length });
      toast.success(
        publicEnv.githubLocalMock
          ? "Pushed to GitHub (local mock, no secrets sent)"
          : `Pushed to ${repos.length === 1 ? repos[0] : `${repos.length} repositories`}`,
      );
    } catch {
      toast.error("Failed to push to GitHub");
    } finally {
      pushing = false;
    }
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(doc);
      copiedAll = true;
      setTimeout(() => (copiedAll = false), 1500);
    } catch {
      toast.error("Couldn't copy to the clipboard");
    }
  }

  /** Merges `.env` lines into the doc. False when they contain no secrets. */
  function paste(text: string, target: number): boolean {
    const result = pasteEnv(doc, text, target);
    if (!parseEnv(text).secrets.length) return false;
    edit(result.text);
    const parts = [
      result.updated && `${result.updated} updated`,
      result.added && `${result.added} added`,
    ].filter(Boolean);
    toast(parts.length ? `Pasted: ${parts.join(", ")}` : "Nothing changed");
    return true;
  }

  function openPaste() {
    pasteGroup = table?.pasteTarget() ?? parsed.groups.length - 1;
    pasteError = null;
    pasteOpen = true;
  }

  function submitPaste() {
    if (paste(pasteText, pasteGroup)) pasteOpen = false;
    else pasteError = "No KEY=value lines found.";
  }

  const dialogOpen = () => Boolean(document.querySelector("dialog[open]"));

  function onKeydown(event: KeyboardEvent) {
    if (!active || phase !== "ready") return;
    const mod = event.metaKey || event.ctrlKey;
    if (mod && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void save();
    } else if (
      mod &&
      !event.shiftKey &&
      event.key.toLowerCase() === "z" &&
      view === "table" &&
      !readOnly &&
      !typing(event.target) &&
      !dialogOpen()
    ) {
      event.preventDefault();
      undo();
    }
  }

  /** ⌘V outside a text field pastes `.env` lines into the table. */
  function onPaste(event: ClipboardEvent) {
    if (!active || phase !== "ready" || view !== "table" || readOnly) return;
    if (typing(event.target) || dialogOpen()) return;
    const text = event.clipboardData?.getData("text/plain") ?? "";
    if (paste(text, table?.pasteTarget() ?? -1)) event.preventDefault();
  }

  // Shared with the unsaved-changes guard and History's Restore.
  $effect(() => {
    nav.isDirty = phase === "ready" && isDirty;
    nav.externallyUpdated = externallyUpdated;
    nav.saving = saving;
    nav.pushing = pushing;
    nav.hasIntegrations = integrations.length > 0;
    nav.readOnly = readOnly;
    nav.projectName = project.name;
  });

  $effect(() => {
    if (phase !== "ready") {
      nav.save = nav.discard = nav.push = nav.replaceDoc = null;
      return;
    }
    nav.save = () => save({ quiet: true });
    nav.discard = () => {
      doc = baseline;
      undoStack = [];
    };
    nav.push = () => push({ afterSave: true });
    nav.replaceDoc = edit;
  });

  onDestroy(() => {
    loadSeq++;
    closeEvents();
    nav.isDirty = false;
    nav.externallyUpdated = false;
    nav.save = nav.discard = nav.push = nav.replaceDoc = null;
  });

  // First-run tour (desktop only, like the legacy app).
  $effect(() => {
    if (phase === "ready" && active && matchMedia("(min-width: 768px)").matches)
      untrack(startFTUX);
  });
  $effect(() => {
    if (isDirty) untrack(ftuxUserMadeEdit);
  });
  $effect(() => {
    if (page.params.tab === "settings") untrack(ftuxUserOpenedIntegrations);
  });

  const kbd = "mono text-[11px] font-medium";
</script>

<svelte:window onkeydown={onKeydown} onpaste={onPaste} />

{#snippet controls()}
  {#if view === "table"}
    <SearchField
      bind:value={filter}
      placeholder={`Filter ${secretsLabel}`}
      class="@max-[900px]:w-auto @max-[900px]:flex-1"
    />
  {/if}
  <div class="ml-auto flex shrink-0 items-center gap-2">
    {#if readOnly}
      <span class="text-fg3">Read only</span>
    {:else if saving}
      <span class="text-fg3">Saving…</span>
    {:else if isDirty}
      <span
        class="inline-flex"
        title={externallyUpdated
          ? "Updated elsewhere. Reload first."
          : undefined}
      >
        <Button
          variant="primary"
          size="sm"
          data-ftux="save"
          disabled={!canSave}
          onclick={() => void save()}
        >
          Save <kbd class="{kbd} text-[var(--g500)]">⌘S</kbd>
        </Button>
      </span>
    {:else}
      <span class="text-fg3" data-ftux="save">Saved</span>
    {/if}
    {#if integrations.length && !readOnly}
      <span class="inline-flex" title={pushBlocked ?? undefined}>
        <Button
          size="sm"
          aria-label="Push to GitHub"
          disabled={Boolean(pushBlocked) || pushing}
          onclick={() => (pushOpen = true)}
        >
          <Github strokeWidth={1.75} />
          <span class="@max-[1100px]:hidden"
            >{pushing ? "Pushing…" : "Push"}</span
          >
        </Button>
      </span>
    {/if}
    <Button
      size="sm"
      aria-label="Copy all"
      class={copiedAll ? "text-success" : undefined}
      onclick={copyAll}
    >
      {#if copiedAll}<Check strokeWidth={2} />{:else}<Copy
          strokeWidth={1.75}
        />{/if}
      <span class="@max-[1100px]:hidden"
        >{copiedAll ? "Copied" : "Copy all"}</span
      >
    </Button>
    {#if !readOnly}
      <Button size="sm" aria-label="Paste .env" onclick={openPaste}>
        <Clipboard strokeWidth={1.75} />
        <span class="@max-[1100px]:hidden">Paste .env</span>
      </Button>
    {/if}
    <Segmented
      options={VIEWS}
      bind:value={view}
      label="View"
      onchange={(next) => localStorage.setItem(VIEW_KEY, next)}
    />
  </div>
{/snippet}

<div class="@container flex min-h-0 flex-1 flex-col">
  <ProjectTopbar
    projectId={project.id}
    projectName={project.name}
    tab="secrets"
  >
    {#if phase === "ready"}
      <div class="contents @max-[900px]:hidden">{@render controls()}</div>
    {/if}
  </ProjectTopbar>

  {#if phase === "loading"}
    <p class="m-auto text-[12.5px] text-fg3">Decrypting…</p>
  {:else if phase === "error" || phase === "forbidden"}
    <div class="px-1.5">
      <Well
        title={phase === "forbidden" ? "No access" : "Couldn't load secrets"}
        class="max-w-xl"
      >
        <p class="px-1 py-0.5 text-fg2">{message ?? "Something went wrong."}</p>
      </Well>
    </div>
  {:else if phase === "ready"}
    <div class="hidden items-center gap-2 px-1.5 pb-1.5 @max-[900px]:flex">
      {@render controls()}
    </div>
    {#if externallyUpdated}
      <div
        role="alert"
        class="mx-1.5 mb-1.5 flex items-center gap-2.5 rounded-card bg-[color-mix(in_oklab,var(--warning)_10%,transparent)] py-1 pr-1 pl-3 text-[color-mix(in_oklab,var(--warning)_60%,var(--fg))]"
      >
        <TriangleAlert class="size-3.5 shrink-0" strokeWidth={1.75} />
        <span class="min-w-0 flex-1">
          This project was updated elsewhere. Copy anything you need, then
          reload to get the latest version.
        </span>
        <Button variant="ghost" size="sm" onclick={() => void load(projectId)}>
          Discard mine and reload
        </Button>
      </div>
    {/if}
    {#if view === "table"}
      <SecretsTable
        bind:this={table}
        {doc}
        {baseline}
        {revealOn}
        {readOnly}
        {filter}
        {active}
        onedit={edit}
      />
    {:else}
      <div class="relative min-h-0 flex-1 px-1.5 pb-1.5">
        <span
          data-ftux="secrets"
          class="absolute top-10 left-24 h-0 w-40"
          aria-hidden="true"
        ></span>
        <div
          class="h-full overflow-hidden rounded-card bg-s100 py-1 shadow-card"
        >
          {#if active}
            {#key revealOn}
              <SecretsFileEditor
                value={doc}
                onChange={(next) => (doc = next)}
                {revealOn}
                {readOnly}
              />
            {/key}
          {/if}
        </div>
      </div>
    {/if}

    {#if active && ftux.step === "editor"}
      <FtuxPopover anchor="[data-ftux=secrets]">
        Store API keys, tokens and other secrets here. Everything is end-to-end
        encrypted.
      </FtuxPopover>
    {:else if active && ftux.step === "save"}
      <FtuxPopover anchor="[data-ftux=save]">
        Press Save or <kbd class={kbd}>⌘S</kbd>. Your secrets are encrypted on
        this device before they leave it.
      </FtuxPopover>
    {:else if active && ftux.step === "integrations"}
      <FtuxPopover
        anchor="nav[aria-label=Project] a[href$='/settings']"
        nextLabel="Done"
      >
        Connect GitHub in Settings to push these secrets to your repositories.
      </FtuxPopover>
    {/if}
  {/if}
</div>

<Dialog
  bind:open={pasteOpen}
  title="Paste .env"
  description="Existing keys are updated, new ones are added. Nothing is saved until you press ⌘S."
  onclose={() => {
    pasteText = "";
    pasteError = null;
  }}
>
  <!-- Never spellchecked or autofilled: browsers may send that text to a remote service. -->
  <textarea
    bind:value={pasteText}
    rows="10"
    class="w-full resize-none rounded-row bg-field px-2 py-1.5 mono text-[12.5px] leading-5 text-fg shadow-field outline-none placeholder:text-ph focus:shadow-[inset_0_0_0_1px_var(--fg3)]"
    placeholder="API_KEY=…&#10;DATABASE_URL=…"
    aria-label=".env lines"
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
    data-1p-ignore
    data-lpignore="true"
    onkeydown={(event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        submitPaste();
      }
    }}
  ></textarea>
  {#if parsed.groups.length > 1}
    <label class="flex items-center gap-2 text-fg3">
      New keys go to
      <select
        bind:value={pasteGroup}
        class="h-[26px] min-w-0 rounded-row bg-field px-1.5 text-fg shadow-field outline-none"
      >
        {#each parsed.groups as g (g.index)}
          <option value={g.index}>{g.name ?? "Untitled"}</option>
        {/each}
      </select>
    </label>
  {/if}
  {#if pasteError}
    <p class="text-[12.5px] text-danger">{pasteError}</p>
  {/if}
  <div class="flex justify-end gap-2">
    <Button variant="ghost" onclick={() => (pasteOpen = false)}>Cancel</Button>
    <Button variant="primary" onclick={submitPaste}>
      Paste <kbd class="{kbd} text-[var(--g500)]">⌘↵</kbd>
    </Button>
  </div>
</Dialog>

<Dialog
  bind:open={pushOpen}
  title="Push to GitHub"
  description="Overwrites the Actions secrets with the same names in:"
>
  <ul class="flex flex-col gap-1">
    {#each repos as repo, i (i)}
      <li class="flex items-center gap-2 mono text-[12.5px] text-fg">
        <Github class="size-3.5 text-fg3" strokeWidth={1.75} />{repo}
      </li>
    {/each}
  </ul>
  <div class="flex justify-end gap-2">
    <Button variant="ghost" onclick={() => (pushOpen = false)}>Cancel</Button>
    <Button variant="primary" onclick={() => void push()}>
      Push {secretsLabel}
    </Button>
  </div>
</Dialog>
