import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { ProjectMemberRole } from "@/lib/api/projects.api";
import { projectLogic } from "@/lib/logics/projectLogic";
import { useBlocker, type ShouldBlockFn } from "@tanstack/react-router";
import { useAsyncActions, useActions, useValues } from "kea";
import { CommandIcon } from "lucide-react";
import { motion } from "motion/react";
import posthog from "posthog-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

const PROJECT_ROUTE_ID = "/app/project/$projectId" as const;

interface DialogSnapshot {
  projectName: string;
  isExternallyUpdated: boolean;
}

export function ProjectUnsavedChangesGuard() {
  const {
    isEditorDirty,
    projectData,
    currentUserRole,
    isExternallyUpdated,
  } = useValues(projectLogic);
  const { setInputValue } = useActions(projectLogic);
  const { updateProjectContent } = useAsyncActions(projectLogic);

  const isReadOnly = currentUserRole === ProjectMemberRole.Read;

  const shouldBlockFn = useCallback<ShouldBlockFn>(
    ({ current, next }) => {
      if (!isEditorDirty) return false;
      if (current.routeId !== PROJECT_ROUTE_ID) return false;
      if (next.routeId !== PROJECT_ROUTE_ID) return true;
      return current.params.projectId !== next.params.projectId;
    },
    [isEditorDirty]
  );

  const blocker = useBlocker({
    shouldBlockFn,
    enableBeforeUnload: isEditorDirty,
    withResolver: true,
  });

  const proceedRef = useRef(blocker.proceed);
  proceedRef.current = blocker.proceed;
  const isEditorDirtyRef = useRef(isEditorDirty);
  isEditorDirtyRef.current = isEditorDirty;
  const blockerRef = useRef(blocker);
  blockerRef.current = blocker;
  const saveInFlightRef = useRef(false);

  const projectDataRef = useRef(projectData);
  projectDataRef.current = projectData;
  const isExternallyUpdatedRef = useRef(isExternallyUpdated);
  isExternallyUpdatedRef.current = isExternallyUpdated;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<DialogSnapshot | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const blocked = blocker.status === "blocked";

  useEffect(() => {
    if (!blocked) return;

    let cancelled = false;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        if (cancelled) return;
        if (blockerRef.current.status !== "blocked") return;
        if (!isEditorDirtyRef.current) {
          proceedRef.current?.();
          return;
        }

        const snap: DialogSnapshot = {
          projectName: projectDataRef.current?.name ?? "",
          isExternallyUpdated: isExternallyUpdatedRef.current,
        };

        flushSync(() => {
          setSnapshot(snap);
          setSaving(false);
          setSaveError(false);
          setDialogOpen(true);
        });
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [blocked]);

  const canSave =
    !saving &&
    !isReadOnly &&
    !(snapshot?.isExternallyUpdated ?? isExternallyUpdated);

  const handleSave = useCallback(async () => {
    if (!canSave || saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    posthog.capture("save_button_clicked");
    flushSync(() => {
      setSaving(true);
      setSaveError(false);
    });
    try {
      await updateProjectContent();
      flushSync(() => setDialogOpen(false));
      requestAnimationFrame(() => proceedRef.current?.());
    } catch {
      flushSync(() => {
        setSaving(false);
        setSaveError(true);
      });
    } finally {
      saveInFlightRef.current = false;
    }
  }, [canSave, updateProjectContent]);

  useEffect(() => {
    if (!dialogOpen) setSaveError(false);
  }, [dialogOpen]);

  useEffect(() => {
    if (!dialogOpen || saving) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        event.stopImmediatePropagation();
        void handleSave();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [dialogOpen, saving, handleSave]);

  const handleOpenChange = (next: boolean) => {
    if (!next && dialogOpen && blocker.status === "blocked" && !saving) {
      flushSync(() => setDialogOpen(false));
      blocker.reset?.();
    }
  };

  const handleDiscard = () => {
    if (projectData) {
      setInputValue(projectData.content);
    }
    flushSync(() => setDialogOpen(false));
    requestAnimationFrame(() => blocker.proceed?.());
  };

  const handleKeepEditing = () => {
    flushSync(() => setDialogOpen(false));
    blocker.reset?.();
  };

  const displayName = snapshot?.projectName ?? "";
  const displayExternallyUpdated = snapshot?.isExternallyUpdated ?? false;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Save your changes?</DialogTitle>
          <DialogDescription>
            {displayName ? (
              <>
                You have unsaved edits to{" "}
                <span className="font-medium text-foreground">
                  {displayName}
                </span>
                . Save now, discard them, or keep editing.
              </>
            ) : (
              "You have unsaved edits. Save now, discard them, or keep editing."
            )}
          </DialogDescription>
        </DialogHeader>

        {displayExternallyUpdated && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            This project was updated elsewhere. Refresh to load the latest
            version before saving.
          </p>
        )}

        {saveError && (
          <p className="text-sm text-destructive">
            Could not save. Try again.
          </p>
        )}

        <DialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
          <div className="flex flex-wrap items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={saving}
              onClick={handleKeepEditing}
            >
              Keep editing
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer text-destructive hover:text-destructive"
              disabled={saving}
              onClick={handleDiscard}
            >
              Discard changes
            </Button>
            <motion.button
              type="button"
              aria-label="Save"
              onClick={() => void handleSave()}
              disabled={!canSave}
              whileTap={canSave ? { scale: 0.95 } : undefined}
              className="inline-flex h-10 items-center gap-2 rounded-md border px-4 font-semibold whitespace-nowrap cursor-pointer bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span
                    aria-label="Saving"
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/60 border-t-transparent"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <span>Save</span>
                  <span className="inline-flex items-center gap-1 opacity-90">
                    <Kbd className="!bg-primary-foreground/20 !text-primary-foreground border-0 h-6 px-1.5">
                      <CommandIcon className="size-3" />
                    </Kbd>
                    <Kbd className="!bg-primary-foreground/20 !text-primary-foreground border-0 h-6 px-1.5">
                      S
                    </Kbd>
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
