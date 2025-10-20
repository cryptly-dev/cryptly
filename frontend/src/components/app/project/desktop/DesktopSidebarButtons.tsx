import { Button } from "@/components/ui/button";
import { projectLogic } from "@/lib/logics/projectLogic";
import {
  IconArrowLeft,
  IconHistory,
  IconPlugConnected,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { useActions, useValues } from "kea";
import { useState } from "react";
import { ProjectAccessDialog } from "@/components/dialogs/ProjectAccessDialog";
import { ProjectSettingsDialog } from "@/components/dialogs/ProjectSettingsDialog";
import { IntegrationsDialog } from "@/components/dialogs/IntegrationsDialog";
import { SavePushButtonGroup } from "@/components/app/project/SavePushButtonGroup";
import { CopyAllButton } from "@/components/app/project/CopyAllButton";
import posthog from "posthog-js";

export function DesktopSidebarButtons() {
  const { isShowingHistory } = useValues(projectLogic);
  const { toggleHistoryView } = useActions(projectLogic);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [integrationsDialogOpen, setIntegrationsDialogOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Navigation Buttons */}
      <nav className="flex-1 space-y-1">
        {isShowingHistory ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleHistoryView}
            aria-label="Go back"
            className="w-full justify-start cursor-pointer"
          >
            <IconArrowLeft className="size-4 mr-2" />
            Back
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toggleHistoryView();
                posthog.capture("history_button_clicked");
              }}
              aria-label="History"
              className="w-full justify-start cursor-pointer"
            >
              <IconHistory className="size-4 mr-2" />
              History
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShareDialogOpen(true);
                posthog.capture("members_button_clicked");
              }}
              aria-label="Members"
              className="w-full justify-start cursor-pointer"
            >
              <IconUsers className="size-4 mr-2" />
              Members
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSettingsDialogOpen(true);
                posthog.capture("settings_button_clicked");
              }}
              aria-label="Settings"
              className="w-full justify-start cursor-pointer"
            >
              <IconSettings className="size-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIntegrationsDialogOpen(true);
                posthog.capture("integrations_button_clicked");
              }}
              aria-label="Integrations"
              className="w-full justify-start cursor-pointer"
            >
              <IconPlugConnected className="size-4 mr-2" />
              Integrations
            </Button>
          </>
        )}
      </nav>

      {/* Save/Copy Buttons at Bottom */}
      {!isShowingHistory && (
        <div className="space-y-2 pt-4 border-t border-border">
          <SavePushButtonGroup />
          <CopyAllButton />
        </div>
      )}

      <ProjectAccessDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
      <ProjectSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
      <IntegrationsDialog
        open={integrationsDialogOpen}
        onOpenChange={setIntegrationsDialogOpen}
      />
    </div>
  );
}
