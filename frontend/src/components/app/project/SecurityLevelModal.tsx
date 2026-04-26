import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  SecurityLevelPicker,
  type SecurityLevel,
} from "./SecurityLevelPicker";

interface SecurityLevelModalProps {
  open: boolean;
  onConfirm: (level: SecurityLevel) => void | Promise<void>;
}

export function SecurityLevelModal({ open, onConfirm }: SecurityLevelModalProps) {
  const [level, setLevel] = useState<SecurityLevel>("normal");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await onConfirm(level);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Non-dismissible: ignore attempts to close.
        if (!next) return;
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Choose a security level</DialogTitle>
          <DialogDescription>
            This decides how your secrets render inside the editor for this
            project. You can change it later in project settings.
          </DialogDescription>
        </DialogHeader>

        <SecurityLevelPicker
          value={level}
          onChange={setLevel}
          disabled={submitting}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            onClick={handleConfirm}
            isLoading={submitting}
            disabled={submitting}
            className="cursor-pointer"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SecurityLevelModal;
