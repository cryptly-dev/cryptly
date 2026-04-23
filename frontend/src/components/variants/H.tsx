import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Copy, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT H — "The Conservatory"
 * Multiple working mocks, all rendered with hairline borders and quiet
 * typography. Same warm parchment accent, used sparingly.
 * Density ~7-8/10. Closer to a fine retrospective than to a product demo.
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
            <Pin /> <span>Cryptly · the conservatory</span>
          </span>
          <span className="hidden md:inline">A composed retrospective</span>
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
    <div className="mx-auto max-w-6xl px-6 my-20">
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
    <section className="pt-24 md:pt-32 pb-16">
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9 }}
              className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500"
            >
              A retrospective in seven exhibits
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.1 }}
              className="mt-6 text-5xl md:text-7xl lg:text-[88px] font-semibold text-neutral-100 leading-[0.98] tracking-tight"
            >
              A vault, with the
              <br />
              lights kept low.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="mt-8 text-lg text-neutral-300 max-w-2xl leading-[1.75]"
            >
              Cryptly is a small secrets manager: AES-256-GCM in your
              browser, then ciphertext on the wire. The exhibits below
              walk you through the writing, the inviting, the dispatch
              to GitHub, and the ledger that records all of the above.
              Each one is the actual product UI, in repose.
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
            transition={{ duration: 0.9, delay: 0.4 }}
            className="lg:col-span-5"
          >
            <div className="border-t border-neutral-800 pt-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                On the wall text
              </div>
              <dl className="mt-5 space-y-3 text-[13px] text-neutral-300">
                <Row k="Custody">in the browser, alone</Row>
                <Row k="Cipher">aes-256-gcm</Row>
                <Row k="Inviting">link · teammate · team*</Row>
                <Row k="Continuous">github actions, one click</Row>
                <Row k="Audit">signed diffs, searchable</Row>
                <Row k="Source">open · MIT</Row>
                <Row k="Price">none, in any currency</Row>
              </dl>
              <div className="mt-5 text-[11px] font-mono text-neutral-600">
                * whole-team invitations land in Q3.
              </div>
            </div>
          </motion.aside>
        </div>
      </Shell>
    </section>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4">
      <dt className="w-24 shrink-0 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        {k}
      </dt>
      <dd className="text-neutral-200 font-mono">{children}</dd>
    </div>
  );
}

// ── Exhibit I — The vault ─────────────────────────────────────────────────

const VAULT_ROWS = [
  { k: "DATABASE_URL", v: "postgres://u:p@db.internal:5432/app" },
  { k: "STRIPE_SECRET_KEY", v: "sk_live_72Mky8qRt9tWnOpC" },
  { k: "JWT_SIGNING_KEY", v: "kJ9f2LmN8aQq3PzVxT4wYrUi" },
  { k: "OPENAI_API_KEY", v: "sk-proj-AbcDef123xyz456" },
  { k: "SENTRY_DSN", v: "https://abc@o42.ingest.sentry.io/99" },
];

function VaultExhibit() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <SectionLabel n="I">Exhibit · the vault</SectionLabel>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
              <span className="text-neutral-100">A row, a blob,</span>
              <br />
              <span className="text-neutral-500">no second column.</span>
            </h2>
            <p className="mt-6 text-[16px] text-neutral-400 leading-[1.75] max-w-md">
              The editor on the right is the actual product. Hover any
              row to peek; the value lives in your tab and nowhere else.
              The smaller frame below shows what the database stores —
              the same row, reduced to ciphertext.
            </p>
            <SmallList
              items={[
                "AES-256-GCM, in the browser",
                "PBKDF2-SHA256 · 210,000 iterations",
                "RSA-OAEP, when keys are re-wrapped",
              ]}
            />
          </div>
          <div className="lg:col-span-7 space-y-6">
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
                    className="grid grid-cols-[36px_180px_1fr] items-baseline gap-3 px-3 hover:bg-white/[0.015]"
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
                      {hover === i ? r.v : "•".repeat(Math.min(r.v.length, 28))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-3 h-9 flex items-center justify-between border-t border-neutral-900 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                <span>5 of 12 · hover to peek</span>
                <span className="font-mono normal-case tracking-normal text-neutral-600">
                  ciphertext, on every save
                </span>
              </div>
            </FigureFrame>

            <FigureFrame caption="Fig. 02 — the database, plainly">
              <div className="px-4 py-4 font-mono text-[12px] text-neutral-400 leading-[1.8]">
                <div className="text-neutral-500">— column · value</div>
                <div className="mt-2 grid grid-cols-[110px_1fr] gap-x-6 gap-y-1">
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

// ── Exhibit II — Inviting ─────────────────────────────────────────────────

function InviteExhibit() {
  const [tab, setTab] = useState<"link" | "user" | "team">("link");
  const [copied, setCopied] = useState(false);
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <SectionLabel n="II">Exhibit · the invitation</SectionLabel>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
              <span className="text-neutral-100">Three ways</span>{" "}
              <span className="text-neutral-500">
                to bring one teammate, or sixty.
              </span>
            </h2>
            <p className="mt-6 text-[16px] text-neutral-400 leading-[1.75] max-w-md">
              Each method re-wraps the project key in the new member's
              browser. Our server moves wrapped bytes only, regardless
              of the channel.
            </p>
            <SmallList
              items={[
                "By link · one URL + one passphrase, on two channels",
                "By teammate · pulled from your existing collaborators",
                "By team · entire org units, in one stroke. (Q3)",
              ]}
            />
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
                          layoutId="conservatory-invite-underline"
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
                      <div className="md:col-span-2 mt-2 text-[12px] font-mono text-neutral-500 leading-relaxed">
                        Once accepted, the project key is re-wrapped for
                        the new member's public key inside their browser.
                        We forward the wrapped bytes; we never see the
                        unwrap.
                      </div>
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
                      <p className="text-[15px] text-neutral-400 leading-[1.75]">
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
              Fig. 03 — invitations, three modes
            </div>
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

// ── Exhibit III — The wire (GitHub) ──────────────────────────────────────

const GH_LIST = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SIGNING_KEY",
  "STRIPE_SECRET_KEY",
  "OPENAI_API_KEY",
  "SENTRY_DSN",
];

function WireExhibit() {
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
            <SectionLabel n="III">Exhibit · the wire</SectionLabel>
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

// ── Exhibit IV — The ledger (history with diff) ──────────────────────────

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
];

function LedgerExhibit() {
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
    <section>
      <Shell>
        <div className="max-w-2xl">
          <SectionLabel n="IV">Exhibit · the ledger</SectionLabel>
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
            <span className="text-neutral-100">Every save signed.</span>{" "}
            <span className="text-neutral-500">
              Every change recallable.
            </span>
          </h2>
          <p className="mt-6 text-[16px] text-neutral-400 leading-[1.75]">
            The server returns the matching ciphertexts; your browser
            decrypts and renders them. The audit log is the only one we
            know of that we cannot read.
          </p>
        </div>

        <div className="mt-10">
          <FigureFrame caption="Fig. 05 — the ledger, searched">
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
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
                <div className="max-h-[320px] overflow-auto">
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
                            <span className="text-neutral-300">+{p.add}</span>{" "}
                            <span className="text-neutral-500">−{p.del}</span>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.25em]">
                            {p.when} ago
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
                  <span className="text-neutral-500 italic font-serif normal-case">
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
      </Shell>
    </section>
  );
}

// ── Exhibit V — Numbers + pricing ────────────────────────────────────────

function NumbersExhibit() {
  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <SectionLabel n="V">Exhibit · the numbers</SectionLabel>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.08] tracking-tight">
              <span className="text-neutral-100">Small.</span>{" "}
              <span className="text-neutral-500">By design.</span>
            </h2>
            <p className="mt-6 text-[16px] text-neutral-400 leading-[1.75] max-w-md">
              We think you should know how small we are before you sign
              up. Every figure here is real, and every figure is
              modest. The blog follows them as they move.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-8">
              <NumberRow k="users">77</NumberRow>
              <NumberRow k="projects">89</NumberRow>
              <NumberRow k="versions">1,086</NumberRow>
              <NumberRow k="stars">30</NumberRow>
              <NumberRow k="plan">$0</NumberRow>
              <NumberRow k="our knowledge">0 bits</NumberRow>
              <NumberRow k="time to first secret">≈3 min</NumberRow>
              <NumberRow k="cipher">aes-256</NumberRow>
            </div>
          </div>
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

// ── Pull quotes ──────────────────────────────────────────────────────────

function Quotes() {
  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 max-w-5xl">
          <blockquote>
            <p className="font-serif italic text-xl md:text-[24px] text-neutral-200 leading-[1.5] tracking-tight">
              &ldquo;The invite link flow took me roughly fifteen
              seconds, and my teammate was decrypting production values
              on his side a minute later.&rdquo;
            </p>
            <div className="mt-5 text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              — Jerzy Wiśniewski · signosh
            </div>
          </blockquote>
          <blockquote>
            <p className="font-serif italic text-xl md:text-[24px] text-neutral-200 leading-[1.5] tracking-tight">
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
          The conservatory closes here. The vault opens at the next click.
        </motion.h2>
        <p className="mt-6 text-lg text-neutral-400 leading-[1.7] max-w-xl">
          Sign in with GitHub, mint a passphrase in the browser, paste
          your first value. The exhibits above belong to your project
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
            <Pin /> Cryptly · the conservatory · MIT
          </span>
          <span className="normal-case tracking-normal text-neutral-500 italic font-serif">
            Lit dimly, on purpose.
          </span>
        </div>
      </Shell>
    </footer>
  );
}

export function VariantH() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 overflow-x-hidden">
      <Header />
      <Hero />
      <Rule />
      <VaultExhibit />
      <Rule />
      <InviteExhibit />
      <Rule />
      <WireExhibit />
      <Rule />
      <LedgerExhibit />
      <Rule />
      <NumbersExhibit />
      <Rule />
      <Quotes />
      <Coda />
      <Colophon />
    </div>
  );
}
