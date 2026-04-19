import { DiffEditor } from "@/components/app/project/DiffEditor";
import { Kbd } from "@/components/ui/kbd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authLogic } from "@/lib/logics/authLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import { cn, getCompactRelativeTime } from "@/lib/utils";
import { useActions, useValues } from "kea";
import { Check, ChevronDown, Clock, Search, User as UserIcon, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_AVATAR,
  filterByTimeRange,
  formatFullDate,
  formatIsoDayLabel,
  getAuthorStats,
  getPatchStats,
  isoDayKeyFromString,
  TIME_RANGES,
} from "./shared";
import { YearHeatmap } from "./YearHeatmap";

export function V9Dropdowns() {
  const { patches, selectedHistoryChangeId } = useValues(projectLogic);
  const { selectHistoryChange } = useActions(projectLogic);
  const { userData } = useValues(authLogic);

  const [query, setQuery] = useState("");
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<
    string | null
  >(null);
  const [timeRangeKey, setTimeRangeKey] = useState<string>("all");
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [timeOpen, setTimeOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const authors = useMemo(() => getAuthorStats(patches), [patches]);
  const selectedAuthor = authors.find((a) => a.id === selectedAuthorFilter);
  const selectedTimeRange = TIME_RANGES.find((r) => r.key === timeRangeKey);

  const filtered = useMemo(() => {
    let result = patches;
    result = filterByTimeRange(result, selectedTimeRange?.days ?? null);
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
  }, [
    patches,
    query,
    selectedAuthorFilter,
    selectedTimeRange,
    selectedDayKey,
  ]);

  const maxVolume = useMemo(() => {
    let max = 0;
    for (const p of filtered) {
      const s = getPatchStats(p.content);
      max = Math.max(max, s.additions + s.deletions);
    }
    return max || 1;
  }, [filtered]);

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

      if (filtered.length === 0) return;
      const currentIdx = filtered.findIndex(
        (p) => p.id === selectedHistoryChangeId
      );
      const moveBy = (delta: number) => {
        e.preventDefault();
        const nextIdx =
          currentIdx < 0
            ? 0
            : Math.max(0, Math.min(filtered.length - 1, currentIdx + delta));
        const next = filtered[nextIdx];
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
  }, [filtered, selectedHistoryChangeId, selectHistoryChange]);

  const selectedPatch = patches.find((p) => p.id === selectedHistoryChangeId);

  return (
    <div className="h-full flex bg-background">
      <div className="w-[560px] flex flex-col border-r border-border/50 bg-[#0a0a0a]">
        {/* Unified filter + search row */}
        <div className="flex items-stretch border-b border-border/50 bg-neutral-900">
          {/* Time range dropdown */}
          <Popover open={timeOpen} onOpenChange={setTimeOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 h-10 text-sm hover:bg-neutral-800 cursor-pointer border-r border-border/50"
              >
                <Clock className="size-3.5 text-muted-foreground" />
                <span className="truncate max-w-32">
                  {selectedTimeRange?.label ?? "All time"}
                </span>
                <ChevronDown className="size-3 opacity-60" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={4} className="w-48 p-1">
              {TIME_RANGES.map((r) => {
                const active = r.key === timeRangeKey;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => {
                      setTimeRangeKey(r.key);
                      setTimeOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs cursor-pointer text-left",
                      active
                        ? "bg-primary/15 text-primary"
                        : "hover:bg-neutral-800 text-foreground"
                    )}
                  >
                    <span className="flex-1">{r.label}</span>
                    {active && <Check className="size-3" />}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>

          {/* User dropdown */}
          <Popover open={userOpen} onOpenChange={setUserOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 h-10 text-sm hover:bg-neutral-800 cursor-pointer border-r border-border/50 min-w-0"
              >
                {selectedAuthor ? (
                  <img
                    src={selectedAuthor.avatarUrl || DEFAULT_AVATAR}
                    alt=""
                    className="size-4 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <UserIcon className="size-3.5 text-muted-foreground" />
                )}
                <span className="truncate max-w-28">
                  {selectedAuthor ? selectedAuthor.displayName : "Anyone"}
                </span>
                <ChevronDown className="size-3 opacity-60 flex-shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={4} className="w-56 p-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedAuthorFilter(null);
                  setUserOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs cursor-pointer text-left",
                  !selectedAuthorFilter
                    ? "bg-primary/15 text-primary"
                    : "hover:bg-neutral-800 text-foreground"
                )}
              >
                <UserIcon className="size-3.5 text-muted-foreground flex-shrink-0" />
                <span className="flex-1">Anyone</span>
                {!selectedAuthorFilter && <Check className="size-3" />}
              </button>
              <div className="h-px bg-border/50 my-1" />
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {authors.map((a) => {
                  const active = selectedAuthorFilter === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setSelectedAuthorFilter(active ? null : a.id);
                        setUserOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs cursor-pointer text-left",
                        active
                          ? "bg-primary/15 text-primary"
                          : "hover:bg-neutral-800 text-foreground"
                      )}
                    >
                      <img
                        src={a.avatarUrl || DEFAULT_AVATAR}
                        alt=""
                        className="size-5 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="flex-1 truncate">{a.displayName}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {a.count}
                      </span>
                      {active && <Check className="size-3" />}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Search input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by author, email or content…"
              className="w-full h-10 bg-transparent border-0 pl-10 pr-10 text-sm font-mono placeholder:text-muted-foreground/60 focus:outline-none"
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
        </div>

        {/* Active day chip (set from heatmap) */}
        {selectedDayKey && (
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 bg-card/30 text-[11px] text-muted-foreground">
            <span>Showing edits from</span>
            <button
              type="button"
              onClick={() => setSelectedDayKey(null)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/40 text-primary cursor-pointer hover:bg-primary/20"
            >
              {formatIsoDayLabel(selectedDayKey)}
              <X className="size-2.5" />
            </button>
          </div>
        )}

        {/* Minimal list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No results
            </div>
          ) : (
            filtered.map((patch) => {
              const isSelected = patch.id === selectedHistoryChangeId;
              const stats = getPatchStats(patch.content);
              const isMine = patch.author.id === userData?.id;
              const volume = stats.additions + stats.deletions;
              const addRatio = stats.additions / Math.max(volume, 1);
              const barWidthPct = (volume / maxVolume) * 100;

              return (
                <button
                  key={patch.id}
                  onClick={() => selectHistoryChange(patch.id, patch.content)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 border-l-2 cursor-pointer transition-colors text-left",
                    isSelected
                      ? "bg-neutral-900 border-primary"
                      : "border-transparent hover:bg-neutral-900/60"
                  )}
                >
                  <img
                    src={patch.author.avatarUrl || DEFAULT_AVATAR}
                    alt=""
                    className="size-5 rounded-full object-cover flex-shrink-0"
                  />
                  <span
                    className={cn(
                      "text-sm truncate flex-1 min-w-0",
                      isSelected
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {patch.author.displayName}
                    {isMine && (
                      <span className="ml-1 text-primary/70 text-[11px]">
                        · you
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-mono tabular-nums">
                      <span className="text-emerald-400">
                        +{stats.additions}
                      </span>{" "}
                      <span className="text-rose-400">
                        -{stats.deletions}
                      </span>
                    </span>
                    <div className="w-[80px] h-1 bg-neutral-800/60 flex overflow-hidden rounded-full">
                      <div
                        className="h-full bg-emerald-500/80"
                        style={{
                          width: `${barWidthPct * addRatio}%`,
                        }}
                      />
                      <div
                        className="h-full bg-rose-500/80"
                        style={{
                          width: `${barWidthPct * (1 - addRatio)}%`,
                        }}
                      />
                    </div>
                    <span
                      className="text-[11px] text-muted-foreground tabular-nums w-10 text-right"
                      title={formatFullDate(patch.createdAt)}
                    >
                      {getCompactRelativeTime(patch.createdAt)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Heatmap — bottom */}
        <div className="px-4 pt-3 pb-3 border-t border-border/50 bg-card/20">
          <YearHeatmap
            patches={patches}
            selectedDayKey={selectedDayKey}
            onDayClick={setSelectedDayKey}
          />
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
