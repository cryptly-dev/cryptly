import { type Project } from "@/lib/api/projects.api";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { GripVertical } from "lucide-react";
import type { DragControls } from "motion/react";

interface DesktopProjectsListItemProps {
  project: Project;
  isActive: boolean;
  dragControls: DragControls;
}

export function DesktopProjectsListItem({
  project,
  isActive,
  dragControls,
}: DesktopProjectsListItemProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors select-none",
        isActive
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <Link
        to="/app/project/$projectId"
        params={{ projectId: project.id }}
        aria-label={`Open project ${project.name}`}
        className="absolute inset-0 rounded-md cursor-pointer"
      />
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            isActive ? "bg-primary" : "bg-muted-foreground/40"
          )}
        />
        <span className="font-medium truncate block relative pointer-events-none text-[13px]">
          {project.name}
        </span>
      </div>
      <div
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
        className="cursor-grab active:cursor-grabbing touch-none flex items-center relative z-10 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60" />
      </div>
    </div>
  );
}

export default DesktopProjectsListItem;
