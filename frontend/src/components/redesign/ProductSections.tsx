import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import {
  ArrowDownUp,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Copy,
  GitBranch,
  Link2,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SectionShell } from "./common";

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

// ── Invite section — 3 ways ──────────────────────────────────────────────────
type InviteMethod = "link" | "suggested" | "teams";

export function InviteSection() {
  const [method, setMethod] = useState<InviteMethod>("link");

  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Bring in your team"
        title="Three ways in. None of them leak your vault."
        subtitle="They generate their own keypair. We re-wrap the project key for them. Plaintext stays on your device."
      />

      <div className="mt-20 md:mt-24 max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex rounded-full border border-neutral-800 bg-neutral-950/60 p-1">
            {(
              [
                { id: "link", label: "Invite link", Icon: Link2, soon: false },
                {
                  id: "suggested",
                  label: "Suggested users",
                  Icon: Sparkles,
                  soon: false,
                },
                { id: "teams", label: "Teams", Icon: Users, soon: true },
              ] as const
            ).map((t) => {
              const active = method === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setMethod(t.id)}
                  className={cn(
                    "relative px-4 py-2 text-sm rounded-full transition-colors inline-flex items-center gap-2",
                    active
                      ? "text-black"
                      : "text-neutral-400 hover:text-neutral-200"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="invite-tab"
                      className="absolute inset-0 rounded-full bg-white"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 32,
                      }}
                    />
                  )}
                  <t.Icon className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10">{t.label}</span>
                  {t.soon && (
                    <span
                      className={cn(
                        "relative z-10 ml-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider border",
                        active
                          ? "bg-black/10 text-black/60 border-black/20"
                          : "bg-neutral-900 text-neutral-500 border-neutral-800"
                      )}
                    >
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Card className="overflow-hidden min-h-[320px]">
          <AnimatePresence mode="wait">
            {method === "link" && <InviteLinkMethod key="link" />}
            {method === "suggested" && <InviteSuggestedMethod key="suggested" />}
            {method === "teams" && <InviteTeamsMethod key="teams" />}
          </AnimatePresence>
        </Card>
      </div>
    </SectionShell>
  );
}

function MethodWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="p-6 md:p-8"
    >
      {children}
    </motion.div>
  );
}

function InviteLinkMethod() {
  const [copied, setCopied] = useState(false);
  const link = "cryptly.dev/invite/a3f9-k2m-7bxQ";
  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://${link}`).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <MethodWrap>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
        <Link2 className="h-3 w-3" /> A link worth sharing
      </div>
      <div className="mt-3 text-xl font-semibold text-neutral-100">
        Send a link. They unlock it with their own passphrase.
      </div>
      <p className="mt-2 text-sm text-neutral-400">
        The link is a handshake — not a key. Useless on its own.
      </p>

      <div className="mt-6 rounded-xl border border-neutral-800 bg-black/50 p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-md bg-neutral-950 border border-neutral-900 px-3 py-2 text-sm font-mono text-neutral-300 truncate">
            https://{link}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors",
              copied
                ? "border-emerald-700/50 text-emerald-400 bg-emerald-500/5"
                : "bg-white text-black hover:bg-neutral-100 border-transparent"
            )}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy link
              </>
            )}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-neutral-300">
            Role: Write
            <ChevronDown className="h-3 w-3 text-neutral-500" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-neutral-300">
            <Clock className="h-3 w-3 text-neutral-500" />
            Expires in 24 hours
            <ChevronDown className="h-3 w-3 text-neutral-500" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-neutral-300">
            <Shield className="h-3 w-3 text-neutral-500" />
            One-time
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 text-xs text-neutral-500">
        <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          When they click it they generate their own keypair. Your browser
          re-wraps the project key against their public key. At no point does a
          plaintext secret leave your device.
        </span>
      </div>
    </MethodWrap>
  );
}

function InviteSuggestedMethod() {
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const people: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    reason: string;
  }[] = [
    {
      id: "alex",
      name: "Alex Chen",
      handle: "alexchen",
      avatar: "/avatars/alex-chen.svg",
      reason: "Collaborator on cryptly-dev/api",
    },
    {
      id: "marcus",
      name: "Marcus Rodriguez",
      handle: "mrodriguez",
      avatar: "/avatars/marcus-rodriguez.svg",
      reason: "Commits to cryptly-dev/api last week",
    },
    {
      id: "priya",
      name: "Priya Patel",
      handle: "ppatel",
      avatar: "/avatars/priya-patel.svg",
      reason: "Owns cryptly-dev/web-frontend",
    },
    {
      id: "nina",
      name: "Nina Gupta",
      handle: "ngupta",
      avatar: "/avatars/nina-gupta.svg",
      reason: "Reviewed 3 PRs in cryptly-dev/api",
    },
  ];
  return (
    <MethodWrap>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
        <Sparkles className="h-3 w-3" /> Smart guesses, no snooping
      </div>
      <div className="mt-3 text-xl font-semibold text-neutral-100">
        People your repo already trusts.
      </div>
      <p className="mt-2 text-sm text-neutral-400">
        Pulled from your GitHub repo's collaborators in your browser. We don't
        see this list — your browser just asks GitHub directly.
      </p>

      <div className="mt-6 rounded-xl border border-neutral-800 bg-black/40 divide-y divide-neutral-900">
        {people.map((p) => {
          const isAdded = !!added[p.id];
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <img
                src={p.avatar}
                alt=""
                className="h-8 w-8 rounded-full border border-neutral-800"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-neutral-200 truncate">
                  {p.name}{" "}
                  <span className="text-neutral-600 font-mono">@{p.handle}</span>
                </div>
                <div className="text-xs text-neutral-500 truncate">
                  {p.reason}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAdded((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  isAdded
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-white text-black hover:bg-neutral-100"
                )}
              >
                {isAdded ? (
                  <>
                    <Check className="h-3 w-3" /> Added
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3" /> Add
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-start gap-2 text-xs text-neutral-500">
        <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          Your GitHub token never touches our backend. The "suggest" endpoint
          is just <code className="text-neutral-300">fetch</code> from your
          browser to github.com.
        </span>
      </div>
    </MethodWrap>
  );
}

function InviteTeamsMethod() {
  const teams = [
    {
      name: "Core engineering",
      members: 8,
      avatars: [
        "/avatars/alex-chen.svg",
        "/avatars/marcus-rodriguez.svg",
        "/avatars/priya-patel.svg",
        "/avatars/nina-gupta.svg",
      ],
    },
    {
      name: "Infra & SRE",
      members: 4,
      avatars: [
        "/avatars/david-kim.svg",
        "/avatars/emily-park.svg",
        "/avatars/james-wilson.svg",
      ],
    },
    {
      name: "Frontend",
      members: 6,
      avatars: [
        "/avatars/jessica-taylor.svg",
        "/avatars/lisa-zhang.svg",
        "/avatars/sarah-williams.svg",
        "/avatars/ryan-cooper.svg",
      ],
    },
  ];
  return (
    <MethodWrap>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
        <Users className="h-3 w-3" /> Coming soon
      </div>
      <div className="mt-3 text-xl font-semibold text-neutral-100">
        Invite a whole team with a click.
      </div>
      <p className="mt-2 text-sm text-neutral-400">
        Group collaborators into teams and manage their access in one place.
        Launching alongside SSO later this year.
      </p>

      <div className="mt-6 relative rounded-xl border border-dashed border-neutral-800 bg-black/30 p-5">
        <div className="absolute top-3 right-3 inline-flex items-center rounded-full bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-neutral-400">
          Preview
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {teams.map((t) => (
            <div
              key={t.name}
              className="rounded-lg border border-neutral-900 bg-neutral-950/80 p-4"
            >
              <div className="flex -space-x-2">
                {t.avatars.slice(0, 4).map((a, i) => (
                  <img
                    key={i}
                    src={a}
                    alt=""
                    className="h-7 w-7 rounded-full border-2 border-neutral-950"
                  />
                ))}
                {t.members > 4 && (
                  <div className="h-7 w-7 rounded-full border-2 border-neutral-950 bg-neutral-900 text-[10px] text-neutral-400 flex items-center justify-center">
                    +{t.members - 4}
                  </div>
                )}
              </div>
              <div className="mt-3 text-sm text-neutral-200 font-medium">
                {t.name}
              </div>
              <div className="text-xs text-neutral-500">
                {t.members} members
              </div>
              <button
                type="button"
                disabled
                className="mt-3 w-full rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs text-neutral-500 cursor-not-allowed"
              >
                Invite team
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 text-xs text-neutral-500">
        Want early access?{" "}
        <a
          href="https://github.com/cryptly-dev/cryptly/issues"
          target="_blank"
          rel="noreferrer"
          className="text-neutral-300 underline decoration-neutral-700 underline-offset-4 hover:decoration-neutral-400"
        >
          Tell us in the issues
        </a>
        .
      </div>
    </MethodWrap>
  );
}

// ── GitHub sync section ──────────────────────────────────────────────────────
type SyncStatus = "idle" | "pending" | "syncing" | "synced";

const SYNC_SECRETS = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "STRIPE_SECRET_KEY",
  "OPENAI_API_KEY",
  "SENTRY_DSN",
  "CLOUDFLARE_API_TOKEN",
  "GITHUB_APP_PRIVATE_KEY",
];

export function GithubSyncSection() {
  const [status, setStatus] = useState<SyncStatus[]>(
    SYNC_SECRETS.map(() => "pending")
  );
  const [running, setRunning] = useState(false);
  const [doneAt, setDoneAt] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  const run = () => {
    clearTimers();
    setRunning(true);
    setDoneAt(null);
    setStatus(SYNC_SECRETS.map(() => "pending"));

    SYNC_SECRETS.forEach((_, i) => {
      const startAt = 200 + i * 90;
      timersRef.current.push(
        window.setTimeout(() => {
          setStatus((prev) => {
            const next = [...prev];
            next[i] = "syncing";
            return next;
          });
        }, startAt)
      );
      timersRef.current.push(
        window.setTimeout(() => {
          setStatus((prev) => {
            const next = [...prev];
            next[i] = "synced";
            return next;
          });
        }, startAt + 260)
      );
    });
    const total = 200 + SYNC_SECRETS.length * 90 + 260;
    timersRef.current.push(
      window.setTimeout(() => {
        setRunning(false);
        setDoneAt(Math.round(total));
      }, total)
    );
  };

  useEffect(() => {
    run();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncedCount = status.filter((s) => s === "synced").length;
  const progress = (syncedCount / SYNC_SECRETS.length) * 100;

  return (
    <SectionShell>
      <SectionTitle
        eyebrow="GitHub Actions · one-click sync"
        title="Push every secret to every repo. Never decrypted on our side."
        subtitle="Your browser decrypts locally, re-encrypts each value against each repo's public key, and calls the GitHub API. We forward ciphertext and a smile."
      />

      <div className="mt-20 md:mt-24 max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          {/* Header — Cryptly → GitHub */}
          <div className="px-5 py-4 border-b border-neutral-900 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center h-8 w-8 rounded-lg bg-white text-black font-bold text-xs">
                c
              </div>
              <div className="text-sm">
                <div className="text-neutral-200 font-medium">
                  cryptly / production
                </div>
                <div className="text-[11px] text-neutral-500">
                  {SYNC_SECRETS.length} secrets tracked
                </div>
              </div>
            </div>
            <div className="flex-1 relative mx-2">
              <div className="h-px bg-neutral-900 w-full" />
              <motion.div
                className="absolute inset-0 flex items-center"
                animate={{ x: running ? ["0%", "100%"] : "0%" }}
                transition={{
                  duration: 1.6,
                  repeat: running ? Infinity : 0,
                  ease: "linear",
                }}
              >
                <div className="h-1.5 w-10 rounded-full bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <GitHubIcon className="h-5 w-5" />
              <div className="text-sm">
                <div className="text-neutral-200 font-medium">
                  cryptly-dev/api
                </div>
                <div className="text-[11px] text-neutral-500 inline-flex items-center gap-1">
                  <GitBranch className="h-3 w-3" /> main
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-neutral-900/80 relative">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-500 via-emerald-500 to-emerald-400"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>

          {/* Secret list */}
          <div className="divide-y divide-neutral-900">
            {SYNC_SECRETS.map((key, i) => {
              const s = status[i];
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 px-5 py-2.5"
                >
                  <span className="font-mono text-sm text-sky-400 flex-1 truncate">
                    {key}
                  </span>
                  <span className="text-[11px] text-neutral-600 font-mono hidden md:inline">
                    {s === "synced" ? "pushed via GitHub API" : "re-encrypting locally"}
                  </span>
                  <div className="w-24 flex items-center justify-end">
                    {s === "pending" && (
                      <span className="text-[11px] text-neutral-600">
                        queued
                      </span>
                    )}
                    {s === "syncing" && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-sky-400">
                        <span className="h-3 w-3 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin" />
                        pushing
                      </span>
                    )}
                    {s === "synced" && (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400"
                      >
                        <Check className="h-3.5 w-3.5" />
                        synced
                      </motion.span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer / CTA */}
          <div className="px-5 py-4 border-t border-neutral-900 flex items-center justify-between gap-3 bg-black/30">
            <div className="text-xs text-neutral-500">
              {running ? (
                <span>
                  Pushing{" "}
                  <span className="text-neutral-200 tabular-nums">
                    {syncedCount}
                  </span>{" "}
                  of {SYNC_SECRETS.length} · ciphertext only
                </span>
              ) : doneAt != null ? (
                <span className="text-emerald-400 inline-flex items-center gap-2">
                  <Check className="h-3.5 w-3.5" />
                  {SYNC_SECRETS.length} secrets synced in {doneAt}ms
                </span>
              ) : (
                <span>Ready to sync</span>
              )}
            </div>
            <button
              type="button"
              onClick={run}
              disabled={running}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                running
                  ? "bg-neutral-900 text-neutral-500 cursor-wait"
                  : "bg-white text-black hover:bg-neutral-100"
              )}
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", running && "animate-spin")}
              />
              {running ? "Syncing…" : doneAt != null ? "Sync again" : "Push to GitHub"}
            </button>
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-neutral-500">
          <div className="rounded-xl border border-neutral-900 bg-neutral-950/40 px-4 py-3">
            <div className="text-neutral-200 font-medium text-sm">
              Decrypted locally
            </div>
            <div className="mt-1">Your passphrase unwraps the project key in your browser.</div>
          </div>
          <div className="rounded-xl border border-neutral-900 bg-neutral-950/40 px-4 py-3">
            <div className="text-neutral-200 font-medium text-sm">
              Re-encrypted per repo
            </div>
            <div className="mt-1">Each value is wrapped against GitHub's per-repo public key.</div>
          </div>
          <div className="rounded-xl border border-neutral-900 bg-neutral-950/40 px-4 py-3">
            <div className="text-neutral-200 font-medium text-sm">
              Pushed via GitHub API
            </div>
            <div className="mt-1">Our server relays the bytes — never sees them in the clear.</div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

// ── History section ──────────────────────────────────────────────────────────

type HistoryAuthor = {
  id: string;
  name: string;
  first: string;
  avatar: string;
};

const AUTHORS: Record<string, HistoryAuthor> = {
  alex: {
    id: "alex",
    name: "Alex Chen",
    first: "Alex",
    avatar: "/avatars/alex-chen.svg",
  },
  marcus: {
    id: "marcus",
    name: "Marcus Rodriguez",
    first: "Marcus",
    avatar: "/avatars/marcus-rodriguez.svg",
  },
  priya: {
    id: "priya",
    name: "Priya Patel",
    first: "Priya",
    avatar: "/avatars/priya-patel.svg",
  },
  nina: {
    id: "nina",
    name: "Nina Gupta",
    first: "Nina",
    avatar: "/avatars/nina-gupta.svg",
  },
};

type HistoryPatch = {
  id: string;
  author: HistoryAuthor;
  additions: number;
  deletions: number;
  when: string;
  diff: { kind: "eq" | "add" | "del" | "hunk" | "comment"; text: string }[];
};

const PATCHES: HistoryPatch[] = [
  {
    id: "p1",
    author: AUTHORS.alex,
    additions: 1,
    deletions: 1,
    when: "2m",
    diff: [
      { kind: "hunk", text: "@@ production / .env @@" },
      { kind: "eq", text: " DATABASE_URL=postgres://u:p@db.internal/app" },
      { kind: "del", text: "-STRIPE_SECRET_KEY=sk_live_51Nxj7pLkQr9mVbXc" },
      { kind: "add", text: "+STRIPE_SECRET_KEY=sk_live_72Mky8qRt9tWnOpC" },
      { kind: "eq", text: " JWT_SECRET=kJ9f2LmN8aQq3PzVxT4wYrUi" },
      { kind: "eq", text: " OPENAI_API_KEY=sk-proj-AbcDef123xyz456" },
      { kind: "eq", text: " SENTRY_DSN=https://abc@o42.ingest.sentry.io/99" },
    ],
  },
  {
    id: "p2",
    author: AUTHORS.marcus,
    additions: 2,
    deletions: 0,
    when: "14m",
    diff: [
      { kind: "hunk", text: "@@ production / .env @@" },
      { kind: "eq", text: " DATABASE_URL=postgres://u:p@db.internal/app" },
      { kind: "eq", text: " STRIPE_SECRET_KEY=sk_live_72Mky8qRt9tWnOpC" },
      { kind: "eq", text: " JWT_SECRET=kJ9f2LmN8aQq3PzVxT4wYrUi" },
      { kind: "comment", text: " # observability" },
      { kind: "add", text: "+OPENAI_API_KEY=sk-proj-AbcDef123xyz456" },
      { kind: "add", text: "+SENTRY_DSN=https://abc@o42.ingest.sentry.io/99" },
    ],
  },
  {
    id: "p3",
    author: AUTHORS.priya,
    additions: 2,
    deletions: 2,
    when: "1h",
    diff: [
      { kind: "hunk", text: "@@ production / .env @@" },
      { kind: "del", text: "-DATABASE_URL=postgres://u:p@db-old.internal/app" },
      { kind: "add", text: "+DATABASE_URL=postgres://u:p@db.internal/app" },
      { kind: "del", text: "-JWT_SECRET=aBcDeFg1234567890HiJkLmN" },
      { kind: "add", text: "+JWT_SECRET=kJ9f2LmN8aQq3PzVxT4wYrUi" },
      { kind: "eq", text: " STRIPE_SECRET_KEY=sk_live_72Mky8qRt9tWnOpC" },
    ],
  },
  {
    id: "p4",
    author: AUTHORS.alex,
    additions: 0,
    deletions: 1,
    when: "3h",
    diff: [
      { kind: "hunk", text: "@@ production / .env @@" },
      { kind: "eq", text: " DATABASE_URL=postgres://u:p@db.internal/app" },
      { kind: "del", text: "-REDIS_URL=redis://default:legacy@redis-old:6379" },
      { kind: "eq", text: " STRIPE_SECRET_KEY=sk_live_72Mky8qRt9tWnOpC" },
    ],
  },
  {
    id: "p5",
    author: AUTHORS.nina,
    additions: 3,
    deletions: 0,
    when: "1d",
    diff: [
      { kind: "hunk", text: "@@ production / .env @@" },
      { kind: "comment", text: " # feature flags for Q2" },
      { kind: "add", text: "+FEATURE_CHECKOUT_V2=true" },
      { kind: "add", text: "+FEATURE_ONBOARDING_V3=true" },
      { kind: "add", text: "+FEATURE_AI_SUGGEST=false" },
      { kind: "eq", text: " DATABASE_URL=postgres://u:p@db.internal/app" },
    ],
  },
  {
    id: "p6",
    author: AUTHORS.marcus,
    additions: 8,
    deletions: 0,
    when: "1d",
    diff: [
      { kind: "hunk", text: "@@ production / .env @@ bulk import" },
      { kind: "add", text: "+DATABASE_URL=postgres://u:p@db.internal/app" },
      { kind: "add", text: "+REDIS_URL=redis://default:r3dis@redis:6379" },
      { kind: "add", text: "+JWT_SECRET=aBcDeFg1234567890HiJkLmN" },
      { kind: "add", text: "+STRIPE_SECRET_KEY=sk_live_51Nxj7pLkQr9mVbXc" },
      { kind: "add", text: "+SENDGRID_API_KEY=SG.abcDefGhiJkl123456" },
      { kind: "add", text: "+CLOUDFLARE_API_TOKEN=cf_tok_Xy9mN2pQ7rStUvWx" },
      { kind: "add", text: "+GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA…-----" },
      { kind: "add", text: "+GOOGLE_OAUTH_SECRET=GOCSPX-abcDefGhi123" },
    ],
  },
  {
    id: "p7",
    author: AUTHORS.priya,
    additions: 0,
    deletions: 1,
    when: "2d",
    diff: [
      { kind: "hunk", text: "@@ production / .env @@" },
      { kind: "eq", text: " DATABASE_URL=postgres://u:p@db.internal/app" },
      { kind: "del", text: "-NEWRELIC_LICENSE_KEY=nr_legacy_unused_key" },
      { kind: "eq", text: " SENTRY_DSN=https://abc@o42.ingest.sentry.io/99" },
    ],
  },
  {
    id: "p8",
    author: AUTHORS.alex,
    additions: 1,
    deletions: 0,
    when: "3d",
    diff: [
      { kind: "hunk", text: "@@ production / .env @@" },
      { kind: "eq", text: " DATABASE_URL=postgres://u:p@db.internal/app" },
      { kind: "add", text: "+CLOUDFLARE_API_TOKEN=cf_tok_Xy9mN2pQ7rStUvWx" },
    ],
  },
];

const TIME_RANGES = [
  { key: "all", label: "All" },
  { key: "24h", label: "-24h" },
  { key: "7d", label: "-7d" },
  { key: "30d", label: "-30d" },
];

export function HistorySection() {
  const [selectedId, setSelectedId] = useState(PATCHES[0].id);
  const [timeRange, setTimeRange] = useState("all");
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);

  const selected = PATCHES.find((p) => p.id === selectedId) ?? PATCHES[0];

  const filtered = PATCHES.filter((p) => {
    if (authorFilter && p.author.id !== authorFilter) return false;
    if (timeRange === "24h" && !/^(\d+m|\dh)$/.test(p.when)) return false;
    if (timeRange === "7d" && p.when.endsWith("d") && parseInt(p.when) > 7)
      return false;
    return true;
  });

  const maxVolume = Math.max(
    1,
    ...PATCHES.map((p) => p.additions + p.deletions)
  );

  const authors = [
    { ...AUTHORS.alex, count: PATCHES.filter((p) => p.author.id === "alex").length },
    { ...AUTHORS.marcus, count: PATCHES.filter((p) => p.author.id === "marcus").length },
    { ...AUTHORS.priya, count: PATCHES.filter((p) => p.author.id === "priya").length },
  ];

  return (
    <SectionShell>
      <SectionTitle
        eyebrow="History tab · the real thing"
        title="Every save is a diff, with a face on it."
        subtitle="The history tab of the app, rendered right here. Click a row, see the diff. Yes — it's the same component."
      />

      <div className="mt-20 md:mt-24 max-w-6xl mx-auto">
        <div className="rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl shadow-black/60 bg-background">
          {/* Tab strip */}
          <HistoryTabStrip />
          {/* History split view */}
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] h-[560px] bg-background">
            {/* Sidebar */}
            <div className="flex flex-col border-r border-border/50 bg-[#0a0a0a] min-h-0">
              {/* Search bar */}
              <div className="relative border-b border-border/50 bg-neutral-900">
                <div className="flex items-center h-10">
                  <Search className="ml-3 size-3.5 text-muted-foreground pointer-events-none flex-shrink-0" />
                  <input
                    placeholder="Search edits — author, email, diff content…"
                    className="flex-1 h-full bg-transparent border-0 pl-2.5 pr-10 text-sm font-mono placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Kbd className="bg-neutral-800 text-neutral-400 border border-border/60">
                      /
                    </Kbd>
                  </div>
                </div>
              </div>
              {/* Filters */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 overflow-x-auto">
                {TIME_RANGES.map((r) => (
                  <HistoryChip
                    key={r.key}
                    active={timeRange === r.key}
                    onClick={() => setTimeRange(r.key)}
                  >
                    {r.label}
                  </HistoryChip>
                ))}
                <div className="flex-1" />
                {authors.map((a) => (
                  <HistoryChip
                    key={a.id}
                    active={authorFilter === a.id}
                    onClick={() =>
                      setAuthorFilter(authorFilter === a.id ? null : a.id)
                    }
                  >
                    <span className="inline-block align-middle truncate max-w-[60px]">
                      {a.first}
                    </span>{" "}
                    <span className="opacity-60">({a.count})</span>
                  </HistoryChip>
                ))}
              </div>
              {/* List */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {filtered.length === 0 ? (
                  <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No results
                  </div>
                ) : (
                  filtered.map((patch) => {
                    const isSelected = patch.id === selected.id;
                    const volume = patch.additions + patch.deletions;
                    const addRatio = patch.additions / Math.max(volume, 1);
                    const barWidthPct = (volume / maxVolume) * 100;
                    return (
                      <button
                        key={patch.id}
                        onClick={() => setSelectedId(patch.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 border-l-2 cursor-pointer transition-colors text-left focus:outline-none",
                          isSelected
                            ? "bg-neutral-900 border-primary"
                            : "border-transparent hover:bg-neutral-900/60"
                        )}
                      >
                        <img
                          src={patch.author.avatar}
                          alt=""
                          className="size-5 rounded-full object-cover flex-shrink-0"
                        />
                        <span
                          className={cn(
                            "text-sm truncate flex-1 min-w-0",
                            isSelected
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          {patch.author.name}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] font-mono tabular-nums">
                            <span className="text-emerald-400">
                              +{patch.additions}
                            </span>{" "}
                            <span className="text-rose-400">
                              -{patch.deletions}
                            </span>
                          </span>
                          <div className="w-[60px] h-1 bg-neutral-800/60 flex overflow-hidden rounded-full">
                            <div
                              className="h-full bg-emerald-500/80"
                              style={{
                                width: `${barWidthPct * addRatio}%`,
                              }}
                            />
                            <div
                              className="h-full bg-rose-500/80"
                              style={{
                                width: `${barWidthPct * (1 - addRatio)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-muted-foreground tabular-nums w-8 text-right">
                            {patch.when}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              {/* Mini heatmap */}
              <div className="px-4 pt-3 pb-3 border-t border-border/50 bg-card/20">
                <div className="flex items-end gap-0.5 h-10">
                  {[1, 2, 4, 3, 6, 2, 1, 0, 3, 5, 7, 4, 2, 1, 3, 5, 8, 6, 3, 2, 1, 0, 4, 6, 9, 5, 3, 1, 2, 4].map(
                    (n, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 rounded-[2px]",
                          n === 0 && "bg-neutral-900",
                          n > 0 && n <= 2 && "bg-emerald-500/20",
                          n > 2 && n <= 5 && "bg-emerald-500/40",
                          n > 5 && "bg-emerald-500/70"
                        )}
                        style={{ height: `${20 + n * 8}%` }}
                      />
                    )
                  )}
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    last 30 days
                  </span>
                  <span className="tabular-nums">
                    {PATCHES.length} changes
                  </span>
                </div>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-border/50 bg-black/60 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60">
                      j
                    </Kbd>
                    <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60">
                      k
                    </Kbd>
                    <span className="ml-1">navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60">
                      /
                    </Kbd>
                    <span className="ml-1">search</span>
                  </span>
                </div>
                <span className="tabular-nums">
                  {filtered.length}/{PATCHES.length}
                </span>
              </div>
            </div>

            {/* Diff pane */}
            <div className="min-h-0 flex flex-col bg-black">
              <div className="px-4 py-2.5 border-b border-border/50 flex items-center gap-3 bg-neutral-950/60">
                <img
                  src={selected.author.avatar}
                  alt=""
                  className="size-6 rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-foreground truncate">
                    {selected.author.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {selected.when} ago · production / .env
                  </div>
                </div>
                <div className="text-[11px] font-mono tabular-nums flex items-center gap-2">
                  <span className="text-emerald-400">+{selected.additions}</span>
                  <span className="text-rose-400">-{selected.deletions}</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto font-mono text-[12px] leading-6 p-4 min-h-0">
                {selected.diff.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-3 px-2 -mx-2 rounded",
                      line.kind === "add" &&
                        "text-emerald-300 bg-emerald-500/[0.06]",
                      line.kind === "del" &&
                        "text-rose-300 bg-rose-500/[0.06]",
                      line.kind === "hunk" && "text-sky-400/80 italic",
                      line.kind === "comment" && "text-neutral-500 italic",
                      line.kind === "eq" && "text-neutral-400"
                    )}
                  >
                    <span className="w-4 shrink-0 select-none text-neutral-600">
                      {line.kind === "add"
                        ? "+"
                        : line.kind === "del"
                          ? "-"
                          : line.kind === "hunk"
                            ? " "
                            : " "}
                    </span>
                    <span className="whitespace-pre-wrap break-all">
                      {line.text.replace(/^[+\- ]/, "")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-3 w-3 text-emerald-400" /> adds
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Minus className="h-3 w-3 text-rose-400" /> removes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ArrowDownUp className="h-3 w-3 text-neutral-400" /> rotations
          </span>
          <span>·</span>
          <span>All decrypted client-side. The server only sees the ciphertext blobs.</span>
        </div>
      </div>
    </SectionShell>
  );
}

function HistoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 py-0.5 text-[11px] rounded-full border cursor-pointer whitespace-nowrap transition-colors flex-shrink-0",
        active
          ? "bg-primary/15 border-primary/40 text-primary"
          : "bg-neutral-900 border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {children}
    </button>
  );
}

function HistoryTabStrip() {
  const tabs = [
    { id: "editor", label: "Editor", icon: "{ }", active: false },
    { id: "history", label: "History", icon: "⟲", active: true },
    { id: "members", label: "Members", icon: "◴", active: false },
    { id: "github", label: "GitHub secrets", icon: "", active: false },
  ];
  return (
    <div className="flex items-center gap-1 px-3 h-12 border-b border-border/50 bg-card/20">
      {tabs.map((t) => (
        <div
          key={t.id}
          className={cn(
            "relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md",
            t.active ? "text-primary" : "text-muted-foreground"
          )}
        >
          {t.active && (
            <div className="absolute inset-0 bg-neutral-800 rounded-md" />
          )}
          {t.id === "github" ? (
            <GitHubIcon className="relative z-10 size-4" />
          ) : (
            <span className="relative z-10 font-mono text-xs">{t.icon}</span>
          )}
          <span className="relative z-10">{t.label}</span>
        </div>
      ))}
    </div>
  );
}
