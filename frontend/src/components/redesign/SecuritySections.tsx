import { cn } from "@/lib/utils";
import { Check, Copy, Database, Lock } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { fakeCiphertext, SectionShell } from "./common";

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      {eyebrow && (
        <div className="mb-4 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          {eyebrow}
        </div>
      )}
      <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-neutral-400">{subtitle}</p>
      )}
    </div>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-900 bg-neutral-950/60",
        className
      )}
    >
      {children}
    </div>
  );
}

// ── End-to-end encryption, zero trust ────────────────────────────────────────
export function DevToolsNetworkSection() {
  const URL = "https://api.cryptly.dev/projects/69e3552669a2c7b0de2468fc";
  const CIPHERTEXT =
    "zlbK6R/Cd0JvRybO7kg7wuTkLJWR7bew8aYR8o1n64VVzg+A2AzlZEa41QAIp8bwJmBVhxV5HJwSXQAB/Q==";
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="End-to-end encryption · zero trust"
        title="The only thing that leaves your browser is ciphertext."
        subtitle="Open DevTools. Watch the network tab. This is the literal request that hits our API when you save."
      />
      <div className="mt-20 md:mt-24 max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-2 border-b border-neutral-900 text-xs text-neutral-500">
            {["Headers", "Payload", "Response", "Timing"].map((t) => (
              <span
                key={t}
                className={cn(
                  "py-0.5",
                  t === "Payload"
                    ? "text-white border-b-2 border-sky-500 -mb-[9px] pb-2"
                    : ""
                )}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="px-4 py-2.5 border-b border-neutral-900 flex items-center gap-3 text-xs font-mono">
            <span className="rounded px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              POST
            </span>
            <span className="text-neutral-300 truncate">{URL}</span>
            <span className="ml-auto text-neutral-500 shrink-0">200 · 142ms</span>
          </div>
          <pre className="p-4 font-mono text-[12px] leading-5 text-neutral-400 break-all whitespace-pre-wrap">
            <span className="text-neutral-600">{"{"}</span>
            <span className="text-sky-400">"encryptedSecrets"</span>
            <span className="text-neutral-500">: </span>
            <span className="text-neutral-500">"{CIPHERTEXT}"</span>
            <span className="text-neutral-600">{"}"}</span>
          </pre>
          <div className="px-4 py-2 border-t border-neutral-900 text-[11px] text-neutral-500">
            One opaque base64 blob. AES-256-GCM. The key never leaves your
            device.
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── Cryptly on Cryptly ───────────────────────────────────────────────────────
// The flex: show Cryptly's own production secrets as one raw block of
// ciphertext. If our encryption were shaky, this page would be a
// career-ending mistake. Single wall of characters, no split cards.
export function CryptlyOnCryptlySection() {
  const dump = useMemo(
    () => fakeCiphertext("cryptly-on-cryptly-prod", 2400),
    []
  );
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  const handleCopy = () => {
    navigator.clipboard?.writeText(dump).catch(() => {});
    setCopied(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="We use Cryptly to store Cryptly's secrets"
        title="Our actual production secrets."
        subtitle={
          <>
            Read raw from our database, right now. We can paste them on a
            public landing page because there's nothing here to read. Don't
            believe us? Here is a{" "}
            <a
              href="https://github.com/cryptly-dev/cryptly/blob/main/frontend/src/components/Beams.tsx"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-200 underline decoration-neutral-700 underline-offset-4 hover:decoration-neutral-400"
            >
              code fragment
            </a>{" "}
            which does that!
          </>
        }
      />
      <div className="mt-20 md:mt-24 max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-900 text-xs">
            <div className="flex items-center gap-2 text-neutral-400">
              <Database className="h-3.5 w-3.5" />
              <span className="font-mono">Cryptly (backend)</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition-colors",
                copied
                  ? "border-emerald-700/50 text-emerald-400 bg-emerald-500/5"
                  : "border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 bg-neutral-900/60"
              )}
              aria-label="Copy ciphertext"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <div
              className="p-5 md:p-6 font-mono text-[11px] md:text-[12px] leading-5 text-neutral-500 break-all overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 5,
                WebkitBoxOrient: "vertical",
              }}
            >
              {dump}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-neutral-950/80 to-transparent" />
            <div className="px-5 pb-3 text-[11px] text-neutral-600 flex items-center gap-1">
              <Lock className="h-3 w-3" /> AES-256-GCM · truncated for your
              eyes — there's nothing else to see anyway
            </div>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}
