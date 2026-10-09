<script lang="ts" module>
  import { IconEye, IconEyeCode, IconEyeOff } from "@tabler/icons-svelte";
  import type { ProjectRevealOn } from "$lib/auth/domain/project-settings";

  export const REVEAL_ON_OPTIONS = [
    {
      key: "always",
      label: "Always",
      description: "Values stay visible in the editor",
      icon: IconEye,
    },
    {
      key: "hover",
      label: "Hover",
      description: "Values stay masked until hover or click",
      icon: IconEyeCode,
    },
    {
      key: "never",
      label: "Never",
      description: "Values stay masked and copy without revealing",
      icon: IconEyeOff,
    },
  ] as const satisfies readonly {
    key: ProjectRevealOn;
    label: string;
    description: string;
    icon: unknown;
  }[];
</script>

<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    value = $bindable(),
    disabled = false,
  }: { value: ProjectRevealOn; disabled?: boolean } = $props();

  const activeIndex = $derived(
    REVEAL_ON_OPTIONS.findIndex((option) => option.key === value),
  );
  const active = $derived(REVEAL_ON_OPTIONS[activeIndex]);

  function select(next: ProjectRevealOn) {
    if (!disabled) value = next;
  }
</script>

<div
  class={cn(
    "flex flex-col gap-3 rounded-lg border border-border/50 bg-neutral-800/20 p-4",
    disabled && "opacity-60",
  )}
  data-slot="project-reveal-on-picker"
>
  <div class="grid grid-cols-3 gap-2">
    {#each REVEAL_ON_OPTIONS as option, index (option.key)}
      {@const Icon = option.icon}
      {@const isActive = index === activeIndex}
      <button
        type="button"
        {disabled}
        aria-pressed={isActive}
        aria-label={option.label}
        class={cn(
          "flex h-10 cursor-pointer items-center justify-center rounded-md transition-all",
          isActive
            ? "text-primary"
            : "text-muted-foreground/60 hover:text-muted-foreground",
          disabled && "cursor-not-allowed",
        )}
        onclick={() => select(option.key)}
      >
        <Icon
          class={cn("size-5 transition-transform", isActive && "scale-110")}
        />
      </button>
    {/each}
  </div>

  <div class="relative h-8 select-none">
    <div
      class="absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-neutral-700/70"
    ></div>
    <div
      class="absolute top-1/2 left-2 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-200"
      style={`width: calc(((100% - 1rem) / 2) * ${activeIndex})`}
    ></div>
    <div class="absolute inset-x-2 top-0 grid h-full grid-cols-3">
      {#each REVEAL_ON_OPTIONS as option, index (option.key)}
        <button
          type="button"
          {disabled}
          aria-label={`Select ${option.label}`}
          class={cn(
            "relative flex cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            disabled && "cursor-not-allowed",
          )}
          style={`justify-self: ${index === 0 ? "start" : index === REVEAL_ON_OPTIONS.length - 1 ? "end" : "center"}`}
          onclick={() => select(option.key)}
        >
          <span
            class={cn(
              "relative z-10 block rounded-full transition-all duration-200",
              index === activeIndex
                ? "size-4 bg-primary ring-4 ring-primary/20"
                : index < activeIndex
                  ? "size-3 bg-primary"
                  : "size-3 bg-neutral-600",
            )}
          ></span>
        </button>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-0.5 text-center">
    <span class="text-sm font-semibold text-foreground">{active.label}</span>
    <span class="text-xs text-muted-foreground">{active.description}</span>
  </div>
</div>
