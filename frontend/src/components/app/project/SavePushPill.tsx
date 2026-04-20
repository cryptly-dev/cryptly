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
import { ProjectSwitchContext } from "@/lib/context/ProjectSwitchContext";
import { projectLogic } from "@/lib/logics/projectLogic";
import { cn } from "@/lib/utils";
import { useActions, useAsyncActions, useValues } from "kea";
import { CheckCircle2, CommandIcon, XCircle } from "lucide-react";
import posthog from "posthog-js";
import { useContext, useState } from "react";
import { toast } from "sonner";

const style = {
  pill: "bg-[#1e1e1e] shadow-[4px_4px_12px_rgba(0,0,0,0.4),-4px_-4px_12px_rgba(255,255,255,0.03)] border border-[#2a2a2a] p-1.5",
  save: "bg-white text-black hover:bg-neutral-100 font-semibold rounded-full",
  saveDisabled: "text-neutral-600 font-medium rounded-full",
  divider: "bg-neutral-700/30",
  push: "bg-white text-black hover:bg-neutral-100 font-semibold rounded-full",
  pushDisabled: "text-neutral-600 font-medium rounded-full",
  spinner: "border-neutral-600 border-t-neutral-300",
  buttonBase:
    "flex items-center gap-2.5 px-6 py-3 transition-all duration-200 cursor-pointer disabled:cursor-default",
  buttonEnabledText: "text-[17px]",
  buttonDisabledText: "text-base",
};

interface SavePushPillProps {
  suppressShortcutTooltip?: boolean;
  onConnectIntegrations?: () => void;
}

export function SavePushPill({
  suppressShortcutTooltip,
  onConnectIntegrations,
}: SavePushPillProps) {
  const {
    isSubmitting,
    isEditorDirty,
    isExternallyUpdated,
    isPushing,
    integrations,
    currentUserRole,
    secretsSyncedWithGithub,
  } = useValues(projectLogic);
  const { updateProjectContent } = useActions(projectLogic);
  const { pushToIntegrations } = useAsyncActions(projectLogic);
  const isReadOnly = currentUserRole === ProjectMemberRole.Read;
  const switchContext = useContext(ProjectSwitchContext);
  const isSwitching = switchContext?.isSwitching ?? false;
  const [showSlideToConfirm, setShowSlideToConfirm] = useState(false);

  const saveDisabled =
    isSubmitting ||
    !isEditorDirty ||
    isExternallyUpdated ||
    isReadOnly ||
    isSwitching;
  const hasIntegrations = integrations && integrations.length > 0;
  const pushEnabled =
    !isEditorDirty &&
    !isPushing &&
    !isExternallyUpdated &&
    hasIntegrations &&
    !isReadOnly &&
    !isSwitching;
  let pushDisabledReason: string | undefined;
  if (isSwitching) {
    pushDisabledReason = "Switching project…";
  } else if (isReadOnly) {
    pushDisabledReason = "You don't have permission to push";
  } else if (!hasIntegrations) {
    pushDisabledReason = "No GitHub repository connected";
  } else if (isEditorDirty) {
    pushDisabledReason = "Save your changes first";
  } else if (isExternallyUpdated) {
    pushDisabledReason = "Project was updated externally. Refresh first.";
  }

  let saveDisabledReason: string | undefined;
  if (isSwitching) {
    saveDisabledReason = "Switching project…";
  } else if (isReadOnly) {
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
    !isSwitching &&
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
                style.buttonBase,
                saveDisabled
                  ? cn(style.buttonDisabledText, style.saveDisabled)
                  : cn(style.buttonEnabledText, style.save)
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

      {hasIntegrations && (
        <div
          className="px-2 max-sm:hidden shrink-0"
          title={
            secretsSyncedWithGithub
              ? "Saved version was pushed to GitHub"
              : "Saved version differs from last push — push again to update GitHub"
          }
        >
          {secretsSyncedWithGithub ? (
            <span className="text-xs font-medium text-green-500/90 whitespace-nowrap">
              Pushed
            </span>
          ) : (
            <span className="text-xs font-medium text-amber-500/85 whitespace-nowrap">
              Not pushed
            </span>
          )}
        </div>
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
                    style.buttonBase,
                    !pushEnabled
                      ? cn(style.buttonDisabledText, style.pushDisabled)
                      : cn(style.buttonEnabledText, style.push)
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
              <span>{pushDisabledReason}</span>
              {!hasIntegrations && !isReadOnly && onConnectIntegrations && (
                <>
                  {". "}
                  <button
                    type="button"
                    onClick={onConnectIntegrations}
                    className="underline underline-offset-2 cursor-pointer hover:text-white focus:outline-none"
                  >
                    Connect now?
                  </button>
                </>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
