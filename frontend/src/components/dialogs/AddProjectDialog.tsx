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
import { projectsLogic } from "@/lib/logics/projectsLogic";
import { useNavigate } from "@tanstack/react-router";
import { useActions } from "kea";
import { useEffect, useState } from "react";

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddProjectDialog({
  open,
  onOpenChange,
}: AddProjectDialogProps) {
  const navigate = useNavigate();
  const { addProject } = useActions(projectsLogic);

  const [name, setName] = useState("");
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>("normal");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setSecurityLevel("normal");
      setSubmitting(false);
    }
  }, [open]);

  const handleAddProject = async () => {
    if (!name.trim() || submitting) return;
    try {
      setSubmitting(true);
      await addProject(
        {
          name: name.trim(),
          securityLevel,
        },
        (projectId) => navigate({ to: `/app/project/${projectId}` })
      );
      onOpenChange?.(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddProject();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!submitting} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a new project</DialogTitle>
          <DialogDescription>
            Name your project and pick a security level. You can change both
            later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <label htmlFor="project-name" className="text-sm font-medium">
            Project name
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={submitting}
            className="w-full rounded-md border px-3 py-2 bg-background text-base sm:text-sm"
            autoFocus
            required
          />
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-medium">Security level</span>
          <SecurityLevelPicker
            value={securityLevel}
            onChange={setSecurityLevel}
            disabled={submitting}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            onClick={handleAddProject}
            disabled={!name.trim() || submitting}
            isLoading={submitting}
            className="cursor-pointer"
          >
            {submitting ? "Creating…" : "Create project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddProjectDialog;
