<script lang="ts">
  import LandingShell from './LandingShell.svelte';
  import {
    ACCENT,
    formatStat,
    trustHeadline,
    type StatsState
  } from './landing-data';

  let { state }: { state: StatsState } = $props();

  const headline = $derived(
    state.status === 'ready' ? trustHeadline(state.data.users) : 'People trust us with their keys.'
  );
</script>

<section>
  <LandingShell>
    <div class="max-w-2xl">
      <h2 class="text-3xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl">
        <span class="text-foreground">{headline}</span>
        {' '}
        <span class="text-muted-foreground">We thought you should know that before you did.</span>
      </h2>
      <p class="mt-6 max-w-xl text-[16px] leading-[1.75] text-muted-foreground">
        Four numbers, honestly counted. No rounding, no asterisks.
      </p>
    </div>

    <div class="mt-10">
      <div
        class="overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-2xl shadow-black/40 backdrop-blur-sm"
      >
        <div
          class="flex h-10 items-center justify-between border-b border-border/50 bg-neutral-900/40 px-4 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground"
        >
          <span>the house · today</span>
          <span class="inline-flex flex-col items-end gap-1 leading-none">
            <span style:color={ACCENT}>live</span>
            <span class="relative block h-[2px] w-10 overflow-hidden rounded-full bg-border/40">
              <span
                class="animate-live-scan absolute inset-y-0 left-0 w-1/2 rounded-full"
                style:background-color={ACCENT}
              ></span>
            </span>
          </span>
        </div>
        {#if state.status === 'error'}
          <div class="px-6 py-12 text-center">
            <p class="text-sm text-muted-foreground">
              Couldn't load the latest numbers right now. Please try again in a moment.
            </p>
          </div>
        {:else}
          <div class="grid grid-cols-2 divide-y divide-border/50 md:grid-cols-4 md:divide-x md:divide-y-0">
            {#if state.status === 'ready'}
              {#each [{ k: 'users', v: state.data.users }, { k: 'projects', v: state.data.projects }, { k: 'diffs', v: state.data.diffs }, { k: 'stars', v: state.data.stars }] as row}
                <div class="px-6 py-8 md:py-10">
                  <div class="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">{row.k}</div>
                  <div class="mt-3 text-5xl font-semibold tabular-nums leading-none text-foreground md:text-6xl">
                    {formatStat(row.v)}
                  </div>
                </div>
              {/each}
            {:else}
              {#each ['users', 'projects', 'diffs', 'stars'] as k}
                <div class="px-6 py-8 md:py-10">
                  <div class="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">{k}</div>
                  <div class="mt-3 text-5xl font-semibold tabular-nums leading-none text-foreground md:text-6xl">—</div>
                </div>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
      <div class="mt-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
        Fig. 06 — the house, by the numbers
      </div>
    </div>
  </LandingShell>
</section>
