import { DesktopProjectsList } from "./DesktopProjectsList";
import { DesktopProjectTile } from "./DesktopProjectTile";

export function DesktopProjectView() {
  return (
    <div className="h-screen w-full text-foreground flex">
      {/* Left Sidebar - Full height, attached to edge */}
      <aside className="h-full w-72 flex-shrink-0 border-r border-border/50 bg-card/40 backdrop-blur-sm">
        <DesktopProjectsList />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full min-w-0">
        <DesktopProjectTile />
      </main>
    </div>
  );
}
