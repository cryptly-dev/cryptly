import { DiffEditor } from "@/components/app/project/DiffEditor";
import { projectLogic } from "@/lib/logics/projectLogic";
import { cn, getCompactRelativeTime, getRelativeTime } from "@/lib/utils";
import { useActions, useValues } from "kea";
import {
  Activity,
  GitCommit,
  Minus,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildDailyBuckets,
  DEFAULT_AVATAR,
  formatFullDate,
  getAuthorStats,
  getPatchStats,
} from "./shared";

export function V3Analytics() {
  const { patches, selectedHistoryChangeId } = useValues(projectLogic);
  const { selectHistoryChange } = useActions(projectLogic);

  const authors = useMemo(() => getAuthorStats(patches), [patches]);
  const maxAuthorCount = authors[0]?.count || 1;

  const totals = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    for (const p of patches) {
      const s = getPatchStats(p.content);
      additions += s.additions;
      deletions += s.deletions;
    }
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = patches.filter(
      (p) => new Date(p.createdAt).getTime() >= weekAgo
    ).length;
    return { additions, deletions, thisWeek };
  }, [patches]);

  const chartData = useMemo(() => buildDailyBuckets(patches, 14), [patches]);

  const selectedPatch = patches.find((p) => p.id === selectedHistoryChangeId);

  const pace = useMemo(() => {
    if (patches.length < 2) return null;
    const times = [...patches]
      .map((p) => new Date(p.createdAt).getTime())
      .sort((a, b) => a - b);
    let totalGap = 0;
    for (let i = 1; i < times.length; i++) {
      totalGap += times[i] - times[i - 1];
    }
    const avgMs = totalGap / (times.length - 1);
    const days = avgMs / (1000 * 60 * 60 * 24);
    if (days < 1) return `${(days * 24).toFixed(1)}h`;
    return `${days.toFixed(1)}d`;
  }, [patches]);

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="flex-shrink-0 overflow-y-auto custom-scrollbar">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3 px-6 pt-5 pb-3">
          <BigStatCard
            icon={<GitCommit className="size-4" />}
            label="Total commits"
            value={patches.length.toString()}
            hint={`${authors.length} contributors`}
            color="text-blue-400"
            glow="from-blue-500/20"
          />
          <BigStatCard
            icon={<TrendingUp className="size-4" />}
            label="Last 7 days"
            value={totals.thisWeek.toString()}
            hint={pace ? `avg every ${pace}` : "not enough data"}
            color="text-violet-400"
            glow="from-violet-500/20"
          />
          <BigStatCard
            icon={<Plus className="size-4" />}
            label="Lines added"
            value={totals.additions.toString()}
            hint={`+${Math.round(totals.additions / Math.max(patches.length, 1))}/commit`}
            color="text-emerald-400"
            glow="from-emerald-500/20"
          />
          <BigStatCard
            icon={<Minus className="size-4" />}
            label="Lines removed"
            value={totals.deletions.toString()}
            hint={`-${Math.round(totals.deletions / Math.max(patches.length, 1))}/commit`}
            color="text-rose-400"
            glow="from-rose-500/20"
          />
        </div>

        {/* Chart and leaderboard */}
        <div className="grid grid-cols-3 gap-3 px-6 pb-3">
          <div className="col-span-2 rounded-xl border border-border/50 bg-card/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">
                  Activity (last 14 days)
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground">
                commits per day
              </span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#737373", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fill: "#737373", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0a0a0a",
                      border: "1px solid #262626",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#a3a3a3" }}
                    cursor={{ stroke: "#525252", strokeDasharray: "3 3" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    fill="url(#gradArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/40 p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Users className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Top contributors</h3>
            </div>
            <div className="flex-1 space-y-2.5">
              {authors.slice(0, 4).map((a, i) => (
                <div key={a.id} className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono text-muted-foreground w-3 text-center">
                    {i + 1}
                  </span>
                  <img
                    src={a.avatarUrl || DEFAULT_AVATAR}
                    alt=""
                    className="size-6 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium truncate">
                        {a.displayName}
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {a.count}
                      </span>
                    </div>
                    <div className="h-1 bg-neutral-800 rounded-full overflow-hidden mt-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(a.count / maxAuthorCount) * 100}%`,
                        }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-primary/60 to-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {authors.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No contributors yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: commits + diff */}
      <div className="flex-1 min-h-0 flex border-t border-border/50">
        <div className="w-[320px] flex flex-col border-r border-border/50 bg-card/20">
          <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50">
            Recent edits
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {patches.map((patch) => {
              const isSelected = patch.id === selectedHistoryChangeId;
              const s = getPatchStats(patch.content);
              return (
                <button
                  key={patch.id}
                  onClick={() => selectHistoryChange(patch.id, patch.content)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md flex items-center gap-2.5 cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : "hover:bg-neutral-800/70"
                  )}
                  title={formatFullDate(patch.createdAt)}
                >
                  <img
                    src={patch.author.avatarUrl || DEFAULT_AVATAR}
                    alt=""
                    className="size-6 rounded-full flex-shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium truncate">
                        {patch.author.displayName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {getCompactRelativeTime(patch.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                      <span className="text-emerald-400">+{s.additions}</span>
                      <span className="text-rose-400">-{s.deletions}</span>
                      <span className="text-muted-foreground">
                        · {getRelativeTime(patch.createdAt)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {selectedPatch ? (
            <DiffEditor value={selectedPatch.content} />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Select an edit to view its diff
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BigStatCard({
  icon,
  label,
  value,
  hint,
  color,
  glow,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  color: string;
  glow: string;
}) {
  return (
    <div className="relative rounded-xl border border-border/50 bg-card/40 p-4 overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none opacity-60",
          glow
        )}
      />
      <div className="relative flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </span>
          <span className={cn("flex items-center", color)}>{icon}</span>
        </div>
        <span className={cn("text-2xl font-semibold tabular-nums", color)}>
          {value}
        </span>
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      </div>
    </div>
  );
}
