<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";

  onMount(() => {
    void goto(resolve("/app/login"), { replaceState: true });
  });
</script>

<p class="p-8 text-sm text-muted-foreground">Redirecting…</p>
