import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { projectLogic } from "@/lib/logics/projectLogic";
import { useActions, useValues } from "kea";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import { PlugZap } from "lucide-react";

export function PushButton() {
  const { isEditorDirty, isExternallyUpdated, isPushing } =
    useValues(projectLogic);
  const { pushToIntegrations } = useActions(projectLogic);

  const push = () => {
    posthog.capture("push_button_clicked");
    pushToIntegrations();
  };

  // Button is enabled when there are no unsaved changes
  const isEnabled = !isEditorDirty && !isPushing && !isExternallyUpdated;

  return (
    <Button
      variant="outline"
      onClick={push}
      disabled={!isEnabled}
      aria-label="Push to external connections"
      className="cursor-pointer h-10 w-10 p-0 bg-secondary/50 hover:bg-secondary"
      tooltip={{ title: "Push changes" }}
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
            <PlugZap className="size-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
