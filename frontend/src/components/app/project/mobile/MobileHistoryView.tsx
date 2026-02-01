import { cn, getRelativeTime } from "@/lib/utils";
import { useValues, useActions } from "kea";
import { projectLogic } from "@/lib/logics/projectLogic";
import { DiffEditor } from "@/components/app/project/DiffEditor";
import { useEffect, useState } from "react";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

export function MobileHistoryView() {
  const { patches, selectedHistoryChangeId, projectVersionsLoading } =
    useValues(projectLogic);
  const { selectHistoryChange } = useActions(projectLogic);

  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get the currently selected patch
  const selectedPatch = patches.find(
    (patch) => patch.id === selectedHistoryChangeId
  )?.content;

  // Handle loading state
  if (!patches.length && projectVersionsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading history...</div>
      </div>
    );
  }

  // Handle empty state
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
      {/* Top - Version list */}
      <div className="border-b border-border/50 overflow-y-auto p-2 h-[35%] flex-shrink-0">
        <div className="space-y-0.5">
          {patches.map((patch) => {
            const isSelected = patch.id === selectedHistoryChangeId;

            return (
              <button
                key={patch.id}
                type="button"
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm text-left",
                  isSelected
                    ? "bg-neutral-800 text-primary"
                    : "active:bg-neutral-800"
                )}
                onClick={() => selectHistoryChange(patch.id, patch.content)}
              >
                <img
                  src={patch.author.avatarUrl || DEFAULT_AVATAR}
                  alt={`Avatar for ${patch.author.displayName}`}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium truncate block">
                    {patch.author.displayName}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {getRelativeTime(patch.createdAt)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom - Diff editor */}
      <div className="flex-1 min-h-0">
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
