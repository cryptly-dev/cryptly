import { DiffEditor } from "@/components/app/project/DiffEditor";
import { projectLogic, type Patch } from "@/lib/logics/projectLogic";
import { cn, getRelativeTime } from "@/lib/utils";
import { useActions, useValues } from "kea";
import { ChevronDown, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  buildHourlyHeatmap,
  DEFAULT_AVATAR,
  formatFullDate,
  formatTimeOnly,
  getPatchStats,
  getRelativeGroup,
  GROUP_ORDER,
} from "./shared";

interface Group {
  key: string;
  patches: Patch[];
}

export function V5Grouped() {
  const { patches, selectedHistoryChangeId } = useValues(projectLogic);
  const { selectHistoryChange } = useActions(projectLogic);

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Patch[]>();
    for (const patch of patches) {
      const key = getRelativeGroup(patch.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(patch);
    }
    return GROUP_ORDER.filter((k) => map.has(k)).map((key) => ({
      key,
      patches: map.get(key)!,
    }));
  }, [patches]);

  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectedPatch = patches.find((p) => p.id === selectedHistoryChangeId);

  const heatmap = useMemo(() => buildHourlyHeatmap(patches), [patches]);
  const heatmapMax = useMemo(() => {
    let max = 0;
    for (const row of heatmap) for (const v of row) max = Math.max(max, v);
    return max || 1;
  }, [heatmap]);

  return (
    <div className="h-full flex bg-background">
      <div className="w-[440px] flex flex-col border-r border-border/50 bg-card/20">
        {/* Heatmap header */}
        <div className="px-4 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-3.5 text-primary" />
            <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              Activity heatmap · by hour
            </h3>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="flex flex-col justify-between text-[9px] text-muted-foreground pr-1 py-0.5">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="h-[10px] leading-[10px]">
                  {d}
                </span>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-24 gap-[2px]" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
              {heatmap.flatMap((row, dayIdx) =>
                row.map((count, hour) => {
                  const intensity = count / heatmapMax;
                  return (
                    <div
                      key={`${dayIdx}-${hour}`}
                      className="aspect-square rounded-[2px]"
                      style={{
                        backgroundColor:
                          count === 0
                            ? "rgba(255,255,255,0.03)"
                            : `rgba(96,165,250,${0.2 + intensity * 0.8})`,
                      }}
                      title={`${count} edits at ${hour}:00`}
                    />
                  );
                })
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Groups */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {groups.map((group) => {
            const isCollapsed = collapsed.has(group.key);
            const contributors = Array.from(
              new Map(
                group.patches.map((p) => [p.author.id, p.author])
              ).values()
            );
            const groupTotals = group.patches.reduce(
              (acc, p) => {
                const s = getPatchStats(p.content);
                acc.additions += s.additions;
                acc.deletions += s.deletions;
                return acc;
              },
              { additions: 0, deletions: 0 }
            );

            return (
              <div key={group.key} className="border-b border-border/50">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-900/60 cursor-pointer transition-colors sticky top-0 bg-card/50 backdrop-blur-md z-10"
                >
                  <motion.span
                    animate={{ rotate: isCollapsed ? -90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </motion.span>
                  <span className="text-xs font-semibold text-foreground">
                    {group.key}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-muted-foreground font-mono">
                    {group.patches.length}
                  </span>
                  <div className="flex-1 flex items-center justify-end gap-2.5">
                    <div className="flex -space-x-1.5">
                      {contributors.slice(0, 4).map((c) => (
                        <img
                          key={c.id}
                          src={c.avatarUrl || DEFAULT_AVATAR}
                          alt=""
                          className="size-5 rounded-full ring-2 ring-card object-cover"
                          title={c.displayName}
                        />
                      ))}
                      {contributors.length > 4 && (
                        <span className="size-5 rounded-full bg-neutral-700 ring-2 ring-card flex items-center justify-center text-[9px] font-semibold">
                          +{contributors.length - 4}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono tabular-nums flex items-center gap-1.5">
                      <span className="text-emerald-400">
                        +{groupTotals.additions}
                      </span>
                      <span className="text-rose-400">
                        -{groupTotals.deletions}
                      </span>
                    </span>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-2 pt-1 space-y-1">
                        {group.patches.map((patch) => {
                          const isSelected =
                            patch.id === selectedHistoryChangeId;
                          const s = getPatchStats(patch.content);
                          const volume = s.additions + s.deletions;
                          const addR = s.additions / Math.max(volume, 1);
                          return (
                            <button
                              key={patch.id}
                              onClick={() =>
                                selectHistoryChange(patch.id, patch.content)
                              }
                              className={cn(
                                "w-full text-left p-2.5 rounded-lg flex items-center gap-2.5 cursor-pointer transition-all",
                                isSelected
                                  ? "bg-primary/10 ring-1 ring-primary/40"
                                  : "hover:bg-neutral-900/80"
                              )}
                            >
                              <img
                                src={
                                  patch.author.avatarUrl || DEFAULT_AVATAR
                                }
                                alt=""
                                className="size-7 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-medium truncate">
                                    {patch.author.displayName}
                                  </span>
                                  <span
                                    className="text-[10px] text-muted-foreground whitespace-nowrap"
                                    title={formatFullDate(patch.createdAt)}
                                  >
                                    {group.key === "Today"
                                      ? formatTimeOnly(patch.createdAt)
                                      : getRelativeTime(patch.createdAt)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="h-1 flex-1 rounded-full bg-neutral-800 overflow-hidden flex">
                                    <div
                                      className="bg-emerald-500"
                                      style={{ width: `${addR * 100}%` }}
                                    />
                                    <div
                                      className="bg-rose-500"
                                      style={{ width: `${(1 - addR) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                                    <span className="text-emerald-400">
                                      +{s.additions}
                                    </span>{" "}
                                    <span className="text-rose-400">
                                      -{s.deletions}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diff */}
      <div className="flex-1 min-w-0">
        {selectedPatch ? (
          <DiffEditor value={selectedPatch.content} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Expand a group and pick an edit
          </div>
        )}
      </div>
    </div>
  );
}
