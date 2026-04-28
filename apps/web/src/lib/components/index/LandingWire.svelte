<script lang="ts">
  import { onDestroy } from 'svelte';
  import { ArrowRight, Check } from 'lucide-svelte';
  import GitHubIcon from '$lib/shared/ui/GitHubIcon.svelte';
  import { cn } from '$lib/utils';
  import LandingShell from './LandingShell.svelte';
  import { ACCENT, GH_LIST, WIRE_PANEL_HEIGHT } from './landing-data';

  let done = $state<number[]>([]);
  let running = $state(false);
  const timers: number[] = [];

  function run() {
    timers.forEach((t) => window.clearTimeout(t));
    timers.length = 0;
    done = [];
    running = true;
    GH_LIST.forEach((_, i) => {
      timers.push(
        window.setTimeout(
          () => {
            done = [...done, i];
            if (i === GH_LIST.length - 1) running = false;
          },
          220 + i * 220
        )
      );
    });
  }

  onDestroy(() => timers.forEach((t) => window.clearTimeout(t)));
</script>

<section>
  <LandingShell>
    <div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
      <div class="lg:col-span-5">
        <h2 class="text-3xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl">
          <span class="text-foreground">One click</span>
          <br />
          <span class="text-muted-foreground">to GitHub Actions.</span>
        </h2>
        <p class="mt-6 max-w-md text-[16px] leading-[1.75] text-muted-foreground">
          The browser re-encrypts each value against the target repository's public key — the same primitive GitHub's own
          CLI uses — and forwards the ciphertext. We are the courier; GitHub is the recipient.
        </p>
        <button
          type="button"
          disabled={running}
          class={cn(
            'mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors',
            running
              ? 'cursor-wait border-border/50 bg-neutral-900/40 text-muted-foreground'
              : 'border-border/50 bg-card/40 text-foreground backdrop-blur-sm hover:border-border hover:bg-neutral-800/60'
          )}
          onclick={run}
        >
          {#if running}
            <span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
            ></span>
            Pushing…
          {:else if done.length === GH_LIST.length}
            <span style:color={ACCENT}><Check class="h-3.5 w-3.5" /></span>
            Pushed · run again
          {:else}
            Run the dispatch
            <ArrowRight class="h-3.5 w-3.5" />
          {/if}
        </button>
      </div>
      <div class="lg:col-span-7">
        <div
          class="overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-2xl shadow-black/40 backdrop-blur-sm"
        >
          <div class="grid grid-cols-1 md:grid-cols-2">
            <div class="flex flex-col border-b border-border/50 md:border-b-0 md:border-r">
              <div
                class="flex h-10 items-center justify-between border-b border-border/50 bg-neutral-900/40 px-4 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground"
              >
                <span>cryptly vault</span>
                <span style:color={ACCENT}>source</span>
              </div>
              <div class="overflow-hidden p-2 font-mono text-[12px] leading-[1.95]" style:height="{WIRE_PANEL_HEIGHT}px">
                {#each GH_LIST as k, i}
                  <div
                    class={cn(
                      'mx-1 grid grid-cols-[1fr_auto] items-baseline gap-2 rounded-md px-2 py-1 transition-all',
                      done.includes(i) ? 'bg-neutral-900/40 opacity-50' : 'hover:bg-neutral-800/40'
                    )}
                  >
                    <span class="truncate text-foreground/90">{k}</span>
                    <span class="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">ciphertext</span>
                  </div>
                {/each}
              </div>
            </div>
            <div class="flex flex-col">
              <div
                class="flex h-10 items-center justify-between border-b border-border/50 bg-neutral-900/40 px-4 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground"
              >
                <span class="inline-flex items-center gap-1.5">
                  <GitHubIcon class="h-3 w-3" />
                  cryptly-dev/api
                </span>
                <span style:color={ACCENT}>recipient</span>
              </div>
              <div class="relative overflow-hidden p-2" style:height="{WIRE_PANEL_HEIGHT}px">
                {#if done.length === 0}
                  <div class="absolute inset-0 grid place-items-center text-[12px] font-mono text-muted-foreground/70">
                    none yet · press the button
                  </div>
                {/if}
                {#each done as i (i)}
                  <div
                    class="mx-1 grid grid-cols-[1fr_auto] items-baseline gap-2 rounded-md bg-neutral-800/30 px-2 py-1 font-mono text-[12px] leading-[1.95]"
                  >
                    <span class="truncate text-foreground">{GH_LIST[i]}</span>
                    <span class="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">just now</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
          Fig. 03 — each value, re-sealed for the recipient
        </div>
      </div>
    </div>
  </LandingShell>
</section>
