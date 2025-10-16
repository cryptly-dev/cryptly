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
        className="absolute inset-0 rounded-xl cursor-pointer"
      />
      <span className="font-medium truncate block relative pointer-events-none">
        {project.name}
      </span>
      <div
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
        className="cursor-grab active:cursor-grabbing touch-none flex items-center relative z-10 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground/60" />
      </div>
    </div>
  );
}

export default DesktopProjectsListItem;
