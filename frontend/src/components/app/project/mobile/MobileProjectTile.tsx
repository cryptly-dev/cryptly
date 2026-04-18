import AddProjectDialog from "@/components/dialogs/AddProjectDialog";
import { CryptlyLogo } from "@/components/ui/CryptlyLogo";
import { IntegrationsTabContent } from "@/components/dialogs/IntegrationsDialog";
import { MembersTabContent } from "@/components/dialogs/ProjectAccessDialog";
import { SettingsTabContent } from "@/components/dialogs/ProjectSettingsDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectMemberRole } from "@/lib/api/projects.api";
import { UserApi } from "@/lib/api/user.api";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProjects } from "@/lib/hooks/useProjects";
import { authLogic } from "@/lib/logics/authLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import { projectsLogic } from "@/lib/logics/projectsLogic";
import { searchLogic, type SearchableProject } from "@/lib/logics/searchLogic";
import { cn, getRelativeTime } from "@/lib/utils";
import {
  IconBraces,
  IconBrandGithub,
  IconHistory,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useActions, useAsyncActions, useValues } from "kea";
import {
  Check,
  FolderOpen,
  LogOut,
  Pencil,
  Plus,
  Search,
  User,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";
import { SavePushPill } from "../SavePushPill";
import { MobileFileEditor } from "./MobileFileEditor";
import { MobileHistoryView } from "./MobileHistoryView";

type MobileTabType = "editor" | "history" | "members" | "integrations" | "settings";

const MOBILE_TABS: { id: MobileTabType; label: string; icon: typeof IconBraces }[] = [
  { id: "editor", label: "Editor", icon: IconBraces },
  { id: "history", label: "History", icon: IconHistory },
  { id: "members", label: "Members", icon: IconUsers },
  { id: "integrations", label: "GitHub secrets", icon: IconBrandGithub },
  { id: "settings", label: "Settings", icon: IconSettings },
];

export function MobileProjectTile() {
  const {
    projectData,
    isSubmitting,
    isEditorDirty,
    inputValue,
    lastEditAuthor,
    currentUserRole,
  } = useValues(projectLogic);
  const { userData } = useValues(authLogic);
  const { projects } = useValues(projectsLogic);
  const { activeProject } = useProjects();
  const { updateProjectContent, setInputValue } = useActions(projectLogic);
  const { isSearching, searchResults, searchQuery, searchableProjectsLoading } = useValues(searchLogic);
  const { setSearchQuery, clearSearch } = useActions(searchLogic);
  const navigate = useNavigate();
  const isReadOnly = currentUserRole === ProjectMemberRole.Read;
  const [activeTab, setActiveTab] = useState<MobileTabType>("editor");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        event.stopPropagation();
        if (
          !isSubmitting &&
          isEditorDirty &&
          activeTab === "editor" &&
          !isReadOnly
        ) {
          updateProjectContent();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [
    isSubmitting,
    isEditorDirty,
    updateProjectContent,
    inputValue,
    activeTab,
    isReadOnly,
  ]);

  const changedBy = useMemo(() => {
    if (lastEditAuthor?.id === userData?.id) {
      return "you";
    }
    return lastEditAuthor?.displayName;
  }, [lastEditAuthor, userData]);

  const handleProjectChange = (projectId: string) => {
    navigate({
      to: "/app/project/$projectId",
      params: { projectId },
    });
  };

  // Show search results when searching
  if (isSearching) {
    return (
      <div className="h-full flex flex-col">
        <MobileSearchHeader 
          query={searchQuery} 
          resultCount={searchResults.length}
          isLoading={searchableProjectsLoading}
          onClose={clearSearch}
          onQueryChange={setSearchQuery}
        />
        <div className="flex-1 overflow-y-auto p-3">
          {searchableProjectsLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : (
            <MobileSearchResultsList results={searchResults} query={searchQuery} onResultClick={clearSearch} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <MobileProjectHeader
        projects={projects || []}
        activeProject={activeProject}
        onProjectChange={handleProjectChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 h-full relative overflow-hidden">
            {!projectData ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/60 border-t-transparent mb-2"></div>
                  <div className="text-sm text-muted-foreground">
                    Loading project...
                  </div>
                </div>
              </div>
        ) : activeTab === "history" ? (
              <MobileHistoryView />
        ) : activeTab === "members" ? (
              <div className="h-full overflow-y-auto p-4">
                <MembersTabContent />
              </div>
        ) : activeTab === "integrations" ? (
              <div className="h-full overflow-y-auto p-4">
                <IntegrationsTabContent />
              </div>
        ) : activeTab === "settings" ? (
              <div className="h-full overflow-y-auto p-4">
                <SettingsTabContent />
              </div>
            ) : (
              <div className="h-full relative">
                <MobileFileEditor
                  value={inputValue}
                  onChange={(v) => setInputValue(v)}
                  readOnly={isReadOnly}
                />
                {/* Changed-by label — bottom */}
                <AnimatePresence mode="wait">
                  {changedBy && (
                    <motion.div
                      className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center z-10"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ ease: "easeInOut", duration: 0.1 }}
                    >
                      <span className="rounded-full bg-card/80 backdrop-blur px-3 py-1 text-xs text-muted-foreground shadow-sm border border-border/50">
                        Changed by {changedBy}{" "}
                        {getRelativeTime(projectData.updatedAt)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Save/Push pill — top right */}
                <div className="absolute top-3 right-3 z-10">
                  <SavePushPill />
                </div>
              </div>
        )}
      </div>

    </div>
  );
}

function MobileProjectHeader({
  projects,
  activeProject,
  onProjectChange,
  activeTab,
  onTabChange,
}: {
  projects: any[];
  activeProject: any;
  onProjectChange: (projectId: string) => void;
  activeTab: MobileTabType;
  onTabChange: (tab: MobileTabType) => void;
}) {
  const { userData, jwtToken } = useValues(authLogic);
  const { loadUserData } = useAsyncActions(authLogic);
  const { logout } = useAuth();
  const { startSearch } = useActions(searchLogic);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(userData?.displayName || "");
  const [isSavingDisplayName, setIsSavingDisplayName] = useState(false);

  useEffect(() => {
    if (userData?.displayName) {
      setDisplayNameInput(userData.displayName);
    }
  }, [userData?.displayName]);

  const handleSaveDisplayName = async () => {
    if (!jwtToken || !displayNameInput.trim()) return;
    setIsSavingDisplayName(true);
    try {
      await UserApi.updateMe(jwtToken, { displayName: displayNameInput.trim() });
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

  const handleSelectChange = (value: string) => {
    if (value === "add-project") {
      posthog.capture("add_project_button_clicked");
      setAddDialogOpen(true);
    } else {
      onProjectChange(value);
    }
  };

  return (
    <div className="border-b border-border/50 bg-card/20 backdrop-blur-sm flex-shrink-0">
      {/* Top row - Project selector, Search icon, Avatar */}
      <div className="flex items-center gap-2 px-3 py-2">
        <Link to="/" className="flex-shrink-0">
          <CryptlyLogo size={24} />
        </Link>

        <Select
          value={activeProject?.id || ""}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="flex-1 h-9 border-border/50 bg-neutral-800">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <SelectValue placeholder="Select project">
                {activeProject?.name || "Select project"}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem
                key={project.id}
                value={project.id}
                className="cursor-pointer"
              >
                {project.name}
              </SelectItem>
            ))}
            <SelectItem
              value="add-project"
              className="text-muted-foreground cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add new project
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={startSearch}
          className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center transition-colors cursor-pointer text-muted-foreground"
        >
          <Search className="size-4" />
        </button>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden cursor-pointer"
            >
              {userData?.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt={userData.displayName || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-64">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">
                {userData?.displayName || userData?.email || "User"}
              </p>
              {userData?.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {userData.email}
                </p>
              )}
            </div>
            <DropdownMenuSeparator />
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

      {/* Horizontally scrollable tabs */}
      <div className="flex items-center overflow-x-auto px-3 pb-2 gap-1 scrollbar-none">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onTabChange(tab.id);
                posthog.capture(`${tab.id}_tab_clicked`);
              }}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex-shrink-0",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-mobile"
                  className="absolute inset-0 bg-neutral-800 rounded-md"
                  transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                />
              )}
              <Icon className="relative z-10 size-4" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AddProjectDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}

// Mobile Search Components

interface MobileSearchHeaderProps {
  query: string;
  resultCount: number;
  isLoading: boolean;
  onClose: () => void;
  onQueryChange: (query: string) => void;
}

function MobileSearchHeader({ query, resultCount, isLoading, onClose, onQueryChange }: MobileSearchHeaderProps) {
  return (
    <div className="border-b border-border/50 bg-card/20 backdrop-blur-sm px-3 py-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 cursor-pointer flex-shrink-0"
        >
          <X className="size-4" />
        </Button>
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            name="project-search"
            placeholder="Search..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
            className="w-full h-8 pl-8 pr-3 rounded-md bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>
        {!isLoading && (
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

interface MobileSearchResultsListProps {
  results: SearchableProject[];
  query: string;
  onResultClick: () => void;
}

function MobileSearchResultsList({ results, query, onResultClick }: MobileSearchResultsListProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <Search className="size-10 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">No projects found</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Try a different search term
        </p>
      </div>
    );
  }

  const getContentSnippet = (content: string, searchQuery: string): string | null => {
    const lowerContent = content.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    const matchIndex = lowerContent.indexOf(lowerQuery);
    
    if (matchIndex === -1) return null;
    
    const start = Math.max(0, matchIndex - 20);
    const end = Math.min(content.length, matchIndex + searchQuery.length + 40);
    let snippet = content.slice(start, end);
    
    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet = snippet + "...";
    
    return snippet;
  };

  return (
    <div className="space-y-2">
      {results.map((project) => {
        const contentSnippet = getContentSnippet(project.decryptedContent, query);
        const matchedInContent = contentSnippet !== null;

        return (
          <Link
            key={project.id}
            to="/app/project/$projectId"
            params={{ projectId: project.id }}
            onClick={onResultClick}
            className="flex items-start gap-3 p-3 rounded-lg border border-border/50 active:bg-neutral-800 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
              <FolderOpen className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {project.name}
              </p>
              {matchedInContent && (
                <p className="text-muted-foreground mt-1 font-mono text-xs bg-neutral-800 px-2 py-1 rounded truncate">
                  {contentSnippet}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
