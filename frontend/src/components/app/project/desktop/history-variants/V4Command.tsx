import { DiffEditor } from "@/components/app/project/DiffEditor";
import { Kbd } from "@/components/ui/kbd";
import { authLogic } from "@/lib/logics/authLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import { cn, getCompactRelativeTime } from "@/lib/utils";
import { useActions, useValues } from "kea";
import { Filter, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_AVATAR,
  filterByTimeRange,
  formatFullDate,
  getAuthorStats,
  getInitials,
  getPatchStats,
  TIME_RANGES,
} from "./shared";

export function V4Command() {
  const { patches, selectedHistoryChangeId } = useValues(projectLogic);
  const { selectHistoryChange } = useActions(projectLogic);
  const { userData } = useValues(authLogic);

  const [query, setQuery] = useState("");
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<
    string | null
  >(null);
  const [timeRangeKey, setTimeRangeKey] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const authors = useMemo(() => getAuthorStats(patches), [patches]);

  const filtered = useMemo(() => {
    let result = patches;
    const timeRange = TIME_RANGES.find((r) => r.key === timeRangeKey);
    result = filterByTimeRange(result, timeRange?.days ?? null);
    if (selectedAuthorFilter) {
      result = result.filter(
        (p) => p.author.id === selectedAuthorFilter
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
  }, [patches, query, selectedAuthorFilter, timeRangeKey]);

  // j/k and arrow navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typingInInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // "/" focuses search
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
      <div className="w-[460px] flex flex-col border-r border-border/50 bg-[#0a0a0a]">
        {/* Search */}
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

          {/* Filter chips */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto custom-scrollbar">
            <Filter className="size-3 text-muted-foreground flex-shrink-0" />
            {TIME_RANGES.map((r) => (
              <ChipFilter
                key={r.key}
                active={timeRangeKey === r.key}
                onClick={() => setTimeRangeKey(r.key)}
              >
                {r.label}
              </ChipFilter>
            ))}
            <span className="w-px h-4 bg-border/70 mx-1" />
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

        {/* List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto custom-scrollbar font-mono text-xs"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No results
            </div>
          ) : (
            filtered.map((patch, idx) => {
              const isSelected = patch.id === selectedHistoryChangeId;
              const stats = getPatchStats(patch.content);
              const isMine = patch.author.id === userData?.id;
              const id6 = patch.id.slice(0, 7);
              return (
                <button
                  key={patch.id}
                  onClick={() => selectHistoryChange(patch.id, patch.content)}
                  className={cn(
                    "w-full text-left px-3 py-2 flex items-center gap-3 border-l-2 cursor-pointer transition-colors",
                    isSelected
                      ? "bg-neutral-900 border-primary text-foreground"
                      : "border-transparent hover:bg-neutral-900/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-[10px] tabular-nums text-muted-foreground w-6 text-right flex-shrink-0">
                    {String(idx + 1).padStart(3, "0")}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono w-14 flex-shrink-0 truncate">
                    {id6}
                  </span>
                  <AuthorBadge
                    displayName={patch.author.displayName}
                    avatarUrl={patch.author.avatarUrl}
                  />
                  <span
                    className={cn(
                      "flex-1 truncate",
                      isSelected ? "font-medium" : ""
                    )}
                  >
                    {patch.author.displayName}
                    {isMine && (
                      <span className="ml-1 text-primary/80">@me</span>
                    )}
                  </span>
                  <span className="text-emerald-400 tabular-nums">
                    +{stats.additions}
                  </span>
                  <span className="text-rose-400 tabular-nums">
                    -{stats.deletions}
                  </span>
                  <span
                    className="text-muted-foreground w-12 text-right flex-shrink-0"
                    title={formatFullDate(patch.createdAt)}
                  >
                    {getCompactRelativeTime(patch.createdAt)}
                  </span>
                </button>
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
            Select a row — use{" "}
            <Kbd className="mx-1 bg-neutral-800 text-neutral-300 border border-border/60">
              j
            </Kbd>
            /
            <Kbd className="mx-1 bg-neutral-800 text-neutral-300 border border-border/60">
              k
            </Kbd>{" "}
            or click
          </div>
        )}
      </div>
    </div>
  );
}

function AuthorBadge({
  displayName,
  avatarUrl,
}: {
  displayName: string;
  avatarUrl: string;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl || DEFAULT_AVATAR}
        alt=""
        className="size-5 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <span className="size-5 rounded-full bg-neutral-700 text-[9px] font-semibold text-foreground flex items-center justify-center flex-shrink-0">
      {getInitials(displayName)}
    </span>
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
        "px-2 py-0.5 rounded-sm text-[11px] border cursor-pointer whitespace-nowrap transition-colors",
        active
          ? "bg-primary/15 border-primary/40 text-primary"
          : "bg-neutral-900 border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {children}
    </button>
  );
}
