<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";
  import { cn } from "$lib/utils";

  type Props = {
    variant?: "secondary" | "ghost" | "primary" | "danger";
    size?: "md" | "sm";
    class?: string;
    children?: Snippet;
  } & (
    | ({ href: string } & Omit<HTMLAnchorAttributes, "class" | "children">)
    | ({ href?: undefined } & Omit<HTMLButtonAttributes, "class" | "children">)
  );

  let {
    variant = "secondary",
    size = "md",
    class: className,
    children,
    ...rest
  }: Props = $props();

  const classes = $derived(
    cn(
      "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
      size === "md"
        ? "h-[30px] px-3 text-[13px] [&_svg]:size-[15px]"
        : "h-[26px] px-2.5 text-[12.5px] [&_svg]:size-[13px]",
      variant === "secondary" && "bg-btn text-fg shadow-btn hover:bg-btn-hover",
      variant === "ghost" &&
        "text-fg3 hover:bg-[color-mix(in_oklab,var(--fg)_6%,transparent)] hover:text-fg",
      variant === "primary" &&
        "bg-btn-primary text-btn-primary-fg shadow-raise hover:bg-btn-primary-hover",
      variant === "danger" &&
        "bg-danger-bg text-danger hover:bg-danger-bg-hover",
      className,
    ),
  );
</script>

{#if rest.href !== undefined}
  <a class={classes} {...rest as HTMLAnchorAttributes}>{@render children?.()}</a
  >
{:else}
  <button type="button" class={classes} {...rest as HTMLButtonAttributes}
    >{@render children?.()}</button
  >
{/if}
