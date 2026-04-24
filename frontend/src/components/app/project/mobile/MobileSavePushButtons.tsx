import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { ProjectMemberRole } from "@/lib/api/projects.api";
import { ProjectSwitchContext } from "@/lib/context/ProjectSwitchContext";
import { projectLogic } from "@/lib/logics/projectLogic";
import { cn } from "@/lib/utils";
import { useActions, useAsyncActions, useValues } from "kea";
import { CheckCircle2, ChevronDown, XCircle } from "lucide-react";
import posthog from "posthog-js";
import { useContext } from "react";
import { toast } from "sonner";

export function MobileSavePushButtons() {
  const {
    isSubmitting,
    isEditorDirty,
    isExternallyUpdated,
    isPushing,
    integrations,
    currentUserRole,
  } = useValues(projectLogic);
  const { updateProjectContent } = useActions(projectLogic);
  const { pushToIntegrations } = useAsyncActions(projectLogic);
  const isReadOnly = currentUserRole === ProjectMemberRole.Read;
  const switchContext = useContext(ProjectSwitchContext);
  const isSwitching = switchContext?.isSwitching ?? false;

  const saveDisabled =
    isSubmitting ||
    !isEditorDirty ||
    isExternallyUpdated ||
    isReadOnly ||
    isSwitching;
  const hasIntegrations = integrations && integrations.length > 0;
  const pushEnabled =
    !isEditorDirty &&
    !isPushing &&
    !isExternallyUpdated &&
    hasIntegrations &&
    !isReadOnly &&
    !isSwitching;
  const saved = !isEditorDirty && !isSubmitting;

  const handleSave = () => {
    if (saveDisabled) return;
    posthog.capture("save_button_clicked");
    updateProjectContent();
  };

  const handlePush = async () => {
    if (!pushEnabled) return;
    posthog.capture("push_button_confirmed");
    try {
      await pushToIntegrations();
      toast.custom((t) => (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-lg w-fit">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="text-foreground flex items-center gap-2 whitespace-nowrap">
              <span>Synced with</span>
              <span className="inline-flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded text-sm">
                <GitHubIcon className="size-4" />
                GitHub
              </span>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="text-foreground/50 hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      ));
    } catch {
      toast.custom((t) => (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-lg w-fit">
          <div className="flex items-center gap-4">
            <XCircle className="size-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="text-foreground flex items-center gap-2 whitespace-nowrap">
              <span>Failed to sync with</span>
              <span className="inline-flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded text-sm">
                <GitHubIcon className="size-4" />
                GitHub
              </span>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="text-foreground/50 hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      ));
    }
  };

  let pushReason: string | null = null;
  if (isReadOnly) pushReason = "Read-only access";
  else if (!hasIntegrations) pushReason = "No GitHub repo connected";
  else if (isEditorDirty) pushReason = "Save your changes first";
  else if (isExternallyUpdated) pushReason = "Refresh first — updated elsewhere";

  return (
    <div className="inline-flex items-stretch rounded-md overflow-hidden">
      <button
        type="button"
        onClick={handleSave}
        disabled={saveDisabled}
        className={cn(
          "h-8 px-3 text-sm font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center min-w-[68px]",
          saveDisabled
            ? "bg-neutral-800 text-neutral-500"
            : "bg-white text-black hover:bg-neutral-100 cursor-pointer"
        )}
      >
        {isSubmitting ? (
          <span
            aria-label="Saving"
            className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : saved ? (
          <span>Saved</span>
        ) : (
          <span>Save</span>
        )}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="More actions"
            className={cn(
              "h-8 px-1.5 border-l transition-colors inline-flex items-center justify-center cursor-pointer",
              saveDisabled
                ? "bg-neutral-800 border-neutral-700 text-neutral-500"
                : "bg-white border-black/10 text-black hover:bg-neutral-100"
            )}
          >
            <ChevronDown className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} className="w-56">
          <DropdownMenuItem
            onSelect={(e) => {
              if (!pushEnabled) {
                e.preventDefault();
                return;
              }
              handlePush();
            }}
            disabled={!pushEnabled}
            className="cursor-pointer"
          >
            {isPushing ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            ) : (
              <GitHubIcon className="size-4 mr-2" />
            )}
            <div className="flex flex-col min-w-0">
              <span>Push to GitHub</span>
              {!pushEnabled && pushReason && (
                <span className="text-[11px] text-muted-foreground truncate">
                  {pushReason}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
