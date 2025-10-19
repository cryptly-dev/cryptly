import { authLogic } from "@/lib/logics/authLogic";
import { myPersonalInvitationsLogic } from "@/lib/logics/myPersonalInvitationsLogic";
import { useLocation } from "@tanstack/react-router";
import { useValues } from "kea";
import { Code, Home, LogIn, Search, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";
import { FloatingDock } from "./floating-dock";
import { useFeatureFlagEnabled } from "posthog-js/react";

function AppNavigationImpl() {
  const location = useLocation();

  const isAppRoute = location.href.startsWith("/app");

  const { isLoggedIn } = useValues(authLogic);
  const { myPersonalInvitations } = useValues(myPersonalInvitationsLogic);

  const isDeveloper = useFeatureFlagEnabled("developer");

  // Helper function to check if a route is active
  const isRouteActive = (href: string) => {
    const currentPath = location.pathname;

    // Exact match for root and specific routes
    if (href === "/" || href === "/app/search" || href === "/app/me") {
      return currentPath === href;
    }

    // For project routes, check if current path starts with the href
    if (href === "/app/project/") {
      return currentPath.startsWith("/app/project");
    }

    // For developer routes
    if (href === "/app/developer/") {
      return currentPath.startsWith("/app/developer");
    }

    return false;
  };

  const navItems = [
    // Show Login only when user is not logged in
    ...(!isLoggedIn
      ? [
          {
            title: "Landing page",
            icon: (
              <LogIn className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: "/",
            isActive: isRouteActive("/"),
          },
        ]
      : []),
    // Show Projects, Developer, and Me only when user is logged in
    ...(isLoggedIn
      ? [
          {
            title: "Projects",
            icon: (
              <Home className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: `/app/project/`,
            isActive: isRouteActive("/app/project/"),
          },
          {
            title: "Search",
            icon: (
              <Search className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: `/app/search`,
            isActive: isRouteActive("/app/search"),
          },
          ...(isDeveloper
            ? [
                {
                  title: "Dev",
                  icon: (
                    <Code className="h-full w-full text-neutral-500 dark:text-neutral-300" />
                  ),
                  href: `/app/developer/`,
                  isActive: isRouteActive("/app/developer/"),
                },
              ]
            : []),
          {
            title: "Profile",
            icon: (
              <User className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: "/app/me",
            badge: myPersonalInvitations?.length || undefined,
            isActive: isRouteActive("/app/me"),
          },
        ]
      : []),
  ];

  return (
    <AnimatePresence>
      {isAppRoute && (
        <motion.div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{
            duration: 2,
            ease: [0, 1, 0, 1],
            delay: 0.4,
          }}
        >
          <FloatingDock items={navItems} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const AppNavigation = memo(AppNavigationImpl);
