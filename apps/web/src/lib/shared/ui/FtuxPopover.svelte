<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";
  import { ArrowLeft, X } from "lucide-svelte";
  import {
    FTUX_TOTAL_STEPS,
    completeFTUX,
    ftuxStepNumber,
    nextFTUXStep,
    previousFTUXStep,
  } from "$lib/stores/ftux.svelte";
  import { cn } from "$lib/utils";

  let {
    arrow,
    arrowStyle = "",
    nextLabel = "Next",
    class: className = "",
    children,
  }: {
    /** Side of the card the arrow sits on (points at the anchor). */
    arrow: "top" | "bottom";
    arrowStyle?: string;
    nextLabel?: string;
    class?: string;
    children: Snippet;
  } = $props();

  const step = $derived(ftuxStepNumber());
</script>

<div
  role="dialog"
  aria-label={`Tutorial step ${step} of ${FTUX_TOTAL_STEPS}`}
  class={cn(
    "absolute z-[100] w-80 rounded-lg border bg-popover p-4 text-sm text-popover-foreground shadow-2xl",
    className,
  )}
  transition:fade={{ duration: 150 }}
>
  <span
    class={cn(
      "absolute",
      arrow === "bottom"
        ? "bottom-0 translate-y-full"
        : "top-0 -translate-y-full rotate-180",
    )}
    style={arrowStyle || "left: 50%; margin-left: -6px;"}
  >
    <svg
      class="-my-px block fill-popover drop-shadow-[0_1px_0_oklch(1_0_0_/_0.1)]"
      width="12"
      height="7"
      viewBox="0 0 30 10"
      preserveAspectRatio="none"
    >
      <polygon points="0,0 30,0 15,10" />
    </svg>
  </span>
  <div class="flex flex-col gap-4">
    <div class="flex items-start justify-between gap-4">
      <span class="text-sm font-medium text-muted-foreground"
        >Step {step} of {FTUX_TOTAL_STEPS}</span
      >
      <button
        type="button"
        aria-label="Skip tutorial"
        class="inline-flex size-5 cursor-pointer items-center justify-center rounded-md transition-all hover:bg-secondary hover:text-accent-foreground"
        onclick={completeFTUX}
      >
        <X class="size-4" />
      </button>
    </div>
    <div class="text-sm leading-relaxed text-foreground">
      {@render children()}
    </div>
    <div class="flex justify-between gap-2">
      <button
        type="button"
        class="inline-flex h-8 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-neutral-800 hover:text-foreground"
        onclick={completeFTUX}
      >
        Skip tutorial
      </button>
      <div class="flex gap-2">
        {#if step > 1}
          <button
            type="button"
            aria-label="Previous step"
            class="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 px-2 shadow-xs transition-all hover:bg-neutral-700"
            onclick={previousFTUXStep}
          >
            <ArrowLeft class="size-4" />
          </button>
        {/if}
        <button
          type="button"
          class="inline-flex h-8 cursor-pointer items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
          onclick={nextFTUXStep}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  </div>
</div>
