<script lang="ts">
  import { cn } from '$lib/utils';

  let {
    label = 'Loading',
    class: className = '',
  }: {
    label?: string;
    class?: string;
  } = $props();
</script>

<div
  role="status"
  aria-live="polite"
  class={cn('flex items-center justify-center text-muted-foreground', className)}
>
  <span class="flex flex-col items-center gap-3">
    <span
      aria-hidden="true"
      class="h-px w-8 origin-center rounded-full bg-[#DDA15E]/80 shadow-[0_0_14px_rgba(221,161,94,0.35)] animate-pulse"
    ></span>
    <span class="text-[12px] tracking-wide text-muted-foreground/70">{label}</span>
  </span>
</div>
