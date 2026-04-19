import { DesktopProjectView } from "@/components/app/project/desktop/DesktopProjectView";
import { MobileProjectView } from "@/components/app/project/mobile/MobileProjectView";
import { ProjectUnsavedChangesGuard } from "@/components/app/project/ProjectUnsavedChangesGuard";
import { ProjectSwitchContext } from "@/lib/context/ProjectSwitchContext";
import { authLogic } from "@/lib/logics/authLogic";
import { integrationsLogic } from "@/lib/logics/integrationsLogic";
import { invitationsLogic } from "@/lib/logics/invitationsLogic";
import { personalInvitationsLogic } from "@/lib/logics/personalInvitationsLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import { projectSettingsLogic } from "@/lib/logics/projectSettingsLogic";
import { projectsLogic } from "@/lib/logics/projectsLogic";
import { suggestedUsersLogic } from "@/lib/logics/suggestedUsersLogic";
import { useNavigate, useParams } from "@tanstack/react-router";
import { BindLogic, useValues } from "kea";
import { useEffect, useMemo, useRef, useState } from "react";

export function ProjectPage() {
  const { projects } = useValues(projectsLogic);
  const navigate = useNavigate();
  const { isLoggedIn } = useValues(authLogic);

  const { projectId } = useParams({
    from: "/app/project/$projectId",
  });

  const [displayedProjectId, setDisplayedProjectId] = useState(projectId);
  const isSwitching = displayedProjectId !== projectId;

  const switchContextValue = useMemo(
    () => ({
      displayedProjectId,
      pendingProjectId: isSwitching ? projectId : null,
      isSwitching,
    }),
    [displayedProjectId, projectId, isSwitching]
  );

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/app/login" });
    }
  }, []);

  useEffect(() => {
    if (
      projects &&
      projects.length &&
      !projects.find((project) => project.id === projectId)
    ) {
      navigate({
        to: "/app/project/$projectId",
        params: { projectId: projects[0].id },
      });
    } else if (projects && projects.length === 0) {
      navigate({ to: "/app/project" });
    }
  }, [projects, projectId]);

  return (
    <ProjectSwitchContext.Provider value={switchContextValue}>
      {isSwitching && (
        <PendingProjectLoader
          projectId={projectId}
          onReady={() => setDisplayedProjectId(projectId)}
        />
      )}
      <BindLogic logic={projectLogic} props={{ projectId: displayedProjectId }}>
        <BindLogic
          logic={invitationsLogic}
          props={{ projectId: displayedProjectId }}
        >
          <BindLogic
            logic={projectSettingsLogic}
            props={{ projectId: displayedProjectId }}
          >
            <BindLogic
              logic={integrationsLogic}
              props={{ projectId: displayedProjectId }}
            >
              <BindLogic
                logic={personalInvitationsLogic}
                props={{ projectId: displayedProjectId }}
              >
                <BindLogic
                  logic={suggestedUsersLogic}
                  props={{ projectId: displayedProjectId }}
                >
                  <ProjectPageContent />
                </BindLogic>
              </BindLogic>
            </BindLogic>
          </BindLogic>
        </BindLogic>
      </BindLogic>
    </ProjectSwitchContext.Provider>
  );
}

interface PendingProjectLoaderProps {
  projectId: string;
  onReady: () => void;
}

/**
 * Mounts projectLogic for the pending projectId so it starts loading in the
 * background. Notifies the parent as soon as data is available (or the load
 * settles), so the UI can swap from the previous project to the new one
 * without a skeleton flash.
 */
function PendingProjectLoader({
  projectId,
  onReady,
}: PendingProjectLoaderProps) {
  const { projectData, projectDataLoading } = useValues(
    projectLogic({ projectId })
  );
  const startedRef = useRef(false);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (notifiedRef.current) return;

    if (projectDataLoading) {
      startedRef.current = true;
      return;
    }

    if (projectData && projectData.id === projectId) {
      notifiedRef.current = true;
      onReady();
      return;
    }

    if (startedRef.current) {
      notifiedRef.current = true;
      onReady();
    }
  }, [projectData, projectDataLoading, projectId, onReady]);

  return null;
}

function ProjectPageContent() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return (
    <>
      <ProjectUnsavedChangesGuard />
      {isMobile ? <MobileProjectView /> : <DesktopProjectView />}
    </>
  );
}
