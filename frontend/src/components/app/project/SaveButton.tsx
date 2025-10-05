import { Kbd } from "@/components/ui/kbd";
import { projectLogic } from "@/lib/logics/projectLogic";
import { cn } from "@/lib/utils";
import { useActions, useValues } from "kea";
import { CommandIcon, RefreshCwIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import { useState } from "react";

export function UpdateButton() {
  const { isSubmitting, isEditorDirty } = useValues(projectLogic);
  const { updateProjectContent } = useActions(projectLogic);
  const { isExternallyUpdated } = useValues(projectLogic);

  const [isSaveHovered, setIsSaveHovered] = useState(false);
  const [isSyncHovered, setIsSyncHovered] = useState(false);

  const update = () => {
    posthog.capture("save_button_clicked");
    updateProjectContent();
    setIsSaveHovered(false);
  };

  const sync = () => {
    // TODO: Implement sync functionality
    console.log("Sync clicked");
  };

  const showTooltip = isEditorDirty && !isSubmitting && !isExternallyUpdated;

  return (
    <motion.div
      layout
      className="relative inline-flex"
      transition={{
        layout: { duration: 0.25, ease: [0.2, 0, 0, 1] },
      }}
    >
      {/* Sync Button */}
      <motion.button
        type="button"
        aria-label="Sync"
        onClick={sync}
        layout
        whileTap={{ scale: 0.95 }}
        transition={{
          layout: { duration: 0.25, ease: [0.2, 0, 0, 1] },
          scale: {
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.5,
          },
        }}
        animate={{ scale: isSyncHovered ? 1.05 : 1 }}
        onHoverStart={() => setIsSyncHovered(true)}
        onHoverEnd={() => setIsSyncHovered(false)}
        className={cn(
          "inline-flex h-10 items-center justify-center px-3 font-semibold whitespace-nowrap cursor-pointer",
          "rounded-l-md border border-r-0",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          "transition-colors"
        )}
      >
        <RefreshCwIcon className="size-4" />
      </motion.button>

      {/* Save Button Group */}
      <div className="relative group">
        <motion.button
          type="button"
          aria-label="Save"
          onClick={update}
          disabled={isSubmitting || !isEditorDirty || isExternallyUpdated}
          whileTap={
            isSubmitting || !isEditorDirty ? undefined : { scale: 0.95 }
          }
          layout
          transition={{
            layout: { duration: 0.25, ease: [0.2, 0, 0, 1] },
            scale: {
              type: "spring",
              stiffness: 500,
              damping: 30,
              mass: 0.5,
            },
          }}
          animate={{ scale: isSaveHovered ? 1.05 : 1 }}
          onHoverStart={() => {
            if (!isSubmitting && isEditorDirty) setIsSaveHovered(true);
          }}
          onHoverEnd={() => setIsSaveHovered(false)}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-r-md border px-4 font-semibold whitespace-nowrap cursor-pointer",
            "bg-primary text-primary-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <span
                aria-label="Saving"
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/60 border-t-transparent"
              />
              <span>Saving...</span>
            </>
          ) : !isEditorDirty ? (
            <span>Saved</span>
          ) : (
            <span>Save</span>
          )}
        </motion.button>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{
                duration: 0.2,
                ease: [0.2, 0, 0, 1],
              }}
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-md pointer-events-none whitespace-nowrap z-50 flex items-center gap-2"
            >
              <Kbd>
                <CommandIcon className="size-3" />
              </Kbd>
              <span>+</span>
              <Kbd>Enter</Kbd>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
