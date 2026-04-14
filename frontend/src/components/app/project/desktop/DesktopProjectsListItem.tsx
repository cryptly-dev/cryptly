import { type Project } from "@/lib/api/projects.api";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { GripVertical } from "lucide-react";
import { motion, type DragControls } from "motion/react";

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
          ? "text-primary"
          : "text-muted-foreground hover:bg-neutral-800/50 hover:text-foreground"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-project"
          className="absolute inset-0 bg-neutral-800 rounded-md pointer-events-none"
          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
        />
      )}
      <Link
        to="/app/project/$projectId"
        params={{ projectId: project.id }}
        aria-label={`Open project ${project.name}`}
        className="absolute inset-0 rounded-md cursor-pointer"
      />
      <div className="relative z-10 flex items-center gap-2 min-w-0 flex-1 pointer-events-none">
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
