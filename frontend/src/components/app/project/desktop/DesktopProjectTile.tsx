import { CopyAllButton } from "@/components/app/project/CopyAllButton";
import { DesktopHistoryView } from "@/components/app/project/desktop/DesktopHistoryView";
import { FileEditor } from "@/components/app/project/FileEditor";
import { SavePushButtonGroup } from "@/components/app/project/SavePushButtonGroup";
import { IntegrationsDialog } from "@/components/dialogs/IntegrationsDialog";
import { ProjectAccessDialog } from "@/components/dialogs/ProjectAccessDialog";
import { ProjectSettingsDialog } from "@/components/dialogs/ProjectSettingsDialog";
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
import { commonLogic } from "@/lib/logics/commonLogic";
import { ftuxLogic } from "@/lib/logics/ftuxLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import { getRelativeTime } from "@/lib/utils";
import {
  IconArrowLeft,
  IconHistory,
  IconPlugConnected,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { useActions, useValues } from "kea";
import { AlertTriangle, ArrowLeft, CommandIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import React, { useEffect, useMemo, useState } from "react";

export function DesktopProjectTile() {
  const {
    projectData,
    isShowingHistory,
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
  const [_currentTime, setCurrentTime] = useState(Date.now()); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [hasStartedFTUX, setHasStartedFTUX] = useState(false);

  const changedBy = useMemo(() => {
    if (lastEditAuthor?.id === userData?.id) {
      return "you";
    }

    if (!lastEditAuthor) {
      return null;
    }

    return lastEditAuthor?.email;
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
          !isShowingHistory &&
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
    isShowingHistory,
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
      <div className="h-[65vh] rounded-2xl border border-border bg-card/60 backdrop-blur">
        <div className="h-full flex flex-col p-4 gap-4">
          <ProjectHeaderSkeleton />
          <div className="relative rounded-xl overflow-hidden bg-editor h-full">
            <div className="h-full p-6">
              <EditorSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[65vh] rounded-2xl border border-border bg-card/60 backdrop-blur">
      <div className="h-full flex flex-col p-4 gap-4 relative">
        <ProjectHeader />
        <TooltipProvider>
          <Tooltip
            open={shouldShowEditorTooltip && !isShowingHistory}
            delayDuration={0}
          >
            <TooltipTrigger asChild>
              <div className="relative rounded-xl overflow-hidden h-full">
                {isShowingHistory ? (
                  <DesktopHistoryView />
                ) : (
                  <div className="h-full">
                    <FileEditor
                      value={inputValue}
                      onChange={(v) => setInputValue(v)}
                      readOnly={isReadOnly}
                    />
                    <AnimatePresence mode="wait">
                      {" "}
                      {changedBy && (
                        <motion.div
                          className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ ease: "easeInOut", duration: 0.1 }}
                        >
                          <span className="rounded bg-background/100 px-2 py-0.5 text-xs text-muted-foreground shadow-sm">
                            Changed by {changedBy.split("@")[0]}{" "}
                            {getRelativeTime(projectData.updatedAt)}
                          </span>
                        </motion.div>
                      )}{" "}
                    </AnimatePresence>
                  </div>
                )}
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
      </div>
    </div>
  );
}

function ProjectHeader() {
  const { projectData, isShowingHistory, isExternallyUpdated } =
    useValues(projectLogic);

  const { toggleHistoryView } = useActions(projectLogic);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [integrationsDialogOpen, setIntegrationsDialogOpen] = useState(false);

  const { shouldReopenIntegrationsDialog } = useValues(commonLogic);
  const { setShouldReopenIntegrationsDialog } = useActions(commonLogic);

  const {
    shouldShowSaveTooltip,
    shouldShowIntegrationsTooltip,
    currentStepNumber,
  } = useValues(ftuxLogic);
  const { skipFTUX, nextStep, previousStep, userOpenedIntegrationsDialog } =
    useActions(ftuxLogic);

  useEffect(() => {
    if (shouldReopenIntegrationsDialog) {
      setShouldReopenIntegrationsDialog(false);

      setTimeout(() => {
        setIntegrationsDialogOpen(true);
      }, 500);
    }
  }, []);

  // Track when integrations dialog opens for FTUX
  useEffect(() => {
    if (integrationsDialogOpen) {
      userOpenedIntegrationsDialog();
    }
  }, [integrationsDialogOpen, userOpenedIntegrationsDialog]);

  return (
    <div className="relative flex h-10 items-center justify-center overflow-visible">
      {/* Left buttons - fixed width */}
      <div className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center gap-3">
        {isShowingHistory ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleHistoryView}
            aria-label="Go back"
            className="size-10 cursor-pointer"
            tooltip={{ title: "Go back" }}
          >
            <IconArrowLeft className="size-5" />
          </Button>
        ) : (
          <>
            <Button
              variant={isShowingHistory ? "default" : "ghost"}
              size="icon"
              onClick={() => {
                toggleHistoryView();
                posthog.capture("history_button_clicked");
              }}
              aria-label="History"
              className="size-10 cursor-pointer"
              tooltip={{ title: "History" }}
            >
              <IconHistory className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShareDialogOpen(true);
                posthog.capture("members_button_clicked");
              }}
              aria-label="Members"
              className="size-10 cursor-pointer"
              tooltip={{ title: "Members" }}
            >
              <IconUsers className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSettingsDialogOpen(true);
                posthog.capture("settings_button_clicked");
              }}
              aria-label="Settings"
              className="size-10 cursor-pointer"
              tooltip={{ title: "Settings" }}
            >
              <IconSettings className="size-5" />
            </Button>
            <div className="relative overflow-visible">
              <TooltipProvider>
                <Tooltip open={shouldShowIntegrationsTooltip} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIntegrationsDialogOpen(true);
                        posthog.capture("integrations_button_clicked");
                      }}
                      aria-label="Integrations"
                      className="size-10 cursor-pointer"
                      tooltip="Integrations"
                    >
                      <IconPlugConnected className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
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
            </div>
          </>
        )}
      </div>

      {/* Center - project name with proper truncation */}
      <div className="w-[45%] flex min-w-0 items-center justify-center gap-4">
        <div className="h-px w-6 flex-shrink-0 bg-border"></div>
        <div className="relative group min-w-0">
          <h1 className="min-w-0 truncate text-2xl font-semibold tracking-wide text-foreground/90">
            {projectData?.name}
          </h1>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {projectData?.name}
          </div>
        </div>
        <div className="h-px w-6 flex-shrink-0 bg-border"></div>
      </div>

      {/* Right button - fixed width */}
      <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {isExternallyUpdated && (
          <div className="relative group/tooltip">
            <AlertTriangle className="size-5 text-amber-500" />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-m bg-black text-white text-sm rounded-md py-2 px-3 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
              <p className="font-medium">
                This project has just been updated by someone else.
              </p>
              <p className="font-medium">Refresh to get the new content.</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black"></div>
            </div>
          </div>
        )}
        {!isShowingHistory && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <TooltipProvider>
                <Tooltip open={shouldShowSaveTooltip} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div>
                      <SavePushButtonGroup />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
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

      <ProjectAccessDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
      <ProjectSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
      <IntegrationsDialog
        open={integrationsDialogOpen}
        onOpenChange={setIntegrationsDialogOpen}
      />
    </div>
  );
}

function ProjectHeaderSkeleton() {
  const { isShowingHistory } = useValues(projectLogic);
  const { toggleHistoryView } = useActions(projectLogic);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [integrationsDialogOpen, setIntegrationsDialogOpen] = useState(false);

  return (
    <div className="relative flex h-10 items-center justify-center">
      {/* Left buttons - fixed width */}
      <div className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center gap-3">
        {isShowingHistory ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleHistoryView}
            aria-label="Go back"
            className="cursor-pointer size-10"
            tooltip={{ title: "Go back", description: "Return to editor" }}
          >
            <IconArrowLeft className="size-5" />
          </Button>
        ) : (
          <>
            <Button
              variant={isShowingHistory ? "default" : "ghost"}
              size="icon"
              onClick={toggleHistoryView}
              aria-label={
                isShowingHistory ? "Exit history mode" : "View history"
              }
              className="cursor-pointer size-10"
              tooltip={{
                title: isShowingHistory ? "Exit History Mode" : "View History",
                description: isShowingHistory
                  ? "Return to edit mode"
                  : "View version history",
              }}
            >
              <IconHistory className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShareDialogOpen(true)}
              aria-label="Share project"
              className="cursor-pointer size-10"
              tooltip={{ title: "Members", description: "Invite members" }}
            >
              <IconUsers className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsDialogOpen(true)}
              aria-label="Project settings"
              className="cursor-pointer size-10"
              tooltip={{ title: "Settings", description: "Project settings" }}
            >
              <IconSettings className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIntegrationsDialogOpen(true)}
              aria-label="Integrations"
              className="cursor-pointer size-10"
              tooltip={{
                title: "Integrations",
                description: "Connect external services",
              }}
            >
              <IconPlugConnected className="size-5" />
            </Button>
          </>
        )}
      </div>

      {/* Center - project name skeleton */}
      <div className="w-[45%] flex min-w-0 items-center justify-center gap-4">
        <div className="h-px w-6 flex-shrink-0 bg-border"></div>
        <Skeleton className="h-8 w-48 rounded-md" />
        <div className="h-px w-6 flex-shrink-0 bg-border"></div>
      </div>

      {/* Right button - fixed width */}
      <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {!isShowingHistory && (
          <div className="flex items-center gap-4">
            <SavePushButtonGroup />
            <CopyAllButton disabled />
          </div>
        )}
      </div>

      <ProjectAccessDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
      <ProjectSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
      <IntegrationsDialog
        open={integrationsDialogOpen}
        onOpenChange={setIntegrationsDialogOpen}
      />
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="space-y-3">
      {/* Create multiple skeleton lines with varying widths to simulate text content */}
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
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-[84%]" />
      <Skeleton className="h-5 w-[91%]" />
      <Skeleton className="h-5 w-[87%]" />
      <Skeleton className="h-5 w-[93%]" />
      <Skeleton className="h-5 w-[79%]" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-[86%]" />
      <Skeleton className="h-5 w-[94%]" />
      <Skeleton className="h-5 w-[81%]" />
      <Skeleton className="h-5 w-[92%]" />
      <Skeleton className="h-5 w-[77%]" />
    </div>
  );
}
