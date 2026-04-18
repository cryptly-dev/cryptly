import { AddProjectDialog } from "@/components/dialogs/AddProjectDialog";
import { Button } from "@/components/ui/button";
import { BlinkingCursor } from "@/components/ui/BlinkingCursor";
import { CryptlyLogo } from "@/components/ui/CryptlyLogo";
import { TypingDots } from "@/components/ui/TypingDots";
import { authLogic } from "@/lib/logics/authLogic";
import { projectsLogic } from "@/lib/logics/projectsLogic";
import { IconPlus } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useValues } from "kea";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

export function CreateFirstProjectView() {
  const navigate = useNavigate();
  const { projects, projectsLoading } = useValues(projectsLogic);
  const { isLoggedIn } = useValues(authLogic);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/app/login" });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    // Wait for projects to finish loading
    if (projectsLoading) {
      return;
    }

    // If there are projects, navigate to the most recent one
    if (projects && projects.length > 0) {
      // Sort by updatedAt to find the most recent project
      const sortedProjects = [...projects].sort((a, b) => {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });

      const targetProjectId = sortedProjects[0].id;

      // Use replace navigation so back button doesn't bounce through this loading page
      navigate({
        to: "/app/project/$projectId",
        params: { projectId: targetProjectId },
        replace: true,
      });
    }
  }, [projects, projectsLoading, navigate]);

  // Show loading state while fetching projects
  if (projectsLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <BlinkingCursor className="h-12 w-3" />
          <span className="text-lg text-muted-foreground">
            Loading your projects<TypingDots />
          </span>
        </div>
      </div>
    );
  }

  // Show empty state if no projects
  if (projects && projects.length === 0) {
    return <EmptyProjectsState />;
  }

  // This shouldn't be visible since we navigate away in useEffect,
  // but keep it for edge cases
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <BlinkingCursor className="h-12 w-3" />
        <span className="text-lg text-muted-foreground">
          Redirecting to your project<TypingDots />
        </span>
      </div>
    </div>
  );
}

function EmptyProjectsState() {
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);

  const handleCreateProject = () => {
    posthog.capture("add_project_button_clicked");
    setIsAddProjectDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-8">
      <div className="relative z-10 w-full max-w-xs">
        <div className="text-center space-y-6">
          {/* Logo */}
          <CryptlyLogo size={56} className="mx-auto" />

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              No projects yet
            </h1>
            <p className="text-sm text-muted-foreground">
              Create your first project to start managing your encrypted secrets.
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleCreateProject}
            size="default"
            className="w-2/3 mx-auto cursor-pointer gap-2 rounded-xl"
          >
            <IconPlus className="w-5 h-5" />
            Create your first project
          </Button>
        </div>

        {/* Add Project Dialog */}
        <AddProjectDialog
          open={isAddProjectDialogOpen}
          onOpenChange={setIsAddProjectDialogOpen}
        />
      </div>
    </div>
  );
}
