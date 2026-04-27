<script lang="ts">
  import { ArrowRight } from 'lucide-svelte';
  import GitHubIcon from '$lib/shared/ui/GitHubIcon.svelte';
  import LandingShell from './LandingShell.svelte';
  import { formatOrdinal, type StatsState } from './landing-data';

  let { state }: { state: StatsState } = $props();

  const heading = $derived(
    state.status === 'ready' ? `Ready to be the ${formatOrdinal(state.data.users + 1)}?` : 'Ready to join them?'
  );
</script>

<section class="py-24">
  <LandingShell>
    <h2 class="max-w-3xl text-3xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
      {heading}
    </h2>
    <p class="mt-6 max-w-xl text-lg leading-[1.7] text-muted-foreground">
      Sign in, mint a passphrase in the browser, paste your first value. Three minutes, one vault, no charge.
    </p>
    <div class="mt-10 flex flex-wrap items-center gap-3">
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
  </LandingShell>
</section>
