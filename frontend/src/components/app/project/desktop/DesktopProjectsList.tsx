import AddProjectDialog from "@/components/dialogs/AddProjectDialog";
import { useProjects } from "@/lib/hooks/useProjects";
import { projectsLogic } from "@/lib/logics/projectsLogic";
import { useValues } from "kea";
import { Plus } from "lucide-react";
import { useState } from "react";
import posthog from "posthog-js";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DesktopProjectsListProps {
  onProjectSelect?: () => void;
}

export function DesktopProjectsList({ onProjectSelect }: DesktopProjectsListProps) {
  const { projects, projectsLoading } = useValues(projectsLogic);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { activeProject } = useProjects();
  const navigate = useNavigate();

  if (!projects || (!projects.length && projectsLoading)) {
    return null;
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Projects
        </h3>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Add project"
          className="h-6 w-6 cursor-pointer"
          onClick={() => {
            setAddDialogOpen(true);
            posthog.capture("add_project_button_clicked");
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
        {projects.map((project) => {
          const isActive = project.id === activeProject?.id;
          return (
            <button
              key={project.id}
              onClick={() => {
                navigate({
                  to: "/app/project/$projectId",
                  params: { projectId: project.id },
                });
                if (onProjectSelect) {
                  onProjectSelect();
                }
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors truncate",
                isActive
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {project.name}
            </button>
          );
        })}
      </div>

      <AddProjectDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
