import { FloatingDock } from "./floating-dock";
import { LogIn, ScanFaceIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function AppNavigation() {
  const isAppRoute = true;
  const navItems = [
    {
      title: "Log in",
      icon: (
        <LogIn className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/app/login",
    },
    {
      title: "Me",
      icon: (
        <ScanFaceIcon className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/app/me",
    },
  ];

  return (
    <AnimatePresence>
      {isAppRoute && (
        <motion.div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
        >
          <FloatingDock items={navItems} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
