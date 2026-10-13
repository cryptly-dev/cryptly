<script lang="ts">
  import { X } from "lucide-svelte";
  import Button from "$lib/ui/Button.svelte";
  import Well from "$lib/ui/Well.svelte";
  import { dayKey, shortDay } from "../format";

  /** Saves per day over the last 26 weeks; clicking a day filters the version list to it. */
  let {
    versions,
    day,
    onselect,
  }: {
    versions: readonly { createdAt: string }[];
    /** The day the version list is filtered to, `YYYY-MM-DD`. */
    day: string | null;
    onselect: (day: string | null) => void;
  } = $props();

  const WEEKS = 26;
  const SHADES = ["7%", "22%", "42%", "68%"];

  let hovered = $state<{ key: string; count: number } | null>(null);

  const cells = $derived.by(() => {
    const counts: Record<string, number> = {};
    for (const v of versions) {
      const key = dayKey(v.createdAt);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    const now = new Date();
    // Columns are Sunday-first weeks; the last one is this week, with future days left blank.
    const first = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() - (WEEKS - 1) * 7,
    );
    return Array.from({ length: WEEKS * 7 }, (_, i) => {
      const date = new Date(
        first.getFullYear(),
        first.getMonth(),
        first.getDate() + i,
      );
      const key = dayKey(date);
      const count = counts[key] ?? 0;
      const level = count === 0 ? 0 : count === 1 ? 1 : count < 4 ? 2 : 3;
      return { key, count, level, future: date > now };
    });
  });

  const plural = (n: number) => `${n} version${n === 1 ? "" : "s"}`;
</script>

<Well
  title="Activity"
  note={hovered
    ? `${shortDay(hovered.key)} · ${plural(hovered.count)}`
    : "6 months"}
  cardClass="grid grid-flow-col grid-rows-[repeat(7,9px)] auto-cols-[9px] justify-between gap-0.5"
>
  {#snippet trail()}
    {#if day}
      <Button
        size="sm"
        aria-label={`Show all days, not only ${shortDay(day)}`}
        onclick={() => onselect(null)}
      >
        {shortDay(day)}
        <X class="text-fg3" />
      </Button>
    {/if}
  {/snippet}
  {#each cells as cell (cell.key)}
    {#if cell.count > 0}
      <button
        type="button"
        aria-label={`${shortDay(cell.key)}, ${plural(cell.count)}`}
        aria-pressed={day === cell.key}
        class="rounded-[2px] bg-[color-mix(in_oklab,var(--fg)_var(--l),var(--s100))] hover:shadow-[0_0_0_1px_var(--fg3)] aria-pressed:shadow-[0_0_0_1.5px_var(--fg)]"
        style={`--l:${SHADES[cell.level]}`}
        onclick={() => onselect(day === cell.key ? null : cell.key)}
        onpointerenter={() => (hovered = cell)}
        onpointerleave={() => (hovered = null)}
        onfocus={() => (hovered = cell)}
        onblur={() => (hovered = null)}
      ></button>
    {:else}
      <i
        role="presentation"
        class="rounded-[2px] bg-[color-mix(in_oklab,var(--fg)_var(--l),var(--s100))]"
        style={`--l:${cell.future ? "0%" : SHADES[0]}`}
        onpointerenter={() => (hovered = cell.future ? null : cell)}
        onpointerleave={() => (hovered = null)}
      ></i>
    {/if}
  {/each}
</Well>
