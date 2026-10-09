<script lang="ts">
  let { children } = $props();
</script>

<div class="min-h-screen-mobile relative overflow-hidden bg-background">
  <div class="h-screen-mobile relative z-10">
    {@render children()}
  </div>
</div>
