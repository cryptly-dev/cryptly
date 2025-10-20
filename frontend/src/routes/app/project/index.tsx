import { ProjectPage } from "@/components/app/project/ProjectPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/project/")({
  component: ProjectTanstackPage,
});

function ProjectTanstackPage() {
  return <ProjectPage />;
}
