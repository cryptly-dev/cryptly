<script lang="ts">
  let { title, description }: { title: string; description: string } = $props();
</script>

<div class="rounded-lg border border-dashed border-border bg-card p-8">
  <h2 class="font-semibold">{title}</h2>
  <p class="mt-1 text-sm text-muted-foreground">{description}</p>
</div>
