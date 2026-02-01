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
import { useActions, useValues } from "kea";
import { CommandIcon } from "lucide-react";
import { motion } from "motion/react";
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
    <TooltipProvider>
      <Tooltip open={showTooltip} delayDuration={0}>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          sideOffset={8}
          className="flex items-center gap-2 px-3 py-2"
        >
          <Kbd className="!bg-white/20 !text-white rounded-md">
            <CommandIcon className="size-3 !text-white" />
          </Kbd>
          <span>+</span>
          <Kbd className="!bg-white/20 !text-white rounded-md">S</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
