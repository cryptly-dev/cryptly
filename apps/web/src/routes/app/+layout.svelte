<script lang="ts">
  import AppLayout from '$lib/app/ui/AppLayout.svelte';

  let { children } = $props();
</script>

<AppLayout>
  {@render children()}
</AppLayout>
