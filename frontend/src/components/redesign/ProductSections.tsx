import { BracketsIcon } from "@/components/ui/BracketsIcon";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { HistoryIcon } from "@/components/ui/HistoryIcon";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { IconBrandGithub, IconUsers } from "@tabler/icons-react";
import {
  ArrowDownUp,
  Check,
  Copy,
  CornerDownLeft,
  KeyRound,
  Link2,
  Lock,
  Minus,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SectionShell } from "./common";

function SectionTitle({
  title,
  subtitle,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto text-center">
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

function GithubEditorTabs() {
  const tabs = [
    { id: "editor", label: "Editor", Icon: BracketsIcon, active: true },
    { id: "history", label: "History", Icon: HistoryIcon, active: false },
    { id: "members", label: "Members", Icon: IconUsers, active: false },
    {
      id: "integrations",
      label: "GitHub secrets",
      Icon: IconBrandGithub,
      active: false,
    },
  ];
  return (
    <div className="flex h-14 items-center justify-between px-3 border-b border-border/50 bg-card/20 backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center gap-1">
        {tabs.map((t) => (
          <div
            key={t.id}
            className={cn(
              "relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md",
              t.active ? "text-primary" : "text-muted-foreground"
            )}
          >
            {t.active && (
              <div className="absolute inset-0 bg-neutral-800 rounded-md" />
            )}
            <t.Icon className="relative z-10 size-4" />
            <span className="relative z-10">{t.label}</span>
          </div>
        ))}
      </div>
      <div />
    </div>
  );
}

// ── Three-pillars section ────────────────────────────────────────────────────
export function ThreePillarsSection() {
  const pillars = [
    {
      Icon: Lock,
      title: "Zero-trust storage.",
      body: (
        <>
          Every secret is AES-256 encrypted inside your browser before it ever
          leaves your device. Our database only ever sees a ciphertext blob —
          we could not read your secrets if a court ordered us to.
        </>
      ),
      accent: "text-sky-300",
      tile: "bg-sky-500/10 border-sky-500/20 text-sky-300",
    },
    {
      Icon: Users,
      title: "Secure collaboration.",
      body: (
        <>
          Invite your team into a project. The vault is re-wrapped for each
          member's public key in your browser, so shared secrets stay
          end-to-end encrypted. No plaintext. No "just Slack me the .env".{" "}
          <a
            href="https://cryptly.dev/blog/how-inviting-works"
            target="_blank"
            rel="noreferrer"
            className="text-neutral-200 underline decoration-neutral-700 underline-offset-4 hover:decoration-neutral-400"
          >
            See how invites work
          </a>
          .
        </>
      ),
      accent: "text-emerald-300",
      tile: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    },
    {
      Icon: null,
      title: "GitHub Actions sync.",
      body: (
        <>
          Push secrets straight into GitHub Actions with one click. Your
          browser re-encrypts each value against the repo's public key. We
          forward ciphertext — never see what's inside.
        </>
      ),
      accent: "text-neutral-200",
      tile: "bg-white/5 border-neutral-700/50 text-white",
    },
  ] as const;

  return (
    <SectionShell>
      <SectionTitle
        title="The whole pitch, in three lines."
        subtitle="Storage, collaboration, and deployment — each one built so we never hold the key."
      />
      <div className="mt-20 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto">
        {pillars.map((p, i) => (
          <div
            key={i}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6 md:p-7 flex flex-col"
          >
            <div
              className={cn(
                "h-10 w-10 rounded-xl border grid place-items-center",
                p.tile
              )}
            >
              {p.Icon ? (
                <p.Icon className="h-5 w-5" />
              ) : (
                <GitHubIcon className="h-5 w-5" />
              )}
            </div>
            <div className="mt-5 text-lg font-semibold text-neutral-100 tracking-tight">
              {p.title}
            </div>
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Invite section — 3 ways ──────────────────────────────────────────────────
type InviteMethod = "link" | "suggested" | "teams";

export function InviteSection() {
  const [method, setMethod] = useState<InviteMethod>("link");

  return (
    <SectionShell>
      <SectionTitle title="Bring your team." />

      <div className="mt-16 md:mt-20 max-w-3xl mx-auto">
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

        <Card className="overflow-hidden">
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

function MethodIntro({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="text-sm font-semibold text-neutral-100">{title}</div>
      <p className="mt-1 text-sm text-neutral-400 leading-relaxed">{children}</p>
    </div>
  );
}

function InviteLinkMethod() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const link = "cryptly.dev/invite/a3f9-k2m-7bxQ";
  const tempPassphrase = "sunrise-otter-42";
  const copy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setter(true);
    window.setTimeout(() => setter(false), 1400);
  };
  return (
    <MethodWrap>
      <MethodIntro title="Link and a passphrase.">
        Cryptly mints a one-time link and a passphrase. Send each over a different channel — a leaked link alone is useless.{" "}
        <a
          href="https://cryptly.dev/blog/how-inviting-works"
          target="_blank"
          rel="noreferrer"
          className="text-neutral-300 underline decoration-neutral-700 underline-offset-4 hover:decoration-neutral-400"
        >
          We wrote about it here.
        </a>
      </MethodIntro>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-neutral-500 shrink-0" />
          <div className="flex-1 rounded-md bg-neutral-950 border border-neutral-900 px-3 py-2 text-sm font-mono text-neutral-300 truncate">
            https://{link}
          </div>
          <button
            type="button"
            onClick={() => copy(`https://${link}`, setCopiedLink)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors",
              copiedLink
                ? "border-emerald-700/50 text-emerald-400 bg-emerald-500/5"
                : "bg-white text-black hover:bg-neutral-100 border-transparent"
            )}
          >
            {copiedLink ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-neutral-500 shrink-0" />
          <div className="flex-1 rounded-md bg-neutral-950 border border-neutral-900 px-3 py-2 text-sm font-mono text-sky-300 truncate">
            {tempPassphrase}
          </div>
          <button
            type="button"
            onClick={() => copy(tempPassphrase, setCopiedPass)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors",
              copiedPass
                ? "border-emerald-700/50 text-emerald-400 bg-emerald-500/5"
                : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border-neutral-800"
            )}
          >
            {copiedPass ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
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
  ];
  return (
    <MethodWrap>
      <MethodIntro title="Invite who's already around.">
        We pull collaborators you've already worked with in your Cryptly projects.
      </MethodIntro>
      <div className="rounded-xl border border-neutral-800 bg-black/40 divide-y divide-neutral-900">
        {people.map((p) => {
          const isAdded = !!added[p.id];
          return (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
              <img
                src={p.avatar}
                alt=""
                className="h-7 w-7 rounded-full border border-neutral-800"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-neutral-200 truncate">
                  {p.name}
                </div>
                <div className="text-xs text-neutral-600 font-mono truncate">
                  @{p.handle}
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
      <MethodIntro title="Invite a whole team at once.">
        Define groups once and grant project access
        to all of them with a single click. Coming soon.
      </MethodIntro>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {teams.map((t) => (
          <div
            key={t.name}
            className="rounded-lg border border-dashed border-neutral-800 bg-black/30 p-4"
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
            <div className="text-xs text-neutral-500">{t.members} members</div>
          </div>
        ))}
      </div>
    </MethodWrap>
  );
}

// ── GitHub integration section ──────────────────────────────────────────────
const SYNC_SECRETS = [
  { key: "DATABASE_URL", value: "postgres://u:p@db.internal/app" },
  { key: "REDIS_URL", value: "redis://default:r3dis@redis:6379" },
  { key: "JWT_SECRET", value: "kJ9f2LmN8aQq3PzVxT4wYrUi" },
  { key: "STRIPE_SECRET_KEY", value: "sk_live_72Mky8qRt9tWnOpC" },
  { key: "OPENAI_API_KEY", value: "sk-proj-AbcDef123xyz456" },
  { key: "SENTRY_DSN", value: "https://abc@o42.ingest.sentry.io/99" },
];

export function GithubSyncSection() {
  const [pushedCount, setPushedCount] = useState(0);
  const [running, setRunning] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  const run = () => {
    clearTimers();
    setRunning(true);
    setPushedCount(0);

    SYNC_SECRETS.forEach((_, i) => {
      timersRef.current.push(
        window.setTimeout(
          () => setPushedCount(i + 1),
          300 + i * 220
        )
      );
    });
    timersRef.current.push(
      window.setTimeout(
        () => setRunning(false),
        300 + SYNC_SECRETS.length * 220 + 200
      )
    );
  };

  useEffect(() => clearTimers, []);

  const done = !running && pushedCount === SYNC_SECRETS.length;

  return (
    <SectionShell>
      <SectionTitle
        title="GitHub integration."
        subtitle="Push every secret into GitHub Actions with one click. We re-encrypt each value against the repo's public key in your browser — GitHub gets what it expects, we never see plaintext."
      />

      <div className="mt-20 md:mt-24 max-w-6xl mx-auto">
        <Card className="overflow-hidden p-0 bg-black">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            {/* Left: Cryptly editor — replica of the real product */}
            <div className="relative flex flex-col border-b md:border-b-0 md:border-r border-neutral-900 bg-background">
              <GithubEditorTabs />
              <div className="font-mono text-[13px] leading-[1.9] py-3">
                {SYNC_SECRETS.map((r, i) => (
                  <div
                    key={r.key}
                    className="group flex items-stretch hover:bg-white/[0.025] transition-colors"
                  >
                    <span className="w-12 px-3 text-right text-neutral-700 border-r border-neutral-900 shrink-0 select-none py-0.5 tabular-nums">
                      {i + 1}
                    </span>
                    <div className="pl-6 pr-4 py-0.5 flex items-baseline min-w-0 flex-1">
                      <span className="text-sky-400 shrink-0">{r.key}</span>
                      <span className="text-neutral-500 shrink-0">=</span>
                      <span className="text-neutral-500 truncate min-w-0">
                        {"•".repeat(Math.min(r.value.length, 22))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none">
                <div className="pointer-events-auto">
                  <MagneticPushButton
                    running={running}
                    done={done}
                    onClick={run}
                  />
                </div>
              </div>
            </div>

            {/* Right: GitHub UI mimic — fixed height so the card doesn't jump */}
            <div className="bg-[#0d1117] flex flex-col">
              <div className="flex items-center gap-2 h-11 px-4 border-b border-[#30363d] text-[11px] text-[#8b949e]">
                <GitHubIcon className="h-3.5 w-3.5 text-white" />
                <span className="text-white">cryptly-dev / api</span>
                <span>›</span>
                <span>Settings</span>
                <span>›</span>
                <span>Secrets and variables</span>
                <span>›</span>
                <span className="text-white">Actions</span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-[#e6edf3] text-[20px] font-semibold leading-tight">
                  Actions secrets and variables
                </h3>
                <p className="mt-2 text-[13px] text-[#8b949e] leading-relaxed">
                  Secrets and variables allow you to manage reusable
                  configuration data.{" "}
                  <span className="text-[#4493f8]">Learn more.</span>
                </p>

                <div className="mt-4 flex items-center gap-5 border-b border-[#30363d]">
                  <div className="relative pb-2 text-[13px] text-[#e6edf3] font-medium">
                    Secrets
                    <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#f78166]" />
                  </div>
                  <div className="pb-2 text-[13px] text-[#8b949e]">
                    Variables
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <h4 className="text-[#e6edf3] text-[14px] font-semibold">
                    Repository secrets
                  </h4>
                  <button
                    type="button"
                    className="rounded-md bg-[#238636] hover:bg-[#2ea043] px-3 py-1.5 text-[12px] font-medium text-white border border-[#2ea043]/40"
                  >
                    New repository secret
                  </button>
                </div>

                <div className="mt-3 rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden flex flex-col">
                  <div className="grid grid-cols-[1fr_140px_80px] items-center gap-2 px-4 h-9 bg-[#161b22] border-b border-[#30363d] text-[11px] font-medium text-[#8b949e] flex-shrink-0">
                    <span>Name</span>
                    <span>Last updated</span>
                    <span />
                  </div>
                  {/* Reserve space so the card doesn't jump as rows append */}
                  <div
                    className="relative"
                    style={{ height: SYNC_SECRETS.length * 40 }}
                  >
                    {pushedCount === 0 && (
                      <div className="absolute inset-0 grid place-items-center text-[13px] text-[#8b949e]">
                        This environment has no secrets.
                      </div>
                    )}
                    <div className="absolute inset-0 divide-y divide-[#21262d]">
                      <AnimatePresence initial={false}>
                        {SYNC_SECRETS.slice(0, pushedCount).map((r) => (
                          <motion.div
                            key={r.key}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="grid grid-cols-[1fr_140px_80px] items-center gap-2 px-4 h-10 text-[13px] hover:bg-white/[0.02]"
                          >
                            <span className="flex items-center gap-2 text-[#e6edf3] min-w-0">
                              <Lock className="h-3.5 w-3.5 text-[#8b949e] shrink-0" />
                              <span className="font-mono truncate">
                                {r.key}
                              </span>
                            </span>
                            <span className="text-[#8b949e]">just now</span>
                            <span className="flex items-center gap-3 justify-end text-[#8b949e]">
                              <Pencil className="h-3.5 w-3.5 hover:text-[#e6edf3]" />
                              <Trash2 className="h-3.5 w-3.5 hover:text-[#e6edf3]" />
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

function MagneticPushButton({
  running,
  done,
  onClick,
}: {
  running: boolean;
  done: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const sx = useSpring(x, { stiffness: 360, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 360, damping: 28, mass: 0.5 });
  const sScale = useSpring(scale, { stiffness: 320, damping: 22 });

  useEffect(() => {
    const OUTER = 200;
    const INNER = 70;
    const handle = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distance = Math.hypot(dx, dy);
      if (distance < INNER) {
        x.set(dx);
        y.set(dy);
        scale.set(1.08);
      } else if (distance < OUTER) {
        const t = (OUTER - distance) / (OUTER - INNER);
        const pull = Math.pow(t, 1.6) * 0.35;
        x.set(dx * pull);
        y.set(dy * pull);
        scale.set(1 + t * 0.02);
      } else {
        x.set(0);
        y.set(0);
        scale.set(1);
      }
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [x, y, scale]);

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={running}
      style={{ x: sx, y: sy, scale: sScale }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full bg-white text-black h-12 px-7 text-sm font-semibold tracking-tight",
        running && "cursor-wait"
      )}
    >
      {running ? (
        <>
          <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
          Pushing…
        </>
      ) : done ? (
        <>
          <Check className="h-4 w-4" />
          Pushed
        </>
      ) : (
        "Push"
      )}
    </motion.button>
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

type SearchMode = "added" | "removed" | "changed" | "anywhere";

interface SearchSuggestion {
  mode: SearchMode;
  icon: LucideIcon;
  iconBg: string;
  iconFg: string;
  verb: React.ReactNode;
}

const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  {
    mode: "added",
    icon: Plus,
    iconBg: "bg-emerald-500/15",
    iconFg: "text-emerald-400",
    verb: (
      <>
        was <span className="text-emerald-400 font-medium">added</span>
      </>
    ),
  },
  {
    mode: "removed",
    icon: Minus,
    iconBg: "bg-rose-500/15",
    iconFg: "text-rose-400",
    verb: (
      <>
        was <span className="text-rose-400 font-medium">removed</span>
      </>
    ),
  },
  {
    mode: "changed",
    icon: ArrowDownUp,
    iconBg: "bg-neutral-800",
    iconFg: "text-neutral-300",
    verb: <>was added or removed</>,
  },
  {
    mode: "anywhere",
    icon: Sparkles,
    iconBg: "bg-neutral-800",
    iconFg: "text-neutral-300",
    verb: <>appears anywhere</>,
  },
];

function patchDiffContent(p: HistoryPatch): string {
  return p.diff.map((d) => d.text).join("\n");
}

function matchesHistory(
  p: HistoryPatch,
  query: string,
  mode: SearchMode
): boolean {
  const q = query.toLowerCase();
  const content = patchDiffContent(p);
  if (mode === "anywhere") {
    return (
      p.author.name.toLowerCase().includes(q) ||
      content.toLowerCase().includes(q)
    );
  }
  const lines = content.split("\n");
  const isAdded = (l: string) => l.startsWith("+") && !l.startsWith("+++");
  const isRemoved = (l: string) => l.startsWith("-") && !l.startsWith("---");
  for (const line of lines) {
    if (!line.toLowerCase().includes(q)) continue;
    if (mode === "added" && isAdded(line)) return true;
    if (mode === "removed" && isRemoved(line)) return true;
    if (mode === "changed" && (isAdded(line) || isRemoved(line))) return true;
  }
  return false;
}

export function HistorySection() {
  const [selectedId, setSelectedId] = useState(PATCHES[0].id);
  const [timeRange, setTimeRange] = useState("all");
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [activeMode, setActiveMode] = useState<SearchMode | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchRootRef = useRef<HTMLDivElement>(null);

  const selected = PATCHES.find((p) => p.id === selectedId) ?? PATCHES[0];

  const trimmedQuery = query.trim();
  const effectiveMode: SearchMode = activeMode ?? "anywhere";
  const showSuggestions = suggestionsOpen && trimmedQuery.length > 0;
  const activeSuggestion =
    activeMode != null
      ? SEARCH_SUGGESTIONS.find((s) => s.mode === activeMode)
      : null;

  const filtered = PATCHES.filter((p) => {
    if (authorFilter && p.author.id !== authorFilter) return false;
    if (timeRange === "24h" && !/^(\d+m|\dh)$/.test(p.when)) return false;
    if (timeRange === "7d" && p.when.endsWith("d") && parseInt(p.when) > 7)
      return false;
    if (trimmedQuery && !matchesHistory(p, trimmedQuery, effectiveMode))
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

  const applyMode = (mode: SearchMode) => {
    setActiveMode(mode);
    setSuggestionsOpen(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery("");
    setActiveMode(null);
    setSuggestionsOpen(false);
  };

  useEffect(() => {
    if (!showSuggestions) return;
    setHighlightIdx((idx) =>
      idx >= SEARCH_SUGGESTIONS.length || idx < 0 ? 0 : idx
    );
  }, [showSuggestions]);

  useEffect(() => {
    if (!suggestionsOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        searchRootRef.current &&
        !searchRootRef.current.contains(e.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [suggestionsOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typingInInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "/" && !typingInInput) {
        e.preventDefault();
        inputRef.current?.focus();
        if (trimmedQuery) setSuggestionsOpen(true);
        return;
      }

      if (target === inputRef.current) {
        if (showSuggestions) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIdx((i) => (i + 1) % SEARCH_SUGGESTIONS.length);
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIdx(
              (i) =>
                (i - 1 + SEARCH_SUGGESTIONS.length) % SEARCH_SUGGESTIONS.length
            );
            return;
          }
          if (e.key === "Enter") {
            e.preventDefault();
            applyMode(SEARCH_SUGGESTIONS[highlightIdx].mode);
            return;
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setSuggestionsOpen(false);
            return;
          }
        }
        if (e.key === "Escape") {
          e.preventDefault();
          clearSearch();
          inputRef.current?.blur();
          return;
        }
        return;
      }

      if (typingInInput) return;
      if (filtered.length === 0) return;
      const currentIdx = filtered.findIndex((p) => p.id === selectedId);
      const moveBy = (delta: number) => {
        e.preventDefault();
        if (
          document.activeElement instanceof HTMLElement &&
          document.activeElement.tagName === "BUTTON"
        ) {
          document.activeElement.blur();
        }
        const nextIdx =
          currentIdx < 0
            ? 0
            : Math.max(0, Math.min(filtered.length - 1, currentIdx + delta));
        const next = filtered[nextIdx];
        if (next) setSelectedId(next.id);
      };
      if (
        (e.key === "j" || e.key === "ArrowDown") &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        moveBy(1);
      } else if (
        (e.key === "k" || e.key === "ArrowUp") &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        moveBy(-1);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [filtered, selectedId, showSuggestions, highlightIdx, trimmedQuery]);

  return (
    <SectionShell>
      <SectionTitle
        title="Time travel, with receipts."
        subtitle="Every save becomes a signed diff. Scrub through months of rotations, filter by who touched what, and search inside the diff itself — decrypted only in your browser, never on our servers."
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
              <div
                ref={searchRootRef}
                className="relative border-b border-border/50 bg-neutral-900"
              >
                <div className="relative flex items-center h-10">
                  {activeSuggestion ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode(null);
                        if (trimmedQuery) setSuggestionsOpen(true);
                        inputRef.current?.focus();
                      }}
                      className={cn(
                        "flex items-center gap-1 ml-2 pl-1.5 pr-1.5 h-6 rounded-md text-[11px] font-medium cursor-pointer hover:brightness-110 transition-all flex-shrink-0",
                        activeSuggestion.iconBg,
                        activeSuggestion.iconFg
                      )}
                      title="Change mode"
                    >
                      <activeSuggestion.icon className="size-3" />
                      <span className="capitalize">
                        {activeSuggestion.mode}
                      </span>
                      <X className="size-2.5 opacity-60" />
                    </button>
                  ) : (
                    <Search className="ml-3 size-3.5 text-muted-foreground pointer-events-none flex-shrink-0" />
                  )}
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                      const next = e.target.value;
                      setQuery(next);
                      setHighlightIdx(0);
                      if (next.trim().length === 0) {
                        setActiveMode(null);
                        setSuggestionsOpen(false);
                      } else if (!activeMode) {
                        setSuggestionsOpen(true);
                      }
                    }}
                    onFocus={() => {
                      if (trimmedQuery && !activeMode) setSuggestionsOpen(true);
                    }}
                    placeholder={
                      activeSuggestion
                        ? "Refine your search…"
                        : "Search edits — author, diff content…"
                    }
                    className="flex-1 h-full bg-transparent border-0 pl-2.5 pr-10 text-sm font-mono placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {query || activeMode ? (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="p-1 rounded-sm hover:bg-neutral-800 cursor-pointer"
                        aria-label="Clear search"
                      >
                        <X className="size-3" />
                      </button>
                    ) : (
                      <Kbd className="bg-neutral-800 text-neutral-400 border border-border/60">
                        /
                      </Kbd>
                    )}
                  </div>
                </div>

                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 z-40 border-x border-b border-border/70 bg-neutral-950/95 backdrop-blur-md shadow-2xl shadow-black/50">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium border-b border-border/50 bg-black/40">
                      What do you mean by{" "}
                      <span className="text-foreground font-mono normal-case">
                        "{trimmedQuery}"
                      </span>
                      ?
                    </div>
                    <div className="py-1">
                      {SEARCH_SUGGESTIONS.map((s, i) => {
                        const Icon = s.icon;
                        const isHighlighted = i === highlightIdx;
                        return (
                          <button
                            key={s.mode}
                            type="button"
                            onClick={() => applyMode(s.mode)}
                            onMouseEnter={() => setHighlightIdx(i)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-1.5 text-left cursor-pointer transition-colors focus:outline-none",
                              isHighlighted
                                ? "bg-neutral-800/80"
                                : "hover:bg-neutral-900/60"
                            )}
                          >
                            <div
                              className={cn(
                                "flex items-center justify-center size-5 rounded-md flex-shrink-0",
                                s.iconBg,
                                s.iconFg
                              )}
                            >
                              <Icon className="size-3" />
                            </div>
                            <div className="flex-1 min-w-0 text-sm">
                              <span className="font-mono text-foreground">
                                "{trimmedQuery}"
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {s.verb}
                              </span>
                            </div>
                            {isHighlighted && (
                              <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60 px-1 flex-shrink-0">
                                <CornerDownLeft className="size-2.5" />
                              </Kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/50 bg-black/40 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60 px-1">
                            ↑
                          </Kbd>
                          <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60 px-1">
                            ↓
                          </Kbd>
                          <span>navigate</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60 px-1">
                            ↵
                          </Kbd>
                          <span>apply</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Kbd className="bg-neutral-800 text-neutral-300 border border-border/60 px-1">
                            esc
                          </Kbd>
                          <span>dismiss</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
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
              {/* Heatmap — GitHub-style grid */}
              <div className="px-4 pt-3 pb-3 border-t border-border/50 bg-card/20">
                <HistoryHeatmap />
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

        <div className="mt-6 text-center text-xs text-muted-foreground">
          All decrypted client-side. The server only sees the ciphertext blobs.
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

function HistoryHeatmap() {
  const WEEKS = 22;
  const SQ = 11;
  const GAP = 3;
  // Seeded pseudo-random sequence for stable visuals
  const counts: number[] = [];
  let seed = 0x9e3779b9;
  for (let i = 0; i < WEEKS * 7; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const r = seed / 0x7fffffff;
    // bias toward mid-low values, with occasional bursts
    const v = r < 0.4 ? 0 : r < 0.7 ? 1 + Math.floor(r * 3) : 3 + Math.floor(r * 7);
    counts.push(v);
  }
  const intensity = (n: number) => {
    if (n === 0) return "rgba(255,255,255,0.04)";
    if (n === 1) return "rgba(96,165,250,0.35)";
    if (n < 4) return "rgba(96,165,250,0.55)";
    if (n < 8) return "rgba(96,165,250,0.8)";
    return "rgb(96,165,250)";
  };
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <div>
      <div className="flex items-start">
        <div
          className="relative flex-shrink-0 text-[9px] text-muted-foreground"
          style={{ width: 22, height: 7 * (SQ + GAP) - GAP }}
        >
          <span className="absolute" style={{ top: (SQ + GAP) * 1 - 2 }}>
            Mon
          </span>
          <span className="absolute" style={{ top: (SQ + GAP) * 3 - 2 }}>
            Wed
          </span>
          <span className="absolute" style={{ top: (SQ + GAP) * 5 - 2 }}>
            Fri
          </span>
        </div>
        <div className="flex" style={{ gap: GAP }}>
          {Array.from({ length: WEEKS }).map((_, w) => (
            <div
              key={w}
              className="flex flex-col"
              style={{ gap: GAP }}
            >
              {Array.from({ length: 7 }).map((_, d) => {
                const n = counts[w * 7 + d];
                return (
                  <div
                    key={d}
                    className="rounded-[2px]"
                    style={{
                      width: SQ,
                      height: SQ,
                      backgroundColor: intensity(n),
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground">
        <span className="tabular-nums">{total} changes · last {WEEKS}w</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {[0, 1, 3, 6, 9].map((n, i) => (
            <span
              key={i}
              className="rounded-[2px]"
              style={{
                width: 10,
                height: 10,
                backgroundColor: intensity(n),
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
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
