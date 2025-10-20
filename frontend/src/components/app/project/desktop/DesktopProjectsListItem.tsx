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
        "group relative flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition select-none",
        isActive
          ? "bg-accent text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      <Link
        to="/app/project/$projectId"
        params={{ projectId: project.id }}
        aria-label={`Open project ${project.name}`}
        className="absolute inset-0 rounded-md cursor-pointer"
      />
      <span className="truncate block relative pointer-events-none text-xs">
        {project.name}
      </span>
      <div
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
        className="cursor-grab active:cursor-grabbing touch-none flex items-center relative z-10 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3 text-muted-foreground/60" />
      </div>
    </div>
  );
}

export default DesktopProjectsListItem;
