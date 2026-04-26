import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActions, useValues } from "kea";
import { keyLogic } from "@/lib/logics/keyLogic";
import { authLogic } from "@/lib/logics/authLogic";
import { useState } from "react";
import { UserApi } from "@/lib/api/user.api";
import { keystore } from "@/lib/crypto/keystore";

export function DeveloperPage() {
  const { userData, browserIsUnlocked } = useValues(keyLogic);
  const { setHasMasterKey, hydrateMasterKey } = useActions(keyLogic);

  const { loadUserData } = useActions(authLogic);
  const { jwtToken } = useValues(authLogic);

  const [showNewAccountDialog, setShowNewAccountDialog] = useState(false);
  const [hideNewAccountButton, setHideNewAccountButton] = useState(false);

  const copyToClipboard = async (value?: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {}
  };

  const areKeysSet = Boolean(
    userData?.publicKey && userData?.privateKeyEncrypted
  );

  const simulateNewAccount = async () => {
    if (!jwtToken) return;
    await UserApi.deleteKeys(jwtToken);
    await keystore.wipeAll();
    setHasMasterKey(false);
    await loadUserData();
    setShowNewAccountDialog(false);
    setHideNewAccountButton(true);
  };

  const simulateNewBrowser = async () => {
    await keystore.wipeAll();
    await hydrateMasterKey();
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl border border-border bg-card/60 backdrop-blur p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Developer</h1>

        <div className="space-y-2">
          <Row label="Are keys set?">
            <Value onClick={() => copyToClipboard(areKeysSet ? "Yes" : "No")}>
              {areKeysSet ? "Yes" : "No"}
            </Value>
          </Row>
          <Row label="Is this browser unlocked?">
            <Value
              onClick={() => copyToClipboard(browserIsUnlocked ? "Yes" : "No")}
            >
              {browserIsUnlocked ? "Yes" : "No"}
            </Value>
          </Row>
          <Row label="Public key">
            <Value
              title={userData?.publicKey || ""}
              onClick={() => copyToClipboard(userData?.publicKey)}
            >
              {userData?.publicKey || "—"}
            </Value>
          </Row>
          <Row label="Encrypted private key">
            <Value
              title={userData?.privateKeyEncrypted || ""}
              onClick={() => copyToClipboard(userData?.privateKeyEncrypted)}
            >
              {userData?.privateKeyEncrypted || "—"}
            </Value>
          </Row>
          <Row label="Master key">
            <Value>
              {browserIsUnlocked
                ? "Held as non-extractable CryptoKey in IndexedDB"
                : "—"}
            </Value>
          </Row>
        </div>

        <div className="pt-2 flex gap-3">
          {!hideNewAccountButton && (
            <Button
              variant="secondary"
              onClick={() => setShowNewAccountDialog(true)}
            >
              Simulate new account
            </Button>
          )}
          <Button variant="secondary" onClick={simulateNewBrowser}>
            Simulate new browser
          </Button>
        </div>
      </div>

      <Dialog
        open={showNewAccountDialog}
        onOpenChange={setShowNewAccountDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simulate New Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to simulate a new account?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="text-sm font-medium text-destructive mb-2">
                ⚠️ Warning: Destructive Action
              </div>
              <div className="text-sm text-muted-foreground">
                This action will regenerate your encryption keys and make{" "}
                <strong>all your current projects completely unusable</strong>.
                You will lose access to all encrypted data. This action cannot
                be undone.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowNewAccountDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={simulateNewAccount}>
              Confirm - Regenerate Keys
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-56 shrink-0 text-muted-foreground">{label}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Value({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <div
      className="rounded-md bg-muted px-3 py-2 text-xs truncate cursor-pointer select-none"
      onClick={onClick}
      title={title}
      role="button"
      aria-label="Copy value"
    >
      {children}
    </div>
  );
}
