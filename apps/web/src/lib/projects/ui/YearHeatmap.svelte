<script lang="ts">
  import { onMount } from 'svelte';

  let {
    patches,
    selectedDayKey,
    onDayClick
  }: {
    patches: { createdAt: string }[];
    selectedDayKey: string | null;
    onDayClick: (key: string | null) => void;
  } = $props();

  const SQ = 12;
  const GAP = 3;
  const LABEL_WIDTH = 26;
  const MIN_WEEKS = 4;
  const FALLBACK_WEEKS = 26;

  let root = $state<HTMLDivElement | null>(null);
  let containerWidth = $state(0);
  let hover = $state<{ x: number; y: number; day: DayCell } | null>(null);

  interface DayCell {
    date: Date;
    count: number;
    isFuture: boolean;
    key: string;
  }

  onMount(() => {
    if (!root) return;
    containerWidth = root.getBoundingClientRect().width;
    const ro = new ResizeObserver((entries) => {
      containerWidth = entries[0]?.contentRect.width ?? 0;
    });
    ro.observe(root);
    return () => ro.disconnect();
  });

  const effectiveWeeks = $derived.by(() => {
    if (containerWidth <= 0) return FALLBACK_WEEKS;
    const available = containerWidth - LABEL_WIDTH;
    const count = Math.floor((available + GAP) / (SQ + GAP));
    return Math.max(MIN_WEEKS, count);
  });

  const heatmapData = $derived.by(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));
    const start = new Date(end);
    start.setDate(start.getDate() - (effectiveWeeks * 7 - 1));

    const dayMap = new Map<string, number>();
    for (const patch of patches) {
      const d = new Date(patch.createdAt);
      d.setHours(0, 0, 0, 0);
      const key = dateToISODayKey(d);
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
    }

    const weeks: DayCell[][] = [];
    const monthLabels: { weekIdx: number; label: string }[] = [];
    const monthsSeen = new Set<string>();
    const cursor = new Date(start);

    for (let weekIdx = 0; weekIdx < effectiveWeeks; weekIdx += 1) {
      const week: DayCell[] = [];
      for (let dayIdx = 0; dayIdx < 7; dayIdx += 1) {
        const date = new Date(cursor);
        const key = dateToISODayKey(date);
        week.push({
          date,
          count: dayMap.get(key) || 0,
          isFuture: date > today,
          key
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      const firstDay = week[0]!;
      if (firstDay.date.getDate() <= 7) {
        const monthKey = `${firstDay.date.getFullYear()}-${firstDay.date.getMonth()}`;
        if (!monthsSeen.has(monthKey)) {
          monthsSeen.add(monthKey);
          monthLabels.push({
            weekIdx,
            label: firstDay.date.toLocaleDateString('en-US', { month: 'short' })
          });
        }
      }
      weeks.push(week);
    }

    return { weeks, monthLabels };
  });

  const gridWidth = $derived(effectiveWeeks * (SQ + GAP) - GAP);

  function getIntensity(count: number): string {
    if (count === 0) return 'rgba(255,255,255,0.04)';
    if (count === 1) return 'rgba(201,178,135,0.35)';
    if (count < 4) return 'rgba(201,178,135,0.55)';
    if (count < 8) return 'rgba(201,178,135,0.85)';
    return 'rgb(201,178,135)';
  }

  function dateToISODayKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatTooltip(date: Date, count: number): string {
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    if (count === 0) return `No edits · ${formatted}`;
    return `${count} edit${count === 1 ? '' : 's'} · ${formatted}`;
  }
</script>

<div bind:this={root} class="relative w-full">
  <div class="relative mb-1 h-3" style={`margin-left: ${LABEL_WIDTH}px; width: ${gridWidth}px`}>
    {#each heatmapData.monthLabels as month (month.weekIdx)}
      <span
        class="absolute top-0 text-[9px] font-medium text-muted-foreground"
        style={`left: ${month.weekIdx * (SQ + GAP)}px`}
      >
        {month.label}
      </span>
    {/each}
  </div>

  <div class="flex items-start">
    <div
      class="relative shrink-0 text-[9px] text-muted-foreground"
      style={`width: ${LABEL_WIDTH}px; height: ${7 * (SQ + GAP) - GAP}px`}
    >
      <span class="absolute" style={`top: ${(SQ + GAP) * 1 - 2}px`}>Mon</span>
      <span class="absolute" style={`top: ${(SQ + GAP) * 3 - 2}px`}>Wed</span>
      <span class="absolute" style={`top: ${(SQ + GAP) * 5 - 2}px`}>Fri</span>
    </div>

    <div
      class="flex"
      role="presentation"
      style={`gap: ${GAP}px`}
      onmouseleave={() => (hover = null)}
    >
      {#each heatmapData.weeks as week, weekIndex (weekIndex)}
        <div class="flex flex-col" style={`gap: ${GAP}px`}>
          {#each week as day, dayIndex (day.key)}
            {#if day.isFuture}
              <div style={`width: ${SQ}px; height: ${SQ}px`}></div>
            {:else}
              {@const isSelected = selectedDayKey === day.key}
              <button
                type="button"
                aria-label={formatTooltip(day.date, day.count)}
                class={`relative rounded-[2px] transition-all duration-150 hover:z-20 hover:scale-[1.6] hover:ring-1 hover:ring-white/60 ${
                  isSelected ? 'z-20 scale-[1.6] shadow-md shadow-primary/60 ring-2 ring-primary' : ''
                }`}
                style={`width: ${SQ}px; height: ${SQ}px; background-color: ${getIntensity(day.count)}`}
                onmouseenter={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const parentRect = root?.getBoundingClientRect();
                  if (parentRect) {
                    hover = {
                      x: rect.left - parentRect.left + rect.width / 2,
                      y: rect.top - parentRect.top,
                      day
                    };
                  }
                }}
                onclick={() => onDayClick(isSelected ? null : day.key)}
              ></button>
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <div class="mt-2 flex items-center justify-end gap-1 text-[9px] text-muted-foreground">
    <span>Less</span>
    {#each [0, 1, 3, 6, 9] as level}
      <span
        class="rounded-[2px]"
        style={`width: ${SQ}px; height: ${SQ}px; background-color: ${getIntensity(level)}`}
      ></span>
    {/each}
    <span>More</span>
  </div>

  {#if hover}
    <div
      class="pointer-events-none absolute z-30 -translate-x-1/2"
      style={`left: ${hover.x}px; top: ${hover.y - 6}px`}
    >
      <div
        class="-translate-y-full whitespace-nowrap rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-[11px] shadow-lg"
      >
        {formatTooltip(hover.day.date, hover.day.count)}
      </div>
    </div>
  {/if}
</div>
