import {
  CliFlowApi,
  type CliSessionInfo,
} from "@/lib/api/cli-flow.api";
import { AsymmetricCrypto } from "@/lib/crypto/crypto.asymmetric";
import { SymmetricCrypto } from "@/lib/crypto/crypto.symmetric";
import { randomBytes, u8ToBase64 } from "@/lib/crypto/crypto.utils";
import { authLogic } from "@/lib/logics/authLogic";
import { keyLogic } from "@/lib/logics/keyLogic";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useValues } from "kea";
import { AlertTriangle, Check, CornerDownLeft, Terminal } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; session: CliSessionInfo }
  | { kind: "already-approved" }
  | { kind: "error"; message: string };

type ApproveState = "idle" | "submitting" | "done";

export function CliAuthorizePage() {
  const search = useSearch({ from: "/app/cli-authorize" }) as {
    session?: string;
  };
  const sessionId = search.session ?? "";

  const navigate = useNavigate();
  const { isLoggedIn, jwtToken, userData } = useValues(authLogic);
  const { keysAreSetUp } = useValues(keyLogic);

  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [approveState, setApproveState] = useState<ApproveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const passphraseInputRef = useRef<HTMLInputElement>(null);

  // If not logged in, redirect to login. We don't have a return-to mechanism
  // yet, so the user re-opens the URL from the CLI after logging in.
  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/app/login", replace: true });
    }
  }, [isLoggedIn, navigate]);

  const fetchSession = useCallback(async () => {
    if (!jwtToken || !sessionId) {
      setLoad({ kind: "error", message: "Missing session id." });
      return;
    }

    try {
      const session = await CliFlowApi.getSessionInfo(jwtToken, sessionId);
      if (session.status !== "pending") {
        setLoad({ kind: "already-approved" });
      } else {
        setLoad({ kind: "ready", session });
      }
    } catch (e: any) {
      const message =
        e?.response?.status === 404
          ? "Session not found or expired."
          : "Could not load session.";
      setLoad({ kind: "error", message });
    }
  }, [jwtToken, sessionId]);

  useEffect(() => {
    if (isLoggedIn && jwtToken) {
      fetchSession();
    }
  }, [isLoggedIn, jwtToken, fetchSession]);

  useEffect(() => {
    if (load.kind === "ready") {
      passphraseInputRef.current?.focus();
    }
  }, [load.kind]);

  const onApprove = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (load.kind !== "ready" || approveState !== "idle") return;
    if (!passphrase || !jwtToken || !userData?.privateKeyEncrypted) return;

    setApproveState("submitting");
    setError(null);

    let rawPrivateKey: string | null = null;
    let ephemeralKey: string | null = null;

    try {
      // Re-derive the symmetric key from passphrase, decrypt the user's
      // PKCS8 private key locally. This is the only place in the browser
      // we touch the raw key — drop it as soon as we've wrapped it.
      const base64Key = await SymmetricCrypto.deriveBase64KeyFromPassphrase(
        passphrase
      );
      try {
        rawPrivateKey = await SymmetricCrypto.decrypt(
          userData.privateKeyEncrypted,
          base64Key
        );
      } catch {
        throw new Error("Incorrect passphrase");
      }

      // Envelope-encrypt: ephemeral AES key wraps the private key, and is
      // itself wrapped with the CLI's RSA temp public key.
      ephemeralKey = u8ToBase64(randomBytes(32));
      const wrappedKey = await AsymmetricCrypto.encrypt(
        ephemeralKey,
        load.session.tempPublicKey
      );
      const encryptedPrivateKey = await SymmetricCrypto.encrypt(
        rawPrivateKey,
        ephemeralKey
      );

      await CliFlowApi.approveSession(jwtToken, load.session.sessionId, {
        wrappedKey,
        encryptedPrivateKey,
      });

      setApproveState("done");
    } catch (e: any) {
      setError(e?.message ?? "Failed to authorize");
      setApproveState("idle");
      requestAnimationFrame(() => {
        passphraseInputRef.current?.focus();
        passphraseInputRef.current?.select();
      });
    } finally {
      // Best effort to drop the raw key from this scope. JS can't actually
      // wipe strings, but at least we lose the reference.
      rawPrivateKey = null;
      ephemeralKey = null;
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0, 0.55, 0.45, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground/60 mb-5">
            <Terminal className="size-3.5" />
            <span>Authorize CLI</span>
          </div>
          <h1 className="text-[34px] md:text-[40px] font-semibold text-foreground tracking-tight leading-[1.05]">
            {load.kind === "ready" ? (
              <>
                Authorize{" "}
                <span className="text-muted-foreground">
                  {load.session.deviceName}
                </span>
                ?
              </>
            ) : approveState === "done" ? (
              <>
                Authorized.{" "}
                <span className="text-muted-foreground">You can close this tab.</span>
              </>
            ) : load.kind === "already-approved" ? (
              <>
                Already used.{" "}
                <span className="text-muted-foreground">
                  Start a new session from your CLI.
                </span>
              </>
            ) : load.kind === "error" ? (
              <>
                Something went wrong.{" "}
                <span className="text-muted-foreground">{load.message}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Loading…</span>
            )}
          </h1>
          {load.kind === "ready" && approveState !== "done" && (
            <p className="mt-5 text-[15px] text-muted-foreground leading-[1.7]">
              The CLI on this device will get a long-lived access to your
              account, and a copy of your private key so it can decrypt project
              secrets locally.
            </p>
          )}
        </div>

        {load.kind === "ready" && approveState !== "done" && (
          <>
            {!keysAreSetUp ? (
              <div className="text-sm text-amber-500/90 leading-relaxed pl-1">
                You haven't set up a passphrase on this account yet — finish
                onboarding before authorizing a CLI.
              </div>
            ) : (
              <form onSubmit={onApprove} className="space-y-3">
                <div className="relative">
                  <input
                    ref={passphraseInputRef}
                    type={showPassphrase ? "text" : "password"}
                    value={passphrase}
                    onChange={(e) => {
                      setPassphrase(e.target.value);
                      setError(null);
                    }}
                    placeholder="Your passphrase"
                    disabled={approveState === "submitting"}
                    autoComplete="current-password"
                    required
                    className="w-full h-12 bg-neutral-900/40 border border-border/60 rounded-lg pl-4 pr-12 text-base md:text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:bg-neutral-900/60 transition-colors disabled:opacity-60"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground hover:text-foreground cursor-pointer"
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

                {error && (
                  <div className="text-xs text-destructive pl-1">{error}</div>
                )}

                <div className="flex items-start gap-2 text-[12px] text-amber-500/90 leading-relaxed pt-2 pl-1">
                  <AlertTriangle className="size-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    Only authorize devices you trust. The CLI keeps a copy of
                    your private key on disk.
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-5">
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/app/project" })}
                    disabled={approveState === "submitting"}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      approveState === "submitting" || passphrase.length === 0
                    }
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    {approveState === "submitting" ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Authorizing
                      </>
                    ) : (
                      <>
                        Authorize
                        <CornerDownLeft className="h-4 w-4 hidden md:inline" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {approveState === "done" && (
          <div className="mt-2 flex items-center gap-2 text-sm text-emerald-500/90">
            <Check className="size-4" />
            <span>Your CLI should report success in a moment.</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

