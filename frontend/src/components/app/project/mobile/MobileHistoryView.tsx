import { DiffEditor } from "@/components/app/project/DiffEditor";
import {
  DEFAULT_AVATAR,
  getPatchStats,
} from "@/components/app/project/desktop/history-variants/shared";
import { authLogic } from "@/lib/logics/authLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import { cn, getCompactRelativeTime } from "@/lib/utils";
import { useActions, useValues } from "kea";
import { useEffect, useMemo, useState } from "react";

export function MobileHistoryView() {
  const { patches, selectedHistoryChangeId, projectVersionsLoading } =
    useValues(projectLogic);
  const { selectHistoryChange } = useActions(projectLogic);
  const { userData } = useValues(authLogic);

  // Tick every second so relative times stay fresh.
  const [, setNow] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-select the latest patch when nothing is selected yet (or when the
  // selected one no longer exists).
  useEffect(() => {
    if (patches.length === 0) return;
    const currentExists = patches.some((p) => p.id === selectedHistoryChangeId);
    if (!currentExists) {
      const latest = patches[0];
      selectHistoryChange(latest.id, latest.content);
    }
  }, [patches, selectedHistoryChangeId, selectHistoryChange]);

  const maxVolume = useMemo(() => {
    let max = 0;
    for (const p of patches) {
      const s = getPatchStats(p.content);
      max = Math.max(max, s.additions + s.deletions);
    }
    return max || 1;
  }, [patches]);

  const selectedPatch = patches.find(
    (patch) => patch.id === selectedHistoryChangeId
  )?.content;

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

  return (
    <div className="h-full flex flex-col">
      {/* Top — compact version list, styled like desktop */}
      <div className="overflow-y-auto h-[38%] flex-shrink-0 bg-[#0a0a0a] shadow-[0_4px_6px_-2px_rgba(0,0,0,0.5)] relative z-10">
        {patches.map((patch) => {
          const isSelected = patch.id === selectedHistoryChangeId;
          const stats = getPatchStats(patch.content);
          const volume = stats.additions + stats.deletions;
          const addRatio = stats.additions / Math.max(volume, 1);
          const barWidthPct = (volume / maxVolume) * 100;
          const isMine = patch.author.id === userData?.id;

          return (
            <button
              key={patch.id}
              type="button"
              onClick={() => selectHistoryChange(patch.id, patch.content)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 border-l-2 cursor-pointer transition-colors text-left",
                isSelected
                  ? "bg-neutral-900 border-primary"
                  : "border-transparent active:bg-neutral-900/60"
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
                  <span className="text-emerald-400">+{stats.additions}</span>{" "}
                  <span className="text-rose-400">-{stats.deletions}</span>
                </span>
                <div className="w-[56px] h-1 bg-neutral-800/60 flex overflow-hidden rounded-full">
                  <div
                    className="h-full bg-emerald-500/80"
                    style={{ width: `${barWidthPct * addRatio}%` }}
                  />
                  <div
                    className="h-full bg-rose-500/80"
                    style={{ width: `${barWidthPct * (1 - addRatio)}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground tabular-nums w-9 text-right">
                  {getCompactRelativeTime(patch.createdAt)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom — diff, no header */}
      <div className="flex-1 min-h-0 border-t border-border bg-background">
        {selectedPatch ? (
          <div className="h-full">
            <DiffEditor value={selectedPatch} />
          </div>
        ) : (
          <div className="h-full flex items-start justify-center pt-8">
            <div className="text-center text-muted-foreground text-sm">
              Select a version to see changes
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
