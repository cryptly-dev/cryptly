<script lang="ts" module>
  const TONES = [
    "#d9a066",
    "#7cc4e8",
    "#8fd19e",
    "#e8a0c4",
    "#b9a8f0",
    "#ec9c94",
  ];

  /** Stable tone per seed, so a person or project keeps its color everywhere. */
  export function toneFor(seed: string): string {
    let hash = 0;
    for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    return TONES[Math.abs(hash) % TONES.length]!;
  }
</script>

<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    name,
    src,
    seed,
    size = 20,
    square = false,
    class: className,
  }: {
    name: string;
    src?: string | null;
    /** Color seed; defaults to the name. */
    seed?: string;
    size?: number;
    /** Rounded square (project tiles) instead of a circle. */
    square?: boolean;
    class?: string;
  } = $props();

  let failed = $state(false);
  const initial = $derived((name.trim()[0] ?? "?").toUpperCase());
</script>

{#if src && !failed}
  <img
    {src}
    alt=""
    class={cn(
      "shrink-0 object-cover",
      square ? "rounded-[5px]" : "rounded-full",
      className,
    )}
    style={`width:${size}px;height:${size}px`}
    onerror={() => (failed = true)}
  />
{:else}
  <span
    aria-hidden="true"
    class={cn(
      "grid shrink-0 place-items-center font-bold text-[#1a1612]",
      square ? "rounded-[5px]" : "rounded-full",
      className,
    )}
    style={`width:${size}px;height:${size}px;font-size:${Math.round(size * 0.52)}px;background:${toneFor(seed ?? name)}`}
    >{initial}</span
  >
{/if}
