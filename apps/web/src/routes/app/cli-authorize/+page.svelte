<script lang="ts">
  import CliAuthorizePage from '$lib/auth/ui/CliAuthorizePage.svelte';

  let { data } = $props();
</script>

<CliAuthorizePage sessionId={data.sessionId} />
