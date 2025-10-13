import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ProjectMemberRole } from "@/lib/api/projects.api";
import { projectLogic } from "@/lib/logics/projectLogic";
import { useAsyncActions, useValues } from "kea";
import { CloudUpload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
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

  const push = async () => {
    posthog.capture("push_button_clicked");
    try {
      await pushToIntegrations();
      toast.success("Pushed to integrations", {
        description:
          "Your changes have been successfully pushed to all integrations.",
      });
    } catch (error) {
      toast.error("Failed to push", {
        description:
          "There was an error pushing to integrations. Please try again.",
      });
    }
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
    <Button
      variant="outline"
      onClick={push}
      disabled={!isEnabled}
      aria-label="Push to integrations"
      className="cursor-pointer h-10 w-10 p-0 bg-secondary/50 hover:bg-secondary"
      tooltip={{
        title: "Push to integrations",
        description: tooltipDescription,
      }}
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
  );
}
