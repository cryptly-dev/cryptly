import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { projectLogic } from "@/lib/logics/projectLogic";
import { useActions, useValues } from "kea";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import { CloudUpload } from "lucide-react";

export function PushButton() {
  const { isEditorDirty, isExternallyUpdated, isPushing, integrations } =
    useValues(projectLogic);
  const { pushToIntegrations } = useActions(projectLogic);

  const push = () => {
    posthog.capture("push_button_clicked");
    pushToIntegrations();
  };

  const hasIntegrations = integrations && integrations.length > 0;

  // Button is enabled when there are no unsaved changes and there are integrations
  const isEnabled =
    !isEditorDirty && !isPushing && !isExternallyUpdated && hasIntegrations;

  let tooltipDescription: string | undefined;
  if (!hasIntegrations) {
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
