import { SlideToConfirmTooltip } from "@/components/ui/slide-to-confirm-tooltip";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectMemberRole } from "@/lib/api/projects.api";
import { projectLogic } from "@/lib/logics/projectLogic";
import { cn } from "@/lib/utils";
import { useActions, useAsyncActions, useValues } from "kea";
import { CheckCircle2, CommandIcon, XCircle } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

const style = {
  pill: "bg-[#1e1e1e] shadow-[4px_4px_12px_rgba(0,0,0,0.4),-4px_-4px_12px_rgba(255,255,255,0.03)] border border-[#2a2a2a]",
  save: "text-neutral-300 hover:text-white hover:bg-white/[0.04]",
  saveDisabled: "text-neutral-600",
  divider: "bg-neutral-700/30",
  push: "text-neutral-300 hover:text-white hover:bg-white/[0.04]",
  pushDisabled: "text-neutral-600",
  spinner: "border-neutral-600 border-t-neutral-300",
};

interface SavePushPillProps {
  suppressShortcutTooltip?: boolean;
}

export function SavePushPill({
  suppressShortcutTooltip,
}: SavePushPillProps) {
  const {
    isSubmitting,
    isEditorDirty,
    isExternallyUpdated,
    isPushing,
    integrations,
    currentUserRole,
  } = useValues(projectLogic);
  const { updateProjectContent } = useActions(projectLogic);
  const { pushToIntegrations } = useAsyncActions(projectLogic);
  const isReadOnly = currentUserRole === ProjectMemberRole.Read;
  const [showSlideToConfirm, setShowSlideToConfirm] = useState(false);

  const saveDisabled =
    isSubmitting || !isEditorDirty || isExternallyUpdated || isReadOnly;
  const hasIntegrations = integrations && integrations.length > 0;
  const pushEnabled =
    !isEditorDirty &&
    !isPushing &&
    !isExternallyUpdated &&
    hasIntegrations &&
    !isReadOnly;
  let pushDisabledReason: string | undefined;
  if (isReadOnly) {
    pushDisabledReason = "You don't have permission to push";
  } else if (!hasIntegrations) {
    pushDisabledReason = "No GitHub repository connected";
  } else if (isEditorDirty) {
    pushDisabledReason = "Save your changes first";
  } else if (isExternallyUpdated) {
    pushDisabledReason = "Project was updated externally. Refresh first.";
  }

  let saveDisabledReason: string | undefined;
  if (isReadOnly) {
    saveDisabledReason = "You don't have permission to edit";
  } else if (isExternallyUpdated) {
    saveDisabledReason = "Project was updated externally. Refresh first.";
  } else if (!isEditorDirty && !isSubmitting) {
    saveDisabledReason = "No unsaved changes";
  }

  const showSaveShortcut =
    isEditorDirty &&
    !isSubmitting &&
    !isExternallyUpdated &&
    !isReadOnly &&
    !showSlideToConfirm &&
    !suppressShortcutTooltip;

  const handleSave = () => {
    if (saveDisabled) return;
    posthog.capture("save_button_clicked");
    updateProjectContent();
  };

  const handlePushClick = () => {
    if (!pushEnabled) return;
    setShowSlideToConfirm(true);
  };

  const handleConfirmPush = async () => {
    setShowSlideToConfirm(false);
    posthog.capture("push_button_confirmed");
    try {
      await pushToIntegrations();
      toast.custom((t) => (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-lg w-fit">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="text-foreground flex items-center gap-2 whitespace-nowrap">
              <span>Synced with</span>
              <span className="inline-flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded text-sm">
                <GitHubIcon className="size-4" />
                GitHub
              </span>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="text-foreground/50 hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      ));
    } catch {
      toast.custom((t) => (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-lg w-fit">
          <div className="flex items-center gap-4">
            <XCircle className="size-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="text-foreground flex items-center gap-2 whitespace-nowrap">
              <span>Failed to sync with</span>
              <span className="inline-flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded text-sm">
                <GitHubIcon className="size-4" />
                GitHub
              </span>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="text-foreground/50 hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      ));
    }
  };

  const handleCancelPush = () => {
    setShowSlideToConfirm(false);
    posthog.capture("push_button_cancelled");
  };

  return (
    <div className={cn("flex items-center rounded-full", style.pill)}>
      {/* Save */}
      <TooltipProvider>
        <Tooltip
          open={showSaveShortcut ? true : undefined}
          delayDuration={showSaveShortcut ? 0 : 200}
        >
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveDisabled}
              className={cn(
                "flex items-center gap-2.5 px-6 py-3 text-base font-medium rounded-l-full transition-all duration-200 cursor-pointer disabled:cursor-default",
                saveDisabled ? style.saveDisabled : style.save
              )}
            >
              {isSubmitting ? (
                <>
                  <span
                    className={cn(
                      "inline-block h-4 w-4 animate-spin rounded-full border-2",
                      style.spinner
                    )}
                  />
                  <span>Saving…</span>
                </>
              ) : !isEditorDirty ? (
                <span>Saved</span>
              ) : (
                <span>Save</span>
              )}
            </button>
          </TooltipTrigger>
          {showSaveShortcut ? (
            <TooltipContent
              side="top"
              sideOffset={8}
              className="flex items-center gap-2 px-3 py-2"
            >
              <Kbd className="!bg-white/20 !text-white rounded-md">
                <CommandIcon className="size-3 !text-white" />
              </Kbd>
              <span>+</span>
              <Kbd className="!bg-white/20 !text-white rounded-md">S</Kbd>
            </TooltipContent>
          ) : (
            saveDisabledReason && (
              <TooltipContent side="top" sideOffset={8} className="text-xs">
                {saveDisabledReason}
              </TooltipContent>
            )
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Divider */}
      {style.divider && (
        <div className={cn("w-px self-stretch my-2", style.divider)} />
      )}

      {/* Push */}
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div className="inline-flex">
              <SlideToConfirmTooltip
                isVisible={showSlideToConfirm}
                onConfirm={handleConfirmPush}
                onCancel={handleCancelPush}
                side="top"
                align="center"
              >
                <button
                  type="button"
                  onClick={handlePushClick}
                  disabled={!pushEnabled}
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-3 text-base font-medium rounded-r-full transition-all duration-200 cursor-pointer disabled:cursor-default",
                    !pushEnabled ? style.pushDisabled : style.push
                  )}
                >
                  {isPushing ? (
                    <>
                      <span
                        className={cn(
                          "inline-block h-4 w-4 animate-spin rounded-full border-2",
                          style.spinner
                        )}
                      />
                      <span>Pushing…</span>
                    </>
                  ) : (
                    <span>Push</span>
                  )}
                </button>
              </SlideToConfirmTooltip>
            </div>
          </TooltipTrigger>
          {pushDisabledReason && !showSlideToConfirm && (
            <TooltipContent side="top" sideOffset={8} className="text-xs">
              {pushDisabledReason}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
