<script lang="ts">
  import { goto, replaceState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { tick, untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import { normalizeProjectSettings } from "$lib/auth/domain/project-settings";
  import { envDiff, shownValue, type SecretDiff } from "$lib/history/diff";
  import { dayKey, dayLabel, fullDate, shortTime } from "$lib/history/format";
  import {
    history,
    loadHistory,
    type HistoryVersion,
  } from "$lib/history/history.svelte";
  import { projectPath } from "$lib/paths";
  import type { Project } from "$lib/projects/projects.api";
  import DiffEditor from "$lib/projects/ui/DiffEditor.svelte";
  import ProjectTopbar from "$lib/projects/ui/ProjectTopbar.svelte";
  import { secretsEditorNavGuard } from "$lib/secrets/secrets-editor-nav-guard.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import { keyAuth } from "$lib/stores/key.svelte";
  import Avatar from "$lib/ui/Avatar.svelte";
  import Button from "$lib/ui/Button.svelte";
  import Dialog from "$lib/ui/Dialog.svelte";
  import SearchField from "$lib/ui/SearchField.svelte";
  import Segmented from "$lib/ui/Segmented.svelte";
  import Well from "$lib/ui/Well.svelte";
  import { cn } from "$lib/utils";
  import ActivityHeatmap from "./ActivityHeatmap.svelte";

  let { project }: { project: Project } = $props();

  type Range = "all" | "24h" | "7d" | "30d";
  type DiffMode = "changes" | "env";
  const RANGES = [
    { value: "all", label: "All" },
    { value: "24h", label: "24h" },
    { value: "7d", label: "7d" },
    { value: "30d", label: "30d" },
  ] as const satisfies readonly { value: Range; label: string }[];
  const RANGE_DAYS = { "24h": 1, "7d": 7, "30d": 30 };
  const DIFF_MODES = [
    { value: "changes", label: "Changes" },
    { value: "env", label: ".env diff" },
  ] as const satisfies readonly { value: DiffMode; label: string }[];
  const DIFF_MODE_KEY = "cryptly.history.diff";

  const TONE = {
    added: {
      mark: "+",
      text: "text-[color-mix(in_oklab,var(--success)_70%,var(--fg3))]",
      row: "bg-[color-mix(in_oklab,var(--success)_6%,transparent)]",
      mk: "text-[color-mix(in_oklab,var(--success)_75%,var(--fg3))]",
    },
    changed: {
      mark: "~",
      text: "text-[color-mix(in_oklab,var(--warning)_70%,var(--fg3))]",
      row: "bg-[color-mix(in_oklab,var(--warning)_6%,transparent)]",
      mk: "text-[color-mix(in_oklab,var(--warning)_75%,var(--fg3))]",
    },
    removed: {
      mark: "−",
      text: "text-[color-mix(in_oklab,var(--danger)_70%,var(--fg3))]",
      row: "bg-[color-mix(in_oklab,var(--danger)_6%,transparent)]",
      mk: "text-[color-mix(in_oklab,var(--danger)_75%,var(--fg3))]",
    },
  };

  // Navigation state lives in the URL (?v=, ?range=, ?day=) so a reload lands on the same view.
  // Filters start over per project: the sidebar switches projects without remounting this view.
  const perProject =
    <T,>(initial: () => T) =>
    () => {
      void project.id;
      return untrack(initial);
    };
  let selectedId = $derived.by(
    perProject(() => page.url.searchParams.get("v")),
  );
  let range = $derived.by(
    perProject(
      (): Range =>
        RANGES.find((r) => r.value === page.url.searchParams.get("range"))
          ?.value ?? "all",
    ),
  );
  let query = $derived.by(perProject(() => ""));
  let day = $derived.by(
    perProject((): string | null => {
      const value = page.url.searchParams.get("day");
      return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
    }),
  );
  let diffMode = $state<DiffMode>(
    localStorage.getItem(DIFF_MODE_KEY) === "env" ? "env" : "changes",
  );
  let confirmRestore = $state(false);
  let now = $state(Date.now());
  let list: HTMLDivElement | undefined = $state();

  $effect(() => {
    const timer = setInterval(() => (now = Date.now()), 30_000);
    return () => clearInterval(timer);
  });

  const versions = $derived(
    history.projectId === project.id ? history.versions : [],
  );
  const revealOn = $derived(
    normalizeProjectSettings(project.settings).revealOn,
  );
  const me = $derived(auth.userData?.id);
  const readOnly = $derived(
    project.members.find((m) => m.id === me)?.role === "read",
  );
  const locked = $derived(
    (keyAuth.masterKeyHydrated && !keyAuth.hasMasterKey) || history.locked,
  );
  const loading = $derived(
    !keyAuth.masterKeyHydrated ||
      history.projectId !== project.id ||
      (history.loading && versions.length === 0),
  );

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    const since =
      range === "all" ? -Infinity : now - RANGE_DAYS[range] * 86_400_000;
    return versions.filter(
      (v) =>
        Date.parse(v.createdAt) >= since &&
        (!day || dayKey(v.createdAt) === day) &&
        (!q || searchText(v).includes(q)),
    );
  });

  const days = $derived.by(() => {
    const out: { key: string; versions: HistoryVersion[] }[] = [];
    for (const v of filtered) {
      const key = dayKey(v.createdAt);
      const last = out.at(-1);
      if (last?.key === key) last.versions.push(v);
      else out.push({ key, versions: [v] });
    }
    return out;
  });

  const selected = $derived(
    versions.find((v) => v.id === selectedId) ?? filtered[0] ?? null,
  );
  const envText = $derived(
    selected && diffMode === "env"
      ? envDiff(selected.previous, selected.content, revealOn)
      : null,
  );

  /** Author, email and changed keys; values only when the project shows them anyway. */
  function searchText(v: HistoryVersion) {
    const parts = [v.author?.displayName ?? "Cryptly", v.author?.email ?? ""];
    for (const group of v.diff.groups) {
      for (const change of group.changes) {
        parts.push(change.key);
        if (revealOn === "always")
          parts.push(change.before ?? "", change.after ?? "");
      }
    }
    return parts.join("\n").toLowerCase();
  }

  function syncUrl() {
    const params = [
      selectedId && `v=${encodeURIComponent(selectedId)}`,
      range !== "all" && `range=${range}`,
      day && `day=${day}`,
    ].filter(Boolean);
    const search = params.length ? `?${params.join("&")}` : "";
    if (search === location.search) return;
    const path = `${projectPath(project.id, "history")}${search}`;
    replaceState(resolve(path as ReturnType<typeof projectPath>), page.state);
  }

  async function select(id: string) {
    selectedId = id;
    syncUrl();
    await tick();
    const row = list?.querySelector<HTMLElement>('[aria-current="true"]');
    row?.scrollIntoView({ block: "nearest" });
    // Keyboard focus follows the selection in the list; elsewhere a focused button lets go so
    // its focus ring doesn't linger while j/k move on.
    const active = document.activeElement;
    if (list?.contains(active)) row?.focus({ preventScroll: true });
    else if (active instanceof HTMLButtonElement) active.blur();
  }

  function isTyping(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    return Boolean(
      el &&
      (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) ||
        el.isContentEditable),
    );
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isTyping(event.target) || document.querySelector("dialog[open]"))
      return;
    if (event.key === "Escape" && (query || day)) {
      query = "";
      day = null;
      syncUrl();
      return;
    }
    const delta =
      event.key === "j" || event.key === "ArrowDown"
        ? 1
        : event.key === "k" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!delta || filtered.length === 0) return;
    event.preventDefault();
    const index = filtered.findIndex((v) => v.id === selected?.id);
    const next =
      index < 0 ? 0 : Math.max(0, Math.min(filtered.length - 1, index + delta));
    void select(filtered[next]!.id);
  }

  function restore() {
    if (secretsEditorNavGuard.isDirty) confirmRestore = true;
    else applyRestore();
  }

  function applyRestore() {
    confirmRestore = false;
    // Set by the Secrets tab once it has decrypted; replaces its working document, unsaved.
    const replaceDoc = secretsEditorNavGuard.replaceDoc;
    if (!selected || !replaceDoc) {
      toast.error("Restore isn't available right now. Reload and try again.");
      return;
    }
    replaceDoc(selected.content);
    void goto(resolve(projectPath(project.id)));
    toast.success(
      `Restored the version from ${fullDate(selected.createdAt)}. Review and save.`,
    );
  }

  const plural = (n: number, word: string) =>
    `${n} ${word}${n === 1 ? "" : "s"}`;
</script>

<svelte:window {onkeydown} />

{#snippet who(v: HistoryVersion)}
  {#if v.author}
    <Avatar
      name={v.author.displayName}
      src={v.author.avatarUrl}
      seed={v.author.id}
    />
    <span class="truncate">{v.author.displayName}</span>
    {#if v.author.id === me}
      <span class="shrink-0 text-[12.5px] text-fg3">you</span>
    {/if}
  {:else}
    <span
      aria-hidden="true"
      class="grid size-5 shrink-0 place-items-center rounded-full bg-s150 text-[10px] font-bold text-fg2"
      >C</span
    >
    <span class="truncate">Cryptly</span>
  {/if}
{/snippet}

{#snippet counts(diff: SecretDiff)}
  <span class="inline-flex shrink-0 gap-1.5 mono text-[11.5px] font-medium">
    {#if diff.added}<span class={TONE.added.text}>+{diff.added}</span>{/if}
    {#if diff.changed}<span class={TONE.changed.text}>~{diff.changed}</span
      >{/if}
    {#if diff.removed}<span class={TONE.removed.text}>−{diff.removed}</span
      >{/if}
    {#if !diff.added && !diff.changed && !diff.removed}<span class="text-faint"
        >±0</span
      >{/if}
  </span>
{/snippet}

{#snippet secretValue(value: string)}
  {@const [head, mask, tail] = shownValue(value, revealOn)}
  <span class="whitespace-pre"
    >{head}<i class="text-faint not-italic">{mask}</i>{tail}</span
  >
{/snippet}

{#snippet message(title: string, text?: string, retry = false)}
  <div class="grid flex-1 place-items-center p-6 text-center">
    <div class="max-w-sm">
      <p class="font-medium">{title}</p>
      {#if text}<p class="mt-1 text-fg3">{text}</p>{/if}
      {#if retry}
        <Button class="mt-4" onclick={() => void loadHistory(project)}
          >Retry</Button
        >
      {/if}
    </div>
  </div>
{/snippet}

{#snippet filters(className: string)}
  <SearchField
    bind:value={query}
    placeholder={versions.length
      ? `Filter ${plural(versions.length, "version")}`
      : "Filter versions"}
    class={className}
  />
  <div class="flex-1 max-md:hidden"></div>
  <Segmented
    options={RANGES}
    bind:value={range}
    label="Time range"
    onchange={syncUrl}
  />
{/snippet}

<ProjectTopbar projectId={project.id} projectName={project.name} tab="history">
  <div class="contents max-md:hidden">{@render filters("")}</div>
</ProjectTopbar>
<div class="flex items-center gap-2 px-1.5 pb-1.5 md:hidden">
  {@render filters("w-auto flex-1")}
</div>

{#if locked}
  {@render message(
    "Unlock to view history",
    "Versions are encrypted. Unlock this browser to decrypt them here.",
  )}
{:else if history.message && history.projectId === project.id}
  {@render message("Couldn't load the history", history.message, true)}
{:else if loading}
  {@render message("Loading history…")}
{:else if versions.length === 0}
  {@render message("No versions yet", "Save secrets to start the history.")}
{:else}
  <div
    class="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] gap-1.5 px-1.5 pb-1.5 max-md:grid-cols-1 max-md:grid-rows-[minmax(0,2fr)_minmax(0,3fr)]"
  >
    <div
      bind:this={list}
      class="hide-scrollbar flex min-h-0 flex-col gap-1.5 overflow-y-auto"
    >
      {#each days as group (group.key)}
        <Well title={dayLabel(group.key, now)} note={group.versions.length}>
          {#each group.versions as v (v.id)}
            {@const on = v.id === selected?.id}
            <button
              type="button"
              aria-current={on}
              class={cn(
                "flex h-8 w-full scroll-mt-1.5 scroll-mb-44 items-center gap-2 rounded-row px-1 text-left outline-none",
                on ? "bg-s100-sel" : "hover:bg-s100-hover",
              )}
              onclick={() => void select(v.id)}
            >
              <span class="flex min-w-0 flex-1 items-center gap-1.5">
                {@render who(v)}
              </span>
              {@render counts(v.diff)}
              <span
                class="w-[38px] shrink-0 text-right mono text-[11.5px] text-fg3"
                title={fullDate(v.createdAt)}
                >{shortTime(v.createdAt, now)}</span
              >
            </button>
          {/each}
        </Well>
      {:else}
        <div class="px-2.5 py-6 text-center text-fg3">
          <p>No versions match.</p>
          <Button
            size="sm"
            class="mt-3"
            onclick={() => {
              query = "";
              day = null;
              range = "all";
              syncUrl();
            }}>Clear filters</Button
          >
        </div>
      {/each}
      <!-- Room for the fade, so the last version clears it when scrolled to the end. -->
      <div class="h-7 shrink-0 max-md:hidden"></div>
      <!-- Pinned to the bottom; versions slide underneath and fade out above it. The panel
           color behind the well hides them in its rounded corners too. -->
      <div
        class="sticky bottom-0 z-[1] mt-auto shrink-0 bg-s50 before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-10 before:bg-linear-to-b before:from-transparent before:to-s50 max-md:hidden"
      >
        <ActivityHeatmap
          {versions}
          {day}
          onselect={(key) => {
            day = key;
            syncUrl();
          }}
        />
      </div>
    </div>

    {#if selected}
      <div class="flex min-h-0 min-w-0 flex-col gap-1.5">
        <header
          class="flex min-h-[34px] shrink-0 flex-wrap items-center gap-x-2.5 gap-y-1.5 pr-0.5 pl-2.5"
        >
          <span class="flex min-w-0 items-center gap-2.5">
            {@render who(selected)}
          </span>
          <span class="shrink-0 text-fg3 max-lg:hidden"
            >{fullDate(selected.createdAt)}</span
          >
          {@render counts(selected.diff)}
          <div class="flex-1"></div>
          <Segmented
            options={DIFF_MODES}
            bind:value={diffMode}
            label="Diff view"
            onchange={(mode) => localStorage.setItem(DIFF_MODE_KEY, mode)}
          />
          {#if !readOnly && selected.id !== versions[0]?.id}
            <Button size="sm" onclick={restore}>Restore</Button>
          {/if}
        </header>

        {#if envText !== null}
          <Well
            title=".env"
            class="min-h-0 flex-1"
            cardClass="min-h-0 flex-1 overflow-hidden"
          >
            <DiffEditor value={envText} />
          </Well>
        {:else}
          <div
            class="hide-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto"
          >
            {#each selected.diff.groups as group (group.name)}
              <Well title={group.name} note={group.changes.length}>
                {#each group.changes as change (change.key)}
                  {@const tone = TONE[change.kind]}
                  <div
                    class={cn(
                      "flex h-[26px] items-center rounded-row px-1 mono text-[12.5px]",
                      tone.row,
                    )}
                  >
                    <span class={cn("w-4 shrink-0 font-semibold", tone.mk)}
                      >{tone.mark}</span
                    >
                    <span
                      class={cn(
                        "min-w-0 flex-1 truncate",
                        change.kind === "removed" && "text-fg3 line-through",
                      )}>{change.key}</span
                    >
                    <!-- Long values truncate; on a change the old value gives way first. -->
                    <span class="flex max-w-[70%] min-w-0 pl-4 text-fg2">
                      {#if change.kind === "added"}
                        <span class="min-w-0 truncate"
                          >{@render secretValue(change.after ?? "")}</span
                        >
                      {:else if change.kind === "removed"}
                        <span class="min-w-0 truncate text-fg3 line-through"
                          >{@render secretValue(change.before ?? "")}</span
                        >
                      {:else if revealOn === "never"}
                        <span class="text-fg3">value changed</span>
                      {:else}
                        <span class="min-w-0 truncate text-fg3 line-through"
                          >{@render secretValue(change.before ?? "")}</span
                        >
                        <span class="shrink-0 px-2 text-faint">→</span>
                        <span class="min-w-0 shrink-[0.1] truncate"
                          >{@render secretValue(change.after ?? "")}</span
                        >
                      {/if}
                    </span>
                  </div>
                {/each}
              </Well>
            {:else}
              <p class="px-2.5 py-0.5 text-[12.5px] text-fg3">
                No secrets changed. The .env diff shows comment and order
                changes.
              </p>
            {/each}
            {#if selected.diff.unchanged}
              <p class="px-2.5 py-0.5 text-[12.5px] text-fg3">
                {plural(selected.diff.unchanged, "unchanged secret")} in {plural(
                  selected.diff.unchangedGroups,
                  "group",
                )}
              </p>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<Dialog
  bind:open={confirmRestore}
  title="Replace your unsaved changes?"
  description="The Secrets tab has edits you haven't saved. Restoring this version replaces them."
>
  <div class="flex justify-end gap-2">
    <Button onclick={() => (confirmRestore = false)}>Cancel</Button>
    <Button variant="primary" onclick={applyRestore}>Restore</Button>
  </div>
</Dialog>
