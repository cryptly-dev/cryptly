import { DesktopHistoryView } from "@/components/app/project/desktop/DesktopHistoryView";
import { FileEditor } from "@/components/app/project/FileEditor";
import { Button } from "@/components/ui/button";
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
import { getRelativeTime } from "@/lib/utils";
import { useActions, useValues } from "kea";
import { ArrowLeft, X } from "lucide-react";
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
      <div className="h-full overflow-hidden">
        <div className="h-full p-6">
          <EditorSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      {/* Main Content */}
      <div className="h-full">
        <TooltipProvider>
          <Tooltip
            open={shouldShowEditorTooltip && !isShowingHistory}
            delayDuration={0}
          >
            <TooltipTrigger asChild>
              <div className="relative overflow-hidden h-full">
                {isShowingHistory ? (
                  <DesktopHistoryView />
                ) : (
                  <div className="relative h-full">
                    <FileEditor
                      value={inputValue}
                      onChange={(v) => setInputValue(v)}
                      readOnly={isReadOnly}
                    />
                    <AnimatePresence mode="wait">
                      {changedBy && (
                        <motion.div
                          className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ ease: "easeInOut", duration: 0.1 }}
                        >
                          <span className="rounded bg-background/100 px-2 py-0.5 text-xs text-muted-foreground shadow-sm">
                            Changed by {changedBy}{" "}
                            {getRelativeTime(projectData.updatedAt)}
                          </span>
                        </motion.div>
                      )}
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
