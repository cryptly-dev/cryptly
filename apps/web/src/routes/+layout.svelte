<script lang="ts">
  import '../app.css';
  import BlogHeader from '$lib/components/blog/BlogHeader.svelte';
  import PassphraseGate from '$lib/components/shell/PassphraseGate.svelte';
  import { Toaster } from 'svelte-sonner';

  let { children } = $props();
</script>

<svelte:head>
  <title>Cryptly</title>
</svelte:head>

<BlogHeader />
{@render children()}
<PassphraseGate />
<Toaster position="bottom-right" theme="dark" />
