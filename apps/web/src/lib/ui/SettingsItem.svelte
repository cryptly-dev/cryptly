<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils";

  /** One settings row: muted label, value, and actions on the right. Rows split by hairlines. */
  let {
    label,
    top = false,
    class: className,
    actions,
    children,
  }: {
    label: string;
    /** Align to the top, for tall values (swatches, previews). */
    top?: boolean;
    class?: string;
    actions?: Snippet;
    children?: Snippet;
  } = $props();
</script>

<div
  class={cn(
    "group/item flex min-h-11 gap-4 px-1 py-2 [&:not(:first-child)]:shadow-[inset_0_0.5px_0_var(--s100-border)]",
    top ? "items-start" : "items-center",
    className,
  )}
>
  <span class={cn("w-16 shrink-0 text-fg3", top && "leading-[30px]")}
    >{label}</span
  >
  <div class="flex min-w-0 flex-1 items-center gap-2.5">
    {@render children?.()}
  </div>
  {#if actions}
    <div class="-my-1.5 flex shrink-0 items-center gap-1.5">
      {@render actions()}
    </div>
  {/if}
</div>
