import {
  SecurityLevelPicker,
  type SecurityLevel,
} from "@/components/app/project/SecurityLevelPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputAction,
  InputWithActions,
} from "@/components/ui/input-with-actions";
import { Spinner } from "@/components/ui/spinner";
import { ProjectMemberRole } from "@/lib/api/projects.api";
import { authLogic } from "@/lib/logics/authLogic";
import { projectLogic } from "@/lib/logics/projectLogic";
import { projectSettingsLogic } from "@/lib/logics/projectSettingsLogic";
import {
  IconCheck,
  IconEdit,
  IconEye,
  IconEyeCode,
  IconEyeOff,
  IconShieldLock,
  IconTrash,
  IconUserMinus,
  IconX,
} from "@tabler/icons-react";
import { useActions, useAsyncActions, useValues } from "kea";
import { useEffect, useMemo, useState } from "react";

const LEVEL_META: Record<
  SecurityLevel,
  { label: string; description: string; Icon: typeof IconEye }
> = {
  yolo: {
    label: "Yolo",
    description: "Values are always visible in the editor",
    Icon: IconEye,
  },
  normal: {
    label: "Normal",
    description: "Values are masked, revealed on hover or click",
    Icon: IconEyeCode,
  },
  tight: {
    label: "Tight",
    description: "Values are always masked, click to copy only",
    Icon: IconEyeOff,
  },
};

function isKnownSecurityLevel(value: string | null): value is SecurityLevel {
  return value === "yolo" || value === "normal" || value === "tight";
}

interface ProjectSettingsDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

function RenameProjectSection() {
  const { projectData, currentUserRole } = useValues(projectLogic);
  const { jwtToken } = useValues(authLogic);
  const { updateProjectLoading } = useValues(projectSettingsLogic);

  const { updateProject } = useAsyncActions(projectSettingsLogic);

  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [showRenameForm, setShowRenameForm] = useState(false);

  const canRename = currentUserRole === ProjectMemberRole.Admin;

  useEffect(() => {
    if (showRenameForm && projectData) {
      setNewName(projectData.name);
    }
  }, [showRenameForm, projectData]);

  const handleRename = async () => {
    if (!projectData || !jwtToken || !newName.trim() || isRenaming) return;

    try {
      setIsRenaming(true);
      await updateProject({ name: newName.trim() });
      setShowRenameForm(false);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRename();
    }
  };

  if (!canRename) {
    return (
      <div className="space-y-3 overflow-hidden">
        <div className="flex items-center gap-2">
          <IconEdit className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Rename project</h3>
        </div>
        <div className="rounded-lg border border-dashed border-border/50 bg-neutral-800/20 px-4 py-6 text-center">
          <div className="text-sm text-muted-foreground">
            Only <span className="font-medium underline">Admins</span> can
            rename projects.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-hidden">
      <div className="flex items-center gap-2">
        <IconEdit className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Rename project</h3>
      </div>

      {showRenameForm ? (
        <InputWithActions
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="Project name"
          actions={
            <>
              <InputAction
                onClick={() => setShowRenameForm(false)}
                disabled={isRenaming}
                aria-label="Cancel"
              >
                <IconX className="size-4" />
              </InputAction>
              <button
                type="button"
                onClick={handleRename}
                disabled={
                  !newName.trim() ||
                  newName.trim() === projectData?.name ||
                  isRenaming ||
                  updateProjectLoading
                }
                aria-label="Save"
                className="flex items-center justify-center size-8 shrink-0 cursor-pointer rounded-md bg-white text-neutral-900 hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isRenaming || updateProjectLoading ? (
                  <Spinner className="size-4" />
                ) : (
                  <IconCheck className="size-4" />
                )}
              </button>
            </>
          }
        />
      ) : (
        <div className="rounded-lg border border-border/50 bg-neutral-800/20 overflow-hidden">
          <div className="group flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-800/40 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {projectData?.name}
              </div>
            </div>
            <Button
              onClick={() => setShowRenameForm(true)}
              variant="ghost"
              size="sm"
              className="cursor-pointer h-8 px-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <IconEdit className="size-4 mr-1.5" />
              Rename
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SecurityLevelSection() {
  const { projectData, currentUserRole } = useValues(projectLogic);
  const { updateProjectLoading } = useValues(projectSettingsLogic);
  const { updateProject } = useAsyncActions(projectSettingsLogic);

  const isAdmin = currentUserRole === ProjectMemberRole.Admin;

  const currentLevel: SecurityLevel = isKnownSecurityLevel(
    projectData?.securityLevel ?? null
  )
    ? (projectData!.securityLevel as SecurityLevel)
    : "normal";

  const [isEditing, setIsEditing] = useState(false);
  const [draftLevel, setDraftLevel] = useState<SecurityLevel>(currentLevel);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setDraftLevel(currentLevel);
    }
  }, [isEditing, currentLevel]);

  const handleSave = async () => {
    if (isSaving || draftLevel === currentLevel) {
      setIsEditing(false);
      return;
    }
    try {
      setIsSaving(true);
      await updateProject({ securityLevel: draftLevel });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-3 overflow-hidden">
        <div className="flex items-center gap-2">
          <IconShieldLock className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Security level</h3>
        </div>
        <div className="rounded-lg border border-dashed border-border/50 bg-neutral-800/20 px-4 py-6 text-center">
          <div className="text-sm text-muted-foreground">
            Only <span className="font-medium underline">Admins</span> can
            change the security level.
          </div>
        </div>
      </div>
    );
  }

  const meta = LEVEL_META[currentLevel];
  const CurrentIcon = meta.Icon;

  return (
    <div className="space-y-3 overflow-hidden">
      <div className="flex items-center gap-2">
        <IconShieldLock className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Security level</h3>
      </div>

      {isEditing ? (
        <div className="rounded-lg border border-border/50 bg-neutral-800/20 p-3 space-y-3">
          <SecurityLevelPicker
            value={draftLevel}
            onChange={setDraftLevel}
            disabled={isSaving || updateProjectLoading}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              disabled={isSaving || updateProjectLoading}
              className="cursor-pointer"
            >
              <IconX className="size-4 mr-1.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={
                isSaving ||
                updateProjectLoading ||
                draftLevel === currentLevel
              }
              className="cursor-pointer"
            >
              {isSaving || updateProjectLoading ? (
                <Spinner className="size-4 mr-1.5" />
              ) : (
                <IconCheck className="size-4 mr-1.5" />
              )}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border/50 bg-neutral-800/20 overflow-hidden">
          <div className="group flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-800/40 transition-colors">
            <CurrentIcon className="size-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{meta.label}</div>
              <div className="text-xs text-muted-foreground truncate">
                {meta.description}
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              className="cursor-pointer h-8 px-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <IconEdit className="size-4 mr-1.5" />
              Edit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function DangerZoneSection() {
  const { deleteProjectLoading } = useValues(projectSettingsLogic);

  const { projectData } = useValues(projectLogic);
  const { userData } = useValues(authLogic);
  const { deleteProject, removeMember } = useActions(projectSettingsLogic);
  const [isLoading, setIsLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const myRole = useMemo(
    () =>
      projectData?.members.find((member) => member.id === userData?.id)?.role,
    [projectData?.members, userData?.id]
  );

  const isAdmin = myRole === ProjectMemberRole.Admin;

  const handleDeleteProject = async () => {
    await deleteProject();
  };

  const handleLeaveProject = async () => {
    setIsLoading(true);
    await removeMember({
      projectId: projectData?.id!,
      memberId: userData?.id!,
    });
  };

  const actionText = isAdmin ? "Delete project" : "Leave project";
  const actionIcon = isAdmin ? IconTrash : IconUserMinus;
  const ActionIcon = actionIcon;

  return (
    <div className="space-y-3 overflow-hidden">
      <div className="flex items-center gap-2">
        <ActionIcon className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Danger zone</h3>
      </div>

      {showDeleteConfirm ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <div className="text-sm font-medium text-destructive mb-3">
            {isAdmin
              ? "Are you sure you want to delete this project?"
              : "Are you sure you want to leave this project?"}
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            {isAdmin
              ? "This action cannot be undone. This will permanently delete the project and remove all members' access."
              : "You will lose access to this project and its secrets. You'll need a new invitation to rejoin."}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={isAdmin ? handleDeleteProject : handleLeaveProject}
              isLoading={deleteProjectLoading || isLoading}
              variant="destructive"
              className="cursor-pointer"
            >
              {isAdmin ? "Delete project" : "Leave project"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteProjectLoading || isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border/50 bg-neutral-800/20 overflow-hidden">
          <div className="group flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/40 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{actionText}</div>
              <div className="text-xs text-muted-foreground">
                {isAdmin
                  ? "Permanently delete this project for all members"
                  : "Remove yourself from this project"}
              </div>
            </div>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="ghost"
              size="sm"
              className="cursor-pointer h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ActionIcon className="size-4 mr-1.5" />
              {isAdmin ? "Delete" : "Leave"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SettingsTabContent() {
  const { projectData } = useValues(projectLogic);

  if (!projectData) {
    return null;
  }

  return (
    <div className="w-full max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage settings for{" "}
          <span className="font-medium text-foreground">{projectData.name}</span>
        </p>
      </div>

      <RenameProjectSection />
      <SecurityLevelSection />
      <DangerZoneSection />
    </div>
  );
}

export function ProjectSettingsDialog({
  open,
  onOpenChange,
}: ProjectSettingsDialogProps) {
  const { projectData } = useValues(projectLogic);

  if (!projectData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <div className="grid gap-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Project settings
            </DialogTitle>
            <DialogDescription>
              Manage settings for "{projectData.name}".
            </DialogDescription>
          </DialogHeader>

          <RenameProjectSection />
          <SecurityLevelSection />
          <DangerZoneSection />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectSettingsDialog;
