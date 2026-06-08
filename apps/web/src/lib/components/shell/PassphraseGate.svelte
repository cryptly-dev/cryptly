<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { auth } from '$lib/stores/auth.svelte';

  const shouldSetUpPassphrase = $derived(
    auth.userData !== null &&
      Boolean(auth.userData) &&
      (!auth.userData.publicKey || !auth.userData.privateKeyEncrypted)
  );

  $effect(() => {
    const path = page.url.pathname;
    if (!auth.jwtToken || !shouldSetUpPassphrase) return;
    if (!path.startsWith('/app')) return;
    if (path.startsWith('/app/login')) return;
    if (path.startsWith('/app/set-passphrase')) return;
    if (path.startsWith('/app/callbacks/')) return;
    void goto('/app/set-passphrase', { replaceState: true });
  });
</script>
