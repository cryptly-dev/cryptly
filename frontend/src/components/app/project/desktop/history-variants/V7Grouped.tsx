import { DiffEditor } from "@/components/app/project/DiffEditor";
import { Kbd } from "@/components/ui/kbd";
import { authLogic } from "@/lib/logics/authLogic";
import { projectLogic, type Patch } from "@/lib/logics/projectLogic";
import { cn, getRelativeTime } from "@/lib/utils";
import { useActions, useValues } from "kea";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_AVATAR,
  filterByTimeRange,
  formatFullDate,
  formatIsoDayLabel,
  formatTimeOnly,
  getAuthorStats,
  getPatchStats,
  getRelativeGroup,
  GROUP_ORDER,
  isoDayKeyFromString,
  TIME_RANGES,
} from "./shared";
import { YearHeatmap } from "./YearHeatmap";

interface Group {
  key: string;
  patches: Patch[];
}

export function V7Grouped() {
  const { patches, selectedHistoryChangeId } = useValues(projectLogic);
  const { selectHistoryChange } = useActions(projectLogic);
  const { userData } = useValues(authLogic);

  const [query, setQuery] = useState("");
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<
    string | null
  >(null);
  const [timeRangeKey, setTimeRangeKey] = useState<string>("all");
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const authors = useMemo(() => getAuthorStats(patches), [patches]);

  const filtered = useMemo(() => {
    let result = patches;
    const timeRange = TIME_RANGES.find((r) => r.key === timeRangeKey);
    result = filterByTimeRange(result, timeRange?.days ?? null);
    if (selectedAuthorFilter) {
      result = result.filter((p) => p.author.id === selectedAuthorFilter);
    }
    if (selectedDayKey) {
      result = result.filter(
        (p) => isoDayKeyFromString(p.createdAt) === selectedDayKey
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.author.displayName.toLowerCase().includes(q) ||
          p.author.email?.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      );
    }
    return result;
  }, [patches, query, selectedAuthorFilter, timeRangeKey, selectedDayKey]);

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Patch[]>();
    for (const patch of filtered) {
      const key = getRelativeGroup(patch.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(patch);
    }
    return GROUP_ORDER.filter((k) => map.has(k)).map((key) => ({
      key,
      patches: map.get(key)!,
    }));
  }, [filtered]);

  const maxVolume = useMemo(() => {
    let max = 0;
    for (const p of filtered) {
      const s = getPatchStats(p.content);
      max = Math.max(max, s.additions + s.deletions);
    }
    return max || 1;
  }, [filtered]);

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typingInInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "/" && !typingInInput) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (typingInInput && target !== inputRef.current) return;

      // Build navigation list from visible (non-collapsed) groups
      const visibleList: Patch[] = [];
      for (const g of groups) {
        if (!collapsed.has(g.key)) visibleList.push(...g.patches);
      }
      if (visibleList.length === 0) return;

      const currentIdx = visibleList.findIndex(
        (p) => p.id === selectedHistoryChangeId
      );
      const moveBy = (delta: number) => {
        e.preventDefault();
        const nextIdx =
          currentIdx < 0
            ? 0
            : Math.max(
                0,
                Math.min(visibleList.length - 1, currentIdx + delta)
              );
        const next = visibleList[nextIdx];
        if (next) selectHistoryChange(next.id, next.content);
      };
      if ((e.key === "j" || e.key === "ArrowDown") && !e.metaKey && !e.ctrlKey) {
        moveBy(1);
      } else if (
        (e.key === "k" || e.key === "ArrowUp") &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        moveBy(-1);
      } else if (e.key === "Escape" && target === inputRef.current) {
        setQuery("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [groups, collapsed, selectedHistoryChangeId, selectHistoryChange]);

  const selectedPatch = patches.find((p) => p.id === selectedHistoryChangeId);

  return (
    <div className="h-full flex bg-background">
      <div className="w-[560px] flex flex-col border-r border-border/50 bg-card/20">
        {/* Heatmap */}
        <div className="px-4 pt-4 pb-3 border-b border-border/50">
          <YearHeatmap
            patches={patches}
            selectedDayKey={selectedDayKey}
            onDayClick={setSelectedDayKey}
          />
        </div>

        {/* Search + filters */}
        <div className="px-3 pt-3 pb-2 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by author, email or content…"
              className="w-full h-9 bg-neutral-900 border border-border/50 rounded-md pl-9 pr-16 text-sm font-mono placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-sm hover:bg-neutral-800 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="size-3" />
                </button>
              ) : (
                <Kbd className="bg-neutral-800 text-neutral-400 border border-border/60">
                  /
                </Kbd>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto custom-scrollbar pb-1">
            <Filter className="size-3 text-muted-foreground flex-shrink-0" />
            {selectedDayKey && (
              <ChipFilter active onClick={() => setSelectedDayKey(null)}>
                {formatIsoDayLabel(selectedDayKey)}
                <X className="inline size-2.5 ml-0.5" />
              </ChipFilter>
            )}
            {TIME_RANGES.map((r) => (
              <ChipFilter
                key={r.key}
                active={timeRangeKey === r.key}
                onClick={() => setTimeRangeKey(r.key)}
              >
                {r.label}
              </ChipFilter>
            ))}
            <span className="w-px h-4 bg-border/70 mx-1 flex-shrink-0" />
            {authors.map((a) => (
              <ChipFilter
                key={a.id}
                active={selectedAuthorFilter === a.id}
                onClick={() =>
                  setSelectedAuthorFilter(
                    selectedAuthorFilter === a.id ? null : a.id
                  )
                }
              >
                {a.displayName.split(" ")[0]}{" "}
                <span className="opacity-60">({a.count})</span>
              </ChipFilter>
            ))}
          </div>
        </div>

        {/* Grouped list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {groups.length === 0 ? (
            <div className="text-center pt-12 text-sm text-muted-foreground">
              No edits match the current filters.
            </div>
          ) : (
            groups.map((group) => {
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
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-900/60 cursor-pointer transition-colors sticky top-0 bg-card/80 backdrop-blur-md z-10"
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
                        <div className="px-3 pb-2 pt-1 space-y-1.5">
                          {group.patches.map((patch) => {
                            const isSelected =
                              patch.id === selectedHistoryChangeId;
                            const stats = getPatchStats(patch.content);
                            const isMine = patch.author.id === userData?.id;
                            const volume = stats.additions + stats.deletions;
                            const addRatio =
                              stats.additions / Math.max(volume, 1);
                            return (
                              <button
                                key={patch.id}
                                onClick={() =>
                                  selectHistoryChange(patch.id, patch.content)
                                }
                                className={cn(
                                  "w-full text-left rounded-xl border p-3 transition-all duration-150 cursor-pointer",
                                  isSelected
                                    ? "bg-gradient-to-br from-primary/10 via-card/60 to-card/40 border-primary/40 shadow-lg shadow-primary/5"
                                    : "bg-card/40 border-border/50 hover:border-border hover:bg-card/70"
                                )}
                              >
                                <div className="flex items-center gap-2.5 mb-2">
                                  <img
                                    src={
                                      patch.author.avatarUrl || DEFAULT_AVATAR
                                    }
                                    alt=""
                                    className={cn(
                                      "size-7 rounded-full object-cover ring-2 flex-shrink-0",
                                      isSelected
                                        ? "ring-primary/60"
                                        : "ring-neutral-800"
                                    )}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm font-medium truncate">
                                        {patch.author.displayName}
                                      </span>
                                      {isMine && (
                                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-primary/20 text-primary">
                                          You
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span
                                    className="text-[11px] text-muted-foreground whitespace-nowrap"
                                    title={formatFullDate(patch.createdAt)}
                                  >
                                    {group.key === "Today"
                                      ? formatTimeOnly(patch.createdAt)
                                      : getRelativeTime(patch.createdAt)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums flex-shrink-0">
                                    <span className="text-emerald-400 font-semibold">
                                      +{stats.additions}
                                    </span>
                                    <span className="text-rose-400 font-semibold">
                                      -{stats.deletions}
                                    </span>
                                  </div>
                                  <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-neutral-800 flex">
                                    <div
                                      className="h-full bg-emerald-500/80"
                                      style={{
                                        width: `${(volume / maxVolume) * addRatio * 100}%`,
                                      }}
                                    />
                                    <div
                                      className="h-full bg-rose-500/80"
                                      style={{
                                        width: `${(volume / maxVolume) * (1 - addRatio) * 100}%`,
                                      }}
                                    />
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
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-border/50 bg-black/60 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60">
                j
              </Kbd>
              <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60">
                k
              </Kbd>
              <span className="ml-1">navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60">
                /
              </Kbd>
              <span className="ml-1">search</span>
            </span>
          </div>
          <span className="tabular-nums">
            {filtered.length}/{patches.length}
          </span>
        </div>
      </div>

      {/* Diff */}
      <div className="flex-1 min-w-0">
        {selectedPatch ? (
          <DiffEditor value={selectedPatch.content} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Pick an entry to view its changes
          </div>
        )}
      </div>
    </div>
  );
}

function ChipFilter({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2 py-0.5 rounded-sm text-[11px] border cursor-pointer whitespace-nowrap transition-colors flex-shrink-0",
        active
          ? "bg-primary/15 border-primary/40 text-primary"
          : "bg-neutral-900 border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {children}
    </button>
  );
}
