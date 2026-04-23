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
import {
  ArrowDownUp,
  ChevronDown,
  CornerDownLeft,
  Minus,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
} from "./history-variants/shared";
import { YearHeatmap } from "./history-variants/YearHeatmap";

const MAX_VISIBLE_AUTHORS = 3;

type SearchMode = "added" | "removed" | "changed" | "anywhere";

interface SearchSuggestion {
  mode: SearchMode;
  icon: LucideIcon;
  iconBg: string;
  iconFg: string;
  verb: React.ReactNode;
}

const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  {
    mode: "added",
    icon: Plus,
    iconBg: "bg-emerald-500/15",
    iconFg: "text-emerald-400",
    verb: (
      <>
        was <span className="text-emerald-400 font-medium">added</span>
      </>
    ),
  },
  {
    mode: "removed",
    icon: Minus,
    iconBg: "bg-rose-500/15",
    iconFg: "text-rose-400",
    verb: (
      <>
        was <span className="text-rose-400 font-medium">removed</span>
      </>
    ),
  },
  {
    mode: "changed",
    icon: ArrowDownUp,
    iconBg: "bg-neutral-800",
    iconFg: "text-neutral-300",
    verb: <>was added or removed</>,
  },
  {
    mode: "anywhere",
    icon: Sparkles,
    iconBg: "bg-neutral-800",
    iconFg: "text-neutral-300",
    verb: <>appears anywhere</>,
  },
];

function matchesMode(
  content: string,
  query: string,
  mode: SearchMode,
  authorName: string,
  authorEmail: string | null | undefined
): boolean {
  const q = query.toLowerCase();
  if (mode === "anywhere") {
    return (
      authorName.toLowerCase().includes(q) ||
      (authorEmail?.toLowerCase().includes(q) ?? false) ||
      content.toLowerCase().includes(q)
    );
  }
  const lines = content.split("\n");
  const isAdded = (l: string) => l.startsWith("+") && !l.startsWith("+++");
  const isRemoved = (l: string) => l.startsWith("-") && !l.startsWith("---");

  for (const line of lines) {
    if (!line.toLowerCase().includes(q)) continue;
    if (mode === "added" && isAdded(line)) return true;
    if (mode === "removed" && isRemoved(line)) return true;
    if (mode === "changed" && (isAdded(line) || isRemoved(line))) return true;
  }
  return false;
}

export function DesktopHistoryView() {
  const { patches, selectedHistoryChangeId, projectVersionsLoading } =
    useValues(projectLogic);
  const { selectHistoryChange } = useActions(projectLogic);
  const { userData } = useValues(authLogic);

  const [query, setQuery] = useState("");
  const [activeMode, setActiveMode] = useState<SearchMode | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);

  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<
    string | null
  >(null);
  const [timeRangeKey, setTimeRangeKey] = useState<string>("all");
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [pinnedAuthorIds, setPinnedAuthorIds] = useState<string[]>([]);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [kbNavActive, setKbNavActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!kbNavActive) return;
    const drop = () => setKbNavActive(false);
    document.addEventListener("mousemove", drop);
    return () => document.removeEventListener("mousemove", drop);
  }, [kbNavActive]);

  const [, setNow] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (patches.length === 0) return;
    const currentExists = patches.some((p) => p.id === selectedHistoryChangeId);
    if (!currentExists) {
      const latest = patches[0];
      selectHistoryChange(latest.id, latest.content);
    }
  }, [patches, selectedHistoryChangeId, selectHistoryChange]);

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

  const trimmedQuery = query.trim();
  const effectiveMode: SearchMode = activeMode ?? "anywhere";
  const showSuggestions = suggestionsOpen && trimmedQuery.length > 0;
  const activeSuggestion =
    activeMode != null
      ? SEARCH_SUGGESTIONS.find((s) => s.mode === activeMode)
      : null;

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
    if (trimmedQuery) {
      result = result.filter((p) =>
        matchesMode(
          p.content,
          trimmedQuery,
          effectiveMode,
          p.author.displayName,
          p.author.email
        )
      );
    }
    return result;
  }, [
    patches,
    trimmedQuery,
    effectiveMode,
    selectedAuthorFilter,
    timeRangeKey,
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

  const applyMode = (mode: SearchMode) => {
    setActiveMode(mode);
    setSuggestionsOpen(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery("");
    setActiveMode(null);
    setSuggestionsOpen(false);
  };

  useEffect(() => {
    if (!showSuggestions) return;
    setHighlightIdx((idx) =>
      idx >= SEARCH_SUGGESTIONS.length || idx < 0 ? 0 : idx
    );
  }, [showSuggestions]);

  useEffect(() => {
    if (!suggestionsOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        searchRootRef.current &&
        !searchRootRef.current.contains(e.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [suggestionsOpen]);

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
        if (trimmedQuery) setSuggestionsOpen(true);
        return;
      }

      if (target === inputRef.current) {
        if (showSuggestions) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIdx((i) => (i + 1) % SEARCH_SUGGESTIONS.length);
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIdx(
              (i) =>
                (i - 1 + SEARCH_SUGGESTIONS.length) % SEARCH_SUGGESTIONS.length
            );
            return;
          }
          if (e.key === "Enter") {
            e.preventDefault();
            applyMode(SEARCH_SUGGESTIONS[highlightIdx].mode);
            return;
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setSuggestionsOpen(false);
            return;
          }
        }
        if (e.key === "Escape") {
          e.preventDefault();
          clearSearch();
          inputRef.current?.blur();
          return;
        }
        return;
      }

      if (typingInInput) return;
      if (filtered.length === 0) return;
      const currentIdx = filtered.findIndex(
        (p) => p.id === selectedHistoryChangeId
      );
      const moveBy = (delta: number) => {
        e.preventDefault();
        if (
          document.activeElement instanceof HTMLElement &&
          document.activeElement.tagName === "BUTTON"
        ) {
          document.activeElement.blur();
        }
        setKbNavActive(true);
        const nextIdx =
          currentIdx < 0
            ? 0
            : Math.max(0, Math.min(filtered.length - 1, currentIdx + delta));
        const next = filtered[nextIdx];
        if (next) selectHistoryChange(next.id, next.content);
      };
      if (
        (e.key === "j" || e.key === "ArrowDown") &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        moveBy(1);
      } else if (
        (e.key === "k" || e.key === "ArrowUp") &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        moveBy(-1);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [
    filtered,
    selectedHistoryChangeId,
    selectHistoryChange,
    showSuggestions,
    highlightIdx,
    trimmedQuery,
  ]);

  if (!patches.length && projectVersionsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading history...</div>
      </div>
    );
  }

  if (!patches.length && !projectVersionsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground text-center">
          <p>No history available yet.</p>
          <p className="mt-1">Make changes to see version history.</p>
        </div>
      </div>
    );
  }

  const selectedPatch = patches.find((p) => p.id === selectedHistoryChangeId);

  return (
    <div className="h-full flex bg-background">
      <div className="w-[560px] flex flex-col border-r border-border/50 bg-[#0a0a0a]">
        {/* Search with semantic suggestions */}
        <div
          ref={searchRootRef}
          className="relative border-b border-border/50 bg-neutral-900"
        >
          <div className="relative flex items-center h-10">
            {activeSuggestion ? (
              <button
                type="button"
                onClick={() => {
                  setActiveMode(null);
                  if (trimmedQuery) setSuggestionsOpen(true);
                  inputRef.current?.focus();
                }}
                className={cn(
                  "flex items-center gap-1 ml-2 pl-1.5 pr-1.5 h-6 rounded-md text-[11px] font-medium cursor-pointer hover:brightness-110 transition-all flex-shrink-0",
                  activeSuggestion.iconBg,
                  activeSuggestion.iconFg
                )}
                title="Change mode"
              >
                <activeSuggestion.icon className="size-3" />
                <span className="capitalize">{activeSuggestion.mode}</span>
                <X className="size-2.5 opacity-60" />
              </button>
            ) : (
              <Search className="ml-3 size-3.5 text-muted-foreground pointer-events-none flex-shrink-0" />
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                const next = e.target.value;
                setQuery(next);
                setHighlightIdx(0);
                if (next.trim().length === 0) {
                  setActiveMode(null);
                  setSuggestionsOpen(false);
                } else if (!activeMode) {
                  setSuggestionsOpen(true);
                }
              }}
              onFocus={() => {
                if (trimmedQuery && !activeMode) setSuggestionsOpen(true);
              }}
              placeholder={
                activeSuggestion
                  ? "Refine your search…"
                  : "Search edits — author, email, diff content…"
              }
              className="flex-1 h-full bg-transparent border-0 pl-2.5 pr-10 text-sm font-mono placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query || activeMode ? (
                <button
                  type="button"
                  onClick={clearSearch}
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

          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 z-40 border-x border-b border-border/70 bg-neutral-950/95 backdrop-blur-md shadow-2xl shadow-black/50">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium border-b border-border/50 bg-black/40">
                What do you mean by{" "}
                <span className="text-foreground font-mono normal-case">
                  "{trimmedQuery}"
                </span>
                ?
              </div>
              <div className="py-1">
                {SEARCH_SUGGESTIONS.map((s, i) => {
                  const Icon = s.icon;
                  const isHighlighted = i === highlightIdx;
                  return (
                    <button
                      key={s.mode}
                      type="button"
                      onClick={() => applyMode(s.mode)}
                      onMouseEnter={() => setHighlightIdx(i)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-1.5 text-left cursor-pointer transition-colors focus:outline-none",
                        isHighlighted
                          ? "bg-neutral-800/80"
                          : "hover:bg-neutral-900/60"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center size-5 rounded-md flex-shrink-0",
                          s.iconBg,
                          s.iconFg
                        )}
                      >
                        <Icon className="size-3" />
                      </div>
                      <div className="flex-1 min-w-0 text-sm">
                        <span className="font-mono text-foreground">
                          "{trimmedQuery}"
                        </span>{" "}
                        <span className="text-muted-foreground">{s.verb}</span>
                      </div>
                      {isHighlighted && (
                        <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60 px-1 flex-shrink-0">
                          <CornerDownLeft className="size-2.5" />
                        </Kbd>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/50 bg-black/40 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60 px-1">
                      ↑
                    </Kbd>
                    <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60 px-1">
                      ↓
                    </Kbd>
                    <span>navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60 px-1">
                      ↵
                    </Kbd>
                    <span>apply</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60 px-1">
                      esc
                    </Kbd>
                    <span>dismiss</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters — dates always visible, users overflow via dropdown */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border/50">
          <div className="flex items-center gap-1.5 flex-shrink-0">
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

          <div className="flex items-center gap-1.5 ml-auto min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
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
                  <span className="max-w-[72px] truncate inline-block align-bottom">
                    {a.displayName.split(" ")[0]}
                  </span>{" "}
                  <span className="opacity-60">({a.count})</span>
                </ChipFilter>
              ))}
            </div>
            {overflowAuthors.length > 0 && (
              <Popover open={overflowOpen} onOpenChange={setOverflowOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-0.5 px-2 py-0.5 text-[11px] rounded-full border border-border/60 bg-neutral-900 text-muted-foreground hover:text-foreground hover:border-border cursor-pointer whitespace-nowrap flex-shrink-0"
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
                    "w-full flex items-center gap-3 px-3 py-2 border-l-2 cursor-pointer transition-colors text-left focus:outline-none focus-visible:outline-none",
                    isSelected
                      ? "bg-neutral-900 border-primary"
                      : kbNavActive
                        ? "border-transparent"
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
                ↑
              </Kbd>
              <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60">
                ↓
              </Kbd>
              <span className="text-muted-foreground/50">·</span>
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
      <div className="flex-1 min-w-0 flex flex-col">
        {selectedPatch ? (
          <>
            <DiffSummary patch={selectedPatch} isMine={selectedPatch.author.id === userData?.id} />
            <div className="flex-1 min-h-0">
              <DiffEditor value={selectedPatch.content} />
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Pick an entry to view its changes
          </div>
        )}
      </div>
    </div>
  );
}

function DiffSummary({
  patch,
  isMine,
}: {
  patch: import("@/lib/logics/projectLogic").Patch;
  isMine: boolean;
}) {
  const stats = getPatchStats(patch.content);
  const relative = getCompactRelativeTime(patch.createdAt);
  const full = formatFullDate(patch.createdAt);
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 bg-neutral-950/60">
      <img
        src={patch.author.avatarUrl || DEFAULT_AVATAR}
        alt=""
        className="size-7 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-medium text-foreground truncate">
            {patch.author.displayName}
          </span>
          {isMine && (
            <span className="text-primary/70 text-[11px]">· you</span>
          )}
          <span className="text-muted-foreground/60 text-[12px]">edited</span>
          <span
            className="text-muted-foreground text-[12px] tabular-nums"
            title={full}
          >
            {relative}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground/70 mt-0.5">
          {full}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono tabular-nums">
          <Plus className="size-3" />
          {stats.additions}
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-mono tabular-nums">
          <Minus className="size-3" />
          {stats.deletions}
        </span>
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
