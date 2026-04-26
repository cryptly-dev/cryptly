import { UnlockBrowserDialog } from "@/components/dialogs/UnlockBrowserDialog";
import { DeviceFlowApproverDialog } from "@/components/dialogs/DeviceFlowApproverDialog";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { Toaster } from "@/components/ui/sonner";
import { authLogic } from "@/lib/logics/authLogic";
import { keyLogic } from "@/lib/logics/keyLogic";
import { myPersonalInvitationsLogic } from "@/lib/logics/myPersonalInvitationsLogic";
import { projectsLogic } from "@/lib/logics/projectsLogic";
import { deviceFlowApproverLogic } from "@/lib/logics/deviceFlowApproverLogic";
import {
  createRootRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { BindLogic, useValues } from "kea";
import { useEffect } from "react";

function PassphraseGate() {
  const { isLoggedIn } = useValues(authLogic);
  const { shouldSetUpPassphrase } = useValues(keyLogic);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || !shouldSetUpPassphrase) return;

    const path = location.pathname;
    if (!path.startsWith("/app")) return;
    if (path.startsWith("/app/login")) return;
    if (path.startsWith("/app/set-passphrase")) return;

    navigate({ to: "/app/set-passphrase", replace: true });
  }, [isLoggedIn, shouldSetUpPassphrase, location.pathname, navigate]);

  return null;
}

const RootLayout = () => (
  <BindLogic logic={authLogic} props={{}}>
    <BindLogic logic={keyLogic} props={{}}>
      <BindLogic logic={projectsLogic} props={{}}>
        <BindLogic logic={myPersonalInvitationsLogic} props={{}}>
          <BindLogic logic={deviceFlowApproverLogic} props={{}}>
            <BlogHeader />
            <Outlet />
            <PassphraseGate />
            <UnlockBrowserDialog />
            <DeviceFlowApproverDialog />
            <Toaster />
          </BindLogic>
        </BindLogic>
      </BindLogic>
    </BindLogic>
  </BindLogic>
);

export const Route = createRootRoute({ component: RootLayout });
