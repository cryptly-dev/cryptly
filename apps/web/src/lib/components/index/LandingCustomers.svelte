<script lang="ts">
  import LandingShell from './LandingShell.svelte';
  import { ACCENT, COMPANIES, TESTIMONIALS } from './landing-data';
</script>

<section>
  <LandingShell>
    <div class="max-w-2xl">
      <h2 class="text-3xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl">
        <span class="text-foreground">In good hands.</span>
        {' '}
        <span class="text-muted-foreground">
          A few of the teams on the vault today — and two of them who agreed to say why.
        </span>
      </h2>
    </div>

    <div class="mt-10">
      <div
        class="overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-2xl shadow-black/40 backdrop-blur-sm"
      >
        <div
          class="flex h-10 items-center justify-between border-b border-border/50 bg-neutral-900/40 px-4 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground"
        >
          <span>in use today</span>
          <span style:color={ACCENT}>selected</span>
        </div>
        <div class="grid grid-cols-2 divide-y divide-border/50 md:grid-cols-4 md:divide-x md:divide-y-0">
          {#each COMPANIES as name}
            <div class="flex items-center justify-center px-6 py-8">
              <span class="text-2xl font-semibold lowercase tracking-tight text-foreground/80 md:text-[28px]">{name}</span>
            </div>
          {/each}
        </div>
        <div
          class="grid grid-cols-1 divide-y divide-border/50 border-t border-border/50 bg-neutral-900/20 md:grid-cols-2 md:divide-x md:divide-y-0"
        >
          {#each TESTIMONIALS as t}
            <figure class="flex flex-col px-6 py-8 md:px-8 md:py-10">
              <div aria-hidden="true" class="mb-2 font-serif text-4xl leading-none" style:color={ACCENT}>“</div>
              <blockquote class="flex-1 text-[15px] leading-[1.7] text-foreground/90">{t.quote}</blockquote>
              <figcaption class="mt-6 flex items-center gap-3">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-neutral-800 font-mono text-[11px] tracking-wider text-foreground/80"
                >
                  {t.initials}
                </div>
                <div class="min-w-0">
                  <div class="truncate text-[13px] font-medium text-foreground">{t.name}</div>
                  <div class="truncate text-[11px] text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          {/each}
        </div>
      </div>
      <div class="mt-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
        Fig. 05 — a selection, two of them on the record
      </div>
    </div>
  </LandingShell>
</section>
