import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { CryptlyLogo } from "@/components/ui/CryptlyLogo";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Copy,
  Search,
  Users,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────────
 * Cryptly landing. Soft layered card surfaces; app-grade primitives.
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
    <section className="min-h-screen flex items-center pt-28 pb-12">
      <Shell className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-semibold text-foreground leading-[0.98] tracking-tight">
              Your secrets
              <br />
              are none of
              <br />
              <span className="text-muted-foreground">our business.</span>
            </h1>
            <p className="mt-8 text-lg text-muted-foreground max-w-xl leading-[1.75]">
              Cryptly is a small, open source secrets manager. Every value
              is encrypted before it leaves your browser — so even we
              can't read it. Free, forever.
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
            </div>

            <div className="mt-8 flex flex-nowrap items-center gap-x-4 text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5">
                <Pin /> Free forever
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Pin /> Zero-knowledge
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Pin /> MIT licensed
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroMock />
            <Caption>Fig. 01 — the editor, in repose</Caption>
          </div>
        </div>
      </Shell>
    </section>
  );
}

const HERO_ROWS = [
  { k: "DATABASE_URL", dots: 22 },
  { k: "STRIPE_SECRET_KEY", dots: 16 },
  { k: "OPENAI_API_KEY", dots: 18 },
];

function HeroMock() {
  return (
    <Card>
      <div className="font-mono text-[13px] leading-[2] py-5 px-4">
        {HERO_ROWS.map((r, i) => (
          <div
            key={i}
            className="flex items-baseline gap-3 px-2 py-1 whitespace-nowrap"
          >
            <span className="w-6 text-right text-muted-foreground/50 tabular-nums flex-shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-medium" style={{ color: ACCENT }}>
              {r.k}
            </span>
            <span className="text-muted-foreground/50">=</span>
            <span className="text-muted-foreground/70">
              {"•".repeat(r.dots)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Movement I — The vault (Excel-style table) ────────────────────────────

const VAULT_ROWS = [
  {
    id: "68d1...",
    project: "68cf...",
    blob: "u2l9aFZbk3Pj+Q7WkS9QfwDfMnLvSsC6XgYh1xZ8pQrT+88k/4Lr2Nh==",
  },
  {
    id: "68d2...",
    project: "68cf...",
    blob: "fWn4pQ0R8sUvZ2Ah6YgKm9XcTdL4PrBv0WsEq1iNy+Oa7uKp3JxCh2==",
  },
  {
    id: "68d3...",
    project: "6a14...",
    blob: "cXpLm7nBd+TrKq9aEf1RtYz5OvHgWuJi2SkNc8MxPqDbZ0Af6ExBn4==",
  },
];

function VaultMovement() {
  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-3xl md:text-5xl font-semibold text-foreground leading-[1.08] tracking-tight">
              <span className="text-foreground">
                One column for the blob.
              </span>{" "}
              <span className="text-muted-foreground">
                None for the value.
              </span>
            </h2>
            <p className="mt-7 text-[16px] text-muted-foreground leading-[1.75] max-w-md">
              Here is our entire secrets table. The{" "}
              <code className="text-foreground rounded bg-neutral-800/60 px-1 py-0.5 text-[13px]">
                blob
              </code>{" "}
              column is the whole secret, encrypted before it left your
              browser. There is no second column where the plaintext
              lives, and no function to produce it on demand.
            </p>
            <SmallList
              items={[
                "Encrypted before it leaves your browser",
                "Keys derived from your passphrase, never shared",
                "Re-wrapped for each collaborator, never copied",
              ]}
            />
          </div>
          <div className="lg:col-span-7">
            <Card>
              <CardChrome
                left={<span>secrets · 3 of 1,086 rows</span>}
                right={<span style={{ color: ACCENT }}>schema</span>}
              />
              <div className="overflow-hidden">
                <table className="w-full font-mono text-[12px] text-left table-fixed">
                  <thead>
                    <tr className="bg-neutral-900/60 border-b border-border/50 text-muted-foreground/80 text-[10px] uppercase tracking-[0.2em]">
                      <th className="px-4 py-2.5 font-medium w-[88px]">id</th>
                      <th className="px-4 py-2.5 font-medium w-[92px]">
                        project
                      </th>
                      <th className="px-4 py-2.5 font-medium">blob</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VAULT_ROWS.map((r, i) => (
                      <tr
                        key={r.id}
                        className={cn(
                          "border-b border-border/40 last:border-b-0 hover:bg-neutral-800/30 transition-colors",
                          i % 2 === 1 && "bg-neutral-900/30"
                        )}
                      >
                        <td className="px-4 py-2.5 text-foreground/90 truncate">
                          {r.id}
                        </td>
                        <td className="px-4 py-2.5 text-foreground/70 truncate">
                          {r.project}
                        </td>
                        <td className="px-4 py-2.5 text-foreground/90 truncate">
                          <span className="inline-flex items-center gap-1.5 rounded bg-neutral-800/60 px-1.5 py-0.5 text-[11px] max-w-full">
                            <span
                              className="h-1 w-1 rounded-full flex-shrink-0"
                              style={{ backgroundColor: ACCENT }}
                            />
                            <span className="truncate">{r.blob}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t border-border/50 bg-neutral-900/40 text-[11px] font-mono text-muted-foreground/80 italic">
                The schema is short on purpose.
              </div>
            </Card>
            <Caption>Fig. 02 — secrets · the whole table</Caption>
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

// ── Movement II — Inviting (app-style sliding tabs) ───────────────────────

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
    <section>
      <Shell>
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-semibold text-foreground leading-[1.08] tracking-tight">
            <span className="text-foreground">Three ways to bring</span>{" "}
            <span className="text-muted-foreground">
              one teammate, or sixty of them.
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
                      <div className="absolute inset-0 rounded-md bg-neutral-800" />
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
              {tab === "link" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              )}

              {tab === "user" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                </div>
              )}

              {tab === "team" && (
                <div>
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
                </div>
              )}
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

const WIRE_PANEL_HEIGHT = 280;

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
    <section>
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-3xl md:text-5xl font-semibold text-foreground leading-[1.08] tracking-tight">
              <span className="text-foreground">One click</span>
              <br />
              <span className="text-muted-foreground">to GitHub Actions.</span>
            </h2>
            <p className="mt-6 text-[16px] text-muted-foreground leading-[1.75] max-w-md">
              The browser re-encrypts each value against the target
              repository's public key — the same primitive GitHub's own
              CLI uses — and forwards the ciphertext. We are the courier;
              GitHub is the recipient.
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
                <div className="border-b md:border-b-0 md:border-r border-border/50 flex flex-col">
                  <CardChrome
                    left={<span>cryptly vault</span>}
                    right={<span style={{ color: ACCENT }}>source</span>}
                  />
                  <div
                    className="p-2 font-mono text-[12px] leading-[1.95] overflow-hidden"
                    style={{ height: WIRE_PANEL_HEIGHT }}
                  >
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
                <div className="flex flex-col">
                  <CardChrome
                    left={
                      <span className="inline-flex items-center gap-1.5">
                        <GitHubIcon className="h-3 w-3" /> cryptly-dev/api
                      </span>
                    }
                    right={<span style={{ color: ACCENT }}>recipient</span>}
                  />
                  <div
                    className="p-2 relative overflow-hidden"
                    style={{ height: WIRE_PANEL_HEIGHT }}
                  >
                    {done.length === 0 && (
                      <div className="absolute inset-0 grid place-items-center text-[12px] font-mono text-muted-foreground/70">
                        none yet · press the button
                      </div>
                    )}
                    {done.map((i) => (
                      <div
                        key={i}
                        className="mx-1 px-2 py-1 rounded-md grid grid-cols-[1fr_auto] items-baseline gap-2 font-mono text-[12px] bg-neutral-800/30 leading-[1.95]"
                      >
                        <span className="text-foreground truncate">
                          {GH_LIST[i]}
                        </span>
                        <span className="text-muted-foreground/70 text-[10px] uppercase tracking-[0.25em]">
                          just now
                        </span>
                      </div>
                    ))}
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

// ── Movement IV — History (mirrors the real /app history list) ────────────

type Patch = {
  id: string;
  who: string;
  avatar: string;
  when: string;
  add: number;
  del: number;
  msg: string;
};

const PATCHES: Patch[] = [
  {
    id: "p1",
    who: "Alex Chen",
    avatar: "/avatars/alex-chen.svg",
    when: "2m",
    add: 1,
    del: 1,
    msg: "rotate STRIPE_SECRET_KEY",
  },
  {
    id: "p2",
    who: "Marcus Rodriguez",
    avatar: "/avatars/marcus-rodriguez.svg",
    when: "14m",
    add: 2,
    del: 0,
    msg: "add observability keys",
  },
  {
    id: "p3",
    who: "Priya Patel",
    avatar: "/avatars/priya-patel.svg",
    when: "1h",
    add: 1,
    del: 1,
    msg: "migrate DATABASE_URL",
  },
  {
    id: "p4",
    who: "Nina Gupta",
    avatar: "/avatars/nina-gupta.svg",
    when: "1d",
    add: 3,
    del: 0,
    msg: "Q2 feature flags",
  },
  {
    id: "p5",
    who: "Alex Chen",
    avatar: "/avatars/alex-chen.svg",
    when: "3d",
    add: 1,
    del: 0,
    msg: "cloudflare api token",
  },
  {
    id: "p6",
    who: "Marcus Rodriguez",
    avatar: "/avatars/marcus-rodriguez.svg",
    when: "5d",
    add: 0,
    del: 2,
    msg: "drop deprecated keys",
  },
];

const TIME_CHIPS = [
  { key: "all", label: "All time" },
  { key: "30", label: "30d" },
  { key: "7", label: "7d" },
  { key: "24", label: "24h" },
];

function HistoryMovement() {
  const [q, setQ] = useState("");
  const [range, setRange] = useState("all");
  const [selectedId, setSelectedId] = useState<string>("p1");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PATCHES;
    return PATCHES.filter(
      (p) =>
        p.who.toLowerCase().includes(s) || p.msg.toLowerCase().includes(s)
    );
  }, [q]);

  const maxVolume = useMemo(() => {
    let m = 0;
    for (const p of filtered) m = Math.max(m, p.add + p.del);
    return m || 1;
  }, [filtered]);

  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-3xl md:text-5xl font-semibold text-foreground leading-[1.08] tracking-tight">
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
                "Filter by time range or contributor",
                "Decrypted in your tab, never on ours",
              ]}
            />
          </div>

          <div className="lg:col-span-7">
            <Card>
              {/* Search row */}
              <div className="relative flex items-center h-10 border-b border-border/50 bg-neutral-900/60">
                <Search className="ml-3 size-3.5 text-muted-foreground pointer-events-none flex-shrink-0" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search edits — author, message…"
                  className="flex-1 h-full bg-transparent border-0 pl-2.5 pr-3 text-sm font-mono placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
                />
                <span className="mr-3 text-[11px] font-mono text-muted-foreground/80 tabular-nums">
                  {filtered.length}/{PATCHES.length}
                </span>
              </div>

              {/* Chip filters */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/50">
                {TIME_CHIPS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRange(r.key)}
                    className={cn(
                      "px-2.5 py-0.5 text-[11px] rounded-full border cursor-pointer whitespace-nowrap transition-colors",
                      range === r.key
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-neutral-900 border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="max-h-[360px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No results
                  </div>
                ) : (
                  filtered.map((p) => {
                    const isSelected = p.id === selectedId;
                    const volume = p.add + p.del;
                    const addRatio = volume ? p.add / volume : 0;
                    const barWidth = (volume / maxVolume) * 100;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedId(p.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 border-l-2 cursor-pointer transition-colors text-left focus:outline-none",
                          isSelected
                            ? "bg-neutral-800/60 border-primary"
                            : "border-transparent hover:bg-neutral-900/60"
                        )}
                      >
                        <img
                          src={p.avatar}
                          alt=""
                          className="size-5 rounded-full object-cover flex-shrink-0 grayscale opacity-90"
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className={cn(
                              "text-sm truncate",
                              isSelected
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                            )}
                          >
                            {p.who}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground/70 truncate">
                            {p.msg}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] font-mono tabular-nums">
                            <span className="text-emerald-400">+{p.add}</span>{" "}
                            <span className="text-rose-400">-{p.del}</span>
                          </span>
                          <div className="w-[80px] h-1 bg-neutral-800/60 flex overflow-hidden rounded-full">
                            <div
                              className="h-full bg-emerald-500/80"
                              style={{ width: `${barWidth * addRatio}%` }}
                            />
                            <div
                              className="h-full bg-rose-500/80"
                              style={{
                                width: `${barWidth * (1 - addRatio)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-muted-foreground tabular-nums w-10 text-right">
                            {p.when}
                          </span>
                        </div>
                      </button>
                    );
                  })
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
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-semibold text-foreground leading-[1.08] tracking-tight">
            <span className="text-foreground">
              Seventy-seven people trust us with their keys.
            </span>{" "}
            <span className="text-muted-foreground">
              We thought you should know that before you did.
            </span>
          </h2>
          <p className="mt-6 text-[16px] text-muted-foreground leading-[1.75] max-w-xl">
            Every count on the right is live — read from the same database
            your secrets would live in, if you joined tonight.
          </p>
        </div>

        <div className="mt-10">
          <Card>
            <CardChrome
              left={<span>the house · today</span>}
              right={<span style={{ color: ACCENT }}>live</span>}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/50">
              <StatCell k="users">77</StatCell>
              <StatCell k="projects">89</StatCell>
              <StatCell k="versions">1,086</StatCell>
              <StatCell k="stars">30</StatCell>
            </div>
          </Card>
          <Caption>Fig. 05 — the house, by the numbers</Caption>
        </div>
      </Shell>
    </section>
  );
}

function StatCell({
  k,
  children,
}: {
  k: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-8 md:py-10">
      <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
        {k}
      </div>
      <div className="mt-3 text-5xl md:text-6xl font-semibold text-foreground tabular-nums leading-none">
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
        <h2 className="text-3xl md:text-5xl font-semibold text-foreground leading-[1.05] tracking-tight max-w-3xl">
          Ready to be the 78th?
        </h2>
        <p className="mt-6 text-lg text-muted-foreground leading-[1.7] max-w-xl">
          Sign in, mint a passphrase in the browser, paste your first
          value. Three minutes, one vault, no charge.
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
        </div>
      </Shell>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border/50 pt-14 pb-10">
      <Shell>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="inline-flex items-center gap-2.5">
              <CryptlyLogo size={22} />
              <span className="font-semibold tracking-tight">Cryptly</span>
            </a>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              A small, open source secrets manager. Encrypted before it
              leaves your browser, never readable by us.
            </p>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
              Product
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="/app/login"
                  className="text-foreground/90 hover:text-foreground transition-colors"
                >
                  Open app
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-foreground/90 hover:text-foreground transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
              Resources
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="https://github.com/cryptly-dev/cryptly"
                  className="inline-flex items-center gap-1.5 text-foreground/90 hover:text-foreground transition-colors"
                >
                  <GitHubIcon className="h-3.5 w-3.5" />
                  Source code
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/cryptly-dev/cryptly/issues"
                  className="text-foreground/90 hover:text-foreground transition-colors"
                >
                  Report an issue
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
              Legal
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <span className="text-foreground/90">MIT License</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-muted-foreground">
          <span>© 2026 Cryptly. Built quietly.</span>
          <span className="inline-flex items-center gap-2">
            <Pin />
            Zero-knowledge by construction
          </span>
        </div>
      </Shell>
    </footer>
  );
}

export function IndexPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground overflow-x-clip relative">
      {/* Soft ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 40rem at 20% -10%, rgba(201,178,135,0.06), transparent 60%), radial-gradient(40rem 30rem at 90% 20%, rgba(255,255,255,0.03), transparent 60%)",
        }}
      />
      <BlogHeader />
      <Hero />
      <SoftDivider />
      <VaultMovement />
      <SoftDivider />
      <InviteMovement />
      <SoftDivider />
      <WireMovement />
      <SoftDivider />
      <HistoryMovement />
      <SoftDivider />
      <Numbers />
      <Coda />
      <Footer />
    </div>
  );
}
