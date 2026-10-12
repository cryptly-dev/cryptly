<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  let {
    label,
    size = "md",
    class: className,
    children,
    ...rest
  }: {
    /** Accessible name, also shown as the native tooltip. */
    label: string;
    size?: "md" | "sm";
    class?: string;
    children: Snippet;
  } & Omit<HTMLButtonAttributes, "class" | "children"> = $props();
</script>

<button
  type="button"
  aria-label={label}
  title={label}
  class={cn(
    "grid shrink-0 place-items-center text-fg3 hover:bg-[color-mix(in_oklab,var(--fg)_7%,transparent)] hover:text-fg disabled:pointer-events-none disabled:opacity-50",
    size === "md"
      ? "size-7 rounded-lg [&_svg]:size-3.5"
      : "size-[22px] rounded-row [&_svg]:size-3.5",
    className,
  )}
  {...rest}
>
  {@render children()}
</button>
