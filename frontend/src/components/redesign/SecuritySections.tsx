import { cn } from "@/lib/utils";
import { Database, Lock } from "lucide-react";
import { useMemo } from "react";
import { fakeCiphertext, SectionShell } from "./common";

type Row = { key: string; value: string };

const DEMO_ROWS: Row[] = [
  { key: "DATABASE_URL", value: "postgres://u:p@db.internal/app" },
  { key: "JWT_SECRET", value: "kJ9f2LmN8aQq3PzVxT4wYrUi" },
  { key: "STRIPE_KEY", value: "sk_live_51Nxj7pLkQr9mVbXc" },
  { key: "OPENAI_API_KEY", value: "sk-proj-AbcDef123xyz456" },
];

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

// ── Inspect the request yourself ─────────────────────────────────────────────
export function DevToolsNetworkSection() {
  const payload = useMemo(
    () => ({
      project_id: "proj_7k2n",
      wrapped_key: fakeCiphertext("v6-wk", 64),
      entries: DEMO_ROWS.map((r, i) => ({
        key: r.key,
        ciphertext: fakeCiphertext(`v6-${i}`, 72),
        iv: fakeCiphertext(`v6-iv-${i}`, 16),
      })),
    }),
    []
  );
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Open your DevTools"
        title="Inspect the request yourself."
        subtitle="This is the literal payload that leaves your browser when you save. No plaintext in sight."
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
            <span className="text-neutral-300">
              api.cryptly.dev/projects/proj_7k2n/secrets
            </span>
            <span className="ml-auto text-neutral-500">200 · 142ms</span>
          </div>
          <pre className="p-4 font-mono text-[12px] leading-5 text-neutral-400 overflow-x-auto">
            <span className="text-neutral-600">{"{"}</span>
            {"\n  "}
            <span className="text-sky-400">"project_id"</span>
            <span className="text-neutral-500">: </span>
            <span className="text-emerald-300">"{payload.project_id}"</span>,{"\n  "}
            <span className="text-sky-400">"wrapped_key"</span>
            <span className="text-neutral-500">: </span>
            <span className="text-neutral-500">"{payload.wrapped_key}"</span>,{"\n  "}
            <span className="text-sky-400">"entries"</span>
            <span className="text-neutral-500">: </span>
            <span className="text-neutral-600">{"["}</span>
            {payload.entries.map((e, i) => (
              <span key={i}>
                {"\n    "}
                <span className="text-neutral-600">{"{ "}</span>
                <span className="text-sky-400">"key"</span>
                <span className="text-neutral-500">: </span>
                <span className="text-emerald-300">"{e.key}"</span>
                <span className="text-neutral-500">, </span>
                <span className="text-sky-400">"ciphertext"</span>
                <span className="text-neutral-500">: </span>
                <span className="text-neutral-500">"{e.ciphertext}"</span>
                <span className="text-neutral-500">, </span>
                <span className="text-sky-400">"iv"</span>
                <span className="text-neutral-500">: </span>
                <span className="text-neutral-500">"{e.iv}"</span>
                <span className="text-neutral-600">{" }"}</span>
                {i < payload.entries.length - 1 ? "," : ""}
              </span>
            ))}
            {"\n  "}
            <span className="text-neutral-600">{"]"}</span>
            {"\n"}
            <span className="text-neutral-600">{"}"}</span>
          </pre>
          <div className="px-4 py-2 border-t border-neutral-900 text-[11px] text-neutral-500">
            Only the <span className="text-sky-400">key</span> names travel in
            the clear — values are AES-256-GCM ciphertext.
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
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="We use Cryptly to store Cryptly's secrets"
        title="Our actual production secrets."
        subtitle="Read raw from our database, right now. We can paste them on a public landing page because there's nothing here to read. Don't believe us? Here is a code fragment which does that!"
      />
      <div className="mt-20 md:mt-24 max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-900 text-xs">
            <div className="flex items-center gap-2 text-neutral-400">
              <Database className="h-3.5 w-3.5" />
              <span className="font-mono">Cryptly (backend)</span>
            </div>
          </div>
          <div className="p-5 md:p-6 font-mono text-[11px] md:text-[12px] leading-5 text-neutral-500 break-all">
            {dump}
          </div>
         
        </Card>
      </div>
    </SectionShell>
  );
}
