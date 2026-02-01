import AddProjectDialog from "@/components/dialogs/AddProjectDialog";
import { useProjects } from "@/lib/hooks/useProjects";
import { projectsLogic } from "@/lib/logics/projectsLogic";
import type { Project } from "@/lib/api/projects.api";
import { useActions, useValues } from "kea";
import { FolderOpen, Plus } from "lucide-react";
import { motion, Reorder, useDragControls } from "motion/react";
import { useEffect, useState } from "react";
import DesktopProjectsListItem from "./DesktopProjectsListItem";
import posthog from "posthog-js";

export function DesktopProjectsList() {
  const { projects, projectsLoading } = useValues(projectsLogic);
  const { finalizeProjectsOrder } = useActions(projectsLogic);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isAddProjectButtonHovered, setAddProjectButtonHovered] =
    useState(false);
  const [localProjects, setLocalProjects] = useState(projects);

  const { activeProject } = useProjects();

  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  const containerVariants = {
    hidden: { opacity: 0, y: 200, scale: 0.7 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 1, ease: [0, 1, 0, 1] },
    },
  } as const;

  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 500, damping: 30, mass: 0.5 },
    },
  } as const;

  if (!localProjects || (!localProjects.length && projectsLoading)) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      layout="position"
    >
      <motion.div
        className="h-[65vh] rounded-2xl border border-border bg-card/60 backdrop-blur shadow-sm overflow-y-auto custom-scrollbar"
        layout="position"
      >
        <motion.h2
          className="font-semibold text-muted-foreground tracking-wide flex items-center justify-between p-4 sticky top-0 bg-gradient-to-b from-card/60 via-transparent to-transparent z-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0, 1, 0, 1], delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <span>Projects</span>
            <span className="text-sm">({localProjects.length})</span>
          </div>
          <motion.button
            type="button"
            aria-label="Add project"
            className="text-muted-foreground hover:text-foreground cursor-pointer bg-accent/100 rounded-md w-8 h-8 justify-center items-center"
            onClick={() => {
              setAddDialogOpen(true);
              posthog.capture("add_project_button_clicked");
            }}
            animate={{ scale: isAddProjectButtonHovered ? 1.15 : 1 }}
            onHoverStart={() => setAddProjectButtonHovered(true)}
            onHoverEnd={() => setAddProjectButtonHovered(false)}
          >
            <div className="flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
          </motion.button>
        </motion.h2>
        <Reorder.Group
          axis="y"
          values={localProjects}
          onReorder={(newOrder) => {
            setLocalProjects(newOrder);
          }}
          className="space-y-2 px-3 pb-3"
          as="nav"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {localProjects.map((project) => {
            const isActive = project.id === activeProject?.id;

            return (
              <ProjectListItem
                key={project.id}
                project={project}
                isActive={isActive}
                itemVariants={itemVariants}
                onDragEnd={() => {
                  finalizeProjectsOrder(localProjects);
                }}
              />
            );
          })}
        </Reorder.Group>
      </motion.div>
      <AddProjectDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </motion.div>
  );
}

function ProjectListItem({
  project,
  isActive,
  itemVariants,
  onDragEnd,
}: {
  project: Project;
  isActive: boolean;
  itemVariants: any;
  onDragEnd: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={project}
      className="list-none"
      variants={itemVariants}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
    >
      <DesktopProjectsListItem
        project={project}
        isActive={isActive}
        dragControls={dragControls}
      />
    </Reorder.Item>
  );
}
