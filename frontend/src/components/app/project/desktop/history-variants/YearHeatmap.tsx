import type { Patch } from "@/lib/logics/projectLogic";
import { cn } from "@/lib/utils";
import { useMemo, useRef, useState } from "react";
import { dateToISODayKey } from "./shared";

interface DayCell {
  date: Date;
  count: number;
  isFuture: boolean;
  key: string;
}

interface HoverState {
  x: number;
  y: number;
  day: DayCell;
}

const WEEKS = 52;
const SQ = 9;
const GAP = 2;
const LABEL_WIDTH = 22;

function getIntensity(count: number): string {
  if (count === 0) return "rgba(255,255,255,0.04)";
  if (count === 1) return "rgba(96,165,250,0.35)";
  if (count < 4) return "rgba(96,165,250,0.55)";
  if (count < 8) return "rgba(96,165,250,0.8)";
  return "rgb(96,165,250)";
}

function formatTooltip(date: Date, count: number): string {
  const fmt = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (count === 0) return `No edits · ${fmt}`;
  return `${count} edit${count === 1 ? "" : "s"} · ${fmt}`;
}

export function YearHeatmap({
  patches,
  selectedDayKey,
  onDayClick,
}: {
  patches: Patch[];
  selectedDayKey: string | null;
  onDayClick: (key: string | null) => void;
}) {
  const [hover, setHover] = useState<HoverState | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));
    const start = new Date(end);
    start.setDate(start.getDate() - (WEEKS * 7 - 1));

    const dayMap = new Map<string, number>();
    for (const p of patches) {
      const d = new Date(p.createdAt);
      d.setHours(0, 0, 0, 0);
      const k = dateToISODayKey(d);
      dayMap.set(k, (dayMap.get(k) || 0) + 1);
    }

    const weeks: DayCell[][] = [];
    const monthLabels: { weekIdx: number; label: string }[] = [];
    const monthsSeen = new Set<string>();
    const cursor = new Date(start);

    for (let w = 0; w < WEEKS; w++) {
      const week: DayCell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(cursor);
        const k = dateToISODayKey(date);
        week.push({
          date,
          count: dayMap.get(k) || 0,
          isFuture: date > today,
          key: k,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      const firstDay = week[0];
      if (firstDay.date.getDate() <= 7) {
        const mKey = `${firstDay.date.getFullYear()}-${firstDay.date.getMonth()}`;
        if (!monthsSeen.has(mKey)) {
          monthsSeen.add(mKey);
          monthLabels.push({
            weekIdx: w,
            label: firstDay.date.toLocaleDateString("en-US", {
              month: "short",
            }),
          });
        }
      }
      weeks.push(week);
    }
    return { weeks, monthLabels };
  }, [patches]);

  const gridWidth = WEEKS * (SQ + GAP);

  return (
    <div ref={rootRef} className="relative">
      {/* Month labels */}
      <div className="relative h-3 mb-1" style={{ marginLeft: LABEL_WIDTH, width: gridWidth }}>
        {monthLabels.map((m) => (
          <span
            key={m.weekIdx}
            className="absolute top-0 text-[9px] text-muted-foreground font-medium"
            style={{ left: m.weekIdx * (SQ + GAP) }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex items-start">
        {/* Day labels */}
        <div
          className="relative flex-shrink-0 text-[9px] text-muted-foreground"
          style={{ width: LABEL_WIDTH, height: 7 * (SQ + GAP) - GAP }}
        >
          <span className="absolute" style={{ top: (SQ + GAP) * 1 - 2 }}>
            Mon
          </span>
          <span className="absolute" style={{ top: (SQ + GAP) * 3 - 2 }}>
            Wed
          </span>
          <span className="absolute" style={{ top: (SQ + GAP) * 5 - 2 }}>
            Fri
          </span>
        </div>

        {/* Grid */}
        <div
          className="flex"
          style={{ gap: GAP }}
          onMouseLeave={() => setHover(null)}
        >
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className="flex flex-col"
              style={{ gap: GAP }}
            >
              {week.map((day, di) => {
                if (day.isFuture) {
                  return <div key={di} style={{ width: SQ, height: SQ }} />;
                }
                const isSelected = selectedDayKey === day.key;
                return (
                  <button
                    key={di}
                    type="button"
                    onClick={() => onDayClick(isSelected ? null : day.key)}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget as HTMLElement;
                      const rect = btn.getBoundingClientRect();
                      const pRect = rootRef.current?.getBoundingClientRect();
                      if (pRect) {
                        setHover({
                          x: rect.left - pRect.left + rect.width / 2,
                          y: rect.top - pRect.top,
                          day,
                        });
                      }
                    }}
                    className={cn(
                      "rounded-[2px] cursor-pointer transition-all duration-150 hover:scale-[1.6] hover:ring-1 hover:ring-white/60 hover:z-20 relative",
                      isSelected &&
                        "ring-2 ring-primary scale-[1.6] shadow-md shadow-primary/60 z-20"
                    )}
                    style={{
                      width: SQ,
                      height: SQ,
                      backgroundColor: getIntensity(day.count),
                    }}
                    aria-label={formatTooltip(day.date, day.count)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2 text-[9px] text-muted-foreground">
        <span>Less</span>
        {[0, 1, 3, 6, 9].map((level, i) => (
          <span
            key={i}
            className="rounded-[2px]"
            style={{
              width: SQ,
              height: SQ,
              backgroundColor: getIntensity(level),
            }}
          />
        ))}
        <span>More</span>
      </div>

      {/* Tooltip */}
      {hover && (
        <div
          className="pointer-events-none absolute z-30 -translate-x-1/2"
          style={{ left: hover.x, top: hover.y - 6 }}
        >
          <div className="-translate-y-full bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1 text-[11px] whitespace-nowrap shadow-lg">
            {formatTooltip(hover.day.date, hover.day.count)}
          </div>
        </div>
      )}
    </div>
  );
}
