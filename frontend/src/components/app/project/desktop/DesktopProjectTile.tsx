import { CopyAllButton } from "@/components/app/project/CopyAllButton";
import { DesktopHistoryView } from "@/components/app/project/desktop/DesktopHistoryView";
import { FileEditor } from "@/components/app/project/FileEditor";
import { SavePushButtonGroup } from "@/components/app/project/SavePushButtonGroup";
import { IntegrationsTabContent } from "@/components/dialogs/IntegrationsDialog";
import { MembersTabContent } from "@/components/dialogs/ProjectAccessDialog";
import { SettingsTabContent } from "@/components/dialogs/ProjectSettingsDialog";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { Kbd } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectMemberRole } from "@/lib/api/projects.api";
import { authLogic } from "@/lib/logics/authLogic";
import { ftuxLogic } from "@/lib/logics/ftuxLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import type { SearchableProject } from "@/lib/logics/searchLogic";
import { searchLogic } from "@/lib/logics/searchLogic";
import { cn, getRelativeTime } from "@/lib/utils";
import {
  IconBraces,
  IconHistory,
  IconPlugConnected,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useActions, useValues } from "kea";
import { AlertTriangle, ArrowLeft, CommandIcon, FolderOpen, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import React, { useEffect, useMemo, useState } from "react";

type TabType = "editor" | "history" | "members" | "settings" | "integrations";

const TABS: { id: TabType; label: string; icon: typeof IconBraces }[] = [
  { id: "editor", label: "Editor", icon: IconBraces },
  { id: "history", label: "History", icon: IconHistory },
  { id: "members", label: "Members", icon: IconUsers },
  { id: "integrations", label: "Integrations", icon: IconPlugConnected },
  { id: "settings", label: "Settings", icon: IconSettings },
];

export function DesktopProjectTile() {
  const {
    projectData,
    isSubmitting,
    isEditorDirty,
    inputValue,
    lastEditAuthor,
    isExternallyUpdated,
    currentUserRole,
  } = useValues(projectLogic);
  const { userData } = useValues(authLogic);
  const { updateProjectContent, setInputValue } = useActions(projectLogic);
  const isReadOnly = currentUserRole === ProjectMemberRole.Read;
  const { shouldShowEditorTooltip, currentStepNumber } = useValues(ftuxLogic);
  const {
    startFTUX,
    skipFTUX,
    nextStep,
    previousStep,
    userMadeEdit,
    userSaved,
  } = useActions(ftuxLogic);
  const { isSearching, searchResults, searchQuery, searchableProjectsLoading } = useValues(searchLogic);
  const { clearSearch } = useActions(searchLogic);
  const [_currentTime, setCurrentTime] = useState(Date.now()); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [hasStartedFTUX, setHasStartedFTUX] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("editor");

  const changedBy = useMemo(() => {
    if (lastEditAuthor?.id === userData?.id) {
      return "you";
    }

    if (!lastEditAuthor) {
      return null;
    }

    return lastEditAuthor?.displayName;
  }, [lastEditAuthor, userData]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        posthog.capture("save_button_clicked");
        event.preventDefault();
        event.stopPropagation();
        if (
          !isSubmitting &&
          isEditorDirty &&
          activeTab === "editor" &&
          !isExternallyUpdated &&
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
    isExternallyUpdated,
    isReadOnly,
  ]);

  // Update the current time every second to refresh the relative time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Start FTUX when project loads for the first time
  useEffect(() => {
    if (projectData && !hasStartedFTUX) {
      setHasStartedFTUX(true);
      startFTUX();
    }
  }, [projectData, hasStartedFTUX, startFTUX]);

  // Track when user makes their first edit
  useEffect(() => {
    if (isEditorDirty) {
      userMadeEdit();
    }
  }, [isEditorDirty, userMadeEdit]);

  // Track when user saves - detect when isSubmitting goes from true to false
  const prevIsSubmitting = React.useRef(isSubmitting);
  useEffect(() => {
    if (prevIsSubmitting.current && !isSubmitting) {
      // Save just completed
      userSaved();
    }
    prevIsSubmitting.current = isSubmitting;
  }, [isSubmitting, userSaved]);

  if (!projectData) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-full flex flex-col">
          <ProjectHeaderSkeleton activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1 relative overflow-hidden">
            <div className="h-full p-6">
              <EditorSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show search results when searching
  if (isSearching) {
    return (
      <div className="h-full flex flex-col">
        <SearchResultsHeader 
          query={searchQuery} 
          resultCount={searchResults.length} 
          isLoading={searchableProjectsLoading}
          onClose={clearSearch} 
        />
        <div className="flex-1 overflow-y-auto p-4">
          {searchableProjectsLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : (
            <SearchResultsList results={searchResults} query={searchQuery} onResultClick={clearSearch} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ProjectHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "editor" && (
        <TooltipProvider>
          <Tooltip
              open={shouldShowEditorTooltip}
            delayDuration={0}
          >
            <TooltipTrigger asChild>
                <div className="relative h-full">
                  <div className="h-full">
                    <FileEditor
                      value={inputValue}
                      onChange={(v) => setInputValue(v)}
                      readOnly={isReadOnly}
                    />
                    <AnimatePresence mode="wait">
                      {changedBy && (
                        <motion.div
                          className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center"
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
                  </div>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              sideOffset={-180}
              className="w-80 p-4 shadow-2xl"
              onPointerDownOutside={(e) => e.preventDefault()}
            >
              <TooltipArrow />
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {currentStepNumber} of 3
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipFTUX}
                    className="h-5 w-5 hover:bg-secondary cursor-pointer"
                    aria-label="Skip tutorial"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-sm text-foreground leading-relaxed">
                  <div>Store API keys, tokens, and sensitive data.</div>
                  <div>Everything is end-to-end encrypted.</div>
                </p>

                {/* Actions */}
                <div className="flex justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipFTUX}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Skip tutorial
                  </Button>
                  <div className="flex gap-2">
                    {currentStepNumber > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousStep}
                        className="px-2 border cursor-pointer"
                        aria-label="Previous step"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={nextStep}
                      className="font-semibold cursor-pointer"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        )}

        {activeTab === "history" && (
          <DesktopHistoryView />
        )}

        {activeTab === "members" && (
          <div className="h-full overflow-y-auto p-6 flex justify-center">
            <MembersTabContent />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="h-full overflow-y-auto p-6 flex justify-center">
            <SettingsTabContent />
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="h-full overflow-y-auto p-6 flex justify-center">
            <IntegrationsTabContent />
          </div>
        )}
      </div>
    </div>
  );
}

interface ProjectHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

function ProjectHeader({ activeTab, onTabChange }: ProjectHeaderProps) {
  const { isExternallyUpdated } = useValues(projectLogic);

  const {
    shouldShowSaveTooltip,
    shouldShowIntegrationsTooltip,
    currentStepNumber,
  } = useValues(ftuxLogic);
  const { skipFTUX, nextStep, previousStep, userOpenedIntegrationsDialog } =
    useActions(ftuxLogic);

  // Track when integrations tab is opened for FTUX
  useEffect(() => {
    if (activeTab === "integrations") {
      userOpenedIntegrationsDialog();
    }
  }, [activeTab, userOpenedIntegrationsDialog]);

  return (
    <div className="flex h-14 items-center justify-between px-3 border-b border-border/50 bg-card/20 backdrop-blur-sm flex-shrink-0 overflow-visible">
      {/* Tabs */}
      <div className="flex items-center gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isIntegrations = tab.id === "integrations";

          const tabButton = (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onTabChange(tab.id);
                posthog.capture(`${tab.id}_tab_clicked`);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );

          // Wrap integrations tab with FTUX tooltip
          if (isIntegrations && shouldShowIntegrationsTooltip) {
            return (
              <TooltipProvider key={tab.id}>
                <Tooltip open={shouldShowIntegrationsTooltip} delayDuration={0}>
                  <TooltipTrigger asChild>
                    {tabButton}
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    className="w-80 p-4 shadow-2xl"
                    onPointerDownOutside={(e) => e.preventDefault()}
                  >
                    <TooltipArrow />
                    <div className="flex flex-col gap-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-sm font-medium text-muted-foreground">
                          Step {currentStepNumber} of 3
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={skipFTUX}
                          className="h-5 w-5 hover:bg-secondary cursor-pointer"
                          aria-label="Skip tutorial"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-foreground leading-relaxed">
                        <div>
                          Link external services like{" "}
                          <GitHubIcon className="inline w-4 h-4 align-text-bottom" />{" "}
                          GitHub to automatically sync your secrets.
                        </div>
                      </p>

                      {/* Actions */}
                      <div className="flex justify-between gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={skipFTUX}
                          className="text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Skip tutorial
                        </Button>
                        <div className="flex gap-2">
                          {currentStepNumber > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={previousStep}
                              className="px-2 border cursor-pointer"
                              aria-label="Previous step"
                            >
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={nextStep}
                            className="font-semibold cursor-pointer"
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return tabButton;
        })}
      </div>

      {/* Right side - actions */}
      <div className="flex items-center gap-3">
        {isExternallyUpdated && (
          <div className="relative group/tooltip">
            <AlertTriangle className="size-4 text-amber-500" />
            <div className="absolute bottom-full mb-2 right-0 w-max max-w-xs bg-black text-white text-sm rounded-md py-2 px-3 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
              <p className="font-medium">
                This project has just been updated by someone else.
              </p>
              <p className="font-medium">Refresh to get the new content.</p>
            </div>
          </div>
        )}
        {activeTab === "editor" && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <TooltipProvider>
                <Tooltip open={shouldShowSaveTooltip} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div>
                      <SavePushButtonGroup />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="end"
                    sideOffset={6}
                    className="w-80 p-4 shadow-2xl"
                    onPointerDownOutside={(e) => e.preventDefault()}
                  >
                    <TooltipArrow />
                    <div className="flex flex-col gap-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-sm font-medium text-muted-foreground">
                          Step {currentStepNumber} of 3
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={skipFTUX}
                          className="h-5 w-5 hover:bg-secondary cursor-pointer"
                          aria-label="Skip tutorial"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-foreground leading-relaxed">
                        Click Save or press{" "}
                        <Kbd className="inline-flex !text-white">
                          <CommandIcon className="size-3 !text-white" />
                        </Kbd>{" "}
                        + <Kbd className="inline-flex !text-white">S</Kbd>. Your
                        data is encrypted before it ever leaves your device.
                      </p>

                      {/* Actions */}
                      <div className="flex justify-between gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={skipFTUX}
                          className="text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Skip tutorial
                        </Button>
                        <div className="flex gap-2">
                          {currentStepNumber > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={previousStep}
                              className="px-2 border cursor-pointer"
                              aria-label="Previous step"
                            >
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={nextStep}
                            className="font-semibold cursor-pointer"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CopyAllButton />
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectHeaderSkeleton({ activeTab, onTabChange }: ProjectHeaderProps) {
  return (
    <div className="flex h-14 items-center justify-between px-3 border-b border-border/50 bg-card/20 backdrop-blur-sm flex-shrink-0">
      {/* Tabs */}
      <div className="flex items-center gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right side - actions */}
      <div className="flex items-center gap-3">
        {activeTab === "editor" && (
          <div className="flex items-center gap-3">
            <SavePushButtonGroup />
            <CopyAllButton disabled />
          </div>
        )}
      </div>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-[85%]" />
      <Skeleton className="h-5 w-[92%]" />
      <Skeleton className="h-5 w-[78%]" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-[88%]" />
      <Skeleton className="h-5 w-[95%]" />
      <Skeleton className="h-5 w-[82%]" />
      <Skeleton className="h-5 w-[90%]" />
      <Skeleton className="h-5 w-[76%]" />
    </div>
  );
}

// Search Results Components

interface SearchResultsHeaderProps {
  query: string;
  resultCount: number;
  isLoading: boolean;
  onClose: () => void;
}

function SearchResultsHeader({ query, resultCount, isLoading, onClose }: SearchResultsHeaderProps) {
  return (
    <div className="flex h-14 items-center justify-between px-4 border-b border-border/50 bg-card/20 backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center gap-3">
        <Search className="size-4 text-muted-foreground" />
        <span className="text-sm">
          <span className="text-muted-foreground">Results for</span>{" "}
          <span className="font-medium">"{query}"</span>
          {!isLoading && (
            <span className="text-muted-foreground ml-2">({resultCount})</span>
          )}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 px-3 cursor-pointer"
      >
        <X className="size-4 mr-1.5" />
        <span className="text-sm">Clear</span>
      </Button>
    </div>
  );
}

interface SearchResultsListProps {
  results: SearchableProject[];
  query: string;
  onResultClick: () => void;
}

function SearchResultsList({ results, query, onResultClick }: SearchResultsListProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <Search className="size-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">No projects found</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Try a different search term
        </p>
      </div>
    );
  }

  // Helper to get a snippet of content around the match
  const getContentSnippet = (content: string, searchQuery: string): string | null => {
    const lowerContent = content.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    const matchIndex = lowerContent.indexOf(lowerQuery);
    
    if (matchIndex === -1) return null;
    
    const start = Math.max(0, matchIndex - 30);
    const end = Math.min(content.length, matchIndex + searchQuery.length + 50);
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
            className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FolderOpen className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {project.name}
              </p>
              {matchedInContent && (
                <p className="text-muted-foreground mt-1 font-mono text-xs bg-muted/50 px-2 py-1 rounded">
                  {contentSnippet}
                </p>
              )}
            </div>
            <ArrowLeft className="size-4 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-opacity mt-3" />
          </Link>
        );
      })}
    </div>
  );
}
