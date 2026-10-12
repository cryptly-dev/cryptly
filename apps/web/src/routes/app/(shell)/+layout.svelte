<script lang="ts">
  import AppShell from "$lib/shell/ui/AppShell.svelte";

  let { children } = $props();
</script>

<AppShell>{@render children()}</AppShell>
