import { Button } from "@/components/ui/button";
import { CryptlyLogo } from "@/components/ui/CryptlyLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProjects } from "@/lib/hooks/useProjects";
import { projectsLogic } from "@/lib/logics/projectsLogic";
import type { Project } from "@/lib/api/projects.api";
import { UserApi } from "@/lib/api/user.api";
import { useAuth } from "@/lib/hooks/useAuth";
import { searchLogic } from "@/lib/logics/searchLogic";
import { suggestedProjectsLogic } from "@/lib/logics/suggestedProjectsLogic";
import { useActions, useAsyncActions, useValues } from "kea";
import {
  ChevronRight,
  FolderOpen,
  Info,
  LogOut,
  Pencil,
  Plus,
  Search,
  User,
  Check,
  Wand2,
  X,
} from "lucide-react";
import { motion, Reorder, useDragControls } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import DesktopProjectsListItem from "./DesktopProjectsListItem";
import posthog from "posthog-js";
import { authLogic } from "@/lib/logics/authLogic";
import { Link, useNavigate } from "@tanstack/react-router";

export function DesktopProjectsList() {
  const { projects, projectsLoading } = useValues(projectsLogic);
  const { finalizeProjectsOrder, addProject } = useActions(projectsLogic);
  const { userData, jwtToken } = useValues(authLogic);
  const { loadUserData } = useAsyncActions(authLogic);
  const { logout } = useAuth();
  const { searchQuery } = useValues(searchLogic);
  const { setSearchQuery } = useActions(searchLogic);
  const {
    suggestedProjects,
    loading: suggestionsLoading,
    acceptingRepoId,
    hasInstallations,
  } = useValues(suggestedProjectsLogic);
  const { acceptSuggestion, dismissSuggestion } = useActions(
    suggestedProjectsLogic
  );
  const navigate = useNavigate();

  const uniqueProjects = useMemo(() => {
    if (!projects) return projects;
    const seen = new Set<string>();
    return projects.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [projects]);

  const [localProjects, setLocalProjects] = useState(uniqueProjects);
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(
    userData?.displayName || ""
  );
  const [isSavingDisplayName, setIsSavingDisplayName] = useState(false);

  // Inline project creation state
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const newProjectInputRef = useRef<HTMLInputElement>(null);

  const { activeProject, pendingProjectId } = useProjects();

  useEffect(() => {
    if (userData?.displayName) {
      setDisplayNameInput(userData.displayName);
    }
  }, [userData?.displayName]);

  const handleSaveDisplayName = async () => {
    if (!jwtToken || !displayNameInput.trim()) return;
    setIsSavingDisplayName(true);
    try {
      await UserApi.updateMe(jwtToken, {
        displayName: displayNameInput.trim(),
      });
      await loadUserData();
      setIsEditingDisplayName(false);
    } catch (error) {
      console.error("Failed to update display name:", error);
    } finally {
      setIsSavingDisplayName(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayNameInput(userData?.displayName || "");
    setIsEditingDisplayName(false);
  };

  // Inline project creation handlers
  const handleStartAddProject = () => {
    setIsAddingProject(true);
    setNewProjectName("");
    posthog.capture("add_project_button_clicked");
    // Focus the input after render
    setTimeout(() => newProjectInputRef.current?.focus(), 0);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || isCreatingProject) return;

    setIsCreatingProject(true);
    try {
      await addProject({ name: newProjectName.trim() }, (projectId) =>
        navigate({ to: `/app/project/${projectId}` })
      );
      setIsAddingProject(false);
      setNewProjectName("");
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleCancelAddProject = () => {
    if (isCreatingProject) return;
    setIsAddingProject(false);
    setNewProjectName("");
  };

  useEffect(() => {
    setLocalProjects(uniqueProjects);
  }, [uniqueProjects]);

  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 500, damping: 30, mass: 0.5 },
    },
  } as const;

  return (
    <div className="h-full flex flex-col">
      {/* App Logo / Brand */}
      <div className="px-4 py-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity"
        >
          <CryptlyLogo size={28} />
          <span className="font-semibold text-lg tracking-tight">Cryptly</span>
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            name="project-search"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
            className="w-full h-9 pl-9 pr-3 rounded-md bg-muted/50 border-[0.5px] border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Projects Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Section Header */}
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <FolderOpen className="w-4 h-4" />
            <span>Projects</span>
            {projectsLoading ? (
              <Spinner className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              localProjects && (
                <span className="text-muted-foreground">
                  ({localProjects.length})
                </span>
              )
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  aria-label="Add project"
                  className="text-muted-foreground hover:text-foreground hover:bg-neutral-800 cursor-pointer rounded-md w-6 h-6 flex items-center justify-center transition-colors"
                  onClick={handleStartAddProject}
                  disabled={isAddingProject}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top">Add project</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar px-2">
          {/* Inline Add Project Input */}
          {isAddingProject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-0.5"
            >
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm border border-primary/30 bg-primary/5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <input
                  ref={newProjectInputRef}
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateProject();
                    if (e.key === "Escape") handleCancelAddProject();
                  }}
                  onBlur={() => {
                    // Small delay to allow button clicks to register
                    setTimeout(() => {
                      if (!isCreatingProject && !newProjectName.trim()) {
                        handleCancelAddProject();
                      }
                    }, 150);
                  }}
                  placeholder="Project name..."
                  disabled={isCreatingProject}
                  className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || isCreatingProject}
                  className="h-6 w-6 p-0 cursor-pointer"
                >
                  {isCreatingProject ? (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelAddProject}
                  disabled={isCreatingProject}
                  className="h-6 w-6 p-0 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {localProjects && localProjects.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={localProjects}
              onReorder={(newOrder) => {
                setLocalProjects(newOrder);
              }}
              className="space-y-0.5"
              as="nav"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {localProjects.map((project) => {
                const isActive = project.id === activeProject?.id;
                const isLoading = project.id === pendingProjectId;

                return (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    isActive={isActive}
                    isLoading={isLoading}
                    itemVariants={itemVariants}
                    onDragEnd={() => {
                      finalizeProjectsOrder(localProjects);
                    }}
                  />
                );
              })}
            </Reorder.Group>
          ) : !projectsLoading && !isAddingProject ? (
            <div className="px-2 py-4 text-sm text-muted-foreground">
              No projects yet
            </div>
          ) : null}
        </div>
      </div>

      {/* Suggested Projects */}
      {hasInstallations && suggestedProjects.length > 0 && !projectsLoading && (
        <motion.div
          className="border-t border-border/50 px-2 py-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0, 1, 0.25, 1] }}
        >
          <div className="px-2 py-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Suggested</span>
            {suggestionsLoading && <Spinner className="w-3 h-3" />}
            <div className="relative group/info ml-auto">
              <Info className="w-3 h-3 cursor-help" />
              <div className="absolute bottom-full mb-1.5 right-0 w-48 bg-popover text-popover-foreground text-xs rounded-md py-2 px-3 opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none shadow-md border border-border z-50">
                We are checking repositories you've recently created on GitHub
                that don't have a matching Cryptly project
              </div>
            </div>
          </div>
          <div className="space-y-0.5">
            {suggestedProjects.map((repo) => {
              const isAccepting = acceptingRepoId === repo.id;
              return (
                <div
                  key={repo.id}
                  className="group relative flex items-center justify-between rounded-md px-3 py-2.5 text-sm select-none text-muted-foreground/60 hover:bg-neutral-800/50 hover:text-muted-foreground transition-colors"
                >
                  <button
                    type="button"
                    disabled={acceptingRepoId !== null}
                    onClick={() => {
                      posthog.capture("suggested_project_accepted");
                      acceptSuggestion(repo, (projectId) =>
                        navigate({ to: `/app/project/${projectId}` })
                      );
                    }}
                    className="absolute inset-0 rounded-md cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center gap-2 min-w-0 flex-1 pointer-events-none">
                    {isAccepting ? (
                      <Spinner className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <Plus className="w-3 h-3 flex-shrink-0 opacity-50" />
                    )}
                    <span className="truncate text-[13px]">{repo.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissSuggestion(repo.id);
                    }}
                    className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Bottom Section - User Profile */}
      <div className="border-t border-border/50 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer text-left"
            >
              {userData?.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt={userData.displayName || "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {userData?.displayName || userData?.email || "User"}
                </p>
                {userData?.email && userData?.displayName && (
                  <p className="text-xs text-muted-foreground truncate">
                    {userData.email}
                  </p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-64">
            {isEditingDisplayName ? (
              <div className="p-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Display Name
                </label>
                <div className="flex gap-1.5">
                  <Input
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    placeholder="Enter display name"
                    className="h-8 text-sm flex-1"
                    maxLength={200}
                    disabled={isSavingDisplayName}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveDisplayName();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveDisplayName}
                    isLoading={isSavingDisplayName}
                    className="h-8 w-8 p-0 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSavingDisplayName}
                    className="h-8 w-8 p-0 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setIsEditingDisplayName(true);
                }}
                className="cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit display name
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ProjectListItem({
  project,
  isActive,
  isLoading,
  itemVariants,
  onDragEnd,
}: {
  project: Project;
  isActive: boolean;
  isLoading: boolean;
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
        isLoading={isLoading}
        dragControls={dragControls}
      />
    </Reorder.Item>
  );
}
