import { type Project } from "@/lib/api/projects.api";
import { cn, getCompactRelativeTime } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { GripVertical } from "lucide-react";
import { type DragControls } from "motion/react";
import { useEffect, useState } from "react";

interface DesktopProjectsListItemProps {
  project: Project;
  isActive: boolean;
  /** Row is the project we're switching to; show same bg as hover. */
  isLoading?: boolean;
  dragControls: DragControls;
}

// GripVertical's six dots in clockwise perimeter order (matches lucide's geometry).
const GRIP_PERIMETER = [
  { cx: 9, cy: 5 },
  { cx: 15, cy: 5 },
  { cx: 15, cy: 12 },
  { cx: 15, cy: 19 },
  { cx: 9, cy: 19 },
  { cx: 9, cy: 12 },
];

function GripLoader({ color }: { color: string }) {
  const [step, setStep] = useState(() => Math.floor(Math.random() * 6));
  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => (s + 1) % 6), 130);
    return () => window.clearInterval(id);
  }, []);

  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5"
      role="status"
      aria-label="Loading"
    >
      {GRIP_PERIMETER.map((pos, i) => {
        const distance = (i - step + 6) % 6;
        const opacity = distance < 3 ? 1 : 0.12;
        return (
          <circle
            key={i}
            cx={pos.cx}
            cy={pos.cy}
            r={2}
            fill={color}
            style={{
              opacity,
              transition: "opacity 130ms linear",
            }}
          />
        );
      })}
    </svg>
  );
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
        "group relative flex items-center justify-between gap-2 overflow-hidden px-3 py-2 text-sm transition-colors select-none",
        isActive
          ? "text-foreground"
          : isLoading
            ? "bg-neutral-900/60 text-foreground"
            : "text-muted-foreground/55 hover:bg-neutral-900/60 hover:text-foreground",
      )}
    >
      <Link
        to="/app/project/$projectId"
        params={{ projectId: project.id }}
        aria-label={`Open project ${project.name}`}
        className="absolute inset-0 cursor-pointer z-[2]"
      />
      <div className="relative z-[2] flex items-center min-w-0 flex-1 pointer-events-none">
        <span
          className={cn(
            "truncate block relative pointer-events-none text-[14px]",
            isActive
              ? "font-medium [text-shadow:0_0_0.4px_currentColor]"
              : "font-normal",
          )}
        >
          {project.name}
        </span>
      </div>
      <div className="relative z-[2] flex items-center gap-1.5 flex-shrink-0 pointer-events-none">
        <span
          className={cn(
            "text-[12px] tabular-nums transition-opacity",
            isLoading ? "opacity-0" : "group-hover:opacity-0",
            isActive ? "text-foreground/60" : "text-muted-foreground/40",
          )}
          title={new Date(project.updatedAt).toLocaleString()}
        >
          {timeAgo}
        </span>
      </div>
      <div
        onPointerDown={(e) => {
          if (isLoading) return;
          dragControls.start(e);
        }}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 touch-none flex items-center z-[3] transition-opacity",
          isLoading
            ? "opacity-100 pointer-events-none"
            : "opacity-0 group-hover:opacity-100 pointer-events-auto cursor-grab active:cursor-grabbing",
        )}
      >
        {isLoading ? (
          <GripLoader color="#c9b287" />
        ) : (
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60" />
        )}
      </div>
    </div>
  );
}

export default DesktopProjectsListItem;
