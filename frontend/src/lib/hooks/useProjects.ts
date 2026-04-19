import { useParams } from "@tanstack/react-router";
import { useValues } from "kea";
import { useContext, useMemo } from "react";
import { ProjectSwitchContext } from "../context/ProjectSwitchContext";
import { projectsLogic } from "../logics/projectsLogic";

export function useProjects() {
  const { readProjectById, projects } = useValues(projectsLogic);

  const { projectId: urlProjectId } = useParams({
    from: "/app/project/$projectId",
  });

  const switchContext = useContext(ProjectSwitchContext);
  const activeProjectId = switchContext?.displayedProjectId ?? urlProjectId;
  const pendingProjectId = switchContext?.pendingProjectId ?? null;
  const isSwitching = switchContext?.isSwitching ?? false;

  const activeProject = useMemo(
    () => readProjectById(activeProjectId),
    [activeProjectId, projects]
  );

  return { activeProject, pendingProjectId, isSwitching };
}
