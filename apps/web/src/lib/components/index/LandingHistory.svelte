<script lang="ts">
  import { Search } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import LandingShell from './LandingShell.svelte';
  import { ACCENT, PATCHES, TIME_CHIPS } from './landing-data';

  let q = $state('');
  let range = $state('all');
  let selectedId = $state('p1');

  const filtered = $derived.by(() => {
    const maxAge = TIME_CHIPS.find((r) => r.key === range)?.maxAge ?? null;
    const s = q.trim().toLowerCase();
    return PATCHES.filter((p) => {
      if (maxAge !== null && p.ageMin > maxAge) return false;
      if (!s) return true;
      return p.who.toLowerCase().includes(s) || p.msg.toLowerCase().includes(s);
    });
  });

  $effect(() => {
    const f = filtered;
    if (f.length === 0) return;
    if (!f.some((p) => p.id === selectedId)) {
      selectedId = f[0]!.id;
    }
  });

  const maxVolume = $derived.by(() => {
    let m = 0;
    for (const p of filtered) m = Math.max(m, p.add + p.del);
    return m || 1;
  });
</script>

<section>
  <LandingShell>
    <div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
      <div class="lg:col-span-5">
        <h2 class="text-3xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl">
          <span class="text-foreground">Every save signed.</span>
          {' '}
          <span class="text-muted-foreground">Every change recallable.</span>
        </h2>
        <p class="mt-6 max-w-md text-[16px] leading-[1.75] text-muted-foreground">
          The server returns the matching ciphertexts; your browser decrypts and renders them. The audit log is yours;
          the answer is yours; we supplied only the shelving.
        </p>
        <ul class="mt-6 space-y-2 font-mono text-[12px] text-foreground/80">
          {#each ['Search by author or substring', 'Filter by time range or contributor', 'Decrypted in your tab, never on ours'] as it}
            <li class="flex items-baseline gap-3">
              <span class="text-[10px]" style:color={ACCENT}>◦</span>
              <span>{it}</span>
            </li>
          {/each}
        </ul>
      </div>
      <div class="lg:col-span-7">
        <div
          class="overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-2xl shadow-black/40 backdrop-blur-sm"
        >
          <div class="relative flex h-10 items-center border-b border-border/50 bg-neutral-900/60">
            <Search class="pointer-events-none ml-3 size-3.5 flex-shrink-0 text-muted-foreground" />
            <input
              bind:value={q}
              placeholder="Search edits — author, message…"
              class="h-full min-w-0 flex-1 border-0 bg-transparent pl-2.5 pr-3 font-mono text-sm placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <span class="mr-3 font-mono text-[11px] tabular-nums text-muted-foreground/80">
              {filtered.length}/{PATCHES.length}
            </span>
          </div>
          <div class="flex items-center gap-1.5 border-b border-border/50 px-3 py-2">
            {#each TIME_CHIPS as r}
              <button
                type="button"
                class={cn(
                  'cursor-pointer whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                  range === r.key
                    ? 'border-primary/40 bg-primary/15 text-primary'
                    : 'border-border/60 bg-neutral-900 text-muted-foreground hover:border-border hover:text-foreground'
                )}
                onclick={() => (range = r.key)}
              >
                {r.label}
              </button>
            {/each}
          </div>
          <div class="h-[320px] overflow-y-auto">
            {#if filtered.length === 0}
              <div class="px-4 py-12 text-center text-sm text-muted-foreground">No results</div>
            {:else}
              {#each filtered as p}
                {@const isSelected = p.id === selectedId}
                {@const volume = p.add + p.del}
                {@const addRatio = volume ? p.add / volume : 0}
                {@const barWidth = (volume / maxVolume) * 100}
                <button
                  type="button"
                  class={cn(
                    'flex w-full cursor-pointer items-center gap-3 border-l-2 px-3 py-2 text-left transition-colors focus:outline-none',
                    isSelected ? 'border-primary bg-neutral-800/60' : 'border-transparent hover:bg-neutral-900/60'
                  )}
                  onclick={() => (selectedId = p.id)}
                >
                  <img src={p.avatar} alt="" class="size-5 flex-shrink-0 rounded-full object-cover grayscale opacity-90" />
                  <div class="min-w-0 flex-1">
                    <div
                      class={cn('truncate text-sm', isSelected ? 'font-medium text-foreground' : 'text-muted-foreground')}
                    >
                      {p.who}
                    </div>
                    <div class="truncate font-mono text-[11px] text-muted-foreground/70">{p.msg}</div>
                  </div>
                  <div class="flex flex-shrink-0 items-center gap-2">
                    <span class="font-mono text-[11px] tabular-nums">
                      <span class="text-emerald-400">+{p.add}</span>
                      {' '}
                      <span class="text-rose-400">-{p.del}</span>
                    </span>
                    <div class="flex h-1 w-[80px] overflow-hidden rounded-full bg-neutral-800/60">
                      <div class="h-full bg-emerald-500/80" style:width="{barWidth * addRatio}%"></div>
                      <div class="h-full bg-rose-500/80" style:width="{barWidth * (1 - addRatio)}%"></div>
                    </div>
                    <span class="w-10 text-right font-mono text-[11px] tabular-nums text-muted-foreground">{p.when}</span>
                  </div>
                </button>
              {/each}
            {/if}
          </div>
        </div>
        <div class="mt-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
          Fig. 04 — the ledger, searched
        </div>
      </div>
    </div>
  </LandingShell>
</section>
