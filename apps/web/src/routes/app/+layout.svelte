<script lang="ts">
  let { children } = $props();
</script>

<div class="relative min-h-screen-mobile overflow-hidden bg-background">
  <div class="relative z-10 h-screen-mobile">
    {@render children()}
  </div>
</div>
