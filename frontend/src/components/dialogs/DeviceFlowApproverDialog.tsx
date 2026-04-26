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
import { AsymmetricCrypto } from "@/lib/crypto/crypto.asymmetric";
import { SymmetricCrypto } from "@/lib/crypto/crypto.symmetric";
import { authLogic } from "@/lib/logics/authLogic";
import { deviceFlowApproverLogic } from "@/lib/logics/deviceFlowApproverLogic";
import { deviceFlowRequesterLogic } from "@/lib/logics/deviceFlowRequesterLogic";
import {
  IconCheck,
  IconDeviceMobile,
  IconExclamationCircle,
  IconEye,
  IconEyeOff,
  IconX,
} from "@tabler/icons-react";
import { useActions, useValues } from "kea";
import { useEffect, useState } from "react";

export function DeviceFlowApproverDialog() {
  const { hasNewMessage, lastMessage } = useValues(deviceFlowApproverLogic);
  const { clearMessage } = useActions(deviceFlowApproverLogic);
  const { sendMessage } = useActions(deviceFlowRequesterLogic);
  const { userData } = useValues(authLogic);
  const [isProcessing, setIsProcessing] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isError, setIsError] = useState(false);

  const isUnlockRequest = lastMessage?.type === "request";

  useEffect(() => {
    if (!hasNewMessage) {
      setPassphrase("");
      setShowPassphrase(false);
      setIsError(false);
      setIsProcessing(false);
    }
  }, [hasNewMessage]);

  const verifyPassphrase = async (candidate: string): Promise<boolean> => {
    if (!userData?.privateKeyEncrypted) return false;
    try {
      const base64Key = await SymmetricCrypto.deriveBase64KeyFromPassphrase(
        candidate
      );
      await SymmetricCrypto.decrypt(
        userData.privateKeyEncrypted,
        base64Key
      );
      return true;
    } catch {
      return false;
    }
  };

  const handleApprove = async () => {
    if (
      !lastMessage?.requesterDeviceId ||
      !lastMessage?.publicKey ||
      !passphrase
    ) {
      return;
    }

    setIsProcessing(true);
    setIsError(false);
    try {
      const ok = await verifyPassphrase(passphrase);
      if (!ok) {
        setIsError(true);
        return;
      }

      const encryptedPassphrase = await AsymmetricCrypto.encrypt(
        passphrase,
        lastMessage.publicKey
      );

      await sendMessage(
        lastMessage.requesterDeviceId,
        {
          type: "approve",
          approved: true,
          encryptedPassphrase,
          timestamp: new Date().toISOString(),
        },
        "approver"
      );

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
      await sendMessage(
        lastMessage.requesterDeviceId,
        {
          type: "approve",
          approved: false,
          timestamp: new Date().toISOString(),
        },
        "approver"
      );

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
              <DialogTitle>Device sign in request</DialogTitle>
              <DialogDescription>
                Another device is trying to sign in
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isUnlockRequest ? (
          <div className="py-4 space-y-4">
            {lastMessage.pin && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-3xl font-mono font-bold text-primary tracking-wider text-center">
                  {lastMessage.pin}
                </p>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Verify this PIN matches on your other device
                </p>
              </div>
            )}

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                Enter your passphrase to share it with the requesting device.
                It is encrypted under that device's one-time key before it
                leaves this browser.
              </p>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="approver-pass"
                className="text-sm font-medium"
              >
                Your passphrase
              </label>
              <InputWithActions
                id="approver-pass"
                type={showPassphrase ? "text" : "password"}
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  if (isError) setIsError(false);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    passphrase &&
                    !isProcessing
                  ) {
                    handleApprove();
                  }
                }}
                placeholder="Enter your passphrase"
                autoFocus
                autoComplete="current-password"
                actions={
                  <InputAction
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    aria-label={
                      showPassphrase
                        ? "Hide passphrase"
                        : "Show passphrase"
                    }
                  >
                    {showPassphrase ? (
                      <IconEyeOff className="size-4" />
                    ) : (
                      <IconEye className="size-4" />
                    )}
                  </InputAction>
                }
              />
              {isError && (
                <div className="flex items-center gap-2 p-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                  <IconExclamationCircle />
                  <span>Incorrect passphrase</span>
                </div>
              )}
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
                disabled={isProcessing || !passphrase}
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
