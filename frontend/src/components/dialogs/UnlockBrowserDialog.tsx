import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Device } from "@/lib/api/device-flow.api";
import { useAuth } from "@/lib/hooks/useAuth";
import { authLogic } from "@/lib/logics/authLogic";
import { deviceFlowRequesterLogic } from "@/lib/logics/deviceFlowRequesterLogic";
import { keyLogic } from "@/lib/logics/keyLogic";
import {
  IconDevices,
  IconExclamationCircle,
  IconEye,
  IconEyeOff,
  IconSend,
} from "@tabler/icons-react";
import { useActions, useAsyncActions, useValues } from "kea";
import { useEffect, useMemo, useState } from "react";

export function UnlockBrowserDialog() {
  const { browserIsUnlocked, shouldSetUpPassphrase } = useValues(keyLogic);
  const { isLoggedIn } = useValues(authLogic);
  const { logout } = useAuth();
  const { setPassphrase, decryptPrivateKey } = useAsyncActions(keyLogic);
  const { startRequester, stopRequester } = useActions(
    deviceFlowRequesterLogic
  );

  const [passphrase, setLocalPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);

  const open = useMemo(() => {
    return !browserIsUnlocked && isLoggedIn && !shouldSetUpPassphrase;
  }, [browserIsUnlocked, isLoggedIn, shouldSetUpPassphrase]);

  useEffect(() => {
    if (browserIsUnlocked) {
      setLocalPassphrase("");
      setSubmitting(false);
      setIsError(false);
    }
  }, [browserIsUnlocked]);

  useEffect(() => {
    if (open) {
      startRequester();
    } else {
      stopRequester();
    }

    return () => {
      stopRequester();
    };
  }, [open, startRequester, stopRequester]);

  const handleUnlock = async () => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!passphrase || submitting) return;
    setIsError(false);
    try {
      setPassphrase(passphrase);
      await decryptPrivateKey();
    } catch (e) {
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader className="relative">
          <DialogTitle>Unlock this browser</DialogTitle>
          <DialogDescription>Enter your account passphrase.</DialogDescription>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={logout}
            className="cursor-pointer absolute top-0 right-0"
          >
            Log out
          </Button>
        </DialogHeader>

        <div className="grid gap-2">
          <label htmlFor="unlock-pass" className="text-sm font-medium">
            Passphrase
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="unlock-pass"
                type={showPassphrase ? "text" : "password"}
                value={passphrase}
                onChange={(e) => {
                  setLocalPassphrase(e.target.value);
                  if (isError) {
                    setIsError(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && passphrase && !submitting) {
                    handleUnlock();
                  }
                }}
                className="w-full rounded-md border px-3 py-2 text bg-background text-base sm:text-sm pr-10"
                autoFocus
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={
                  showPassphrase ? "Hide passphrase" : "Show passphrase"
                }
              >
                {showPassphrase ? (
                  <IconEyeOff className="size-4" />
                ) : (
                  <IconEye className="size-4" />
                )}
              </button>
            </div>
            <Button
              onClick={handleUnlock}
              disabled={!passphrase || submitting}
              isLoading={submitting}
              className="cursor-pointer"
            >
              Unlock
            </Button>
          </div>
          {isError && (
            <div className="flex items-center gap-2 p-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              <IconExclamationCircle />
              <span>Incorrect passphrase</span>
            </div>
          )}
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">
              OR
            </span>
          </div>
        </div>

        <ConnectedDevicesSection />
        <ReceivedMessageSection />
      </DialogContent>
    </Dialog>
  );
}

function ConnectedDevicesSection() {
  const { approvers, unlockRequestPin } = useValues(deviceFlowRequesterLogic);
  const { requestUnlock } = useAsyncActions(deviceFlowRequesterLogic);
  const [isSending, setIsSending] = useState(false);

  const handleRequestUnlock = async (deviceId: string) => {
    setIsSending(true);
    try {
      await requestUnlock(deviceId);
    } finally {
      setTimeout(() => setIsSending(false), 1000);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <IconDevices className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Connected Devices</span>
      </div>

      {approvers.length === 0 ? (
        <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer"></div>
          <div className="flex items-start gap-3 relative">
            <div className="p-2 bg-primary/20 rounded-full mt-0.5">
              <IconDevices className="size-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">
                Searching for devices...
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open Cryptly on an already authenticated device and approve the
                unlock request from there. No passphrase typing needed.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {approvers.map((approver) => (
              <DeviceItem
                key={approver.deviceId}
                device={approver}
                onRequestUnlock={handleRequestUnlock}
                isSending={isSending}
              />
            ))}
          </div>
          {unlockRequestPin && (
            <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-2xl font-mono font-bold text-primary tracking-wider text-center">
                {unlockRequestPin}
              </p>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Verify this PIN matches on your other device
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DeviceItem({
  device,
  onRequestUnlock,
  isSending,
}: {
  device: Device;
  onRequestUnlock: (deviceId: string) => Promise<void>;
  isSending: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 border border-border/50 rounded-lg transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <IconDevices className="size-3.5 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">
          {device.deviceName || "Unknown Device"}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onRequestUnlock(device.deviceId)}
        disabled={isSending}
        className="cursor-pointer"
      >
        <IconSend className="size-3 mr-1.5" />
        Request
      </Button>
    </div>
  );
}

function ReceivedMessageSection() {
  const { receivedMessage } = useValues(deviceFlowRequesterLogic);
  const { clearReceivedMessage } = useActions(deviceFlowRequesterLogic);

  if (!receivedMessage) {
    return null;
  }

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Received Message</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearReceivedMessage}
          className="cursor-pointer h-6 text-xs"
        >
          Clear
        </Button>
      </div>
      <div className="bg-muted/50 p-3 rounded-md">
        <pre className="text-xs overflow-auto max-h-32">
          {JSON.stringify(receivedMessage, null, 2)}
        </pre>
      </div>
    </div>
  );
}
