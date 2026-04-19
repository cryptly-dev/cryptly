import { ProjectSwitchContext } from "@/lib/context/ProjectSwitchContext";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useContext } from "react";

interface ProjectSwitchLoadingBarProps {
  /**
   * Extra classes for positioning the bar. Defaults to sitting at the top of
   * the nearest positioned ancestor.
   */
  className?: string;
}

/**
 * A thin indeterminate progress bar that appears while a project switch is in
 * flight. Reads `isSwitching` from `ProjectSwitchContext` so it can be dropped
 * anywhere inside the project scope without prop drilling.
 */
export function ProjectSwitchLoadingBar({
  className,
}: ProjectSwitchLoadingBarProps) {
  const ctx = useContext(ProjectSwitchContext);
  const visible = ctx?.isSwitching ?? false;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="project-switch-loading-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-20 h-[2px] overflow-hidden",
            className
          )}
          aria-hidden
        >
          <div className="absolute inset-0 bg-primary/15" />
          <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-primary animate-project-switch-bar" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
