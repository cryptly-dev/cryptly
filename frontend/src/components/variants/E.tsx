import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { CryptlyLogo } from "@/components/ui/CryptlyLogo";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Copy,
  FolderOpen,
  Search,
  Users,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT E — "The Salon"
 * The atelier, rounded. Same editorial restraint as D, but every frame
 * is soft: translucent card surfaces, backdrop blur, rounded corners,
 * sliding tab pills — the visual language of the in-app /app route
 * translated back to a landing page.
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
    <header className="sticky top-4 z-30 px-4">
      <Shell>
        <div className="flex items-center justify-between h-14 rounded-full border border-border/50 bg-card/40 backdrop-blur-md px-5">
          <a
            href="/"
            className="inline-flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity"
          >
            <CryptlyLogo size={22} />
            <span className="font-semibold tracking-tight">Cryptly</span>
            <span
              className="ml-2 text-[10px] font-mono uppercase tracking-[0.25em]"
              style={{ color: ACCENT }}
            >
              salon
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <a
              href="#vault"
              className="rounded-md px-3 py-1.5 hover:text-foreground hover:bg-neutral-800/50 transition-colors"
            >
              The vault
            </a>
            <a
              href="#invitation"
              className="rounded-md px-3 py-1.5 hover:text-foreground hover:bg-neutral-800/50 transition-colors"
            >
              Invitation
            </a>
            <a
              href="#wire"
              className="rounded-md px-3 py-1.5 hover:text-foreground hover:bg-neutral-800/50 transition-colors"
            >
              The wire
            </a>
            <a
              href="#ledger"
              className="rounded-md px-3 py-1.5 hover:text-foreground hover:bg-neutral-800/50 transition-colors"
            >
              Ledger
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/cryptly-dev/cryptly"
              className="hidden sm:inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-neutral-800/50 transition-colors"
              aria-label="Source"
            >
              <GitHubIcon className="h-4 w-4" />
            </a>
            <a
              href="/app/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-3.5 py-1.5 text-sm font-medium hover:bg-neutral-100 transition-colors"
            >
              Open app
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
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
      className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-semibold shadow-lg shadow-black/40 hover:bg-neutral-100 transition-colors"
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
      className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/40 backdrop-blur-sm px-5 py-2.5 text-sm text-foreground hover:bg-neutral-800/60 hover:border-border transition-colors"
    >
      {children}
    </a>
  );
}

function SoftDivider() {
  return (
    <div className="mx-auto max-w-6xl px-6 my-20">
      <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
    </div>
  );
}

function SectionLabel({
  n,
  children,
}: {
  n: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-card/40 backdrop-blur-sm px-3 py-1 text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
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

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

function CardChrome({
  left,
  right,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-4 h-10 flex items-center justify-between border-b border-border/50 bg-neutral-900/40 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
      <span className="inline-flex items-center gap-2 min-w-0 truncate">
        {left}
      </span>
      {right && <span className="inline-flex items-center gap-2">{right}</span>}
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
      {children}
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="pt-16 md:pt-24 pb-12">
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9 }}
            >
              <SectionLabel n="—">
                A small atelier · a smaller threat surface
              </SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.1 }}
              className="mt-6 text-5xl md:text-7xl lg:text-[84px] font-semibold text-foreground leading-[0.98] tracking-tight"
            >
              Made by hand.
              <br />
              Held by you.
              <br />
              <span className="text-muted-foreground">Not by us.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="mt-8 text-lg text-muted-foreground max-w-xl leading-[1.75]"
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
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground"
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
            <Caption>Fig. 01 — the editor, in repose</Caption>
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
    <Card>
      <CardChrome
        left={<span>cryptly · production · .env</span>}
        right={<span style={{ color: ACCENT }}>locally encrypted</span>}
      />
      <div className="font-mono text-[12px] leading-[1.95] py-2">
        {HERO_ROWS.map((r, i) => (
          <div
            key={i}
            className="group mx-2 grid grid-cols-[28px_160px_1fr] items-baseline gap-3 px-2 py-0.5 rounded-md hover:bg-neutral-800/40 transition-colors"
          >
            <span className="text-right text-muted-foreground/50 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-foreground/90 truncate">{r.k}</span>
            <span className="text-muted-foreground/70 truncate">
              {"•".repeat(Math.min(r.v.length, 28))}
            </span>
          </div>
        ))}
      </div>
      <div className="px-4 h-9 flex items-center justify-between border-t border-border/50 bg-neutral-900/40 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
        <span>5 of 12</span>
        <span className="font-mono normal-case tracking-normal text-muted-foreground/70">
          ciphertext, on every save
        </span>
      </div>
    </Card>
  );
}

// ── Movement I — The vault ─────────────────────────────────────────────────

function VaultMovement() {
  return (
    <section id="vault">
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <SectionLabel n="I">The vault</SectionLabel>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-foreground leading-[1.08] tracking-tight">
              <span className="text-foreground">
                One column for the blob.
              </span>{" "}
              <span className="text-muted-foreground">
                None for the value.
              </span>
            </h2>
            <p className="mt-7 text-[16px] text-muted-foreground leading-[1.75] max-w-md">
              Below, a single row from our database. The field marked{" "}
              <code className="text-foreground rounded bg-neutral-800/60 px-1 py-0.5 text-[13px]">
                blob
              </code>{" "}
              is the entire secret, wrapped in your browser before it left
              the tab. There is no second column where the plaintext lives,
              and no function to produce it on demand.
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
            <Card>
              <CardChrome
                left={<span>secrets · row 1 of 1,086</span>}
                right={<span style={{ color: ACCENT }}>schema</span>}
              />
              <div className="px-5 py-5 font-mono text-[12px] text-muted-foreground leading-[1.9]">
                <div className="text-muted-foreground/60">— column · value</div>
                <div className="mt-3 grid grid-cols-[110px_1fr] gap-x-6 gap-y-1.5">
                  <span className="text-muted-foreground/60">id</span>
                  <span className="text-foreground/90">sec_7mFq2aN9bK</span>
                  <span className="text-muted-foreground/60">project</span>
                  <span className="text-foreground/90">prj_k2L7p</span>
                  <span className="text-muted-foreground/60">created</span>
                  <span className="text-foreground/90">
                    2026-04-22T12:03:18Z
                  </span>
                  <span className="text-muted-foreground/60">blob</span>
                  <span className="text-foreground/90 break-all">
                    u2l9aFZbk3Pj+Q7WkS9QfwDfMnLvSsC6XgYh1xZ8pQrT+88k/4Lr2Nh==
                  </span>
                </div>
                <div className="mt-5 rounded-lg border border-border/50 bg-neutral-900/40 px-4 py-3 text-foreground/70 italic font-serif text-[13px]">
                  No further columns. The schema is short on purpose.
                </div>
              </div>
            </Card>
            <Caption>Fig. 02 — secrets · row 1 of 1,086</Caption>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function SmallList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-2 font-mono text-[12px] text-foreground/80">
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

// ── Movement II — Inviting (three methods, app-style tabs) ────────────────

function InviteMovement() {
  const [tab, setTab] = useState<"link" | "user" | "team">("link");
  const [copied, setCopied] = useState(false);
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  const TABS = [
    { id: "link" as const, label: "By invite link" },
    { id: "user" as const, label: "By teammate" },
    { id: "team" as const, label: "By team", soon: true },
  ];

  return (
    <section id="invitation">
      <Shell>
        <div className="max-w-2xl">
          <SectionLabel n="II">The invitation</SectionLabel>
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-foreground leading-[1.08] tracking-tight">
            <span className="text-foreground">Three ways to bring</span>{" "}
            <span className="text-muted-foreground">
              one teammate, or sixty.
            </span>
          </h2>
          <p className="mt-6 text-[16px] text-muted-foreground leading-[1.75] max-w-xl">
            Each method re-wraps the project key in the new member's
            browser; our server moves wrapped bytes only. Pick the one
            that matches your back-channels.
          </p>
        </div>

        <div className="mt-10">
          <Card>
            <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50 bg-neutral-900/40">
              {TABS.map((t) => {
                const a = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                      a
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-neutral-800/50"
                    )}
                  >
                    {a && (
                      <motion.div
                        layoutId="salon-invite-pill"
                        className="absolute inset-0 rounded-md bg-neutral-800"
                        transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                      />
                    )}
                    <span className="relative z-10">{t.label}</span>
                    {t.soon && (
                      <span
                        className="relative z-10 ml-1 rounded-full px-1.5 py-px text-[9px] font-mono uppercase tracking-[0.2em] border border-border/60"
                        style={{ color: ACCENT }}
                      >
                        soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-6 md:p-8 min-h-[240px]">
              <AnimatePresence mode="wait">
                {tab === "link" && (
                  <motion.div
                    key="link"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <InviteField
                      label="Channel A · the link"
                      value="https://cryptly.dev/invite/a3f9-k2m-7bxQ"
                      onCopy={() => {
                        navigator.clipboard
                          ?.writeText(
                            "https://cryptly.dev/invite/a3f9-k2m-7bxQ"
                          )
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
                    className="grid grid-cols-1 md:grid-cols-3 gap-3"
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
                            setPicked((prev) => ({
                              ...prev,
                              [p.id]: !prev[p.id],
                            }))
                          }
                          className={cn(
                            "group text-left rounded-xl border p-4 transition-all cursor-pointer",
                            on
                              ? "border-border bg-neutral-800/50"
                              : "border-border/50 bg-neutral-900/40 hover:border-border hover:bg-neutral-800/40"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={p.a}
                              alt=""
                              className="h-9 w-9 rounded-full grayscale opacity-90"
                            />
                            <div className="min-w-0">
                              <div className="text-[14px] font-medium text-foreground truncate">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {p.hint}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/70">
                              already collaborator
                            </span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-mono transition-colors",
                                on
                                  ? "bg-neutral-700/60"
                                  : "text-muted-foreground group-hover:text-foreground"
                              )}
                              style={on ? { color: ACCENT } : undefined}
                            >
                              {on ? (
                                <>
                                  <Check className="h-3 w-3" /> added
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3" /> add
                                </>
                              )}
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
                  >
                    <p className="text-[15px] text-muted-foreground leading-[1.75] max-w-xl">
                      Define a team once, grant project access to every
                      member with one stroke. The browser fans out wrapped
                      project keys; the server forwards them. Coming in Q3.
                    </p>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { name: "Core engineering", n: 8 },
                        { name: "Infra & SRE", n: 4 },
                        { name: "Frontend", n: 6 },
                      ].map((t) => (
                        <div
                          key={t.name}
                          className="rounded-xl border border-dashed border-border/60 bg-neutral-900/30 p-4"
                        >
                          <div className="flex items-center gap-2 text-[14px] text-foreground">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            {t.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
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
          </Card>
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
      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
        {label}
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-border/50 bg-neutral-900/50 px-3 py-2.5">
        <span className="font-mono text-[13px] text-foreground truncate flex-1">
          {value}
        </span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "copied" : "copy"}
          </button>
        )}
      </div>
      {note && (
        <div className="mt-2 text-[11px] font-mono text-muted-foreground/80">
          {note}
        </div>
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
        window.setTimeout(
          () => {
            setDone((prev) => [...prev, i]);
            if (i === GH_LIST.length - 1) setRunning(false);
          },
          220 + i * 220
        )
      );
    });
  };
  useEffect(
    () => () => timers.current.forEach((t) => window.clearTimeout(t)),
    []
  );

  return (
    <section id="wire">
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <SectionLabel n="III">The wire</SectionLabel>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-foreground leading-[1.08] tracking-tight">
              <span className="text-foreground">One click</span>
              <br />
              <span className="text-muted-foreground">to GitHub Actions.</span>
            </h2>
            <p className="mt-6 text-[16px] text-muted-foreground leading-[1.75] max-w-md">
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
                "mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border transition-colors cursor-pointer",
                running
                  ? "border-border/50 bg-neutral-900/40 text-muted-foreground cursor-wait"
                  : "border-border/50 bg-card/40 backdrop-blur-sm text-foreground hover:bg-neutral-800/60 hover:border-border"
              )}
            >
              {running ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  Pushing…
                </>
              ) : done.length === GH_LIST.length ? (
                <>
                  <Check className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                  Pushed · run again
                </>
              ) : (
                <>
                  Run the dispatch
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="border-b md:border-b-0 md:border-r border-border/50">
                  <CardChrome
                    left={<span>cryptly vault</span>}
                    right={<span style={{ color: ACCENT }}>source</span>}
                  />
                  <div className="p-2 font-mono text-[12px] leading-[1.95]">
                    {GH_LIST.map((k, i) => (
                      <div
                        key={k}
                        className={cn(
                          "mx-1 px-2 py-1 rounded-md grid grid-cols-[1fr_auto] items-baseline gap-2 transition-all",
                          done.includes(i)
                            ? "opacity-50 bg-neutral-900/40"
                            : "hover:bg-neutral-800/40"
                        )}
                      >
                        <span className="text-foreground/90 truncate">{k}</span>
                        <span className="text-muted-foreground/70 text-[10px] uppercase tracking-[0.25em]">
                          ciphertext
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <CardChrome
                    left={
                      <span className="inline-flex items-center gap-1.5">
                        <GitHubIcon className="h-3 w-3" /> cryptly-dev/api
                      </span>
                    }
                    right={<span style={{ color: ACCENT }}>recipient</span>}
                  />
                  <div className="p-2 min-h-[240px]">
                    {done.length === 0 ? (
                      <div className="grid place-items-center h-[240px] text-[12px] font-mono text-muted-foreground/70">
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
                            className="mx-1 px-2 py-1 rounded-md grid grid-cols-[1fr_auto] items-baseline gap-2 font-mono text-[12px] bg-neutral-800/30"
                          >
                            <span className="text-foreground truncate">
                              {GH_LIST[i]}
                            </span>
                            <span className="text-muted-foreground/70 text-[10px] uppercase tracking-[0.25em]">
                              just now
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              </div>
            </Card>
            <Caption>Fig. 03 — six values, six wires</Caption>
          </div>
        </div>
      </Shell>
    </section>
  );
}

// ── Movement IV — The ledger ──────────────────────────────────────────────

type Patch = {
  who: string;
  avatar: string;
  when: string;
  add: number;
  del: number;
  msg: string;
};

const PATCHES: Patch[] = [
  {
    who: "Alex Chen",
    avatar: "/avatars/alex-chen.svg",
    when: "2m",
    add: 1,
    del: 1,
    msg: "rotate STRIPE_SECRET_KEY",
  },
  {
    who: "Marcus Rodriguez",
    avatar: "/avatars/marcus-rodriguez.svg",
    when: "14m",
    add: 2,
    del: 0,
    msg: "add observability keys",
  },
  {
    who: "Priya Patel",
    avatar: "/avatars/priya-patel.svg",
    when: "1h",
    add: 1,
    del: 1,
    msg: "migrate DATABASE_URL",
  },
  {
    who: "Nina Gupta",
    avatar: "/avatars/nina-gupta.svg",
    when: "1d",
    add: 3,
    del: 0,
    msg: "Q2 feature flags",
  },
  {
    who: "Alex Chen",
    avatar: "/avatars/alex-chen.svg",
    when: "3d",
    add: 1,
    del: 0,
    msg: "cloudflare api token",
  },
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
    <section id="ledger">
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <SectionLabel n="IV">The ledger</SectionLabel>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-foreground leading-[1.08] tracking-tight">
              <span className="text-foreground">Every save signed.</span>{" "}
              <span className="text-muted-foreground">
                Every change recallable.
              </span>
            </h2>
            <p className="mt-6 text-[16px] text-muted-foreground leading-[1.75] max-w-md">
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
            <Card>
              <div className="px-3 h-11 flex items-center gap-2 border-b border-border/50 bg-neutral-900/40">
                <div className="flex items-center gap-2 flex-1 rounded-md bg-neutral-800/50 px-2.5 h-8 border border-border/40">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search author or word…"
                    className="flex-1 bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground/70"
                  />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground tabular-nums rounded-md bg-neutral-800/40 px-2 py-1">
                  {filtered.length}/{PATCHES.length}
                </span>
              </div>
              <div className="p-2 min-h-[240px]">
                {filtered.length === 0 ? (
                  <div className="grid place-items-center py-12 font-mono text-[12px] text-muted-foreground/70">
                    no entries
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {filtered.map((p, i) => (
                      <div
                        key={i}
                        className="mx-1 px-3 py-2.5 rounded-md grid grid-cols-[28px_1fr_auto] items-center gap-3 hover:bg-neutral-800/40 transition-colors cursor-pointer"
                      >
                        <img
                          src={p.avatar}
                          alt=""
                          className="h-7 w-7 rounded-full grayscale opacity-90"
                        />
                        <div className="min-w-0">
                          <div className="text-[13px] text-foreground truncate font-medium">
                            {p.who}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono truncate">
                            {p.msg}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-[12px] tabular-nums">
                            <span className="text-foreground/90">+{p.add}</span>{" "}
                            <span className="text-muted-foreground">
                              −{p.del}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-[0.25em]">
                            {p.when} ago
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
            <Caption>Fig. 04 — the ledger, searched</Caption>
          </div>
        </div>
      </Shell>
    </section>
  );
}

// ── Numbers ────────────────────────────────────────────────────────────────

function Numbers() {
  return (
    <section>
      <Shell>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="font-serif italic text-2xl md:text-[28px] text-foreground leading-[1.45] tracking-tight max-w-3xl"
        >
          &ldquo;Seventy-seven users, eighty-nine projects, one thousand
          and eighty-six versions, thirty stars on GitHub. We think you
          should know that before you sign up.&rdquo;
        </motion.h2>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
          <NumberCard k="users">77</NumberCard>
          <NumberCard k="projects">89</NumberCard>
          <NumberCard k="versions">1,086</NumberCard>
          <NumberCard k="stars">30</NumberCard>
        </div>
      </Shell>
    </section>
  );
}

function NumberCard({
  k,
  children,
}: {
  k: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
        <FolderOpen className="h-3 w-3 opacity-60" />
        {k}
      </div>
      <div className="mt-1.5 text-3xl font-semibold text-foreground tabular-nums">
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
        <div className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm px-8 md:px-12 py-14 md:py-16 shadow-2xl shadow-black/40 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${ACCENT}33, transparent)`,
            }}
          />
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="text-3xl md:text-5xl font-semibold text-foreground leading-[1.05] tracking-tight max-w-3xl"
          >
            The salon closes here. The vault opens at the next click.
          </motion.h2>
          <p className="mt-6 text-lg text-muted-foreground leading-[1.7] max-w-xl">
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
        </div>
      </Shell>
    </section>
  );
}

function Colophon() {
  return (
    <footer className="pb-16">
      <Shell>
        <div className="rounded-full border border-border/50 bg-card/30 backdrop-blur-sm px-5 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
          <span className="inline-flex items-center gap-2.5">
            <Pin /> Cryptly · salon · MIT
          </span>
          <span className="normal-case tracking-normal text-muted-foreground italic font-serif">
            Rounded by hand, in measured quantities.
          </span>
        </div>
      </Shell>
    </footer>
  );
}

export function VariantE() {
  return (
    <div className="dark min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* Soft ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 40rem at 20% -10%, rgba(201,178,135,0.06), transparent 60%), radial-gradient(40rem 30rem at 90% 20%, rgba(255,255,255,0.03), transparent 60%)",
        }}
      />
      <Header />
      <Hero />
      <SoftDivider />
      <VaultMovement />
      <SoftDivider />
      <InviteMovement />
      <SoftDivider />
      <WireMovement />
      <SoftDivider />
      <LedgerMovement />
      <SoftDivider />
      <Numbers />
      <Coda />
      <Colophon />
    </div>
  );
}
