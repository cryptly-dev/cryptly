import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Copy } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D — "The Atelier"
 * Quietly layered. One restrained warm parchment accent, used sparingly.
 * Hairline borders, thin product mocks, no chips, no neon.
 * ──────────────────────────────────────────────────────────────────────────── */

const ACCENT = "#c9b287";

function Shell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-6xl px-6", className)}>{children}</div>
  );
}

function Pin() {
  return (
    <span
      aria-hidden
      className="inline-block h-1.5 w-1.5 rounded-full align-middle"
      style={{ backgroundColor: ACCENT }}
    />
  );
}

function Header() {
  return (
    <header className="border-b border-neutral-900">
      <Shell>
        <div className="flex items-center justify-between h-16 text-[11px] font-mono tracking-[0.25em] uppercase text-neutral-500">
          <span className="inline-flex items-center gap-2.5">
            <Pin /> <span>Cryptly · atelier</span>
          </span>
          <span className="hidden md:inline">A quiet object, made small</span>
          <span>2026</span>
        </div>
      </Shell>
    </header>
  );
}

function PrimaryCTA({
  children,
  href = "/app/login",
}: {
  children: React.ReactNode;
  href?: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full bg-neutral-100 text-black px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white"
    >
      {children}
    </a>
  );
}

function GhostCTA({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  return (
    <a
      href={href ?? "#"}
      className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-transparent px-5 py-2.5 text-sm text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
    >
      {children}
    </a>
  );
}

function Rule() {
  return (
    <div className="mx-auto max-w-6xl px-6 my-16">
      <div className="border-t border-neutral-900" />
    </div>
  );
}

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
      <span
        className="font-serif italic normal-case tracking-normal"
        style={{ color: ACCENT }}
      >
        {n}.
      </span>
      <span>{children}</span>
    </div>
  );
}

function FigureFrame({
  caption,
  children,
}: {
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <figure>
      <div className="border border-neutral-800 bg-neutral-950/30">
        {children}
      </div>
      {caption && (
        <figcaption className="mt-3 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="pt-24 md:pt-32 pb-12">
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9 }}
              className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500"
            >
              A small atelier · a smaller threat surface
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.1 }}
              className="mt-6 text-5xl md:text-7xl lg:text-[88px] font-semibold text-neutral-100 leading-[0.98] tracking-tight"
            >
              Made by hand.
              <br />
              Held by you.
              <br />
              <span className="text-neutral-500">Not by us.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="mt-8 text-lg text-neutral-300 max-w-xl leading-[1.75]"
            >
              Cryptly is a small secrets manager. AES-256-GCM in your
              browser, then ciphertext on our wire — a vault we made
              ourselves and could not open if asked. Free, open source,
              and quietly maintained.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <PrimaryCTA>
                Open the dashboard
                <ArrowRight className="h-4 w-4" />
              </PrimaryCTA>
              <GhostCTA href="https://github.com/cryptly-dev/cryptly">
                <GitHubIcon className="h-4 w-4" />
                Read the source
              </GhostCTA>
              <GhostCTA href="/blog">The blog</GhostCTA>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.9 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500"
            >
              <span className="inline-flex items-center gap-2">
                <Pin /> Free, in every plan
              </span>
              <span className="inline-flex items-center gap-2">
                <Pin /> Zero-knowledge by construction
              </span>
              <span className="inline-flex items-center gap-2">
                <Pin /> MIT licensed
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="lg:col-span-5"
          >
            <HeroMock />
          </motion.div>
        </div>
      </Shell>
    </section>
  );
}

const HERO_ROWS = [
  { k: "DATABASE_URL", v: "postgres://u:p@db.internal:5432/app" },
  { k: "STRIPE_SECRET_KEY", v: "sk_live_72Mky8qRt9tWnOpC" },
  { k: "JWT_SIGNING_KEY", v: "kJ9f2LmN8aQq3PzVxT4wYrUi" },
  { k: "OPENAI_API_KEY", v: "sk-proj-AbcDef123xyz456" },
  { k: "SENTRY_DSN", v: "https://abc@o42.ingest.sentry.io/99" },
];

function HeroMock() {
  return (
    <FigureFrame caption="Fig. 01 — the editor, in repose">
      <div className="px-3 h-9 flex items-center justify-between border-b border-neutral-900 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
        <span>cryptly · production · .env</span>
        <span style={{ color: ACCENT }}>locally encrypted</span>
      </div>
      <div className="font-mono text-[12px] leading-[1.95] py-1">
        {HERO_ROWS.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-[36px_180px_1fr] items-baseline gap-3 px-3 hover:bg-white/[0.015]"
          >
            <span className="text-right text-neutral-700 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-neutral-300 truncate">{r.k}</span>
            <span className="text-neutral-600 truncate">
              {"•".repeat(Math.min(r.v.length, 28))}
            </span>
          </div>
        ))}
      </div>
      <div className="px-3 h-9 flex items-center justify-between border-t border-neutral-900 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
        <span>5 of 12</span>
        <span className="font-mono normal-case tracking-normal text-neutral-600">
          ciphertext, on every save
        </span>
      </div>
    </FigureFrame>
  );
}

// ── Movement I — The vault ─────────────────────────────────────────────────

function VaultMovement() {
  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <SectionLabel n="I">The vault</SectionLabel>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
              <span className="text-neutral-100">
                One column for the blob.
              </span>{" "}
              <span className="text-neutral-500">
                None for the value.
              </span>
            </h2>
            <p className="mt-7 text-[16px] text-neutral-400 leading-[1.75] max-w-md">
              Below, a single row from our database. The field marked{" "}
              <code className="text-neutral-200">blob</code> is the entire
              secret, wrapped in your browser before it left the tab.
              There is no second column where the plaintext lives, and
              no function to produce it on demand.
            </p>
            <SmallList
              items={[
                "AES-256-GCM, in the browser",
                "PBKDF2-SHA256, 210,000 iterations",
                "RSA-OAEP, when keys are re-wrapped",
              ]}
            />
          </div>
          <div className="lg:col-span-7">
            <FigureFrame caption="Fig. 02 — secrets · row 1 of 1,086">
              <div className="px-4 py-4 font-mono text-[12px] text-neutral-400 leading-[1.85]">
                <div className="text-neutral-500">— column · value</div>
                <div className="mt-3 grid grid-cols-[110px_1fr] gap-x-6 gap-y-1">
                  <span className="text-neutral-500">id</span>
                  <span className="text-neutral-300">sec_7mFq2aN9bK</span>
                  <span className="text-neutral-500">project</span>
                  <span className="text-neutral-300">prj_k2L7p</span>
                  <span className="text-neutral-500">created</span>
                  <span className="text-neutral-300">2026-04-22T12:03:18Z</span>
                  <span className="text-neutral-500">blob</span>
                  <span className="text-neutral-300 break-all">
                    u2l9aFZbk3Pj+Q7WkS9QfwDfMnLvSsC6XgYh1xZ8pQrT+88k/4Lr2Nh==
                  </span>
                </div>
                <div className="mt-5 border-t border-neutral-900 pt-4 text-neutral-600 italic font-serif text-[13px]">
                  No further columns. The schema is short on purpose.
                </div>
              </div>
            </FigureFrame>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function SmallList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-2 font-mono text-[12px] text-neutral-300">
      {items.map((it, i) => (
        <li key={i} className="flex items-baseline gap-3">
          <span style={{ color: ACCENT }} className="text-[10px]">
            ◦
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Movement II — Inviting (three methods) ─────────────────────────────────

function InviteMovement() {
  const [tab, setTab] = useState<"link" | "user" | "team">("link");
  const [copied, setCopied] = useState(false);
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  return (
    <section>
      <Shell>
        <div className="max-w-2xl">
          <SectionLabel n="II">The invitation</SectionLabel>
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
            <span className="text-neutral-100">Three ways to bring</span>{" "}
            <span className="text-neutral-500">
              one teammate, or sixty.
            </span>
          </h2>
          <p className="mt-6 text-[16px] text-neutral-400 leading-[1.75] max-w-xl">
            Each method re-wraps the project key in the new member's
            browser; our server moves wrapped bytes only. Pick the one
            that matches your back-channels.
          </p>
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-6 border-b border-neutral-900">
            {(
              [
                { id: "link", label: "By invite link" },
                { id: "user", label: "By teammate" },
                { id: "team", label: "By team", soon: true },
              ] as const
            ).map((t) => {
              const a = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative -mb-px py-3 text-[13px] tracking-tight transition-colors",
                    a
                      ? "text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-300"
                  )}
                >
                  <span>{t.label}</span>
                  {"soon" in t && t.soon && (
                    <span
                      className="ml-2 text-[10px] font-mono uppercase tracking-[0.25em]"
                      style={{ color: ACCENT }}
                    >
                      soon
                    </span>
                  )}
                  {a && (
                    <motion.span
                      layoutId="atelier-invite-underline"
                      className="absolute left-0 right-0 -bottom-px h-px"
                      style={{ backgroundColor: ACCENT }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 min-h-[200px]">
            <AnimatePresence mode="wait">
              {tab === "link" && (
                <motion.div
                  key="link"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl"
                >
                  <InviteField
                    label="Channel A · the link"
                    value="https://cryptly.dev/invite/a3f9-k2m-7bxQ"
                    onCopy={() => {
                      navigator.clipboard
                        ?.writeText("https://cryptly.dev/invite/a3f9-k2m-7bxQ")
                        .catch(() => {});
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1200);
                    }}
                    copied={copied}
                  />
                  <InviteField
                    label="Channel B · the passphrase"
                    value="sunrise-otter-42"
                    note="Send via a different medium than the link."
                  />
                </motion.div>
              )}

              {tab === "user" && (
                <motion.div
                  key="user"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl"
                >
                  {[
                    {
                      id: "alex",
                      name: "Alex Chen",
                      hint: "co-owner of cryptly-dev/api",
                      a: "/avatars/alex-chen.svg",
                    },
                    {
                      id: "marcus",
                      name: "Marcus Rodriguez",
                      hint: "8 commits on the same repo",
                      a: "/avatars/marcus-rodriguez.svg",
                    },
                    {
                      id: "priya",
                      name: "Priya Patel",
                      hint: "maintains cryptly-dev/web",
                      a: "/avatars/priya-patel.svg",
                    },
                  ].map((p) => {
                    const on = !!picked[p.id];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setPicked((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                        }
                        className={cn(
                          "text-left border p-4 transition-colors",
                          on
                            ? "border-neutral-700 bg-neutral-950/60"
                            : "border-neutral-800 hover:border-neutral-700 bg-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.a}
                            alt=""
                            className="h-8 w-8 rounded-full grayscale opacity-90"
                          />
                          <div className="min-w-0">
                            <div className="text-[14px] text-neutral-100 truncate">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-neutral-500 truncate">
                              {p.hint}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                            already collaborator
                          </span>
                          <span
                            className={cn(
                              "text-[11px] font-mono",
                              on ? "" : "text-neutral-500"
                            )}
                            style={on ? { color: ACCENT } : undefined}
                          >
                            {on ? "+ added" : "+ add"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {tab === "team" && (
                <motion.div
                  key="team"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-2xl"
                >
                  <p className="text-[15px] text-neutral-400 leading-[1.75]">
                    Define a team once, grant project access to every
                    member with one stroke. The browser fans out wrapped
                    project keys; the server forwards them. Coming in
                    Q3.
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { name: "Core engineering", n: 8 },
                      { name: "Infra & SRE", n: 4 },
                      { name: "Frontend", n: 6 },
                    ].map((t) => (
                      <div
                        key={t.name}
                        className="border border-dashed border-neutral-800 p-4"
                      >
                        <div className="text-[14px] text-neutral-200">
                          {t.name}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {t.n} members
                        </div>
                        <div
                          className="mt-3 text-[10px] font-mono uppercase tracking-[0.25em]"
                          style={{ color: ACCENT }}
                        >
                          on the waitlist
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function InviteField({
  label,
  value,
  onCopy,
  copied,
  note,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  note?: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
        {label}
      </div>
      <div className="mt-2 flex items-center gap-3 border-b border-neutral-800 pb-3">
        <span className="font-mono text-[13px] text-neutral-200 truncate flex-1">
          {value}
        </span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-neutral-100"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "copied" : "copy"}
          </button>
        )}
      </div>
      {note && (
        <div className="mt-2 text-[11px] font-mono text-neutral-500">{note}</div>
      )}
    </div>
  );
}

// ── Movement III — The wire (GitHub) ──────────────────────────────────────

const GH_LIST = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SIGNING_KEY",
  "STRIPE_SECRET_KEY",
  "OPENAI_API_KEY",
  "SENTRY_DSN",
];

function WireMovement() {
  const [done, setDone] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);

  const run = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setDone([]);
    setRunning(true);
    GH_LIST.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setDone((prev) => [...prev, i]);
          if (i === GH_LIST.length - 1) setRunning(false);
        }, 220 + i * 220)
      );
    });
  };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <SectionLabel n="III">The wire</SectionLabel>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
              <span className="text-neutral-100">One click</span>
              <br />
              <span className="text-neutral-500">to GitHub Actions.</span>
            </h2>
            <p className="mt-6 text-[16px] text-neutral-400 leading-[1.75] max-w-md">
              The browser re-encrypts each value against the target
              repository's libsodium sealed-box public key — the same
              primitive GitHub's own CLI uses — and forwards the
              ciphertext. We are the courier; GitHub is the recipient.
            </p>
            <button
              type="button"
              onClick={run}
              disabled={running}
              className={cn(
                "mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border transition-colors",
                running
                  ? "border-neutral-800 text-neutral-500 cursor-wait"
                  : "border-neutral-700 text-neutral-100 hover:border-neutral-500"
              )}
            >
              {running
                ? "Pushing…"
                : done.length === GH_LIST.length
                  ? "Pushed · run again"
                  : "Run the dispatch"}
            </button>
          </div>

          <div className="lg:col-span-7">
            <FigureFrame caption="Fig. 03 — six values, six wires">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr]">
                <div className="border-b md:border-b-0 md:border-r border-neutral-900">
                  <div className="px-4 h-9 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                    <span>cryptly vault</span>
                    <span style={{ color: ACCENT }}>source</span>
                  </div>
                  <div className="font-mono text-[12px] leading-[1.95] pb-2">
                    {GH_LIST.map((k, i) => (
                      <div
                        key={k}
                        className={cn(
                          "px-4 grid grid-cols-[1fr_auto] items-baseline gap-2",
                          done.includes(i) && "opacity-60"
                        )}
                      >
                        <span className="text-neutral-300 truncate">{k}</span>
                        <span className="text-neutral-600 text-[10px] uppercase tracking-[0.25em]">
                          ciphertext
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="px-4 h-9 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                      <GitHubIcon className="h-3 w-3" /> cryptly-dev/api
                    </span>
                    <span style={{ color: ACCENT }}>recipient</span>
                  </div>
                  <div className="px-4 pb-3 min-h-[210px]">
                    {done.length === 0 ? (
                      <div className="grid place-items-center h-[210px] text-[12px] font-mono text-neutral-600">
                        none yet · press the button
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {done.map((i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-[1fr_auto] items-baseline gap-2 py-1 font-mono text-[12px]"
                          >
                            <span className="text-neutral-200 truncate">
                              {GH_LIST[i]}
                            </span>
                            <span className="text-neutral-500 text-[10px] uppercase tracking-[0.25em]">
                              just now
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              </div>
            </FigureFrame>
          </div>
        </div>
      </Shell>
    </section>
  );
}

// ── Movement IV — The ledger ──────────────────────────────────────────────

type Patch = {
  who: string;
  first: string;
  avatar: string;
  when: string;
  add: number;
  del: number;
  msg: string;
};

const PATCHES: Patch[] = [
  { who: "Alex Chen", first: "Alex", avatar: "/avatars/alex-chen.svg", when: "2m", add: 1, del: 1, msg: "rotate STRIPE_SECRET_KEY" },
  { who: "Marcus Rodriguez", first: "Marcus", avatar: "/avatars/marcus-rodriguez.svg", when: "14m", add: 2, del: 0, msg: "add observability keys" },
  { who: "Priya Patel", first: "Priya", avatar: "/avatars/priya-patel.svg", when: "1h", add: 1, del: 1, msg: "migrate DATABASE_URL" },
  { who: "Nina Gupta", first: "Nina", avatar: "/avatars/nina-gupta.svg", when: "1d", add: 3, del: 0, msg: "Q2 feature flags" },
  { who: "Alex Chen", first: "Alex", avatar: "/avatars/alex-chen.svg", when: "3d", add: 1, del: 0, msg: "cloudflare api token" },
];

function LedgerMovement() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PATCHES;
    return PATCHES.filter(
      (p) =>
        p.who.toLowerCase().includes(s) || p.msg.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <SectionLabel n="IV">The ledger</SectionLabel>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
              <span className="text-neutral-100">Every save signed.</span>{" "}
              <span className="text-neutral-500">
                Every change recallable.
              </span>
            </h2>
            <p className="mt-6 text-[16px] text-neutral-400 leading-[1.75] max-w-md">
              The server returns the matching ciphertexts; your browser
              decrypts and renders them. The audit log is yours; the
              answer is yours; we supplied only the shelving.
            </p>
            <SmallList
              items={[
                "Search by author or substring",
                "Filter by added or removed lines",
                "Decrypted in your tab, never on ours",
              ]}
            />
          </div>

          <div className="lg:col-span-7">
            <FigureFrame caption="Fig. 04 — the ledger, searched">
              <div className="px-3 h-9 flex items-center gap-3 border-b border-neutral-900 text-[12px] font-mono">
                <span className="text-neutral-600">grep</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="author or word…"
                  className="flex-1 bg-transparent outline-none text-neutral-200 placeholder:text-neutral-700"
                />
                <span className="text-neutral-600 tabular-nums">
                  {filtered.length}/{PATCHES.length}
                </span>
              </div>
              <div className="divide-y divide-neutral-900 min-h-[220px]">
                {filtered.length === 0 ? (
                  <div className="grid place-items-center py-12 font-mono text-[12px] text-neutral-600">
                    no entries
                  </div>
                ) : (
                  filtered.map((p, i) => (
                    <div
                      key={i}
                      className="px-4 py-2.5 grid grid-cols-[24px_1fr_auto] items-center gap-3"
                    >
                      <img
                        src={p.avatar}
                        alt=""
                        className="h-6 w-6 rounded-full grayscale opacity-90"
                      />
                      <div className="min-w-0">
                        <div className="text-[13px] text-neutral-100 truncate">
                          {p.who}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono truncate">
                          {p.msg}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[12px] tabular-nums">
                          <span className="text-neutral-300">+{p.add}</span>{" "}
                          <span className="text-neutral-500">−{p.del}</span>
                        </div>
                        <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.25em]">
                          {p.when} ago
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </FigureFrame>
          </div>
        </div>
      </Shell>
    </section>
  );
}

// ── Pull quote + numbers ─────────────────────────────────────────────────

function Numbers() {
  return (
    <section>
      <Shell>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="font-serif italic text-2xl md:text-[28px] text-neutral-200 leading-[1.45] tracking-tight max-w-3xl"
        >
          &ldquo;Seventy-seven users, eighty-nine projects, one
          thousand and eighty-six versions, thirty stars on GitHub. We
          think you should know that before you sign up.&rdquo;
        </motion.h2>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-6 max-w-3xl">
          <NumberRow k="users">77</NumberRow>
          <NumberRow k="projects">89</NumberRow>
          <NumberRow k="versions">1,086</NumberRow>
          <NumberRow k="stars">30</NumberRow>
        </div>
      </Shell>
    </section>
  );
}

function NumberRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-neutral-900 pt-3">
      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
        {k}
      </div>
      <div className="mt-1.5 text-3xl font-semibold text-neutral-100 tabular-nums">
        {children}
      </div>
    </div>
  );
}

// ── Coda ─────────────────────────────────────────────────────────────────

function Coda() {
  return (
    <section className="py-24">
      <Shell>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.05] tracking-tight max-w-3xl"
        >
          The atelier closes here. The vault opens at the next click.
        </motion.h2>
        <p className="mt-6 text-lg text-neutral-400 leading-[1.7] max-w-xl">
          Sign in with GitHub, mint a passphrase in the browser, paste your
          first value. Three minutes, one vault, no charge.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <PrimaryCTA>
            Open the dashboard
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            Read the source
          </GhostCTA>
          <GhostCTA href="/blog">The blog</GhostCTA>
        </div>
      </Shell>
    </section>
  );
}

function Colophon() {
  return (
    <footer className="pb-16">
      <Shell>
        <div className="border-t border-neutral-900 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-600">
          <span className="inline-flex items-center gap-2.5">
            <Pin /> Cryptly · atelier · MIT
          </span>
          <span className="normal-case tracking-normal text-neutral-500 italic font-serif">
            Made by hand, in measured quantities.
          </span>
        </div>
      </Shell>
    </footer>
  );
}

export function VariantD() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 overflow-x-hidden">
      <Header />
      <Hero />
      <Rule />
      <VaultMovement />
      <Rule />
      <InviteMovement />
      <Rule />
      <WireMovement />
      <Rule />
      <LedgerMovement />
      <Rule />
      <Numbers />
      <Coda />
      <Colophon />
    </div>
  );
}
