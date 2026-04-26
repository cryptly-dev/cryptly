import { authLogic } from "@/lib/logics/authLogic";
import { useAuth } from "@/lib/hooks/useAuth";
import { keyLogic } from "@/lib/logics/keyLogic";
import { useNavigate } from "@tanstack/react-router";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useAsyncActions, useValues } from "kea";
import { AlertTriangle, CornerDownLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

export function SetUpPassphrasePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useValues(authLogic);
  const { shouldSetUpPassphrase } = useValues(keyLogic);
  const { setUpPassphrase } = useAsyncActions(keyLogic);
  const { logout } = useAuth();

  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showMismatch, setShowMismatch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reverse-gate: if we don't (or no longer) need to set up a passphrase,
  // get out of here.
  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/app/login", replace: true });
      return;
    }
    if (!shouldSetUpPassphrase) {
      navigate({ to: "/app/project", replace: true });
    }
  }, [isLoggedIn, shouldSetUpPassphrase, navigate]);

  const passwordsMatch = useMemo(
    () => pass1.length > 0 && pass1 === pass2,
    [pass1, pass2]
  );

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (submitting || pass1.length === 0) return;
    if (!passwordsMatch) {
      setShowMismatch(true);
      return;
    }
    setSubmitting(true);
    try {
      await setUpPassphrase(pass1);
      // The reverse-gate above will navigate once shouldSetUpPassphrase flips.
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0, 0.55, 0.45, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/60 mb-5">
            New account
          </div>
          <h1 className="text-[34px] md:text-[40px] font-semibold text-foreground tracking-tight leading-[1.05]">
            Set your{" "}
            <span className="text-muted-foreground">passphrase.</span>
          </h1>
          <p className="mt-5 text-[15px] text-muted-foreground leading-[1.7]">
            Used to encrypt your account. You'll be asked for it on any new
            device.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type={showPass1 ? "text" : "password"}
              value={pass1}
              onChange={(e) => {
                setPass1(e.target.value);
                setShowMismatch(false);
              }}
              placeholder="Passphrase"
              disabled={submitting}
              autoComplete="new-password"
              required
              className="w-full h-12 bg-neutral-900/40 border border-border/60 rounded-lg pl-4 pr-12 text-base md:text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:bg-neutral-900/60 transition-colors disabled:opacity-60"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPass1(!showPass1)}
              className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={showPass1 ? "Hide passphrase" : "Show passphrase"}
            >
              {showPass1 ? (
                <IconEyeOff className="size-4" />
              ) : (
                <IconEye className="size-4" />
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type={showPass2 ? "text" : "password"}
              value={pass2}
              onChange={(e) => {
                setPass2(e.target.value);
                setShowMismatch(false);
              }}
              placeholder="Confirm passphrase"
              disabled={submitting}
              autoComplete="new-password"
              required
              className="w-full h-12 bg-neutral-900/40 border border-border/60 rounded-lg pl-4 pr-12 text-base md:text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:bg-neutral-900/60 transition-colors disabled:opacity-60"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPass2(!showPass2)}
              className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={showPass2 ? "Hide passphrase" : "Show passphrase"}
            >
              {showPass2 ? (
                <IconEyeOff className="size-4" />
              ) : (
                <IconEye className="size-4" />
              )}
            </button>
          </div>

          {showMismatch && !passwordsMatch && (
            <div className="text-xs text-destructive pl-1">
              Passphrases don't match.
            </div>
          )}

          <div className="flex items-start gap-2 text-[12px] text-amber-500/90 leading-relaxed pt-2 pl-1">
            <AlertTriangle className="size-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Can't be recovered. If you forget it, the account has to be
              reset.
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-5">
            <button
              type="button"
              onClick={logout}
              disabled={submitting}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Log out
            </button>
            <button
              type="submit"
              disabled={submitting || pass1.length === 0}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              {submitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Setting up
                </>
              ) : (
                <>
                  Set passphrase
                  <CornerDownLeft className="h-4 w-4 hidden md:inline" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
