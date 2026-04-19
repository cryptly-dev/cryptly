import { DiffEditor } from "@/components/app/project/DiffEditor";
import { authLogic } from "@/lib/logics/authLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import { cn, getCompactRelativeTime, getRelativeTime } from "@/lib/utils";
import { useActions, useValues } from "kea";
import { GitCommit, Minus, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  DEFAULT_AVATAR,
  formatFullDate,
  getAuthorStats,
  getPatchStats,
} from "./shared";

export function V1Timeline() {
  const { patches, selectedHistoryChangeId } = useValues(projectLogic);
  const { selectHistoryChange } = useActions(projectLogic);
  const { userData } = useValues(authLogic);

  const authors = useMemo(() => getAuthorStats(patches), [patches]);

  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    for (const p of patches) {
      const s = getPatchStats(p.content);
      additions += s.additions;
      deletions += s.deletions;
    }
    return { additions, deletions };
  }, [patches]);

  const sortedByTime = useMemo(
    () =>
      [...patches].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [patches]
  );

  const minTime = sortedByTime[0]
    ? new Date(sortedByTime[0].createdAt).getTime()
    : 0;
  const maxTime = sortedByTime[sortedByTime.length - 1]
    ? new Date(sortedByTime[sortedByTime.length - 1].createdAt).getTime()
    : 1;
  const range = Math.max(maxTime - minTime, 1);

  const selectedPatch = patches.find((p) => p.id === selectedHistoryChangeId);
  const selectedStats = selectedPatch
    ? getPatchStats(selectedPatch.content)
    : null;

  const authorColors = useMemo(() => {
    const palette = [
      "#60a5fa",
      "#34d399",
      "#fbbf24",
      "#f87171",
      "#a78bfa",
      "#fb7185",
      "#38bdf8",
      "#facc15",
    ];
    const map = new Map<string, string>();
    authors.forEach((a, i) => map.set(a.id, palette[i % palette.length]));
    return map;
  }, [authors]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-neutral-950 via-background to-background">
      {/* Stats bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <StatCard
          icon={<GitCommit className="size-3.5" />}
          label="Commits"
          value={patches.length}
        />
        <StatCard
          icon={<Users className="size-3.5" />}
          label="Contributors"
          value={authors.length}
        />
        <StatCard
          icon={<Plus className="size-3.5" />}
          label="Added"
          value={stats.additions}
          accent="text-emerald-400"
        />
        <StatCard
          icon={<Minus className="size-3.5" />}
          label="Removed"
          value={stats.deletions}
          accent="text-rose-400"
        />
        <div className="ml-auto flex items-center gap-2">
          {authors.slice(0, 5).map((a) => (
            <div
              key={a.id}
              className="relative group"
              title={`${a.displayName} — ${a.count} edits`}
            >
              <img
                src={a.avatarUrl || DEFAULT_AVATAR}
                alt={a.displayName}
                className="size-7 rounded-full ring-2 object-cover"
                style={{ borderColor: authorColors.get(a.id) }}
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-semibold text-black"
                style={{ backgroundColor: authorColors.get(a.id) }}
              >
                {a.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline rail */}
      <div className="relative border-b border-border/50 bg-card/10 py-8 px-10 overflow-hidden">
        {/* Time axis labels */}
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-4 font-medium">
          <span>{sortedByTime[0] && getRelativeTime(sortedByTime[0].createdAt)}</span>
          <span className="opacity-60">TIMELINE</span>
          <span>
            {sortedByTime[sortedByTime.length - 1] &&
              getRelativeTime(
                sortedByTime[sortedByTime.length - 1].createdAt
              )}
          </span>
        </div>

        {/* Track */}
        <div className="relative h-24">
          {/* Line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-primary/60 via-primary/30 to-primary/60"
          />

          {/* Dots */}
          {sortedByTime.map((patch, i) => {
            const t =
              patches.length === 1
                ? 0.5
                : (new Date(patch.createdAt).getTime() - minTime) / range;
            const isSelected = patch.id === selectedHistoryChangeId;
            const ps = getPatchStats(patch.content);
            const volume = ps.additions + ps.deletions;
            const size = Math.min(22, Math.max(10, 8 + Math.log2(volume + 1) * 3));
            const color = authorColors.get(patch.author.id) || "#60a5fa";
            const isMine = patch.author.id === userData?.id;

            return (
              <motion.button
                key={patch.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                onClick={() =>
                  selectHistoryChange(patch.id, patch.content)
                }
                style={{
                  left: `${t * 100}%`,
                  width: size,
                  height: size,
                  backgroundColor: color,
                }}
                className={cn(
                  "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all duration-200 group",
                  isSelected
                    ? "ring-4 ring-white/20 scale-125 z-20"
                    : "hover:scale-125 hover:ring-4 hover:ring-white/10 opacity-90 hover:opacity-100"
                )}
                aria-label={`${patch.author.displayName} at ${formatFullDate(patch.createdAt)}`}
              >
                {/* Tooltip */}
                <div
                  className={cn(
                    "pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity",
                    isSelected
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                  style={{ bottom: "calc(100% + 10px)" }}
                >
                  <div className="bg-neutral-900 border border-neutral-700 rounded-md px-2.5 py-1.5 shadow-lg text-xs flex items-center gap-2">
                    <img
                      src={patch.author.avatarUrl || DEFAULT_AVATAR}
                      alt=""
                      className="size-4 rounded-full object-cover"
                    />
                    <span className="font-medium text-foreground">
                      {patch.author.displayName}
                      {isMine && (
                        <span className="ml-1 text-primary/80">(you)</span>
                      )}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {getCompactRelativeTime(patch.createdAt)}
                    </span>
                    <span className="text-emerald-400">+{ps.additions}</span>
                    <span className="text-rose-400">-{ps.deletions}</span>
                  </div>
                </div>
                {/* Selected stem below */}
                {isSelected && (
                  <div
                    className="absolute left-1/2 top-full -translate-x-1/2 w-px bg-primary/50"
                    style={{ height: 16 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected detail bar */}
      {selectedPatch && selectedStats && (
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border/50 bg-card/20">
          <img
            src={selectedPatch.author.avatarUrl || DEFAULT_AVATAR}
            alt={selectedPatch.author.displayName}
            className="size-8 rounded-full object-cover ring-2 ring-primary/30"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">
                {selectedPatch.author.displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                · {formatFullDate(selectedPatch.createdAt)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {getRelativeTime(selectedPatch.createdAt)}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-emerald-400">
              +{selectedStats.additions}
            </span>
            <span className="text-rose-400">-{selectedStats.deletions}</span>
          </div>
        </div>
      )}

      {/* Diff */}
      <div className="flex-1 min-h-0">
        {selectedPatch ? (
          <DiffEditor value={selectedPatch.content} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Click a dot on the timeline to view changes
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-900/60 border border-border/50">
      <span className={cn("flex items-center", accent)}>{icon}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums", accent)}>
        {value}
      </span>
    </div>
  );
}
