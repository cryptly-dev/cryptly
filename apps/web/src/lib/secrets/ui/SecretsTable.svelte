<script lang="ts" module>
  /** True while the user types in a field, where single-key shortcuts must not fire. */
  export function typing(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    return Boolean(
      el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        el.isContentEditable),
    );
  }
</script>

<script lang="ts">
  import { tick } from "svelte";
  import { SvelteSet } from "svelte/reactivity";
  import { toast } from "svelte-sonner";
  import {
    Check,
    Copy,
    Eye,
    EyeOff,
    PenLine,
    Plus,
    Trash,
  } from "lucide-svelte";
  import type { ProjectRevealOn } from "$lib/auth/domain/project-settings";
  import {
    addGroup,
    addSecret,
    anchorOf,
    groupText,
    oneLine,
    parseEnv,
    peek,
    removeGroup,
    removeSecrets,
    renameGroup,
    restoreSecret,
    secretsText,
    setSecret,
    type EnvGroup,
    type EnvSecret,
  } from "$lib/secrets/env-doc";
  import Button from "$lib/ui/Button.svelte";
  import IconButton from "$lib/ui/IconButton.svelte";
  import Kbd from "$lib/ui/Kbd.svelte";
  import Well from "$lib/ui/Well.svelte";
  import { cn } from "$lib/utils";
  import SecretForm from "./SecretForm.svelte";

  let {
    doc,
    baseline,
    revealOn,
    readOnly,
    filter,
    active,
    onedit,
  }: {
    doc: string;
    /** The saved version: rows that differ from it are highlighted until the next save. */
    baseline: string;
    revealOn: ProjectRevealOn;
    readOnly: boolean;
    filter: string;
    /** False while another project tab is shown (the view stays mounted, hidden). */
    active: boolean;
    /** Every table operation goes through here (undo stack + dirty state live upstream). */
    onedit: (next: string) => void;
  } = $props();

  const COLUMN = 330;
  const GAP = 6;
  const ROW = 26;

  type Editing =
    | { kind: "edit"; id: string }
    | { kind: "add"; group: number }
    | { kind: "rename"; group: number }
    | { kind: "group" }
    | null;

  let editing = $state<Editing>(null);
  let revealed = $state<string | null>(null);
  let hovered = $state<number | null>(null);
  let flash = $state<string | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | undefined;
  let anchor: string | null = null;
  const selected = new SvelteSet<string>();
  let width = $state(0);
  let root: HTMLDivElement | undefined = $state();

  const parsed = $derived(parseEnv(doc));
  const base = $derived(parseEnv(baseline));
  const saved = $derived(new Map(base.secrets.map((s) => [s.id, s.value])));
  const keys = $derived(new Set(parsed.secrets.map((s) => s.key)));
  /** Duplicated keys, and the copy of each that is used (the last, like dotenv). */
  const duplicates = $derived(
    new Set(parsed.secrets.filter((s) => s.id !== s.key).map((s) => s.key)),
  );
  const used = $derived(new Map(parsed.secrets.map((s) => [s.key, s.id])));
  const query = $derived(filter.trim().toLowerCase());

  function matches(s: EnvSecret) {
    if (!query) return true;
    if (s.key.toLowerCase().includes(query)) return true;
    // Values only count when the project shows them anyway.
    return revealOn === "always" && s.value.toLowerCase().includes(query);
  }

  /** Secrets deleted since the last save, keyed by where they render: `after:ID`, `before:ID`, `top:N`. */
  const deleted = $derived.by(() => {
    const ids = new Set(parsed.secrets.map((s) => s.id));
    const out: Record<string, EnvSecret[]> = {};
    for (const s of base.secrets) {
      if (ids.has(s.id) || !matches(s)) continue;
      const a = anchorOf(parsed, base, s);
      const at = !a
        ? `top:${parsed.groups.length - 1}`
        : a.kind === "top"
          ? `top:${a.group}`
          : `${a.kind}:${a.id}`;
      (out[at] ??= []).push(s);
    }
    return out;
  });

  const EMPTY: EnvGroup = {
    index: -1,
    name: null,
    header: null,
    start: 0,
    end: 0,
    secrets: [],
  };

  const visible = $derived(
    (parsed.groups.length ? parsed.groups : [EMPTY])
      .map((g) => ({ g, rows: g.secrets.filter(matches) }))
      .filter((v) => !query || v.rows.length || `top:${v.g.index}` in deleted),
  );

  /** Row ids in on-screen order, for Shift-click ranges and arrow keys. */
  const order = $derived(visible.flatMap((v) => v.rows.map((s) => s.id)));
  const lastSelected = $derived(order.findLast((id) => selected.has(id)));

  // Groups flow down columns in order like CSS columns, balanced on row counts rather than
  // measured heights, so an open form never moves a group to another column.
  const columns = $derived.by(() => {
    const n = Math.max(1, Math.floor((width - 2 * GAP + GAP) / (COLUMN + GAP)));
    const heights = visible.map((v) => {
      let rows = v.rows.length + (readOnly ? 0 : 1);
      for (const [at, list] of Object.entries(deleted)) {
        const id = at.slice(at.indexOf(":") + 1);
        if (at === `top:${v.g.index}` || v.rows.some((s) => s.id === id))
          rows += list.length;
      }
      return 58 + rows * ROW + GAP;
    });
    const fill = (limit: number) => {
      const cols: number[][] = [[]];
      let h = 0;
      heights.forEach((x, i) => {
        if (h + x > limit && cols[cols.length - 1].length) {
          cols.push([]);
          h = 0;
        }
        cols[cols.length - 1].push(i);
        h += x;
      });
      return cols;
    };
    let lo = Math.max(0, ...heights);
    let hi = heights.reduce((a, b) => a + b, 0);
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (fill(mid).length <= n) hi = mid;
      else lo = mid + 1;
    }
    const cols = fill(lo);
    while (cols.length < n) cols.push([]);
    return cols;
  });

  const lastColumn = $derived(
    Math.max(
      0,
      columns.findLastIndex((c) => c.length),
    ),
  );

  // Selections must not outlive their rows.
  $effect(() => {
    const ids = new Set(parsed.secrets.map((s) => s.id));
    for (const id of selected) if (!ids.has(id)) selected.delete(id);
  });

  // A revealed value never stays in the page while another tab is shown.
  $effect(() => {
    if (!active) revealed = null;
  });

  /** Group that pasted lines go to: the hovered one, else the selection's, else the last. */
  export function pasteTarget(): number {
    if (hovered !== null) return hovered;
    const sel = parsed.secrets.findLast((s) => selected.has(s.id));
    const group = sel && parsed.groups.find((g) => g.secrets.includes(sel));
    return group?.index ?? parsed.groups.length - 1;
  }

  function status(s: EnvSecret) {
    if (!saved.has(s.id)) return "var(--success)";
    return saved.get(s.id) !== s.value ? "var(--warning)" : undefined;
  }

  function showFlash(id: string) {
    flash = id;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => (flash = null), 1500);
  }

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      showFlash(id);
    } catch {
      toast.error("Couldn't copy to the clipboard");
    }
  }

  const copySelection = () => copy(secretsText(parsed, selected), "selection");

  function onRowClick(event: MouseEvent, s: EnvSecret) {
    if (event.shiftKey && anchor && order.includes(anchor)) {
      const [a, b] = [order.indexOf(anchor), order.indexOf(s.id)].sort(
        (x, y) => x - y,
      );
      for (const id of order.slice(a, b + 1)) selected.add(id);
      return;
    }
    anchor = s.id;
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      if (selected.has(s.id)) selected.delete(s.id);
      else selected.add(s.id);
      return;
    }
    selected.clear();
    void copy(s.value, `row:${s.id}`);
  }

  function focusRow(id: string | undefined) {
    if (!id) return;
    root?.querySelector<HTMLElement>(`[data-row="${CSS.escape(id)}"]`)?.focus();
  }

  function onRowKeydown(event: KeyboardEvent, s: EnvSecret) {
    const at = order.indexOf(s.id);
    if (event.key === "Enter" && !readOnly) {
      event.preventDefault();
      startEdit(s.id);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusRow(order[at + (event.key === "ArrowDown" ? 1 : -1)]);
    }
  }

  function startEdit(id: string) {
    if (readOnly) return;
    revealed = null;
    editing = { kind: "edit", id };
  }

  function startAdd(group: number) {
    if (readOnly) return;
    editing = { kind: "add", group };
  }

  async function finish(focusId?: string) {
    editing = null;
    await tick();
    focusRow(focusId);
  }

  function remove(ids: string[]) {
    if (readOnly || !ids.length) return;
    onedit(removeSecrets(doc, ids));
    selected.clear();
  }

  function commitRename(group: number, input: HTMLInputElement) {
    if (editing?.kind !== "rename" || editing.group !== group) return;
    const name = input.value.replace(/^[\s#]+/, "").trim();
    editing = null;
    if (name) onedit(renameGroup(doc, group, name));
  }

  function commitGroup(input: HTMLInputElement) {
    // Blur fires again when Enter or Esc removes the field.
    if (editing?.kind !== "group") return;
    const name = input.value.replace(/^[\s#]+/, "").trim();
    if (!name) {
      editing = null;
      return;
    }
    const next = addGroup(doc, name);
    onedit(next);
    editing = { kind: "add", group: parseEnv(next).groups.length - 1 };
  }

  function nameKeydown(event: KeyboardEvent, commit: () => void) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      editing = null;
    }
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (
      !active ||
      typing(event.target) ||
      document.querySelector("dialog[open]")
    )
      return;
    const mod = event.metaKey || event.ctrlKey;
    const focused = (event.target as HTMLElement | null)?.dataset?.row;
    if (
      mod &&
      event.key.toLowerCase() === "c" &&
      (selected.size || focused) &&
      !window.getSelection()?.toString()
    ) {
      event.preventDefault();
      const row = parsed.secrets.find((s) => s.id === focused);
      if (selected.size) void copySelection();
      else if (row) void copy(row.value, `row:${row.id}`);
      return;
    }
    if (mod || event.altKey) return;
    if (event.key === "Escape") {
      selected.clear();
      revealed = null;
      editing = null;
    } else if (
      (event.key === "Backspace" || event.key === "Delete") &&
      !readOnly
    ) {
      const ids = selected.size ? [...selected] : focused ? [focused] : [];
      if (!ids.length) return;
      event.preventDefault();
      remove(ids);
    } else if (event.key.toLowerCase() === "n" && !readOnly && !editing) {
      event.preventDefault();
      startAdd(pasteTarget());
    }
  }

  const focusOnMount = (el: HTMLInputElement) => {
    el.focus();
    el.select();
  };
</script>

<svelte:window onkeydown={onWindowKeydown} />

<!-- peek: masked ends; line: full value, truncated (Visible); wrap: all of it (revealed). -->
{#snippet value(s: EnvSecret, mode: "peek" | "line" | "wrap")}
  {#if mode === "line"}
    <span class="min-w-0 flex-1 truncate text-right text-fg2"
      >{oneLine(s.value)}</span
    >
  {:else if mode === "wrap"}
    <span class="min-w-0 flex-1 break-all whitespace-pre-wrap text-fg2"
      >{s.value}</span
    >
  {:else}
    {@const p = revealOn === "never" ? null : peek(s.value)}
    <span class="shrink-0 whitespace-pre text-fg2"
      >{#if p}{p.head}<span class="text-faint">••••••</span>{p.tail}{:else}<span
          class="text-faint">••••••••</span
        >{/if}</span
    >
  {/if}
{/snippet}

{#snippet gone(list: EnvSecret[] | undefined)}
  {#each list ?? [] as s (s.id)}
    <div
      class="flex h-[26px] items-center gap-3 rounded-row bg-[color-mix(in_oklab,var(--danger)_6%,transparent)] px-1 mono text-[12.5px] text-faint [&>span]:line-through"
    >
      <span class="min-w-0 flex-1 truncate">{s.key}</span>
      {@render value(s, revealOn === "always" ? "line" : "peek")}
      {#if !readOnly}
        <button
          type="button"
          class="shrink-0 rounded-row px-1 font-ui text-[12px] font-medium text-fg3 hover:text-fg"
          onclick={() => onedit(restoreSecret(doc, baseline, s.id))}
        >
          Undo
        </button>
      {/if}
    </div>
  {/each}
{/snippet}

{#snippet row(s: EnvSecret)}
  {@const sel = selected.has(s.id)}
  {@const tone = status(s)}
  {@const mode =
    revealed === s.id ? "wrap" : revealOn === "always" ? "line" : "peek"}
  <div
    role="presentation"
    class={cn(
      "group/row relative flex rounded-row px-1 mono text-[12.5px] leading-[normal] select-none has-[>button:focus-visible]:shadow-[inset_0_0_0_1px_var(--fg3)]",
      mode === "wrap"
        ? "min-h-[26px] items-start py-[3px]"
        : "h-[26px] items-center",
      sel
        ? "bg-s100-sel"
        : tone
          ? "bg-[color-mix(in_oklab,var(--tone)_6%,transparent)] hover:bg-s100-hover"
          : "hover:bg-s100-hover",
    )}
    style:--tone={tone}
    onpointerleave={() => {
      if (revealed === s.id) revealed = null;
    }}
    onfocusout={(event) => {
      if (
        revealed === s.id &&
        !event.currentTarget.contains(event.relatedTarget as Node | null)
      )
        revealed = null;
    }}
  >
    <button
      type="button"
      data-row={s.id}
      class={cn(
        "flex min-w-0 flex-1 gap-3 text-left outline-none",
        mode === "wrap" ? "items-start" : "h-full items-center",
      )}
      onclick={(event) => onRowClick(event, s)}
      ondblclick={() => startEdit(s.id)}
      onkeydown={(event) => onRowKeydown(event, s)}
    >
      <span
        class={cn(
          "min-w-0 truncate",
          mode === "peek" ? "flex-1" : "max-w-[60%] shrink-0",
          duplicates.has(s.key) &&
            (used.get(s.key) === s.id ? "text-warning" : "text-fg3"),
        )}
        title={!duplicates.has(s.key)
          ? undefined
          : used.get(s.key) === s.id
            ? `${s.key} is defined more than once: this one is used`
            : `Not used: a later ${s.key} overrides it`}>{s.key}</span
      >
      {#if duplicates.has(s.key) && used.get(s.key) !== s.id}
        <span class="shrink-0 font-ui text-[11px] text-faint">unused</span>
      {/if}
      {#if flash === `row:${s.id}`}
        <span
          class="ml-auto flex shrink-0 items-center gap-1 font-ui text-[12px] font-medium text-success"
          ><Check class="size-3" strokeWidth={2} />Copied</span
        >
      {:else}
        {@render value(s, mode)}
      {/if}
    </button>
    <span
      class={cn(
        "ml-1.5 hidden shrink-0 items-center group-focus-within/row:flex group-hover/row:flex",
        mode === "wrap" && "-my-px",
      )}
    >
      {#if revealOn === "hover"}
        <IconButton
          size="sm"
          label={revealed === s.id ? "Hide value" : "Show value"}
          onclick={() => (revealed = revealed === s.id ? null : s.id)}
        >
          {#if revealed === s.id}<EyeOff strokeWidth={1.75} />{:else}<Eye
              strokeWidth={1.75}
            />{/if}
        </IconButton>
      {/if}
      <IconButton
        size="sm"
        label="Copy value"
        onclick={() => copy(s.value, `row:${s.id}`)}
      >
        <Copy strokeWidth={1.75} />
      </IconButton>
      {#if !readOnly}
        <IconButton size="sm" label="Edit" onclick={() => startEdit(s.id)}>
          <PenLine strokeWidth={1.75} />
        </IconButton>
        <IconButton size="sm" label="Delete" onclick={() => remove([s.id])}>
          <Trash strokeWidth={1.75} />
        </IconButton>
      {/if}
    </span>
  </div>
  {#if s.id === lastSelected}
    <div class="relative z-20 h-0">
      <div
        class="absolute top-1 right-0 flex items-center gap-0.5 rounded-full bg-elev p-[3px] shadow-elev"
      >
        <Button variant="primary" size="sm" onclick={copySelection}>
          {#if flash === "selection"}
            <Check strokeWidth={2} />Copied
          {:else}
            <Copy strokeWidth={1.75} />Copy {selected.size}
            <kbd class="mono text-[11px] text-[var(--g500)]">⌘C</kbd>
          {/if}
        </Button>
        {#if !readOnly}
          <IconButton
            size="sm"
            label="Delete selected"
            class="rounded-full"
            onclick={() => remove([...selected])}
          >
            <Trash strokeWidth={1.75} />
          </IconButton>
        {/if}
      </div>
    </div>
  {/if}
{/snippet}

{#snippet group(g: EnvGroup, rows: EnvSecret[], first: boolean)}
  <div
    role="presentation"
    data-ftux={first ? "secrets" : undefined}
    onpointerenter={() => (hovered = g.index < 0 ? null : g.index)}
    onpointerleave={() => (hovered = null)}
  >
    <Well
      title={g.name ?? "Untitled"}
      note={(query ? rows.length : g.secrets.length) || undefined}
    >
      {#snippet head()}
        {#if editing?.kind === "rename" && editing.group === g.index}
          <input
            {@attach focusOnMount}
            class="-ml-1 h-[22px] min-w-0 flex-1 rounded-row bg-field px-1 text-[12.5px] font-[550] text-fg shadow-field outline-none placeholder:text-ph"
            value={g.name ?? ""}
            placeholder="Group name"
            aria-label="Group name"
            autocomplete="off"
            spellcheck="false"
            onkeydown={(event) =>
              nameKeydown(event, () =>
                commitRename(g.index, event.currentTarget),
              )}
            onblur={(event) => commitRename(g.index, event.currentTarget)}
          />
        {:else if readOnly || g.index < 0}
          <h3
            class={cn(
              "truncate text-[12.5px] font-[550]",
              g.name ? "text-fg" : "text-fg3",
            )}
          >
            {g.name ?? "Untitled"}
          </h3>
        {:else}
          <h3 class="min-w-0">
            <button
              type="button"
              title="Rename group"
              class={cn(
                "block max-w-full cursor-text truncate text-[12.5px] font-[550]",
                g.name ? "text-fg" : "text-fg3 hover:text-fg2",
              )}
              onclick={() => (editing = { kind: "rename", group: g.index })}
            >
              {g.name ?? "Untitled"}
            </button>
          </h3>
        {/if}
      {/snippet}
      {#snippet trail()}
        {#if g.secrets.length}
          <Button
            variant="ghost"
            size="sm"
            class={flash === `group:${g.index}` ? "text-success" : undefined}
            onclick={() => copy(groupText(parsed, g.index), `group:${g.index}`)}
          >
            {#if flash === `group:${g.index}`}
              <Check strokeWidth={2} />Copied
            {:else}
              <Copy strokeWidth={1.75} />Copy
            {/if}
          </Button>
        {:else if !readOnly && g.index >= 0}
          <IconButton
            size="sm"
            label="Remove group"
            onclick={() => onedit(removeGroup(doc, g.index))}
          >
            <Trash strokeWidth={1.75} />
          </IconButton>
        {/if}
      {/snippet}
      {@render gone(deleted[`top:${g.index}`])}
      {#each rows as s (s.id)}
        {@render gone(deleted[`before:${s.id}`])}
        {#if editing?.kind === "edit" && editing.id === s.id}
          <SecretForm
            initialKey={s.key}
            initialValue={s.value}
            taken={keys}
            oncancel={() => finish(s.id)}
            onsubmit={(key, value) => {
              onedit(setSecret(doc, s.id, key, value));
              void finish(key);
            }}
          />
        {:else}
          {@render row(s)}
        {/if}
        {@render gone(deleted[`after:${s.id}`])}
      {/each}
      {#if editing?.kind === "add" && editing.group === g.index}
        <SecretForm
          taken={keys}
          oncancel={() => finish()}
          onsubmit={(key, value) => {
            onedit(addSecret(doc, g.index, key, value));
            void finish(key);
          }}
        />
      {:else if !readOnly}
        <button
          type="button"
          class="group/add flex h-[26px] w-full items-center gap-1.5 rounded-row px-1 text-[12.5px] text-faint hover:bg-s100-hover hover:text-fg3"
          onclick={() => startAdd(g.index)}
        >
          <Plus class="size-3.5" strokeWidth={1.75} />Add secret
          <Kbd class="ml-auto hidden group-hover/add:inline-flex">N</Kbd>
        </button>
      {:else if !g.secrets.length}
        <p class="px-1 leading-[26px] text-fg3">No secrets yet</p>
      {/if}
    </Well>
  </div>
{/snippet}

<div
  bind:this={root}
  bind:clientWidth={width}
  class="min-h-0 flex-1 overflow-y-auto px-1.5 pb-1.5"
>
  <div class={cn("flex items-start gap-1.5", !width && "invisible")}>
    {#each columns as column, c (c)}
      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        {#each column as i (visible[i].g.index)}
          {@render group(visible[i].g, visible[i].rows, i === 0)}
        {/each}
        {#if c === lastColumn && !readOnly && !query && parsed.groups.length}
          {#if editing?.kind === "group"}
            <Well title="New group">
              {#snippet head()}
                <input
                  {@attach focusOnMount}
                  class="-ml-1 h-[22px] min-w-0 flex-1 rounded-row bg-field px-1 text-[12.5px] font-[550] text-fg shadow-field outline-none placeholder:text-ph"
                  placeholder="Group name"
                  aria-label="Group name"
                  autocomplete="off"
                  spellcheck="false"
                  onkeydown={(event) =>
                    nameKeydown(event, () => commitGroup(event.currentTarget))}
                  onblur={(event) => commitGroup(event.currentTarget)}
                />
              {/snippet}
            </Well>
          {:else}
            <Button
              variant="ghost"
              size="sm"
              class="ml-1.5 self-start"
              onclick={() => (editing = { kind: "group" })}
            >
              <Plus strokeWidth={1.75} />Group
            </Button>
          {/if}
        {/if}
      </div>
    {/each}
  </div>
</div>
