import { DesktopProjectsList } from "./DesktopProjectsList";
import { DesktopProjectTile } from "./DesktopProjectTile";
import { DesktopSidebarButtons } from "./DesktopSidebarButtons";
import { LogoIcon } from "@/components/ui/logo-icon";
import { useProjects } from "@/lib/hooks/useProjects";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import Beams from "@/components/Beams";

export function DesktopProjectView() {
  const { activeProject } = useProjects();
  const [showProjectView, setShowProjectView] = useState(true);
  const navigate = useNavigate();

  // Automatically show project view when a project is active
  const shouldShowProjectView = showProjectView && activeProject;

  return (
    <div className="h-screen w-full flex bg-background text-foreground">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-border bg-card/30 flex flex-col overflow-hidden">
        {/* Logo Header */}
        <div className="p-4 flex items-center gap-2 border-b border-border">
          <LogoIcon className="w-6 h-6" />
          <span className="text-base font-medium">Cryptly</span>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence initial={false}>
            {shouldShowProjectView ? (
              <motion.div
                key="project-view"
                initial={{ x: 264 }}
                animate={{ x: 0 }}
                exit={{ x: 264 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 w-full flex flex-col"
              >
                {/* Back button and project name */}
                <div className="border-b border-border p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowProjectView(false);
                      navigate({ to: "/app/project" });
                    }}
                    className="w-full justify-start mb-3 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    All Projects
                  </Button>
                  <h2 className="font-semibold text-sm truncate">
                    {activeProject?.name}
                  </h2>
                </div>

                {/* Navigation Buttons */}
                <div className="flex-1 p-4">
                  <DesktopSidebarButtons />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="projects-list"
                initial={{ x: -264 }}
                animate={{ x: 0 }}
                exit={{ x: -264 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 w-full"
              >
                <DesktopProjectsList
                  onProjectSelect={() => setShowProjectView(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeProject ? (
            <DesktopProjectTile />
          ) : (
            <div className="h-full flex items-center justify-center relative overflow-hidden">
              {/* Background Beams */}
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <Beams />
              </div>

              {/* Empty State Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center z-10 px-8 max-w-md"
              >
                <div className="mb-4">
                  <LogoIcon className="w-16 h-16 mx-auto text-muted-foreground/50" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  Select a Project
                </h2>
                <p className="text-muted-foreground text-sm">
                  Choose a project from the sidebar to manage your secrets, API
                  keys, and sensitive data
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
