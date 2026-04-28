<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    void goto('/app/login', { replaceState: true });
  });
</script>

<p class="p-8 text-sm text-muted-foreground">Redirecting…</p>
