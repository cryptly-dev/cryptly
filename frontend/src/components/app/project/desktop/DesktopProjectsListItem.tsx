import { type Project } from "@/lib/api/projects.api";
import { Spinner } from "@/components/ui/spinner";
import { cn, getCompactRelativeTime } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { GripVertical } from "lucide-react";
import { AnimatePresence, motion, type DragControls } from "motion/react";
import { useEffect, useState } from "react";

interface DesktopProjectsListItemProps {
  project: Project;
  isActive: boolean;
  /** Row is the project we're switching to; show same bg as hover. */
  isLoading?: boolean;
  dragControls: DragControls;
}

export function DesktopProjectsListItem({
  project,
  isActive,
  isLoading = false,
  dragControls,
}: DesktopProjectsListItemProps) {
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const timeAgo = getCompactRelativeTime(project.updatedAt);

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between gap-2 overflow-hidden rounded-sm px-3 py-1.5 text-sm transition-colors select-none",
        isActive
          ? "text-primary"
          : isLoading
            ? "bg-neutral-800/40 text-foreground"
            : "text-muted-foreground/55 hover:bg-neutral-800/40 hover:text-foreground",
      )}
    >
      {isActive && (
        <div className="absolute inset-0 bg-neutral-800 rounded-sm pointer-events-none" />
      )}
      <Link
        to="/app/project/$projectId"
        params={{ projectId: project.id }}
        aria-label={`Open project ${project.name}`}
        className="absolute inset-0 rounded-sm cursor-pointer"
      />
      <div className="relative z-10 flex items-center gap-2 min-w-0 flex-1 pointer-events-none">
        <span
          aria-hidden
          className="relative flex h-3 w-3 flex-shrink-0 items-center justify-center"
        >
          <AnimatePresence initial={false}>
            {isLoading ? (
              <motion.span
                key="spinner"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 520,
                  damping: 26,
                  mass: 0.5,
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Spinner
                  className="h-3 w-3"
                  style={{ color: "#c9b287" }}
                />
              </motion.span>
            ) : isActive ? (
              <motion.span
                key="dot"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 520,
                  damping: 22,
                  mass: 0.5,
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "#c9b287" }}
                />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
        <span
          className={cn(
            "truncate block relative pointer-events-none text-[14px] font-normal",
            isActive && "[text-shadow:0_0_0.4px_currentColor]",
          )}
        >
          {project.name}
        </span>
      </div>
      <div className="relative z-10 flex items-center gap-1.5 flex-shrink-0 pointer-events-none">
        <span
          className={cn(
            "text-[12px] tabular-nums transition-opacity group-hover:opacity-0",
            isActive ? "text-primary/70" : "text-muted-foreground/40",
          )}
          title={new Date(project.updatedAt).toLocaleString()}
        >
          {timeAgo}
        </span>
      </div>
      <div
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-none flex items-center z-20 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60" />
      </div>
    </div>
  );
}

export default DesktopProjectsListItem;
