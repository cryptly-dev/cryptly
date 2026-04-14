import { authLogic } from "@/lib/logics/authLogic";
import { useLocation } from "@tanstack/react-router";
import { useValues } from "kea";
import { Code, Home, LogIn } from "lucide-react";
import { memo } from "react";
import { FloatingDock } from "./floating-dock";
import { useFeatureFlagEnabled } from "posthog-js/react";

function AppNavigationImpl() {
  const location = useLocation();

  const isAppRoute = location.href.startsWith("/app");
  const isProjectRoute = location.pathname.startsWith("/app/project");

  const { isLoggedIn } = useValues(authLogic);

  const isDeveloper = useFeatureFlagEnabled("developer");

  // Helper function to check if a route is active
  const isRouteActive = (href: string) => {
    const currentPath = location.pathname;

    // Exact match for root
    if (href === "/") {
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
    // Show Projects and Developer only when user is logged in
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
        ]
      : []),
  ];

  // Hide the floating dock on project routes (new UI uses sidebar navigation)
  // Also hide on login page
  const isLoginRoute = location.pathname.startsWith("/app/login");
  if (isProjectRoute || isLoginRoute) {
    return null;
  }

  if (!isAppRoute) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <FloatingDock items={navItems} />
    </div>
  );
}

export const AppNavigation = memo(AppNavigationImpl);
