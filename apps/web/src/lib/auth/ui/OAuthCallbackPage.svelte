<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { gotoAfterLogin } from '$lib/auth/after-login';
  import {
    auth,
    exchangeGithubCodeForJwt,
    exchangeGoogleCodeForJwt,
    loadUserData
  } from '$lib/stores/auth.svelte';

  let { method }: { method: 'google' | 'github' } = $props();

  let exchangeSucceeded = $state(false);
  let afterLoginRan = $state(false);

  onMount(() => {
    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (!code) {
        await goto('/app/login');
        return;
      }
      try {
        if (method === 'google') {
          await exchangeGoogleCodeForJwt(code);
        } else {
          await exchangeGithubCodeForJwt(code);
        }
        await loadUserData();
        exchangeSucceeded = true;
      } catch {
        await goto('/app/login');
      }
    })();
  });

  $effect(() => {
    if (!exchangeSucceeded || afterLoginRan || !auth.userData) {
      return;
    }
    afterLoginRan = true;
    void gotoAfterLogin();
  });
</script>

<div class="flex h-screen w-screen items-center justify-center">
  <div class="flex items-center gap-2">
    <span
      class="inline-block h-5 w-0.5 animate-pulse bg-muted-foreground"
      aria-hidden="true"
    ></span>
    <span class="text-lg text-muted-foreground">Fetching projects…</span>
  </div>
</div>
