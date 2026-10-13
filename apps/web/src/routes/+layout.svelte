<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import "../app.css";
  import { identify } from "$lib/analytics/logdash";
  import DeviceFlowApproverDialog from "$lib/device-flow/ui/DeviceFlowApproverDialog.svelte";
  import { subscribeApproverStream } from "$lib/device-flow/device-flow-approver.svelte";
  import { installAuthFetchInterceptor } from "$lib/auth/fetch-interceptor";
  import BlogHeader from "$lib/components/blog/BlogHeader.svelte";
  import PassphraseGate from "$lib/components/shell/PassphraseGate.svelte";
  import { appearance } from "$lib/appearance/appearance.svelte";
  import { startKeyAutoLock } from "$lib/keys/auto-lock";
  import UnlockBrowserDialog from "$lib/keys/ui/UnlockBrowserDialog.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import { keyAuth } from "$lib/stores/key.svelte";
  import { Toaster } from "svelte-sonner";

  let { children } = $props();

  onMount(() => {
    installAuthFetchInterceptor();
  });

  // Covers page load, sign-in and sign-out: userData is the single source of the signed-in user.
  const analyticsUserId = $derived(auth.userData?.id ?? null);
  $effect(() => {
    identify(analyticsUserId);
  });

  $effect(() => {
    if (!browser) return;
    if (!auth.jwtToken || !keyAuth.hasMasterKey) return;
    return subscribeApproverStream();
  });

  $effect(() => {
    if (!browser) return;
    if (!auth.jwtToken || !keyAuth.hasMasterKey) return;
    return startKeyAutoLock();
  });
</script>

<svelte:head>
  <title>Cryptly</title>
</svelte:head>

<BlogHeader />
{@render children()}
<PassphraseGate />
<UnlockBrowserDialog />
<DeviceFlowApproverDialog />
<Toaster
  position="top-center"
  theme={appearance.resolved}
  class="toaster group"
  style="--normal-bg: var(--elev); --normal-text: var(--fg); --normal-border: var(--elev-border); --border-radius: 12px; font-family: 'Geist Variable', system-ui, sans-serif;"
/>
