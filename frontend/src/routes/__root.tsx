import { SetUpPassphraseDialog } from "@/components/dialogs/SetUpPassphraseDialog";
import { UnlockBrowserDialog } from "@/components/dialogs/UnlockBrowserDialog";
import { AppNavigation } from "@/components/navigation/app-navigation";
import { Toaster } from "@/components/ui/sonner";
import { authLogic } from "@/lib/logics/authLogic";
import { keyLogic } from "@/lib/logics/keyLogic";
import { projectsLogic } from "@/lib/logics/projectsLogic";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { BindLogic } from "kea";

const RootLayout = () => (
  <BindLogic logic={authLogic} props={{}}>
    <BindLogic logic={keyLogic} props={{}}>
      <BindLogic logic={projectsLogic} props={{}}>
        <Outlet />
        <SetUpPassphraseDialog />
        <UnlockBrowserDialog />
        <AppNavigation />
        <Toaster />
      </BindLogic>
    </BindLogic>
  </BindLogic>
);

export const Route = createRootRoute({ component: RootLayout });
