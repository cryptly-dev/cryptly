<script lang="ts">
  import { onMount } from 'svelte';
  import { cn } from '$lib/utils';

  // GripVertical's six dots — same geometry as `frontend/src/components/ui/GripLoader.tsx`
  const GRIP_PERIMETER = [
    { cx: 9, cy: 5 },
    { cx: 15, cy: 5 },
    { cx: 15, cy: 12 },
    { cx: 15, cy: 19 },
    { cx: 9, cy: 19 },
    { cx: 9, cy: 12 },
  ];

  const STEP_MS = 130;
  const CYCLE_MS = STEP_MS * 6;
  const ALLOWED_START_OFFSETS = [0, 2, 3, 5].map((s) => s * STEP_MS);

  let {
    color,
    class: className = '',
  }: {
    color: string;
    class?: string;
  } = $props();

  const startOffsetMs =
    ALLOWED_START_OFFSETS[Math.floor(Math.random() * ALLOWED_START_OFFSETS.length)]!;

  onMount(() => {
    if (document.getElementById('grip-loader-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'grip-loader-keyframes';
    style.textContent = `
    @keyframes grip-loader-fade {
      0% { opacity: 0.12; }
      16.667% { opacity: 1; }
      50% { opacity: 1; }
      66.667% { opacity: 0.12; }
      100% { opacity: 0.12; }
    }
    .grip-loader-dot {
      animation: grip-loader-fade ${CYCLE_MS}ms linear infinite;
    }
  `;
    document.head.appendChild(style);
  });
</script>

<svg
  viewBox="0 0 24 24"
  class={cn('h-3.5 w-3.5', className)}
  role="status"
  aria-label="Loading"
>
  {#each GRIP_PERIMETER as pos, i (i)}
    {@const fadeInStart = ((i + 4) * STEP_MS) % CYCLE_MS}
    {@const phase = (((startOffsetMs - fadeInStart) % CYCLE_MS) + CYCLE_MS) % CYCLE_MS}
    <circle
      cx={pos.cx}
      cy={pos.cy}
      r={2}
      fill={color}
      class="grip-loader-dot"
      style="animation-delay: -{phase}ms"
    />
  {/each}
</svg>
