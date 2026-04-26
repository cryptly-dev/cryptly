import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

const AppLayout = () => (
  <div className="relative min-h-screen-mobile bg-background overflow-hidden">
    <div className="relative z-10 h-screen-mobile">
      <Outlet />
    </div>
  </div>
);

export const Route = createFileRoute("/app")({
  component: AppLayout,
  beforeLoad: ({ location }) => {
    // Redirect /app to /app/project
    if (location.pathname === "/app" || location.pathname === "/app/") {
      throw redirect({ to: "/app/project" });
    }
  },
});
