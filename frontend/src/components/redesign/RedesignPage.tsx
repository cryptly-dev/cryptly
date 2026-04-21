import Beams from "@/components/Beams";
import { ReviewsSection } from "@/components/index/ReviewsSection";
import { BracketsIcon } from "@/components/ui/BracketsIcon";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { HistoryIcon } from "@/components/ui/HistoryIcon";
import { cn } from "@/lib/utils";
import { IconBrandGithub, IconUsers } from "@tabler/icons-react";
import {
  ArrowRight,
  Book,
  Check,
  Code2,
  Heart,
  KeyRound,
  Lock,
  Newspaper,
} from "lucide-react";
import { GhostCTA, HoverRevealMask, PrimaryCTA, SectionShell } from "./common";
import {
  GithubSyncSection,
  HistorySection,
  InviteSection,
  ThreePillarsSection,
} from "./ProductSections";
import {
  CryptlyOnCryptlySection,
  DevToolsNetworkSection,
} from "./SecuritySections";

type Row = { key: string; value: string; comment?: boolean };

const ROWS: Row[] = [
  { key: "production credentials", value: "", comment: true },
  { key: "DATABASE_URL", value: "postgres://u:p@db.internal:5432/app" },
  { key: "STRIPE_SECRET_KEY", value: "sk_live_51Nxj7pLkQr9mVbXc" },
  { key: "JWT_SIGNING_KEY", value: "kJ9f2LmN8aQq3PzVxT4wYrUi" },
  { key: "OPENAI_API_KEY", value: "sk-proj-abcDef123xyz456" },
  { key: "SENTRY_DSN", value: "https://abc@o42.ingest.sentry.io/99" },
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

function MockEditorTile() {
  return (
    <div className="flex flex-col">
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

      <div className="py-3">
        <ProEditor rows={ROWS} />
      </div>
    </div>
  );
}

function HeroBody() {
  return (
    <div className="relative z-10 w-full">
      <div className="mx-auto max-w-6xl w-full px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight">
              Your secrets are none of our business.
            </h1>
            <p className="mt-6 text-lg text-neutral-400 max-w-xl">
              A secrets manager built so that even we can't read what's in
              it. Open source. Free. Unapologetically small.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <PrimaryCTA href="/app/login">
                <span>Open dashboard</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </PrimaryCTA>
              <GhostCTA href="https://github.com/cryptly-dev/cryptly">
                <GitHubIcon className="h-4 w-4" />
                <span>Source on GitHub</span>
              </GhostCTA>
              <GhostCTA href="/blog">
                <Newspaper className="h-4 w-4" />
                <span>Blog</span>
              </GhostCTA>
            </div>
          </div>
          <div>
            <div className="rounded-2xl border border-neutral-800 bg-background overflow-hidden shadow-2xl shadow-black/70">
              <MockEditorTile />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroWithBeams() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Beams
          beamWidth={2}
          beamHeight={30}
          beamNumber={20}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>
      <div className="absolute top-0 h-64 bg-gradient-to-b from-black to-transparent w-full z-0 pointer-events-none" />
      <div className="absolute bottom-0 h-64 bg-gradient-to-t from-black to-transparent w-full z-0 pointer-events-none" />
      <HeroBody />
    </section>
  );
}

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

function PricingSection() {
  return (
    <SectionShell>
      <SectionTitle
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
          <div className="mt-6 pt-6 border-t border-neutral-900 text-sm text-neutral-400">
            Wondering what the catch is?{" "}
            <a
              href="https://cryptly.dev/blog/why-is-it-free"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-neutral-200 underline decoration-neutral-700 underline-offset-4 hover:decoration-neutral-400"
            >
              Here's why it's free
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
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
      <HeroWithBeams />
      <ThreePillarsSection />
      <DevToolsNetworkSection />
      <CryptlyOnCryptlySection />
      <GithubSyncSection />
      <HistorySection />
      <InviteSection />
      <PricingSection />
      <ReviewsSection />
      <FinalCTA />
    </div>
  );
}
