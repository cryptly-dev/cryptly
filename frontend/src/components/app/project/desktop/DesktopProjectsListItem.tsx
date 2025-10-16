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
        "group relative flex items-center justify-between rounded-xl p-3 text-sm transition border",
        isActive
          ? "bg-primary/10 text-primary border-primary/20"
          : "border-transparent hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Link
        to="/app/project/$projectId"
        params={{ projectId: project.id }}
        aria-label={`Open project ${project.name}`}
        className="absolute inset-0 rounded-xl z-0 cursor-pointer"
      />
      <div className="flex items-center gap-2 flex-1 min-w-0 relative z-10">
        <div
          onPointerDown={(e) => {
            dragControls.start(e);
          }}
          className="cursor-grab active:cursor-grabbing touch-none flex items-center"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
        </div>
        <span className="font-medium truncate block cursor-pointer">
          {project.name}
        </span>
      </div>
    </div>
  );
}

export default DesktopProjectsListItem;
