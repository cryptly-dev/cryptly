import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/hooks/useAuth";
import { authLogic } from "@/lib/logics/authLogic";
import { keyLogic } from "@/lib/logics/keyLogic";
import { deviceFlowRequesterLogic } from "@/lib/logics/deviceFlowRequesterLogic";
import {
  IconExclamationCircle,
  IconEye,
  IconEyeOff,
  IconDevices,
  IconSend,
} from "@tabler/icons-react";
import { useActions, useAsyncActions, useValues } from "kea";
import { useEffect, useState } from "react";

export function UnlockBrowserDialog() {
  const { browserIsUnlocked, shouldSetUpPassphrase } = useValues(keyLogic);
  const { isLoggedIn } = useValues(authLogic);
  const { logout } = useAuth();
  const { setPassphrase, decryptPrivateKey } = useAsyncActions(keyLogic);

  const [passphrase, setLocalPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (browserIsUnlocked) {
      setLocalPassphrase("");
      setSubmitting(false);
      setIsError(false);
    }
  }, [browserIsUnlocked]);

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
    <Dialog open={!browserIsUnlocked && isLoggedIn && !shouldSetUpPassphrase}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unlock this browser</DialogTitle>
          <DialogDescription>Enter your account passphrase.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <label htmlFor="unlock-pass" className="text-sm font-medium">
            Passphrase
          </label>
          <div className="relative">
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
          {isError && (
            <div className="flex items-center gap-2 p-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              <IconExclamationCircle />
              <span>Incorrect passphrase</span>
            </div>
          )}
        </div>

        <ConnectedDevicesSection />
        <ReceivedMessageSection />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={logout}
            className="cursor-pointer"
          >
            Log out
          </Button>
          <Button
            onClick={handleUnlock}
            disabled={!passphrase || submitting}
            isLoading={submitting}
            className="cursor-pointer"
          >
            Unlock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConnectedDevicesSection() {
  const { devices } = useValues(deviceFlowRequesterLogic);
  const { requestUnlock } = useActions(deviceFlowRequesterLogic);
  const [isSending, setIsSending] = useState(false);

  const handleRequestUnlock = async () => {
    setIsSending(true);
    try {
      await requestUnlock();
    } finally {
      setTimeout(() => setIsSending(false), 1000);
    }
  };

  if (devices.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconDevices className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Connected Devices</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRequestUnlock}
          disabled={isSending}
          className="cursor-pointer"
        >
          <IconSend className="size-3 mr-1" />
          Request unlock
        </Button>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {devices.map((device) => (
          <div
            key={device.deviceId}
            className="flex items-center justify-between p-2 text-sm bg-muted/50 rounded-md"
          >
            <span className="text-foreground">
              {device.deviceName || "Unknown Device"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatLastActivity(device.lastActivityDate)}
            </span>
          </div>
        ))}
      </div>
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

function formatLastActivity(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) {
    return "now";
  } else if (seconds < 60) {
    return `${seconds}s ago`;
  } else {
    return "offline";
  }
}
