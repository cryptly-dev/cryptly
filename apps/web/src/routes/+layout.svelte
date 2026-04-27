<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import { installAuthFetchInterceptor } from '$lib/auth/fetch-interceptor';
  import BlogHeader from '$lib/components/blog/BlogHeader.svelte';
  import PassphraseGate from '$lib/components/shell/PassphraseGate.svelte';
  import UnlockBrowserDialog from '$lib/keys/ui/UnlockBrowserDialog.svelte';
  import { Toaster } from 'svelte-sonner';

  let { children } = $props();

  onMount(() => {
    installAuthFetchInterceptor();
  });
</script>

<svelte:head>
  <title>Cryptly</title>
</svelte:head>

<BlogHeader />
{@render children()}
<PassphraseGate />
<UnlockBrowserDialog />
<Toaster position="bottom-right" theme="dark" />
