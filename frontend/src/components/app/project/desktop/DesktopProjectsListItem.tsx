import { type Project } from "@/lib/api/projects.api";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { GripVertical } from "lucide-react";

interface DesktopProjectsListItemProps {
  project: Project;
  isActive: boolean;
}

export function DesktopProjectsListItem({
  project,
  isActive,
}: DesktopProjectsListItemProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center justify-between rounded-xl p-3 text-sm transition border cursor-grab active:cursor-grabbing",
        isActive
          ? "bg-primary/10 text-primary border-primary/20"
          : "border-transparent hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Link
        to="/app/project/$projectId"
        params={{ projectId: project.id }}
        aria-label={`Open project ${project.name}`}
        className="absolute inset-0 rounded-xl pointer-events-auto"
        onClick={(e) => {
          // Prevent navigation when dragging
          if ((e.target as HTMLElement).closest(".reorder-handle")) {
            e.preventDefault();
          }
        }}
      />
      <div className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
        <GripVertical className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors reorder-handle pointer-events-auto" />
        <span className="font-medium truncate block">{project.name}</span>
      </div>
    </div>
  );
}

export default DesktopProjectsListItem;
