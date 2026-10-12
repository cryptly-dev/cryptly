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
  import Button from "$lib/ui/Button.svelte";
  import IconButton from "$lib/ui/IconButton.svelte";

  /** One tour step: a card under the first visible element matching `anchor`, pointing at it. */
  let {
    anchor,
    nextLabel = "Next",
    children,
  }: {
    /** CSS selector of the element the card points at. */
    anchor: string;
    nextLabel?: string;
    children: Snippet;
  } = $props();

  const WIDTH = 300;
  const step = $derived(ftuxStepNumber());
  let pos = $state<{ top: number; left: number; arrow: number } | null>(null);

  // Follows the anchor every frame: it moves when the topbar or the grid re-flows.
  $effect(() => {
    const selector = anchor;
    let frame = 0;
    const place = () => {
      const el = [...document.querySelectorAll<HTMLElement>(selector)].find(
        (e) => e.offsetParent !== null,
      );
      const r = el?.getBoundingClientRect();
      if (!r) pos = null;
      else {
        const center = r.left + Math.min(r.width, WIDTH) / 2;
        const left = Math.round(
          Math.min(Math.max(8, center - WIDTH / 2), innerWidth - WIDTH - 8),
        );
        const top = Math.round(Math.min(r.bottom + 10, innerHeight - 200));
        if (pos?.top !== top || pos.left !== left)
          pos = { top, left, arrow: Math.round(center - left) };
      }
      frame = requestAnimationFrame(place);
    };
    place();
    return () => cancelAnimationFrame(frame);
  });
</script>

{#if pos}
  <div
    role="dialog"
    aria-label={`Tutorial step ${step} of ${FTUX_TOTAL_STEPS}`}
    class="fixed z-[100] flex flex-col gap-2.5 rounded-card bg-elev p-3 pt-2 text-fg shadow-elev"
    style:top="{pos.top}px"
    style:left="{pos.left}px"
    style:width="{WIDTH}px"
    transition:fade={{ duration: 120 }}
  >
    <span
      aria-hidden="true"
      class="absolute -top-[5px] size-2.5 rotate-45 bg-elev shadow-[-0.5px_-0.5px_0_0_var(--elev-border)]"
      style:left="{pos.arrow - 5}px"
    ></span>
    <div class="flex items-center justify-between">
      <span class="text-[12px] font-medium text-fg3"
        >Step {step} of {FTUX_TOTAL_STEPS}</span
      >
      <IconButton size="sm" label="Skip tutorial" onclick={completeFTUX}>
        <X />
      </IconButton>
    </div>
    <div class="text-fg2">{@render children()}</div>
    <div class="flex items-center gap-1.5">
      <Button variant="ghost" size="sm" class="-ml-2.5" onclick={completeFTUX}>
        Skip tutorial
      </Button>
      <div class="flex-1"></div>
      {#if step > 1}
        <IconButton size="sm" label="Previous step" onclick={previousFTUXStep}>
          <ArrowLeft />
        </IconButton>
      {/if}
      <Button variant="primary" size="sm" onclick={nextFTUXStep}>
        {nextLabel}
      </Button>
    </div>
  </div>
{/if}
