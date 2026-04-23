import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Copy,
  Minus,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT I — "The Periodical"
 * Longform editorial. Five chapters, each with its own quiet exhibit, paced
 * like a Stripe Press essay — black backdrop, restrained typography, one
 * warm parchment accent used as decoration only.
 * Density ~9/10, achieved through composition, not through colour.
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
            <Pin /> <span>Cryptly · the periodical</span>
          </span>
          <span className="hidden md:inline">Five chapters · 23 minutes</span>
          <span>Issue VII · 2026</span>
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
    <div className="mx-auto max-w-6xl px-6 my-20">
      <div className="border-t border-neutral-900" />
    </div>
  );
}

function ChapterMark({
  numeral,
  title,
  read,
}: {
  numeral: string;
  title: string;
  read: string;
}) {
  return (
    <div className="flex items-baseline gap-4 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
      <span
        className="font-serif italic normal-case tracking-normal"
        style={{ color: ACCENT }}
      >
        Chapter {numeral}.
      </span>
      <span>{title}</span>
      <span className="ml-auto text-neutral-600 normal-case tracking-normal italic font-serif">
        {read}
      </span>
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="pt-24 md:pt-32 pb-16">
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9 }}
              className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500"
            >
              A long essay on a small program
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.1 }}
              className="mt-6 text-5xl md:text-7xl lg:text-[88px] font-semibold text-neutral-100 leading-[0.96] tracking-tight"
            >
              On a vault we cannot read,
              <br />
              <span className="text-neutral-500">
                and a price we won't charge.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="mt-8 text-lg md:text-xl text-neutral-300 max-w-3xl leading-[1.7] font-serif"
            >
              Cryptly is a small secrets manager built so its operators —
              that's us — physically cannot decrypt your values. The five
              chapters that follow set out the construction in detail:
              what we hold, how it is shared, where it is shipped, what
              the ledger remembers, and why the bill is empty.
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
          </div>

          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="lg:col-span-4"
          >
            <div className="border-t border-neutral-800 pt-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                In this issue
              </div>
              <ol className="mt-5 space-y-3 text-[13px] text-neutral-300">
                <Toc n="I" t="What we hold (and don't)" page="03" />
                <Toc n="II" t="On the matter of inviting" page="07" />
                <Toc n="III" t="The dispatch to GitHub" page="12" />
                <Toc n="IV" t="The ledger and its searches" page="16" />
                <Toc n="V" t="On the price" page="21" />
              </ol>
              <div className="mt-6 text-[11px] font-mono text-neutral-600 leading-relaxed">
                Estimated read · 23 minutes. The compositor recommends
                reading in order.
              </div>
            </div>
          </motion.aside>
        </div>
      </Shell>
    </section>
  );
}

function Toc({ n, t, page }: { n: string; t: string; page: string }) {
  return (
    <li className="flex items-baseline gap-3">
      <span
        className="w-7 shrink-0 text-[11px] font-mono uppercase tracking-[0.25em]"
        style={{ color: ACCENT }}
      >
        {n}.
      </span>
      <a
        href={`#chapter-${n.toLowerCase()}`}
        className="flex-1 text-neutral-200 hover:text-neutral-50 underline-offset-4 decoration-neutral-700 hover:decoration-neutral-400 transition-colors"
      >
        {t}
      </a>
      <span className="text-[11px] font-mono text-neutral-600 tabular-nums">
        p. {page}
      </span>
    </li>
  );
}

// ── Chapter I — The vault ─────────────────────────────────────────────────

const VAULT_ROWS = [
  { k: "DATABASE_URL", v: "postgres://u:p@db.internal:5432/app" },
  { k: "STRIPE_SECRET_KEY", v: "sk_live_72Mky8qRt9tWnOpC" },
  { k: "JWT_SIGNING_KEY", v: "kJ9f2LmN8aQq3PzVxT4wYrUi" },
  { k: "OPENAI_API_KEY", v: "sk-proj-AbcDef123xyz456" },
  { k: "SENTRY_DSN", v: "https://abc@o42.ingest.sentry.io/99" },
];

function ChapterVault() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section id="chapter-i">
      <Shell>
        <ChapterMark numeral="I" title="What we hold (and don't)" read="≈ 4 min" />
        <h2 className="mt-6 text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.02] tracking-tight max-w-4xl">
          <span className="text-neutral-100">A row, a blob,</span>{" "}
          <span className="text-neutral-500">no second column.</span>
        </h2>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-7 space-y-5 text-[17px] text-neutral-400 leading-[1.75] font-serif">
            <p>
              <span
                className="float-left mr-2 mt-[0.18em] font-serif font-semibold leading-none text-neutral-100"
                style={{ fontSize: "3.6rem" }}
              >
                E
              </span>
              very value you save is wrapped in AES-256-GCM by your
              browser, with a key derived — locally — from a passphrase
              you never tell us. The server stores ciphertext and
              nothing else. It is, in the polite phrasing, a
              zero-knowledge system; in the impolite phrasing, ours is
              a database full of noise.
            </p>
            <p>
              The figure on the right is the editor as you'll find it in
              the actual product. Hover any row to peek; the value lives
              in your tab and nowhere else. The smaller frame below
              shows what the database stores for that same row — the
              entire payload reduced to a single base-64 blob.
            </p>
          </div>
          <div className="lg:col-span-5 space-y-5">
            <FigureFrame caption="Fig. 01 — the editor, masked by default">
              <div className="px-3 h-9 flex items-center justify-between border-b border-neutral-900 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                <span>cryptly · production · .env</span>
                <span style={{ color: ACCENT }}>encrypted in your tab</span>
              </div>
              <div className="font-mono text-[12px] leading-[1.95] py-1">
                {VAULT_ROWS.map((r, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    className="grid grid-cols-[28px_150px_1fr] items-baseline gap-3 px-3 hover:bg-white/[0.015]"
                  >
                    <span className="text-right text-neutral-700 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-neutral-300 truncate">{r.k}</span>
                    <span
                      className={cn(
                        "truncate",
                        hover === i ? "text-neutral-200" : "text-neutral-600"
                      )}
                    >
                      {hover === i ? r.v : "•".repeat(Math.min(r.v.length, 24))}
                    </span>
                  </div>
                ))}
              </div>
            </FigureFrame>
            <FigureFrame caption="Fig. 02 — the database, plainly">
              <div className="px-4 py-4 font-mono text-[12px] text-neutral-400 leading-[1.8]">
                <div className="grid grid-cols-[90px_1fr] gap-x-6 gap-y-1">
                  <span className="text-neutral-500">id</span>
                  <span className="text-neutral-300">sec_7mFq2aN9bK</span>
                  <span className="text-neutral-500">project</span>
                  <span className="text-neutral-300">prj_k2L7p</span>
                  <span className="text-neutral-500">created</span>
                  <span className="text-neutral-300">
                    2026-04-22T12:03:18Z
                  </span>
                  <span className="text-neutral-500">blob</span>
                  <span className="text-neutral-300 break-all">
                    u2l9aFZbk3Pj+Q7WkS9QfwDfMnLvSsC6XgYh1xZ8pQrT+88k/4Lr2Nh==
                  </span>
                </div>
                <div className="mt-3 italic font-serif text-neutral-600">
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

// ── Chapter II — Inviting ─────────────────────────────────────────────────

function ChapterInvite() {
  const [tab, setTab] = useState<"link" | "user" | "team">("link");
  const [copied, setCopied] = useState(false);
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  return (
    <section id="chapter-ii">
      <Shell>
        <ChapterMark numeral="II" title="On the matter of inviting" read="≈ 5 min" />
        <h2 className="mt-6 text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.02] tracking-tight max-w-4xl">
          <span className="text-neutral-100">
            Two channels, one handshake.
          </span>{" "}
          <span className="text-neutral-500">No plaintext on our side.</span>
        </h2>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5 space-y-5 text-[17px] text-neutral-400 leading-[1.75] font-serif">
            <p>
              To bring a teammate aboard, Cryptly mints a one-time link
              and a separate passphrase. They travel on different
              channels — a stolen link alone unlocks nothing. Once
              accepted, the project key is re-wrapped for the new
              member's public key inside their browser. Our server moves
              wrapped bytes only.
            </p>
            <p>
              You may also pick from a quiet list of teammates you've
              already worked with. Whole-team invitations — entire org
              units in one stroke —{" "}
              <span style={{ color: ACCENT }}>land in Q3</span>.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="border border-neutral-800 bg-neutral-950/30">
              <div className="flex items-center gap-6 border-b border-neutral-900 px-5">
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
                        "relative -mb-px py-3 text-[13px]",
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
                          layoutId="periodical-invite-underline"
                          className="absolute left-0 right-0 -bottom-px h-px"
                          style={{ backgroundColor: ACCENT }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-5 min-h-[260px]">
                <AnimatePresence mode="wait">
                  {tab === "link" && (
                    <motion.div
                      key="link"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                      <Field
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
                      <Field
                        label="Channel B · the passphrase"
                        value="sunrise-otter-42"
                        note="Send via a different medium than the link."
                      />
                    </motion.div>
                  )}
                  {tab === "user" && (
                    <motion.div
                      key="user"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
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
                          hint: "8 commits this week",
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
                              "text-left border p-4 transition-colors",
                              on
                                ? "border-neutral-700 bg-neutral-900/30"
                                : "border-neutral-800 hover:border-neutral-700"
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
                              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                                already collaborator
                              </span>
                              <span
                                className="text-[11px] font-mono"
                                style={
                                  on
                                    ? { color: ACCENT }
                                    : { color: "#737373" }
                                }
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <p className="text-[15px] text-neutral-400 leading-[1.75] font-serif italic">
                        Define a team once, grant project access to every
                        member with one stroke. The browser fans out
                        wrapped project keys; the server forwards them.
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
            <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              Fig. 03 — three modes of invitation
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function Field({
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

// ── Chapter III — The dispatch ─────────────────────────────────────────────

const GH_LIST = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SIGNING_KEY",
  "STRIPE_SECRET_KEY",
  "OPENAI_API_KEY",
  "SENTRY_DSN",
];

function ChapterDispatch() {
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
    <section id="chapter-iii">
      <Shell>
        <ChapterMark numeral="III" title="The dispatch to GitHub" read="≈ 4 min" />
        <h2 className="mt-6 text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.02] tracking-tight max-w-4xl">
          <span className="text-neutral-100">One click.</span>{" "}
          <span className="text-neutral-500">No plaintext crosses the line.</span>
        </h2>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5 space-y-5 text-[17px] text-neutral-400 leading-[1.75] font-serif">
            <p>
              The browser re-encrypts each value against the target
              repository's libsodium sealed-box public key — the same
              primitive GitHub's own command-line tool uses — and
              forwards the ciphertext. We are the courier; GitHub is
              the recipient. The plaintext lived only in the tab that
              started it and the runner that uses it.
            </p>
            <button
              type="button"
              onClick={run}
              disabled={running}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border transition-colors",
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
            <FigureFrame caption="Fig. 04 — six values, six wires">
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
                        none yet — press the button at left
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

// ── Chapter IV — The ledger ───────────────────────────────────────────────

type Patch = {
  id: string;
  who: string;
  first: string;
  avatar: string;
  add: number;
  del: number;
  when: string;
  msg: string;
  diff: { kind: "add" | "del" | "eq" | "comment"; text: string }[];
};

const PATCHES: Patch[] = [
  {
    id: "p1",
    who: "Alex Chen",
    first: "Alex",
    avatar: "/avatars/alex-chen.svg",
    add: 1,
    del: 1,
    when: "2m",
    msg: "rotate stripe live key",
    diff: [
      { kind: "comment", text: "# production · stripe" },
      { kind: "del", text: "STRIPE_SECRET_KEY=sk_live_51Nxj7pLkQr9mVbXc" },
      { kind: "add", text: "STRIPE_SECRET_KEY=sk_live_72Mky8qRt9tWnOpC" },
    ],
  },
  {
    id: "p2",
    who: "Marcus Rodriguez",
    first: "Marcus",
    avatar: "/avatars/marcus-rodriguez.svg",
    add: 2,
    del: 0,
    when: "14m",
    msg: "add observability keys",
    diff: [
      { kind: "comment", text: "# observability" },
      { kind: "add", text: "OPENAI_API_KEY=sk-proj-AbcDef123xyz456" },
      { kind: "add", text: "SENTRY_DSN=https://abc@o42.ingest.sentry.io/99" },
    ],
  },
  {
    id: "p3",
    who: "Priya Patel",
    first: "Priya",
    avatar: "/avatars/priya-patel.svg",
    add: 1,
    del: 1,
    when: "1h",
    msg: "migrate db to db.internal",
    diff: [
      { kind: "del", text: "DATABASE_URL=postgres://u:p@db-old.internal/app" },
      { kind: "add", text: "DATABASE_URL=postgres://u:p@db.internal/app" },
    ],
  },
  {
    id: "p4",
    who: "Nina Gupta",
    first: "Nina",
    avatar: "/avatars/nina-gupta.svg",
    add: 3,
    del: 0,
    when: "1d",
    msg: "Q2 feature flags",
    diff: [
      { kind: "comment", text: "# feature flags · Q2" },
      { kind: "add", text: "FEATURE_CHECKOUT_V2=true" },
      { kind: "add", text: "FEATURE_ONBOARDING_V3=true" },
      { kind: "add", text: "FEATURE_AI_SUGGEST=false" },
    ],
  },
  {
    id: "p5",
    who: "Marcus Rodriguez",
    first: "Marcus",
    avatar: "/avatars/marcus-rodriguez.svg",
    add: 8,
    del: 0,
    when: "1d",
    msg: "bulk import production env",
    diff: [
      { kind: "add", text: "DATABASE_URL=postgres://u:p@db.internal/app" },
      { kind: "add", text: "REDIS_URL=redis://default:r3dis@redis:6379" },
      { kind: "add", text: "JWT_SIGNING_KEY=kJ9f2LmN8aQq3PzVxT4wYrUi" },
      { kind: "add", text: "STRIPE_SECRET_KEY=sk_live_72Mky8qRt9tWnOpC" },
      { kind: "add", text: "SENDGRID_API_KEY=SG.abcDefGhiJkl123456" },
      { kind: "add", text: "CLOUDFLARE_API_TOKEN=cf_tok_Xy9mN2pQ7rStUvWx" },
      { kind: "add", text: "GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA…-----" },
      { kind: "add", text: "GOOGLE_OAUTH_SECRET=GOCSPX-abcDefGhi123" },
    ],
  },
];

function ChapterLedger() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(PATCHES[0].id);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PATCHES;
    return PATCHES.filter(
      (p) =>
        p.who.toLowerCase().includes(s) ||
        p.msg.toLowerCase().includes(s) ||
        p.diff.some((d) => d.text.toLowerCase().includes(s))
    );
  }, [q]);

  useEffect(() => {
    if (filtered.length && !filtered.some((p) => p.id === selected)) {
      setSelected(filtered[0].id);
    }
  }, [filtered, selected]);

  const current = PATCHES.find((p) => p.id === selected) ?? PATCHES[0];

  return (
    <section id="chapter-iv">
      <Shell>
        <ChapterMark numeral="IV" title="The ledger and its searches" read="≈ 5 min" />
        <h2 className="mt-6 text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.02] tracking-tight max-w-4xl">
          <span className="text-neutral-100">Every save signed.</span>{" "}
          <span className="text-neutral-500">Every change recallable.</span>
        </h2>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-4 space-y-5 text-[17px] text-neutral-400 leading-[1.75] font-serif">
            <p>
              Each save becomes a signed diff in the project's history.
              Search by author, by substring, by what was added or
              removed across months of rotations. The server returns
              the matching ciphertexts; your browser decrypts and
              renders them.
            </p>
            <p>
              It is the only audit log we know of that we cannot read.
            </p>
          </div>
          <div className="lg:col-span-8">
            <FigureFrame caption="Fig. 05 — the ledger, searched">
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
                <div className="border-b lg:border-b-0 lg:border-r border-neutral-900">
                  <div className="flex items-center gap-2 px-3 h-10 border-b border-neutral-900 font-mono text-[12px]">
                    <Search className="h-3.5 w-3.5 text-neutral-500" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="author or word…"
                      className="flex-1 bg-transparent outline-none text-neutral-200 placeholder:text-neutral-700"
                    />
                    <span className="text-neutral-500 tabular-nums">
                      {filtered.length}/{PATCHES.length}
                    </span>
                  </div>
                  <div className="max-h-[360px] overflow-auto">
                    {filtered.map((p) => {
                      const a = p.id === current.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelected(p.id)}
                          className={cn(
                            "w-full text-left flex items-center gap-3 px-3 py-2.5 border-l-2 border-b border-neutral-900",
                            a
                              ? "bg-neutral-900/40"
                              : "border-l-transparent hover:bg-neutral-900/20"
                          )}
                          style={a ? { borderLeftColor: ACCENT } : undefined}
                        >
                          <img
                            src={p.avatar}
                            alt=""
                            className="h-6 w-6 rounded-full grayscale opacity-90"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] text-neutral-100 truncate">
                              {p.who}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono truncate">
                              {p.msg}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-[11px] tabular-nums">
                              <span className="text-neutral-300">
                                +{p.add}
                              </span>{" "}
                              <span className="text-neutral-500">−{p.del}</span>
                            </div>
                            <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.25em]">
                              {p.when}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {filtered.length === 0 && (
                      <div className="grid place-items-center py-12 font-mono text-[12px] text-neutral-600">
                        no entries
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 px-4 h-10 border-b border-neutral-900 text-[12px] font-mono">
                    <img
                      src={current.avatar}
                      alt=""
                      className="h-5 w-5 rounded-full grayscale"
                    />
                    <span className="text-neutral-200">{current.who}</span>
                    <span className="text-neutral-700">·</span>
                    <span className="text-neutral-500">{current.when} ago</span>
                    <span className="text-neutral-700">·</span>
                    <span className="text-neutral-500 italic font-serif">
                      {current.msg}
                    </span>
                    <span className="ml-auto font-mono">
                      <span className="text-neutral-300">+{current.add}</span>{" "}
                      <span className="text-neutral-500">−{current.del}</span>
                    </span>
                  </div>
                  <div className="p-4 font-mono text-[12px] leading-[1.85]">
                    {current.diff.map((d, i) => (
                      <div
                        key={i}
                        className={cn(
                          "px-2 -mx-2",
                          d.kind === "add" && "text-neutral-100",
                          d.kind === "del" &&
                            "text-neutral-500 line-through decoration-neutral-700",
                          d.kind === "comment" && "text-neutral-500 italic font-serif",
                          d.kind === "eq" && "text-neutral-400"
                        )}
                      >
                        <span className="inline-block w-3 text-neutral-700">
                          {d.kind === "add"
                            ? "+"
                            : d.kind === "del"
                              ? "−"
                              : " "}
                        </span>
                        <span className="break-all">{d.text}</span>
                      </div>
                    ))}
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

// ── Chapter V — On the price ─────────────────────────────────────────────

function ChapterPrice() {
  return (
    <section id="chapter-v">
      <Shell>
        <ChapterMark numeral="V" title="On the price" read="≈ 5 min" />
        <h2 className="mt-6 text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.02] tracking-tight max-w-4xl">
          <span className="text-neutral-100">Every chapter above,</span>{" "}
          <span className="text-neutral-500">at no charge, indefinitely.</span>
        </h2>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-7 columns-1 md:columns-2 gap-10 text-[17px] text-neutral-400 leading-[1.75] font-serif">
            <p className="mb-4">
              <span
                className="float-left mr-2 mt-[0.18em] font-serif font-semibold leading-none text-neutral-100"
                style={{ fontSize: "3.6rem" }}
              >
                O
              </span>
              ur charge for this service is{" "}
              <em>zero dollars.</em> Not in the first month, not for
              the first thousand writes; not as a loss-leader for a
              forthcoming enterprise tier nor as bait for a future
              acquisition. Zero, full stop, for every feature, every
              seat, every year.
            </p>
            <p className="mb-4">
              The arithmetic is straightforward. A correctly designed
              zero-knowledge system stores noise. Noise is cheap: a few
              bytes per secret, a few thousand secrets per project, a
              few dollars per month of object storage for the lot. We
              have no plaintext to mine, no behavioural analytics to
              resell, no AI laboratory to feed.
            </p>
            <p>
              If we are ever tempted to charge, it will have to be by
              departing from the mandate — by holding something worth
              hiding from you. Until that day, which we hope is never,
              the price remains the same. The product does too.
            </p>
          </div>
          <div className="lg:col-span-5">
            <FigureFrame caption="Fig. 06 — the invoice, in full">
              <div className="px-4 py-4 font-mono text-[13px]">
                <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  the only invoice we ever send
                </div>
                <div className="mt-3 divide-y divide-neutral-900">
                  <Line k="Unlimited vaults" v="$0.00" />
                  <Line k="Unlimited seats" v="$0.00" />
                  <Line k="Inviting · all three modes" v="$0.00" />
                  <Line k="GitHub Actions sync" v="$0.00" />
                  <Line k="Revision history" v="$0.00" />
                  <Line k="Zero-knowledge storage" v="$0.00" />
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-800 flex items-baseline justify-between">
                  <span className="text-neutral-300">
                    Total · per seat · per year
                  </span>
                  <span className="text-3xl text-neutral-100 tabular-nums">
                    $0.00
                  </span>
                </div>
                <div className="mt-3 text-[11px] font-mono text-neutral-500 leading-relaxed">
                  no card on file · no trial timer · no "contact us"
                  footnote.
                </div>
              </div>
            </FigureFrame>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between py-2">
      <span className="text-neutral-400">{k}</span>
      <span className="text-neutral-200 tabular-nums">{v}</span>
    </div>
  );
}

// ── Numbers + Quotes + FAQ ────────────────────────────────────────────────

function Numbers() {
  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              Marginalia
            </div>
            <h3 className="mt-4 text-3xl md:text-4xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
              Small numbers, told plainly.
            </h3>
            <p className="mt-4 text-[15px] text-neutral-400 leading-[1.7]">
              Each figure is real and modest. The blog follows them as
              they move.
            </p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-8">
            <Stat k="users">77</Stat>
            <Stat k="projects">89</Stat>
            <Stat k="versions">1,086</Stat>
            <Stat k="stars">30</Stat>
            <Stat k="plan">$0</Stat>
            <Stat k="our knowledge">0 bits</Stat>
            <Stat k="time to first secret">≈ 3 min</Stat>
            <Stat k="cipher">aes-256</Stat>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function Stat({ k, children }: { k: string; children: React.ReactNode }) {
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

function Quotes() {
  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
          <blockquote>
            <p className="font-serif italic text-2xl md:text-[28px] text-neutral-200 leading-[1.45] tracking-tight">
              &ldquo;The invite link flow took me roughly fifteen
              seconds, and my teammate was decrypting production values
              on his side a minute later.&rdquo;
            </p>
            <div className="mt-5 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              — Jerzy Wiśniewski · signosh
            </div>
          </blockquote>
          <blockquote>
            <p className="font-serif italic text-2xl md:text-[28px] text-neutral-200 leading-[1.45] tracking-tight">
              &ldquo;The history panel is the thing I didn't know I'd
              want until the day I wanted it.&rdquo;
            </p>
            <div className="mt-5 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              — Dominik Mackiewicz · bluemenu
            </div>
          </blockquote>
        </div>
      </Shell>
    </section>
  );
}

const FAQS = [
  {
    q: "What if you're lying about zero-knowledge?",
    a: "Read the source. The encryption module is small enough to fit on a printed page; the network requests are inspectable with devtools. If you don't trust ours, run your own.",
  },
  {
    q: "What happens if I lose my passphrase?",
    a: "The vault is gone. That is the design — it's also why we can truthfully say we cannot read your secrets. Storing the passphrase in a personal password manager and giving at least one teammate access is the standard recipe.",
  },
  {
    q: "How is it free, really?",
    a: "Storage of ciphertext is cheap. There is no plaintext to mine, no analytics to sell, no model to train. The founders already have day jobs.",
  },
  {
    q: "Does it work with my CI?",
    a: "GitHub Actions today. GitLab and CircleCI are in the queue. The pattern is the same: re-encrypt against the target's public key in the browser, ship ciphertext.",
  },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              Postscript
            </div>
            <h3 className="mt-4 text-3xl md:text-4xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
              Questions, briefly answered.
            </h3>
            <p className="mt-4 text-[15px] text-neutral-400 leading-[1.7]">
              If yours isn't here, the rest of the conversation lives
              in our{" "}
              <a
                href="https://github.com/cryptly-dev/cryptly/discussions"
                className="underline decoration-neutral-700 underline-offset-4 hover:decoration-neutral-400 text-neutral-200"
              >
                GitHub discussions
              </a>
              .
            </p>
          </div>
          <div className="lg:col-span-8 divide-y divide-neutral-900 border-y border-neutral-900">
            {FAQS.map((f, i) => (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center gap-4 py-5 text-left"
                >
                  <span
                    className="font-serif italic text-[14px]"
                    style={{ color: ACCENT }}
                  >
                    Q{String(i + 1).padStart(2, "0")}.
                  </span>
                  <span className="flex-1 text-[16px] md:text-[17px] text-neutral-100 font-medium">
                    {f.q}
                  </span>
                  <span className="text-neutral-500">
                    {open === i ? (
                      <Minus className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5 pl-12 text-[15px] text-neutral-400 leading-[1.7] font-serif">
                        {f.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </Shell>
    </section>
  );
}

// ── Coda ─────────────────────────────────────────────────────────────────

function Coda() {
  return (
    <section className="py-24">
      <Shell>
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
          Last page
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="mt-4 text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.02] tracking-tight max-w-3xl"
        >
          The periodical closes here. The vault opens at the next click.
        </motion.h2>
        <p className="mt-6 text-lg text-neutral-400 leading-[1.7] max-w-xl font-serif">
          Sign in with GitHub, mint a passphrase in the browser, paste
          your first value. The chapters above belong to your project
          from then on, at no charge, indefinitely.
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
            <Pin /> Cryptly · the periodical · MIT
          </span>
          <span className="normal-case tracking-normal text-neutral-500 italic font-serif">
            Set in Funnel Display, with Georgia for the asides.
          </span>
        </div>
      </Shell>
    </footer>
  );
}

export function VariantI() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 overflow-x-hidden">
      <Header />
      <Hero />
      <Rule />
      <ChapterVault />
      <Rule />
      <ChapterInvite />
      <Rule />
      <ChapterDispatch />
      <Rule />
      <ChapterLedger />
      <Rule />
      <ChapterPrice />
      <Rule />
      <Numbers />
      <Rule />
      <Quotes />
      <Rule />
      <FAQSection />
      <Coda />
      <Colophon />
    </div>
  );
}
