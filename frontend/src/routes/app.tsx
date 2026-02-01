import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Waves from "@/components/Waves";

const AppLayout = () => (
  <div className="relative min-h-screen overflow-hidden bg-background">
    {/* Background Waves - persists across all /app routes */}
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110vw] h-[110vh] z-0 opacity-[0.08] pointer-events-none">
      <Waves
        lineColor="rgba(100, 100, 100, 1)"
        backgroundColor="transparent"
        waveSpeedX={0.008}
        waveSpeedY={0.004}
        waveAmpX={20}
        waveAmpY={20}
        maxCursorMove={30}
      />
    </div>

    {/* Content */}
    <div className="relative z-10 h-screen">
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
