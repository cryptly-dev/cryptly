import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { projectLogic } from "@/lib/logics/projectLogic";
import { useValues } from "kea";
import { IconCloudUpload } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import { useState } from "react";

export function MobilePushButton() {
  const { isEditorDirty, isExternallyUpdated } = useValues(projectLogic);
  const [isPushing, setIsPushing] = useState(false);

  const push = async () => {
    posthog.capture("push_button_clicked");
    setIsPushing(true);

    // Simulate push operation for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsPushing(false);
  };

  // Button is enabled when there are no unsaved changes
  const isEnabled = !isEditorDirty && !isPushing && !isExternallyUpdated;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={push}
      disabled={!isEnabled}
      aria-label="Push to external connections"
      className="cursor-pointer h-8 w-8 p-0 bg-secondary/50 hover:bg-secondary"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isPushing ? (
          <motion.div
            key="spinner"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              duration: 0.5,
            }}
          >
            <Spinner />
          </motion.div>
        ) : (
          <motion.div
            key="icon"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            <IconCloudUpload className="size-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
