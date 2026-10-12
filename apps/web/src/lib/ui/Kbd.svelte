<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils";

  let { class: className, children }: { class?: string; children: Snippet } =
    $props();
</script>

<kbd
  class={cn(
    "inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-[4px] bg-s100 px-[5px] font-ui text-[11px] leading-[18px] font-medium text-fg3 shadow-[inset_0_0_0_0.5px_var(--s100-border)]",
    className,
  )}>{@render children()}</kbd
>
