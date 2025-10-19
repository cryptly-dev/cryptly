import { Kbd } from "@/components/ui/kbd";
import { ProjectMemberRole } from "@/lib/api/projects.api";
import { projectLogic } from "@/lib/logics/projectLogic";
import { cn } from "@/lib/utils";
import { useActions, useValues } from "kea";
import { CommandIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import { useState } from "react";

export function UpdateButton() {
  const { isSubmitting, isEditorDirty, currentUserRole } =
    useValues(projectLogic);
  const { updateProjectContent } = useActions(projectLogic);
  const { isExternallyUpdated } = useValues(projectLogic);
  const isReadOnly = currentUserRole === ProjectMemberRole.Read;

  const [isHovered, setIsHovered] = useState(false);

  const update = () => {
    posthog.capture("save_button_clicked");
    updateProjectContent();
    setIsHovered(false);
  };

  const showTooltip =
    isEditorDirty && !isSubmitting && !isExternallyUpdated && !isReadOnly;

  return (
    <div className="relative group">
      <motion.button
        type="button"
        aria-label="Save"
        onClick={update}
        disabled={
          isSubmitting || !isEditorDirty || isExternallyUpdated || isReadOnly
        }
        whileTap={
          isSubmitting || !isEditorDirty || isReadOnly
            ? undefined
            : { scale: 0.95 }
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
        animate={{ scale: isHovered ? 1.05 : 1 }}
        onHoverStart={() => {
          if (!isSubmitting && isEditorDirty && !isReadOnly) setIsHovered(true);
        }}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-md border px-4 font-semibold whitespace-nowrap cursor-pointer",
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
            <motion.span layout>Saving...</motion.span>
          </>
        ) : !isEditorDirty ? (
          <motion.span layout>Saved</motion.span>
        ) : (
          <span>Save</span>
        )}
      </motion.button>
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
            <Kbd>S</Kbd>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
