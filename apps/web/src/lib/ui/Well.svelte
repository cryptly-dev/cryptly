<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils";

  /**
   * The recessed tray that groups content: a one-line header (title, note, trailing actions)
   * above a raised card. Containers nest panel → well → card → row with 6px padding each,
   * so corners nest 24 → 18 → 12 → 6px.
   */
  let {
    title,
    head,
    note,
    trail,
    danger = false,
    bare = false,
    id,
    class: className,
    cardClass,
    children,
  }: {
    title: string;
    /** Replaces the title text (e.g. an inline rename field); `title` stays the fallback. */
    head?: Snippet;
    note?: string | number;
    trail?: Snippet;
    /** Red title, for destructive sections. */
    danger?: boolean;
    /** Render children directly under the header instead of inside a card. */
    bare?: boolean;
    id?: string;
    class?: string;
    cardClass?: string;
    children?: Snippet;
  } = $props();
</script>

<section
  {id}
  class={cn(
    "flex min-w-0 flex-col gap-1.5 rounded-well bg-root p-1.5",
    className,
  )}
>
  <header class="flex h-7 shrink-0 items-center gap-2 pr-0.5 pl-2.5">
    {#if head}
      {@render head()}
    {:else}
      <h3
        class={cn(
          "truncate text-[12.5px] font-[550]",
          danger ? "text-danger" : "text-fg",
        )}
      >
        {title}
      </h3>
    {/if}
    {#if note !== undefined && note !== ""}
      <span class="mono text-[11px] text-fg3">{note}</span>
    {/if}
    {#if trail}
      <div class="ml-auto flex items-center gap-1.5">{@render trail()}</div>
    {/if}
  </header>
  {#if children}
    {#if bare}
      {@render children()}
    {:else}
      <div class={cn("rounded-card bg-s100 p-1.5 shadow-card", cardClass)}>
        {@render children()}
      </div>
    {/if}
  {/if}
</section>
