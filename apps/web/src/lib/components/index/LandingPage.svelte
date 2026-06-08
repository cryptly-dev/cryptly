<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import SiteFooter from '$lib/shared/ui/SiteFooter.svelte';
  import { StatsApi } from '$lib/api/stats.api';
  import LandingCoda from './LandingCoda.svelte';
  import LandingCustomers from './LandingCustomers.svelte';
  import LandingDivider from './LandingDivider.svelte';
  import LandingHero from './LandingHero.svelte';
  import LandingHistory from './LandingHistory.svelte';
  import LandingInvite from './LandingInvite.svelte';
  import LandingNumbers from './LandingNumbers.svelte';
  import LandingVault from './LandingVault.svelte';
  import LandingWire from './LandingWire.svelte';
  import { STATS_REFRESH_INTERVAL_MS, type StatsState } from './landing-data';

  let statsState = $state<StatsState>({ status: 'loading' });

  onMount(() => {
    if (!browser) return;
    let cancelled = false;
    let timeoutId: number | undefined;

    async function run() {
      try {
        const data = await StatsApi.get();
        if (!cancelled) statsState = { status: 'ready', data };
      } catch {
        if (!cancelled) statsState = { status: 'error' };
      }
      if (cancelled) return;
      timeoutId = window.setTimeout(run, STATS_REFRESH_INTERVAL_MS);
    }

    void run();
    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  });
</script>

<div
  class="dark relative min-h-screen overflow-x-clip bg-background text-foreground"
>
  <div
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 -z-10"
    style="background: radial-gradient(60rem 40rem at 20% -10%, rgba(201,178,135,0.06), transparent 60%), radial-gradient(40rem 30rem at 90% 20%, rgba(255,255,255,0.03), transparent 60%)"
  ></div>
  <LandingHero />
  <LandingDivider />
  <LandingVault />
  <LandingDivider />
  <LandingInvite />
  <LandingDivider />
  <LandingWire />
  <LandingDivider />
  <LandingHistory />
  <LandingDivider />
  <LandingCustomers />
  <LandingDivider />
  <LandingNumbers state={statsState} />
  <LandingCoda state={statsState} />
  <SiteFooter />
</div>
