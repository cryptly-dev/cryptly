import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authLogic } from "@/lib/logics/authLogic";
import { keyLogic } from "@/lib/logics/keyLogic";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useActions, useValues } from "kea";
import { useEffect, useMemo, useState } from "react";

export function SetUpPassphraseDialog() {
  const { shouldSetUpPassphrase } = useValues(keyLogic);
  const { setUpPassphrase } = useActions(keyLogic);
  const { logout } = useActions(authLogic);

  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!shouldSetUpPassphrase) {
      setPass1("");
      setPass2("");
      setSubmitting(false);
    }
  }, [shouldSetUpPassphrase]);

  const passwordsMatch = useMemo(
    () => pass1.length > 0 && pass1 === pass2,
    [pass1, pass2]
  );

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!passwordsMatch || submitting) return;
    try {
      setSubmitting(true);
      setUpPassphrase(pass1);
    } catch {}
  };

  return (
    <Dialog open={shouldSetUpPassphrase}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Set up your account passphrase</DialogTitle>
            <DialogDescription>
              You will be asked to enter this passphrase every time you try to
              access your account from a different device.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="size-5 text-blue-600 dark:text-blue-500 flex-shrink-0" />
              <h3 className="text-base font-semibold text-blue-900 dark:text-blue-300">
                Your passphrase ensures complete privacy
              </h3>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              This passphrase is what ensures that nobody (even us) can access
              your secrets. Your data is encrypted end-to-end and only you hold
              the key.
            </p>
          </div>

          <div className="rounded-lg border-2 border-red-600 bg-red-50 dark:bg-red-950/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-5 text-red-600 dark:text-red-500 flex-shrink-0" />
              <h3 className="text-base font-bold text-red-600 dark:text-red-500">
                This passphrase cannot be recovered
              </h3>
            </div>
            <p className="text-sm text-red-800 dark:text-red-300">
              If you forget your passphrase, the only way to regain access to
              your account is to remove it entirely. Make sure to store it
              somewhere safe.
            </p>
          </div>

          <div className="grid gap-2">
            <label htmlFor="pp1" className="text-sm font-medium">
              Passphrase
            </label>
            <div className="relative">
              <input
                id="pp1"
                type={showPass1 ? "text" : "password"}
                value={pass1}
                onChange={(e) => setPass1(e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-background text-base sm:text-sm pr-10"
                autoFocus
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass1(!showPass1)}
                className="absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showPass1 ? "Hide passphrase" : "Show passphrase"}
              >
                {showPass1 ? (
                  <IconEyeOff className="size-4" />
                ) : (
                  <IconEye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="pp2" className="text-sm font-medium">
              Confirm passphrase
            </label>
            <div className="relative">
              <input
                id="pp2"
                type={showPass2 ? "text" : "password"}
                value={pass2}
                onChange={(e) => setPass2(e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-background text-base sm:text-sm pr-10"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass2(!showPass2)}
                className="absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showPass2 ? "Hide passphrase" : "Show passphrase"}
              >
                {showPass2 ? (
                  <IconEyeOff className="size-4" />
                ) : (
                  <IconEye className="size-4" />
                )}
              </button>
            </div>
            {pass2.length > 0 && !passwordsMatch && (
              <div className="text-xs text-destructive">
                Passphrases do not match.
              </div>
            )}
          </div>

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
              type="submit"
              disabled={!passwordsMatch || submitting}
              className="cursor-pointer"
            >
              {submitting ? "Setting up…" : "Set up passphrase"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
