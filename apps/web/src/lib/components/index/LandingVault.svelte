<script lang="ts">
  import { cn } from '$lib/utils';
  import LandingShell from './LandingShell.svelte';
  import { ACCENT, VAULT_ROWS } from './landing-data';
</script>

<section>
  <LandingShell>
    <div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
      <div class="lg:col-span-5">
        <h2 class="text-3xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl">
          <span class="text-foreground">One column for the blob.</span>
          {' '}
          <span class="text-muted-foreground">None for the value.</span>
        </h2>
        <p class="mt-7 max-w-md text-[16px] leading-[1.75] text-muted-foreground">
          Here is our entire secrets table. The{' '}
          <code class="rounded bg-neutral-800/60 px-1 py-0.5 text-[13px] text-foreground">blob</code>
          {' '}
          column is the whole secret, encrypted before it left your browser. There is no second column where the plaintext
          lives, and no function to produce it on demand.
        </p>
        <ul class="mt-6 space-y-2 font-mono text-[12px] text-foreground/80">
          {#each ['Encrypted before it leaves your browser', 'Keys derived from your passphrase, never shared', 'Re-wrapped for each collaborator, never copied'] as it}
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
          <div
            class="flex h-10 items-center justify-between border-b border-border/50 bg-neutral-900/40 px-4 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span class="inline-flex min-w-0 items-center gap-2 truncate">secrets · {VAULT_ROWS.length} rows</span>
            <span style:color={ACCENT}>schema</span>
          </div>
          <div class="overflow-hidden">
            <table class="w-full table-fixed text-left font-mono text-[12px]">
              <thead>
                <tr
                  class="border-b border-border/50 bg-neutral-900/60 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80"
                >
                  <th class="w-[88px] px-4 py-2.5 font-medium">id</th>
                  <th class="w-[92px] px-4 py-2.5 font-medium">project</th>
                  <th class="px-4 py-2.5 font-medium">blob</th>
                </tr>
              </thead>
              <tbody>
                {#each VAULT_ROWS as r, i}
                  <tr
                    class={cn(
                      'border-b border-border/40 transition-colors last:border-b-0 hover:bg-neutral-800/30',
                      i % 2 === 1 && 'bg-neutral-900/30'
                    )}
                  >
                    <td class="truncate px-4 py-2.5 text-foreground/90">{r.id}</td>
                    <td class="truncate px-4 py-2.5 text-foreground/70">{r.project}</td>
                    <td class="truncate px-4 py-2.5 text-foreground/90">
                      <span class="inline-flex max-w-full items-center gap-1.5 rounded bg-neutral-800/60 px-1.5 py-0.5 text-[11px]">
                        <span class="h-1 w-1 flex-shrink-0 rounded-full" style:background-color={ACCENT}></span>
                        <span class="truncate">{r.blob}</span>
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <div
            class="border-t border-border/50 bg-neutral-900/40 px-4 py-2 text-[11px] font-mono italic text-muted-foreground/80"
          >
            The schema is short on purpose.
          </div>
        </div>
        <div class="mt-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
          Fig. 02 — secrets · the whole table
        </div>
      </div>
    </div>
  </LandingShell>
</section>
