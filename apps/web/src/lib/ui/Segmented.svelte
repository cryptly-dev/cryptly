<script lang="ts" generics="T extends string">
  import { cn } from "$lib/utils";

  let {
    options,
    value = $bindable(),
    label,
    onchange,
    disabled = false,
    class: className,
  }: {
    options: readonly { value: T; label: string }[];
    value: T;
    /** Accessible name for the group. */
    label: string;
    onchange?: (value: T) => void;
    disabled?: boolean;
    class?: string;
  } = $props();
</script>

<div
  role="radiogroup"
  aria-label={label}
  class={cn(
    "inline-flex shrink-0 gap-0.5 rounded-full bg-root p-0.5",
    disabled && "pointer-events-none opacity-60",
    className,
  )}
>
  {#each options as option (option.value)}
    {@const on = option.value === value}
    <button
      type="button"
      role="radio"
      aria-checked={on}
      {disabled}
      class={cn(
        "flex h-[26px] items-center rounded-full px-[11px] font-medium whitespace-nowrap",
        on ? "bg-s100 text-fg shadow-card" : "text-fg3 hover:text-fg",
      )}
      onclick={() => {
        if (on) return;
        value = option.value;
        onchange?.(option.value);
      }}
    >
      {option.label}
    </button>
  {/each}
</div>
