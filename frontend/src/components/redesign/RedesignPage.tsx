import { ReviewsSection } from "@/components/index/ReviewsSection";
import { BracketsIcon } from "@/components/ui/BracketsIcon";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { HistoryIcon } from "@/components/ui/HistoryIcon";
import { SlidersIcon } from "@/components/ui/SlidersIcon";
import { cn } from "@/lib/utils";
import { IconBrandGithub, IconUsers } from "@tabler/icons-react";
import {
  ArrowRight,
  Book,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Fingerprint,
  FolderOpen,
  Heart,
  KeyRound,
  Lock,
  Plus,
  Send,
  Server,
  Shield,
  UserPlus,
} from "lucide-react";
import {
  GhostCTA,
  HoverRevealMask,
  MockEnvEditor,
  PrimaryCTA,
  SectionShell,
  fakeCiphertext,
} from "./common";

type Row = { key: string; value: string; comment?: boolean };

const ROWS: Row[] = [
  { key: "production credentials", value: "", comment: true },
  { key: "DATABASE_URL", value: "postgres://u:p@db.internal:5432/app" },
  { key: "STRIPE_SECRET_KEY", value: "sk_live_51Nxj7pLkQr9mVbXc" },
  { key: "JWT_SIGNING_KEY", value: "kJ9f2LmN8aQq3PzVxT4wYrUi" },
  { key: "OPENAI_API_KEY", value: "sk-proj-abcDef123xyz456" },
  { key: "SENTRY_DSN", value: "https://abc@o42.ingest.sentry.io/99" },
];

type MockProject = { name: string; timeAgo: string; active?: boolean };

const PROJECTS: MockProject[] = [
  { name: "api-service", timeAgo: "2m", active: true },
  { name: "web-app", timeAgo: "1h" },
  { name: "mobile", timeAgo: "3d" },
  { name: "admin-dashboard", timeAgo: "1w" },
];

type Tab = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
};

const TABS: Tab[] = [
  { id: "editor", label: "Editor", Icon: BracketsIcon, active: true },
  { id: "history", label: "History", Icon: HistoryIcon },
  { id: "members", label: "Members", Icon: IconUsers },
  { id: "integrations", label: "GitHub secrets", Icon: IconBrandGithub },
  { id: "settings", label: "Settings", Icon: SlidersIcon },
];

function ProEditor({ rows }: { rows: Row[] }) {
  return (
    <div className="font-mono text-[13px] leading-[1.9] h-full">
      {rows.map((r, i) => (
        <div
          key={i}
          className="group flex items-stretch hover:bg-white/[0.025] transition-colors"
        >
          <span className="w-12 px-3 text-right text-neutral-700 border-r border-neutral-900 shrink-0 select-none py-0.5 tabular-nums">
            {i + 1}
          </span>
          {r.comment ? (
            <div className="pl-6 pr-4 py-0.5 text-neutral-600 italic min-w-0 truncate">
              # {r.key}
            </div>
          ) : (
            <div className="pl-6 pr-4 py-0.5 flex items-baseline min-w-0 flex-1">
              <span className="text-sky-400 shrink-0">{r.key}</span>
              <span className="text-neutral-500 shrink-0">=</span>
              <HoverRevealMask
                value={r.value}
                className="text-neutral-300 truncate min-w-0"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MockSidebar() {
  return (
    <div className="h-full flex flex-col bg-card/40">
      <div className="flex-1 overflow-hidden flex flex-col pt-4">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <FolderOpen className="w-4 h-4" />
            <span>Projects</span>
            <span className="text-muted-foreground">({PROJECTS.length})</span>
          </div>
          <div className="text-muted-foreground rounded-md w-6 h-6 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 overflow-hidden px-2">
          <nav className="space-y-0.5">
            {PROJECTS.map((p) => (
              <div
                key={p.name}
                className={cn(
                  "group relative flex items-center justify-between gap-2 overflow-hidden rounded-sm px-3.5 py-2.5 text-sm transition-colors select-none",
                  p.active
                    ? "text-primary"
                    : "text-muted-foreground/55 hover:bg-neutral-800/40 hover:text-foreground"
                )}
              >
                {p.active && (
                  <div className="absolute inset-0 bg-neutral-800 rounded-sm pointer-events-none" />
                )}
                <div className="relative z-10 flex items-center gap-2 min-w-0 flex-1">
                  <span
                    aria-hidden
                    className="flex h-3 w-3 flex-shrink-0 items-center justify-center"
                  >
                    {p.active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "truncate block text-[15px] font-normal",
                      p.active && "[text-shadow:0_0_0.4px_currentColor]"
                    )}
                  >
                    {p.name}
                  </span>
                </div>
                <div className="relative z-10 flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={cn(
                      "text-[13px] tabular-nums",
                      p.active
                        ? "text-primary/70"
                        : "text-muted-foreground/40"
                    )}
                  >
                    {p.timeAgo}
                  </span>
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-border/50 p-3">
        <div className="w-full flex items-center gap-3 p-2 rounded-lg text-left">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-300 flex-shrink-0">
            EP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">emily-park</p>
            <p className="text-xs text-muted-foreground truncate">
              emily@acme.dev
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

function MockEditorTile() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex h-14 items-center justify-between px-3 border-b border-border/50 bg-card/20 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const { Icon } = tab;
            return (
              <div
                key={tab.id}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md",
                  tab.active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {tab.active && (
                  <div className="absolute inset-0 bg-neutral-800 rounded-md" />
                )}
                <Icon className="relative z-10 size-4" />
                <span className="relative z-10">{tab.label}</span>
              </div>
            );
          })}
        </div>
        <div />
      </div>

      <div className="flex-1 overflow-hidden py-3">
        <ProEditor rows={ROWS} />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center">
      <div className="mx-auto max-w-4xl w-full px-6 pt-24">
        <div className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-950 to-[#0a0a0c] overflow-hidden shadow-2xl shadow-black/70">
          <div className="flex h-[480px]">
            <aside className="h-full w-60 flex-shrink-0 border-r border-border/50">
              <MockSidebar />
            </aside>
            <main className="flex-1 h-full min-w-0">
              <MockEditorTile />
            </main>
          </div>
        </div>
      </div>

      <div
        className="mx-auto max-w-4xl w-full px-6 pb-24 text-center"
        style={{ marginTop: "2rem" }}
      >
        <h1 className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight">
          Secrets should be{" "}
          <span className="text-neutral-500">boring.</span>
          <br />
          We made them boring.
        </h1>
        <p className="mx-auto mt-6 text-lg text-neutral-400 max-w-2xl">
          Cryptly stores your{" "}
          <code className="text-neutral-200">.env</code> files encrypted in
          your browser. Our servers hold the ciphertext. The only thing we
          can see is that you exist.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Open dashboard</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Source on GitHub</span>
          </GhostCTA>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-neutral-400" /> End-to-end
            encrypted
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-neutral-400" /> Free, forever
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-neutral-400" /> Open source
          </span>
        </div>
      </div>
    </section>
  );
}

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
      {subtitle && <p className="mt-4 text-lg text-neutral-400">{subtitle}</p>}
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
        "rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

function TwoViewsSection() {
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
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Fingerprint className="h-3.5 w-3.5" /> You
            </span>
            <span>decrypted in-browser</span>
          </div>
          <div className="p-4">
            <MockEnvEditor
              showLineNumbers={false}
              rows={[
                { key: "DATABASE_URL", value: "postgres://u:p@db/app" },
                { key: "JWT_SECRET", value: "kJ9f2LmN8aQq3PzVxT" },
                { key: "STRIPE_KEY", value: "sk_live_abc123def456" },
              ]}
            />
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5" /> Our servers
            </span>
            <span>ciphertext only</span>
          </div>
          <div className="p-4 font-mono text-[11px] leading-5 text-neutral-500 break-all">
            {fakeCiphertext("cryptly-two-views", 520)}
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

function InviteSection() {
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Team"
        title="Invite someone without mailing them your vault."
        subtitle="They generate their own keypair. We re-wrap the project key for them. You never send plaintext."
      />
      <Card className="mt-20 md:mt-24 max-w-xl mx-auto">
        <div className="flex items-center gap-3">
          <UserPlus className="h-4 w-4 text-neutral-500 shrink-0" />
          <div className="flex-1 rounded-lg border border-neutral-800 bg-black px-3 py-2.5 text-sm text-neutral-300 font-mono select-none">
            david@team.dev
          </div>
          <div className="rounded-lg border border-neutral-800 bg-black px-3 py-2.5 text-sm text-neutral-300 inline-flex items-center gap-2 select-none">
            <span>Write</span>
            <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
          </div>
          <div className="rounded-full bg-white text-black px-4 py-2 text-sm font-medium inline-flex items-center gap-2 select-none">
            <Send className="h-3.5 w-3.5" />
            <span>Invite</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
          <Shield className="h-3.5 w-3.5" />
          <span>
            Your passphrase never leaves this device. They'll set their own.
          </span>
        </div>
      </Card>
    </SectionShell>
  );
}

function PricingSection() {
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Pricing"
        title="$0. Every feature. Every seat."
        subtitle="We don't have a team plan because we don't have a personal plan to sell you up from."
      />
      <div className="mt-20 md:mt-24 max-w-md mx-auto">
        <Card className="text-center">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500">
            One plan
          </div>
          <div className="mt-3 text-6xl font-semibold text-neutral-100">$0</div>
          <div className="mt-1 text-sm text-neutral-500">
            per seat · per month · per year · per whatever
          </div>
          <div className="mt-6 space-y-2 text-sm text-left">
            {[
              "Unlimited projects",
              "Unlimited secrets",
              "Unlimited team members",
              "Unlimited GitHub repos",
              "Unlimited everything, honestly",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 text-neutral-300"
              >
                <Check className="h-4 w-4 text-neutral-500" /> {f}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

function FinalCTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          One last thing
        </div>
        <h2 className="mt-4 text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.05]">
          Stop Slack-messaging your .env files.
        </h2>
        <p className="mt-5 text-neutral-400 text-lg leading-relaxed">
          Sign in with GitHub. Set a passphrase. Paste. You're done in three
          minutes, and you'll never paste a secret into a DM again.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <GitHubIcon className="h-4 w-4" />
            <span>Sign in with GitHub</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <Book className="h-4 w-4" />
            <span>Read the docs</span>
          </GhostCTA>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5" /> Free. Always.
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Zero-knowledge by design.
          </span>
          <span className="inline-flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5" /> Passphrase stays in browser.
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5" /> Open source, MIT.
          </span>
        </div>
      </div>
    </SectionShell>
  );
}

export function RedesignPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <Hero />
      <TwoViewsSection />
      <InviteSection />
      <PricingSection />
      <ReviewsSection />
      <FinalCTA />
    </div>
  );
}
