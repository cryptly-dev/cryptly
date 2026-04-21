import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import {
  Database,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Laptop,
  Lock,
  Server,
  Unlock,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { fakeCiphertext, HoverRevealMask, SectionShell } from "./common";

// ── Shared bits ──────────────────────────────────────────────────────────────

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

function PlainList({ rows }: { rows: Row[] }) {
  return (
    <div className="font-mono text-[13px] leading-6 p-4 space-y-0.5">
      {rows.map((r, i) => (
        <div key={i} className="flex min-w-0">
          <span className="text-sky-400 shrink-0">{r.key}</span>
          <span className="text-neutral-500 shrink-0">=</span>
          <HoverRevealMask
            value={r.value}
            className="text-neutral-300 min-w-0 truncate"
          />
        </div>
      ))}
    </div>
  );
}

function CipherBlock({ seed, length = 520 }: { seed: string; length?: number }) {
  return (
    <div className="p-4 font-mono text-[11px] leading-5 text-neutral-500 break-all">
      {fakeCiphertext(seed, length)}
    </div>
  );
}

// ── V1 — Split Cards (polished classic) ──────────────────────────────────────
export function V1SplitCards() {
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Zero knowledge, not zero effort"
        title={
          <>
            This is what <span className="text-neutral-500">you</span> see.
            <br />
            This is what <span className="text-neutral-500">we</span> see.
          </>
        }
        subtitle="Same data, two views. The only difference is whether the passphrase is on this device."
      />
      <div className="mt-20 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Fingerprint className="h-3.5 w-3.5" /> You
            </span>
            <span>decrypted in-browser</span>
          </div>
          <PlainList rows={DEMO_ROWS} />
        </Card>
        <Card className="overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5" /> Our servers
            </span>
            <span>ciphertext only</span>
          </div>
          <CipherBlock seed="v1-split-cards" />
        </Card>
      </div>
    </SectionShell>
  );
}

// ── V2 — Drag Slider (before/after wipe) ─────────────────────────────────────
export function V2DragSlider() {
  const [pct, setPct] = useState(50);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const handleMove = (clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.max(0, Math.min(100, p)));
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingRef.current) handleMove(e.clientX);
    };
    const onTouch = (e: TouchEvent) => {
      if (draggingRef.current && e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const stop = () => {
      draggingRef.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onTouch);
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", stop);
    };
  }, []);

  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Drag to compare"
        title="Same bytes. Different readers."
        subtitle="Drag the handle. Left of it is your device. Right of it is our database."
      />
      <div className="mt-20 md:mt-24 max-w-4xl mx-auto">
        <div
          ref={wrapRef}
          className="relative rounded-2xl border border-neutral-900 overflow-hidden select-none h-[320px] bg-neutral-950"
        >
          {/* Our view (base) */}
          <div className="absolute inset-0">
            <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-500 bg-neutral-950/80 backdrop-blur">
              <span className="inline-flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5" /> Our servers · ciphertext
              </span>
            </div>
            <CipherBlock seed="v2-drag" length={900} />
          </div>
          {/* Your view (clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
          >
            <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-300 bg-black/80 backdrop-blur">
              <span className="inline-flex items-center gap-1.5">
                <Fingerprint className="h-3.5 w-3.5" /> You · decrypted
              </span>
            </div>
            <div className="bg-black h-full">
              <PlainList rows={DEMO_ROWS} />
            </div>
          </div>
          {/* Handle */}
          <div
            className="absolute top-0 bottom-0 w-px bg-white/60"
            style={{ left: `${pct}%` }}
          />
          <button
            type="button"
            onMouseDown={() => (draggingRef.current = true)}
            onTouchStart={() => (draggingRef.current = true)}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-white text-black grid place-items-center cursor-ew-resize shadow-xl"
            style={{ left: `${pct}%` }}
            aria-label="Drag to reveal"
          >
            <span className="text-xs font-semibold tracking-tight">⇆</span>
          </button>
        </div>
        <div className="mt-4 text-xs text-neutral-500 text-center">
          {Math.round(pct)}% you · {Math.round(100 - pct)}% us
        </div>
      </div>
    </SectionShell>
  );
}

// ── V3 — Flip Card ───────────────────────────────────────────────────────────
export function V3FlipCard() {
  const [flipped, setFlipped] = useState(false);
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Same data, both sides"
        title="Click the card. See what we see."
        subtitle="One envelope. Two views. Only one of them is readable."
      />
      <div className="mt-20 md:mt-24 max-w-2xl mx-auto [perspective:1500px]">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="relative w-full h-[360px] [transform-style:preserve-3d] transition-transform duration-700"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}
          aria-label="Flip card"
        >
          {/* Front — you */}
          <div className="absolute inset-0 rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden [backface-visibility:hidden] text-left">
            <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-300">
              <span className="inline-flex items-center gap-1.5">
                <Fingerprint className="h-3.5 w-3.5" /> You
              </span>
              <span className="text-neutral-500">click to flip →</span>
            </div>
            <PlainList rows={DEMO_ROWS} />
          </div>
          {/* Back — us */}
          <div
            className="absolute inset-0 rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden [backface-visibility:hidden] text-left"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5" /> Our servers
              </span>
              <span>← click to flip back</span>
            </div>
            <CipherBlock seed="v3-flip" length={640} />
          </div>
        </button>
      </div>
    </SectionShell>
  );
}

// ── V4 — Tab Toggle ──────────────────────────────────────────────────────────
export function V4TabToggle() {
  const [tab, setTab] = useState<"you" | "us">("you");
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Pick a perspective"
        title="Flip between the two views."
        subtitle="The data is the same. The keys to read it are not."
      />
      <div className="mt-20 md:mt-24 max-w-3xl mx-auto">
        <div className="inline-flex rounded-full border border-neutral-800 bg-neutral-950/60 p-1 mx-auto mb-6">
          {(
            [
              { id: "you", label: "You", Icon: Fingerprint },
              { id: "us", label: "Our servers", Icon: Server },
            ] as const
          ).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative px-5 py-2 text-sm rounded-full transition-colors inline-flex items-center gap-2",
                  active ? "text-black" : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="v4-toggle"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <t.Icon className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">{t.label}</span>
              </button>
            );
          })}
        </div>
        <Card className="overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
            <span>production .env · 4 secrets</span>
            <span>
              {tab === "you" ? "decrypted in-browser" : "ciphertext on disk"}
            </span>
          </div>
          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait">
              {tab === "you" ? (
                <motion.div
                  key="you"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <PlainList rows={DEMO_ROWS} />
                </motion.div>
              ) : (
                <motion.div
                  key="us"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <CipherBlock seed="v4-tab" length={560} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── V5 — Pipeline ────────────────────────────────────────────────────────────
export function V5Pipeline() {
  const stages: {
    Icon: React.ComponentType<{ className?: string }>;
    label: string;
    state: "plain" | "cipher";
    note: string;
  }[] = [
    { Icon: Laptop, label: "Your browser", state: "plain", note: "Passphrase is here" },
    { Icon: Lock, label: "The wire", state: "cipher", note: "TLS + payload cipher" },
    { Icon: Server, label: "Our API", state: "cipher", note: "Blind pass-through" },
    { Icon: Database, label: "Our database", state: "cipher", note: "Encrypted at rest" },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Data flow"
        title="Plaintext lives in exactly one place."
        subtitle="Follow a single secret from your keyboard to our database — and back."
      />
      <div className="mt-20 md:mt-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-4 gap-3 relative">
          {/* connector line */}
          <div className="absolute left-0 right-0 top-[52px] h-px bg-neutral-900" />
          {stages.map((s, i) => {
            const Icon = s.Icon;
            const isPlain = s.state === "plain";
            return (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div
                  className={cn(
                    "relative z-10 grid place-items-center h-[104px] w-[104px] rounded-2xl border",
                    isPlain
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-neutral-800 bg-neutral-950"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-8 w-8",
                      isPlain ? "text-emerald-400" : "text-neutral-400"
                    )}
                  />
                  {!isPlain && (
                    <motion.span
                      className="absolute inset-0 rounded-2xl border border-neutral-700/50"
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                <div className="mt-3 text-sm text-neutral-200">{s.label}</div>
                <div className="mt-1 text-[11px] text-neutral-500">{s.note}</div>
                <div
                  className={cn(
                    "mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                    isPlain
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                  )}
                >
                  {isPlain ? "plaintext" : "ciphertext"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-xs text-neutral-500 text-center">
          Green means readable. Everything grey is a black box — including to us.
        </div>
      </div>
    </SectionShell>
  );
}

// ── V6 — DevTools Network ────────────────────────────────────────────────────
export function V6DevToolsNetwork() {
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
          {/* Tab bar */}
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
          {/* Request row */}
          <div className="px-4 py-2.5 border-b border-neutral-900 flex items-center gap-3 text-xs font-mono">
            <span className="rounded px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              POST
            </span>
            <span className="text-neutral-300">
              api.cryptly.dev/projects/proj_7k2n/secrets
            </span>
            <span className="ml-auto text-neutral-500">200 · 142ms</span>
          </div>
          {/* Payload */}
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

// ── V7 — Admin Console (what our staff sees) ─────────────────────────────────
export function V7AdminConsole() {
  const rows = DEMO_ROWS.map((r, i) => ({
    id: `sec_${(1000 + i).toString(16)}`,
    key: r.key,
    blob: fakeCiphertext(`v7-${i}`, 44),
    updated: ["2m ago", "12m ago", "1h ago", "yesterday"][i],
  }));
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="What a Cryptly employee sees"
        title="Our internal admin. Logged in. Staring at nothing."
        subtitle="This is the full UI our team uses for support. It is — deliberately — useless."
      />
      <div className="mt-20 md:mt-24 max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-900 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <Lock className="h-3.5 w-3.5" />
              <span className="font-medium">Cryptly Admin</span>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-500">projects / proj_7k2n</span>
            </div>
            <div className="inline-flex items-center gap-2 text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              staff@cryptly.dev
            </div>
          </div>
          <div className="grid grid-cols-[8rem_10rem_1fr_6rem] text-[11px] uppercase tracking-wider text-neutral-500 px-4 py-2 border-b border-neutral-900 bg-neutral-950">
            <div>ID</div>
            <div>Key</div>
            <div>Encrypted value</div>
            <div className="text-right">Updated</div>
          </div>
          {rows.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[8rem_10rem_1fr_6rem] items-center px-4 py-2.5 border-b border-neutral-900 last:border-b-0 text-xs font-mono"
            >
              <div className="text-neutral-500">{r.id}</div>
              <div className="text-sky-400">{r.key}</div>
              <div className="truncate text-neutral-600">{r.blob}</div>
              <div className="text-right text-neutral-500">{r.updated}</div>
            </div>
          ))}
          <div className="px-4 py-3 bg-neutral-950 border-t border-neutral-900 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>No decrypt button. No "reveal" button. Not implemented.</span>
            <span className="inline-flex items-center gap-1 text-neutral-600">
              <EyeOff className="h-3 w-3" /> Blind by design
            </span>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── V8 — SQL Console ─────────────────────────────────────────────────────────
export function V8SqlConsole() {
  const rows = DEMO_ROWS.map((r, i) => ({
    key: r.key,
    value: fakeCiphertext(`v8-${i}`, 36),
  }));
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="SELECT * FROM secrets"
        title="What a query returns. Even ours."
        subtitle="If someone ran this against our production database right now, this is what they'd get."
      />
      <div className="mt-20 md:mt-24 max-w-3xl mx-auto">
        <Card className="overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 flex items-center gap-2 text-xs text-neutral-500">
            <Database className="h-3.5 w-3.5" />
            <span className="font-mono">postgres · cryptly_prod</span>
            <span className="ml-auto">readonly</span>
          </div>
          <pre className="px-4 py-3 font-mono text-[13px] leading-6 text-neutral-300 border-b border-neutral-900 bg-black/50">
            <span className="text-neutral-500">cryptly_prod=</span>
            <span className="text-neutral-100">#</span>{" "}
            <span className="text-sky-400">SELECT</span> key, value{" "}
            <span className="text-sky-400">FROM</span> secrets{" "}
            <span className="text-sky-400">WHERE</span> project_id ={" "}
            <span className="text-emerald-300">'proj_7k2n'</span>
            <span className="text-neutral-500">;</span>
          </pre>
          <div className="font-mono text-[12px]">
            <div className="grid grid-cols-[14rem_1fr] px-4 py-2 text-neutral-500 border-b border-neutral-900">
              <div>key</div>
              <div>value</div>
            </div>
            {rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[14rem_1fr] px-4 py-2 border-b border-neutral-900 last:border-b-0"
              >
                <div className="text-sky-400">{r.key}</div>
                <div className="text-neutral-500 truncate">{r.value}</div>
              </div>
            ))}
            <div className="px-4 py-2 text-[11px] text-neutral-500">
              (4 rows · values are <code className="text-neutral-400">bytea</code>{" "}
              base64 · no decrypt function exists server-side)
            </div>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── V9 — Passphrase Unlock ───────────────────────────────────────────────────
export function V9PassphraseUnlock() {
  const [pass, setPass] = useState("");
  const unlocked = pass.trim().length >= 8;
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Try it yourself"
        title="Without your passphrase, it's noise."
        subtitle="Type any 8 characters below to simulate the unlock. Without it, this page has nothing to show."
      />
      <div className="mt-20 md:mt-24 max-w-3xl mx-auto">
        <Card className="overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              {unlocked ? (
                <Unlock className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              production .env
            </span>
            <span
              className={cn(
                unlocked ? "text-emerald-400" : "text-neutral-500"
              )}
            >
              {unlocked ? "decrypted" : "ciphertext"}
            </span>
          </div>
          <div className="relative min-h-[180px]">
            <div
              className={cn(
                "transition-all duration-500",
                unlocked ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <PlainList rows={DEMO_ROWS} />
            </div>
            <div
              className={cn(
                "absolute inset-0 transition-all duration-500",
                unlocked ? "opacity-0" : "opacity-100"
              )}
            >
              <CipherBlock seed="v9-locked" length={520} />
            </div>
          </div>
          <div className="px-4 py-3 border-t border-neutral-900 flex items-center gap-3">
            <KeyRound className="h-4 w-4 text-neutral-500" />
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Type any passphrase (min 8 chars)…"
              className="flex-1 bg-transparent outline-none text-sm text-neutral-100 placeholder:text-neutral-600"
            />
            <span
              className={cn(
                "text-[11px] font-mono",
                unlocked ? "text-emerald-400" : "text-neutral-500"
              )}
            >
              {pass.length} / 8
            </span>
          </div>
        </Card>
        <div className="mt-4 text-xs text-neutral-500 text-center">
          Real Cryptly derives an AES key from your passphrase in the browser.
          This demo just hides/shows. Same idea.
        </div>
      </div>
    </SectionShell>
  );
}

// ── V10 — Redacted Document ──────────────────────────────────────────────────
export function V10Redacted() {
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Imagine a leak"
        title="This is what a breach of our servers would publish."
        subtitle="Go ahead. Screenshot it. We'll wait."
      />
      <div className="mt-20 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        <Card className="overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-300">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> On your device
            </span>
            <span className="text-neutral-500">readable</span>
          </div>
          <div className="p-5 font-mono text-[13px] leading-7 bg-neutral-950">
            {DEMO_ROWS.map((r, i) => (
              <div key={i} className="flex min-w-0">
                <span className="text-sky-400 shrink-0">{r.key}</span>
                <span className="text-neutral-500 shrink-0">=</span>
                <span className="text-neutral-200 truncate">{r.value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <EyeOff className="h-3.5 w-3.5" /> If our servers leaked
            </span>
            <span>redacted by math</span>
          </div>
          <div className="p-5 font-mono text-[13px] leading-7 bg-neutral-950">
            {DEMO_ROWS.map((r, i) => (
              <div key={i} className="flex items-center min-w-0">
                <span className="text-sky-400 shrink-0">{r.key}</span>
                <span className="text-neutral-500 shrink-0">=</span>
                <span
                  className="flex-1 min-w-0 h-4 mx-1 rounded-[2px] bg-neutral-800"
                  style={{
                    width: `${60 + ((r.value.length * 7) % 40)}%`,
                  }}
                  aria-label="redacted"
                />
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-neutral-900 text-[11px] text-neutral-500">
            Not a stylistic choice. The plaintext isn't stored in a form we
            could leak, even if we wanted to.
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── Variant registry ─────────────────────────────────────────────────────────

export type TwoViewsVariant = {
  id: string;
  title: string;
  concept: string;
  render: () => React.ReactNode;
};

export const TWO_VIEWS_VARIANTS: TwoViewsVariant[] = [
  {
    id: "v1-split-cards",
    title: "Split cards",
    concept: "Classic side-by-side comparison",
    render: () => <V1SplitCards />,
  },
  {
    id: "v2-drag-slider",
    title: "Drag slider",
    concept: "Draggable divider wipes between views",
    render: () => <V2DragSlider />,
  },
  {
    id: "v3-flip-card",
    title: "Flip card",
    concept: "Click to flip 3D between views",
    render: () => <V3FlipCard />,
  },
  {
    id: "v4-tab-toggle",
    title: "Tab toggle",
    concept: "Perspective toggle, same frame animates",
    render: () => <V4TabToggle />,
  },
  {
    id: "v5-pipeline",
    title: "Data pipeline",
    concept: "Stages showing where plaintext lives",
    render: () => <V5Pipeline />,
  },
  {
    id: "v6-devtools",
    title: "DevTools Network",
    concept: "Mock network tab — payload is ciphertext",
    render: () => <V6DevToolsNetwork />,
  },
  {
    id: "v7-admin",
    title: "Staff admin portal",
    concept: "What a Cryptly employee actually sees",
    render: () => <V7AdminConsole />,
  },
  {
    id: "v8-sql",
    title: "SQL console",
    concept: "DBA-perspective query returning ciphertext",
    render: () => <V8SqlConsole />,
  },
  {
    id: "v9-unlock",
    title: "Passphrase unlock",
    concept: "Interactive — typing reveals plaintext",
    render: () => <V9PassphraseUnlock />,
  },
  {
    id: "v10-redacted",
    title: "Redacted leak",
    concept: "Leaked-document metaphor with blackout bars",
    render: () => <V10Redacted />,
  },
];
