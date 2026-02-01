import { motion } from "motion/react";
import { DesktopProjectsList } from "./DesktopProjectsList";
import { DesktopProjectTile } from "./DesktopProjectTile";

export function DesktopProjectView() {
  return (
    <div className="h-screen w-full overflow-hidden text-foreground flex">
      {/* Left Sidebar - Full height, attached to edge */}
      <motion.aside
        className="h-full w-72 flex-shrink-0 border-r border-border/50 bg-card/40 backdrop-blur-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <DesktopProjectsList />
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full">
        <motion.div
          className="h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <DesktopProjectTile />
        </motion.div>
      </main>
    </div>
  );
}
