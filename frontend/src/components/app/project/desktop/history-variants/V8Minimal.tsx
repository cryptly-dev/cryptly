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
import { ChevronDown, Search, X } from "lucide-react";
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
  type AuthorStats,
} from "./shared";
import { YearHeatmap } from "./YearHeatmap";

const MAX_VISIBLE_AUTHORS = 3;

export function V8Minimal() {
  const { patches, selectedHistoryChangeId } = useValues(projectLogic);
  const { selectHistoryChange } = useActions(projectLogic);
  const { userData } = useValues(authLogic);

  const [query, setQuery] = useState("");
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<
    string | null
  >(null);
  const [timeRangeKey, setTimeRangeKey] = useState<string>("all");
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [pinnedAuthorIds, setPinnedAuthorIds] = useState<string[]>([]);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const authors = useMemo(() => getAuthorStats(patches), [patches]);

  const { visibleAuthors, overflowAuthors } = useMemo(() => {
    const visible: AuthorStats[] = [];
    const seen = new Set<string>();
    for (const id of pinnedAuthorIds) {
      const a = authors.find((x) => x.id === id);
      if (a && !seen.has(a.id)) {
        visible.push(a);
        seen.add(a.id);
      }
    }
    for (const a of authors) {
      if (visible.length >= MAX_VISIBLE_AUTHORS) break;
      if (!seen.has(a.id)) {
        visible.push(a);
        seen.add(a.id);
      }
    }
    const overflow = authors.filter((a) => !seen.has(a.id));
    return { visibleAuthors: visible, overflowAuthors: overflow };
  }, [authors, pinnedAuthorIds]);

  const promoteAuthorToVisible = (authorId: string) => {
    setPinnedAuthorIds((prev) => {
      const next = [authorId, ...prev.filter((id) => id !== authorId)];
      return next.slice(0, MAX_VISIBLE_AUTHORS);
    });
  };

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
        {/* Search — rectangular, flush */}
        <div className="relative border-b border-border/50 bg-neutral-900">
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

        {/* Filters — split: time ranges left, authors right */}
        <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border/50">
          <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto custom-scrollbar">
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
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {visibleAuthors.map((a) => (
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
            {overflowAuthors.length > 0 && (
              <Popover open={overflowOpen} onOpenChange={setOverflowOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-0.5 px-2 py-0.5 text-[11px] rounded-full border border-border/60 bg-neutral-900 text-muted-foreground hover:text-foreground hover:border-border cursor-pointer whitespace-nowrap"
                    )}
                  >
                    +{overflowAuthors.length}
                    <ChevronDown className="size-2.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={6}
                  className="w-56 p-1"
                >
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {overflowAuthors.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          promoteAuthorToVisible(a.id);
                          setSelectedAuthorFilter(a.id);
                          setOverflowOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs hover:bg-neutral-800 cursor-pointer text-left"
                      >
                        <img
                          src={a.avatarUrl || DEFAULT_AVATAR}
                          alt=""
                          className="size-5 rounded-full object-cover flex-shrink-0"
                        />
                        <span className="flex-1 truncate">
                          {a.displayName}
                        </span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {a.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

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
        "px-2.5 py-0.5 text-[11px] rounded-full border cursor-pointer whitespace-nowrap transition-colors flex-shrink-0",
        active
          ? "bg-primary/15 border-primary/40 text-primary"
          : "bg-neutral-900 border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {children}
    </button>
  );
}
