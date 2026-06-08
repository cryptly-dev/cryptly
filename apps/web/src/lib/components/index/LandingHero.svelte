<script lang="ts">
  import { onMount } from 'svelte';
  import { animate } from 'motion';
  import { ArrowRight } from 'lucide-svelte';
  import GitHubIcon from '$lib/shared/ui/GitHubIcon.svelte';
  import { cn } from '$lib/utils';
  import LandingShell from './LandingShell.svelte';
  import { ACCENT, HERO_DURATION, HERO_EASE, HERO_ROWS } from './landing-data';

  let hovered: number | null = $state(null);

  let elH1: HTMLElement | undefined = $state();
  let elP: HTMLElement | undefined = $state();
  let elCtas: HTMLElement | undefined = $state();
  let elMeta: HTMLElement | undefined = $state();
  let elRight: HTMLElement | undefined = $state();

  onMount(() => {
    const ease = HERO_EASE as unknown as [number, number, number, number];
    const base = { duration: HERO_DURATION, ease };
    if (elH1) void animate(elH1, { opacity: [0, 1], y: [20, 0] }, base);
    if (elP) void animate(elP, { opacity: [0, 1], y: [16, 0] }, { ...base, delay: 0.12 });
    if (elCtas) void animate(elCtas, { opacity: [0, 1], y: [12, 0] }, { ...base, delay: 0.24 });
    if (elMeta) void animate(elMeta, { opacity: [0, 1], y: [12, 0] }, { ...base, delay: 0.36 });
    if (elRight)
      void animate(elRight, { opacity: [0, 1], y: [20, 0] }, { duration: HERO_DURATION + 0.1, ease, delay: 0.18 });
  });
</script>

<section class="flex min-h-screen items-center pb-12 pt-28">
  <LandingShell class="w-full">
    <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
      <div class="lg:col-span-7">
        <h1
          bind:this={elH1}
          class="text-5xl font-semibold leading-[0.98] tracking-tight text-foreground md:text-7xl lg:text-[80px]"
          style="opacity:0;transform:translateY(20px)"
        >
          Your secrets
          <br />
          are none of
          <br />
          <span class="text-muted-foreground">our business.</span>
        </h1>
        <p
          bind:this={elP}
          class="mt-8 max-w-xl text-lg leading-[1.75] text-muted-foreground"
          style="opacity:0;transform:translateY(16px)"
        >
          Cryptly is a small, open source secrets manager. Every value is encrypted before it leaves your browser — so
          even we can't read it. Free, forever.
        </p>
        <div
          bind:this={elCtas}
          class="mt-10 flex flex-wrap items-center gap-3"
          style="opacity:0;transform:translateY(12px)"
        >
          <a
            href="/app/project"
            class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-black/40 transition-all duration-300 hover:bg-neutral-100 hover:shadow-xl [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-0.5"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
            ></span>
            <span class="relative z-10 inline-flex items-center gap-2">
              Open the dashboard
              <ArrowRight class="h-4 w-4" />
            </span>
          </a>
          <a
            href="https://github.com/cryptly-dev/cryptly"
            class="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-5 py-2.5 text-sm text-foreground backdrop-blur-sm transition-colors hover:border-border hover:bg-neutral-800/60"
          >
            <GitHubIcon class="h-4 w-4" />
            Read the source
          </a>
        </div>
        <div
          bind:this={elMeta}
          class="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-muted-foreground"
          style="opacity:0;transform:translateY(12px)"
        >
          <span>Free forever</span>
          <span aria-hidden="true" class="inline-block h-1 w-1 rounded-full align-middle" style:background-color={ACCENT}
          ></span>
          <span>E2E encrypted</span>
          <span aria-hidden="true" class="inline-block h-1 w-1 rounded-full align-middle" style:background-color={ACCENT}
          ></span>
          <span>Open source</span>
        </div>
      </div>
      <div bind:this={elRight} class="lg:col-span-5" style="opacity:0;transform:translateY(20px)">
        <div
          class="overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-2xl shadow-black/40 backdrop-blur-sm"
        >
          <div class="px-4 py-5 font-mono text-[13px] leading-[2]">
            {#each HERO_ROWS as r, i}
              <div
                role="presentation"
                onmouseenter={() => (hovered = i)}
                onmouseleave={() => (hovered = null)}
                class="flex items-baseline gap-3 whitespace-nowrap px-2 py-1"
              >
                <span class="w-6 flex-shrink-0 text-right tabular-nums text-muted-foreground/50">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span class="font-medium" style:color={ACCENT}>{r.k}</span>
                <span class="text-muted-foreground/50">=</span>
                <span
                  class={cn(hovered === i ? 'text-foreground/90' : 'text-muted-foreground/70')}
                >
                  {hovered === i ? r.v : '•'.repeat(r.dots)}
                </span>
              </div>
            {/each}
          </div>
        </div>
        <div class="mt-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
          Fig. 01 — the editor, in repose
        </div>
      </div>
    </div>
  </LandingShell>
</section>
