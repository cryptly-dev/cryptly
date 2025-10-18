import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deviceFlowApproverLogic } from "@/lib/logics/deviceFlowApproverLogic";
import { useActions, useValues } from "kea";

export function DeviceFlowApproverDialog() {
  const { hasNewMessage, lastMessage } = useValues(deviceFlowApproverLogic);
  const { clearMessage } = useActions(deviceFlowApproverLogic);

  return (
    <Dialog
      open={hasNewMessage}
      onOpenChange={(open) => !open && clearMessage()}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Device Message</DialogTitle>
          <DialogDescription>
            You received a message from another device
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
            {JSON.stringify(lastMessage, null, 2)}
          </pre>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={clearMessage} className="cursor-pointer">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
