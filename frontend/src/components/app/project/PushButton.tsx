import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { SlideToConfirmTooltip } from "@/components/ui/slide-to-confirm-tooltip";
import { Spinner } from "@/components/ui/spinner";
import { ProjectMemberRole } from "@/lib/api/projects.api";
import { projectLogic } from "@/lib/logics/projectLogic";
import { useAsyncActions, useValues } from "kea";
import { CheckCircle2, CloudUpload, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

export function PushButton() {
  const {
    isEditorDirty,
    isExternallyUpdated,
    isPushing,
    integrations,
    currentUserRole,
  } = useValues(projectLogic);
  const { pushToIntegrations } = useAsyncActions(projectLogic);
  const isReadOnly = currentUserRole === ProjectMemberRole.Read;
  const [showSlideToConfirm, setShowSlideToConfirm] = useState(false);

  const handleButtonClick = () => {
    if (!isEnabled) return;
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
    } catch (error) {
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

  const hasIntegrations = integrations && integrations.length > 0;

  // Button is enabled when there are no unsaved changes and there are integrations
  const isEnabled =
    !isEditorDirty &&
    !isPushing &&
    !isExternallyUpdated &&
    hasIntegrations &&
    !isReadOnly;

  let tooltipDescription: string | undefined;
  if (isReadOnly) {
    tooltipDescription = "You don't have permission to push";
  } else if (!hasIntegrations) {
    tooltipDescription = "You have no integrations";
  } else if (isEditorDirty) {
    tooltipDescription = "Save your changes first";
  } else if (isExternallyUpdated) {
    tooltipDescription = "Project was updated by someone else";
  }

  return (
    <SlideToConfirmTooltip
      isVisible={showSlideToConfirm}
      onConfirm={handleConfirmPush}
      onCancel={handleCancelPush}
      side="bottom"
      align="center"
    >
      <Button
        variant="outline"
        onClick={handleButtonClick}
        disabled={!isEnabled}
        aria-label="Push to integrations"
        className="cursor-pointer h-10 w-10 p-0 bg-secondary/50 hover:bg-secondary"
        tooltip={
          !showSlideToConfirm
            ? {
                title: "Push to integrations",
                description: tooltipDescription,
              }
            : undefined
        }
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isPushing ? (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                ease: "easeInOut",
                duration: 0.2,
              }}
            >
              <Spinner className="size-5" />
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            >
              <CloudUpload className="size-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </SlideToConfirmTooltip>
  );
}
