<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  let {
    class: className = '',
    children
  }: {
    class?: string;
    children: Snippet;
  } = $props();
</script>

<div class={cn('mx-auto max-w-6xl px-6', className)}>
  {@render children()}
</div>
