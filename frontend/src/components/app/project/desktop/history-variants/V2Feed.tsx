import { DiffEditor } from "@/components/app/project/DiffEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authLogic } from "@/lib/logics/authLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import { cn, getRelativeTime } from "@/lib/utils";
import { useActions, useValues } from "kea";
import { Clock, User as UserIcon } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  DEFAULT_AVATAR,
  filterByTimeRange,
  formatFullDate,
  getAuthorStats,
  getPatchStats,
  TIME_RANGES,
} from "./shared";

type OwnerFilter = "all" | "mine";

export function V2Feed() {
  const { patches, selectedHistoryChangeId } = useValues(projectLogic);
  const { selectHistoryChange } = useActions(projectLogic);
  const { userData } = useValues(authLogic);

  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("all");

  const authors = useMemo(() => getAuthorStats(patches), [patches]);

  const filtered = useMemo(() => {
    let result = patches;
    if (ownerFilter === "mine" && userData?.id) {
      result = result.filter((p) => p.author.id === userData.id);
    }
    if (authorFilter !== "all") {
      result = result.filter((p) => p.author.id === authorFilter);
    }
    const range = TIME_RANGES.find((r) => r.key === timeRange)?.days ?? null;
    result = filterByTimeRange(result, range);
    return result;
  }, [patches, ownerFilter, authorFilter, timeRange, userData?.id]);

  const maxVolume = useMemo(() => {
    let max = 0;
    for (const p of filtered) {
      const s = getPatchStats(p.content);
      max = Math.max(max, s.additions + s.deletions);
    }
    return max || 1;
  }, [filtered]);

  const selectedPatch = patches.find((p) => p.id === selectedHistoryChangeId);

  return (
    <div className="h-full flex bg-background">
      {/* Left rail */}
      <div className="w-[420px] flex flex-col border-r border-border/50 bg-gradient-to-b from-card/40 to-card/10">
        {/* Filter bar */}
        <div className="flex flex-col gap-2 px-4 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-1 p-1 bg-neutral-900/70 rounded-lg border border-border/50 w-fit">
            <FilterChip
              active={ownerFilter === "all"}
              onClick={() => setOwnerFilter("all")}
            >
              All
            </FilterChip>
            <FilterChip
              active={ownerFilter === "mine"}
              onClick={() => setOwnerFilter("mine")}
            >
              Mine
            </FilterChip>
          </div>

          <div className="flex items-center gap-2">
            <Select value={authorFilter} onValueChange={setAuthorFilter}>
              <SelectTrigger size="sm" className="h-8 flex-1 text-xs">
                <UserIcon className="size-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All authors</SelectItem>
                {authors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.displayName} ({a.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger size="sm" className="h-8 flex-1 text-xs">
                <Clock className="size-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((r) => (
                  <SelectItem key={r.key} value={r.key}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              Showing <span className="text-foreground font-medium">
                {filtered.length}
              </span>{" "}
              of {patches.length} edits
            </span>
          </div>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {filtered.length === 0 ? (
            <div className="text-center pt-12 text-sm text-muted-foreground">
              No edits match the current filters.
            </div>
          ) : (
            <div className="relative">
              {/* Vertical connector */}
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-800" />

              <div className="flex flex-col gap-2">
                {filtered.map((patch, idx) => {
                  const isSelected = patch.id === selectedHistoryChangeId;
                  const stats = getPatchStats(patch.content);
                  const isMine = patch.author.id === userData?.id;
                  const volume = stats.additions + stats.deletions;
                  const addRatio = stats.additions / Math.max(volume, 1);

                  return (
                    <motion.button
                      key={patch.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      onClick={() =>
                        selectHistoryChange(patch.id, patch.content)
                      }
                      className={cn(
                        "relative text-left group cursor-pointer rounded-xl border p-3 transition-all duration-200 pl-11",
                        isSelected
                          ? "bg-gradient-to-br from-primary/10 via-card/60 to-card/40 border-primary/40 shadow-lg shadow-primary/5"
                          : "bg-card/40 border-border/50 hover:border-border hover:bg-card/60"
                      )}
                    >
                      {/* Avatar (on connector line) */}
                      <img
                        src={patch.author.avatarUrl || DEFAULT_AVATAR}
                        alt=""
                        className={cn(
                          "absolute left-[5px] top-3 size-7 rounded-full object-cover ring-2 transition-all",
                          isSelected
                            ? "ring-primary/60"
                            : "ring-neutral-800 group-hover:ring-neutral-700"
                        )}
                      />

                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {patch.author.displayName}
                          </span>
                          {isMine && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-primary/20 text-primary">
                              You
                            </span>
                          )}
                        </div>
                        <span
                          className="text-[11px] text-muted-foreground whitespace-nowrap"
                          title={formatFullDate(patch.createdAt)}
                        >
                          {getRelativeTime(patch.createdAt)}
                        </span>
                      </div>

                      {/* Stats visualization */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums">
                          <span className="text-emerald-400 font-semibold">
                            +{stats.additions}
                          </span>
                          <span className="text-rose-400 font-semibold">
                            -{stats.deletions}
                          </span>
                        </div>
                        {/* Proportional bar */}
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
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diff */}
      <div className="flex-1 min-w-0">
        {selectedPatch ? (
          <DiffEditor value={selectedPatch.content} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Select an entry to view its changes
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({
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
        "relative px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {active && (
        <motion.div
          layoutId="feed-filter-chip"
          className="absolute inset-0 rounded-md bg-neutral-700"
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
