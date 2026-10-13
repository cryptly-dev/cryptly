<script lang="ts">
  import { untrack } from "svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Search } from "lucide-svelte";
  import { normalizeProjectSettings } from "$lib/auth/domain/project-settings";
  import { SymmetricCrypto } from "$lib/auth/symmetric-crypto";
  import { projectPath } from "$lib/paths";
  import { getUnlockedProjectKey } from "$lib/projects/project-key";
  import type { ProjectTab } from "$lib/projects/project-tab";
  import { ProjectsApi } from "$lib/projects/projects.api";
  import { parseValueRangesFromString } from "$lib/secrets/monaco/parser";
  import { shell } from "$lib/shell/shell.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import { keyAuth } from "$lib/stores/key.svelte";
  import Avatar from "$lib/ui/Avatar.svelte";
  import Dialog from "$lib/ui/Dialog.svelte";
  import Kbd from "$lib/ui/Kbd.svelte";
  import { cn } from "$lib/utils";

  /**
   * ⌘K: find a project by name, KEY, comment or (Visible projects only) value. Content is
   * decrypted in the browser only while the palette is open and is dropped on close and on lock.
   * Results show project names and matching KEY names, never values.
   */
  let { open = $bindable(false), tab }: { open?: boolean; tab: ProjectTab } =
    $props();

  /**
   * Lowercased search text per project: each KEY (plus its value, only in Visible projects, like
   * the table and History searches) and the comments. Values are never rendered.
   */
  type Searchable = {
    keys: { key: string; text: string }[];
    comments: string;
  };

  let query = $state("");
  let active = $state(0);
  let content = $state<Record<string, Searchable>>({});
  let decrypting = $state(false);
  let list: HTMLDivElement | undefined = $state();

  const q = $derived(query.trim().toLowerCase());

  const results = $derived.by(() => {
    const projects = shell.projects ?? [];
    if (!q) return projects.map((project) => ({ project, keys: [] }));
    return projects.flatMap((project) => {
      const data = content[project.id];
      const keys = (data?.keys ?? [])
        .filter((entry) => entry.text.includes(q))
        .map((entry) => entry.key);
      const hit =
        project.name.toLowerCase().includes(q) ||
        keys.length > 0 ||
        Boolean(data?.comments.includes(q));
      return hit ? [{ project, keys: [...new Set(keys)] }] : [];
    });
  });

  // Decrypt while open; closing, locking or unlocking drops everything decrypted so far.
  let run = 0;
  $effect(() => {
    void keyAuth.revision;
    const seq = ++run;
    content = {};
    decrypting = false;
    if (!open) {
      query = "";
      return;
    }
    untrack(() => void decryptAll(seq));
  });

  async function decryptAll(seq: number) {
    const jwt = auth.jwtToken;
    const revision = keyAuth.revision;
    const current = () =>
      seq === run && revision === keyAuth.revision && keyAuth.hasMasterKey;
    if (!jwt || !current()) return;
    decrypting = true;
    try {
      const projects = await ProjectsApi.searchProjects(jwt);
      for (const project of projects) {
        if (!current()) return;
        try {
          const key = await getUnlockedProjectKey(project);
          if (!key || !current()) continue;
          const text = await SymmetricCrypto.decryptWithKey(
            project.encryptedSecrets,
            key,
          );
          if (!current()) return;
          const settings = shell.projects?.find(
            (p) => p.id === project.id,
          )?.settings;
          const withValues =
            normalizeProjectSettings(settings).revealOn === "always";
          content[project.id] = index(text, withValues);
        } catch {
          // A project that fails to decrypt is still searchable by name.
        }
      }
    } catch {
      // Name search keeps working without the content index.
    } finally {
      if (seq === run) decrypting = false;
    }
  }

  function index(text: string, withValues: boolean): Searchable {
    const lines = text.split("\n");
    // Continuation lines of multi-line values, per the editor's own parser: they belong to the
    // KEY above and are never comments, even when they start with "#".
    const continuation = lines.map(() => false);
    for (const { range } of parseValueRangesFromString(text)) {
      for (let i = range.startLine; i < range.endLine; i++)
        continuation[i] = true;
    }
    const keys: Searchable["keys"] = [];
    const comments: string[] = [];
    lines.forEach((line, i) => {
      const lower = line.trim().toLowerCase();
      const last = keys.at(-1);
      if (continuation[i]) {
        if (withValues && last) last.text += `\n${lower}`;
        return;
      }
      const key = /^(?:export\s+)?([A-Za-z_][\w.-]*)\s*=/.exec(
        line.trim(),
      )?.[1];
      if (key) keys.push({ key, text: withValues ? lower : key.toLowerCase() });
      else if (lower.startsWith("#")) comments.push(lower);
    });
    return { keys, comments: comments.join("\n") };
  }

  function openResult(projectId: string) {
    open = false;
    void goto(resolve(projectPath(projectId, tab)));
  }

  function move(delta: number) {
    if (results.length === 0) return;
    active = (active + delta + results.length) % results.length;
    list
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Enter" && !event.isComposing) {
      event.preventDefault();
      const result = results[active];
      if (result) openResult(result.project.id);
    }
  }
</script>

<Dialog
  bind:open
  title="Search"
  bare
  class="mt-[12vh] mb-auto w-[min(560px,calc(100%-2rem))]"
>
  <div class="p-1.5">
    <label class="flex h-10 items-center gap-2 pr-1 pl-2.5">
      <Search class="size-[15px] shrink-0 text-fg3" strokeWidth={1.75} />
      <!-- svelte-ignore a11y_autofocus -->
      <input
        bind:value={query}
        oninput={() => (active = 0)}
        {onkeydown}
        autofocus
        type="text"
        placeholder="Search projects and secrets"
        aria-label="Search projects and secrets"
        aria-controls="search-results"
        aria-activedescendant={results[active]
          ? `search-result-${active}`
          : undefined}
        role="combobox"
        aria-expanded="true"
        autocomplete="off"
        spellcheck="false"
        data-1p-ignore
        data-lpignore="true"
        class="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ph md:text-[13.5px]"
      />
      <Kbd>esc</Kbd>
    </label>
    <div class="mx-1 h-px bg-elev-border"></div>
    <div
      bind:this={list}
      id="search-results"
      role="listbox"
      aria-label="Projects"
      class="flex max-h-[min(360px,60vh)] flex-col gap-px overflow-y-auto pt-1.5 [scrollbar-width:none]"
    >
      {#each results as result, i (result.project.id)}
        {@const [firstKey, ...moreKeys] = result.keys}
        <a
          id={`search-result-${i}`}
          data-index={i}
          role="option"
          aria-selected={i === active}
          tabindex="-1"
          href={resolve(projectPath(result.project.id, tab))}
          class={cn(
            "flex h-8 shrink-0 items-center gap-2 rounded-lg px-2.5 text-[13.5px]",
            i === active ? "bg-elev-hover text-fg" : "text-fg2",
          )}
          onmousemove={() => (active = i)}
          onclick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey) return;
            event.preventDefault();
            openResult(result.project.id);
          }}
        >
          <Avatar
            name={result.project.name}
            seed={result.project.id}
            size={16}
            square
            class="text-[9.5px]!"
          />
          <span class="min-w-0 flex-1 truncate">{result.project.name}</span>
          {#if firstKey}
            <span class="min-w-0 truncate mono text-[12px] text-fg3"
              >{firstKey}</span
            >
            {#if moreKeys.length > 0}
              <span class="shrink-0 text-[12px] text-faint"
                >+{moreKeys.length}</span
              >
            {/if}
          {/if}
        </a>
      {:else}
        <p class="px-2.5 py-1.5 text-fg3">
          {decrypting ? "Searching secrets…" : "No projects or secrets match."}
        </p>
      {/each}
    </div>
    {#if decrypting && results.length > 0 && q}
      <p class="px-2.5 pt-1.5 text-[12px] text-faint">Searching secrets…</p>
    {/if}
  </div>
</Dialog>
