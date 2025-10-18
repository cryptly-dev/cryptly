import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deviceFlowApproverLogic } from "@/lib/logics/deviceFlowApproverLogic";
import { deviceFlowRequesterLogic } from "@/lib/logics/deviceFlowRequesterLogic";
import { keyLogic } from "@/lib/logics/keyLogic";
import { AsymmetricCrypto } from "@/lib/crypto/crypto.asymmetric";
import { IconDeviceMobile, IconCheck, IconX } from "@tabler/icons-react";
import { useActions, useValues } from "kea";
import { useState } from "react";

export function DeviceFlowApproverDialog() {
  const { hasNewMessage, lastMessage } = useValues(deviceFlowApproverLogic);
  const { clearMessage } = useActions(deviceFlowApproverLogic);
  const { sendMessage } = useActions(deviceFlowRequesterLogic);
  const { passphrase } = useValues(keyLogic);
  const [isProcessing, setIsProcessing] = useState(false);

  const isUnlockRequest = lastMessage?.type === "request";

  const handleApprove = async () => {
    if (
      !lastMessage?.requesterDeviceId ||
      !lastMessage?.publicKey ||
      !passphrase
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const encryptedPassphrase = await AsymmetricCrypto.encrypt(
        passphrase,
        lastMessage.publicKey
      );

      await sendMessage(lastMessage.requesterDeviceId, {
        type: "approve",
        approved: true,
        encryptedPassphrase,
        timestamp: new Date().toISOString(),
      });

      clearMessage();
    } catch (error) {
      console.error("Failed to approve unlock request:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!lastMessage?.requesterDeviceId) {
      return;
    }

    setIsProcessing(true);
    try {
      await sendMessage(lastMessage.requesterDeviceId, {
        type: "approve",
        approved: false,
        timestamp: new Date().toISOString(),
      });

      clearMessage();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={hasNewMessage}
      onOpenChange={(open) => !open && clearMessage()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <IconDeviceMobile className="size-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Device Sign-In Request</DialogTitle>
              <DialogDescription>
                Another device is trying to sign in
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isUnlockRequest ? (
          <div className="py-4 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Request details:
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">
                    {new Date(lastMessage.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                By approving, you will share your passphrase with the requesting
                device to unlock the browser.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 cursor-pointer"
              >
                <IconX className="size-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 cursor-pointer"
              >
                <IconCheck className="size-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="my-4">
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                {JSON.stringify(lastMessage, null, 2)}
              </pre>
            </div>
            <div className="flex justify-end">
              <Button onClick={clearMessage} className="cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
