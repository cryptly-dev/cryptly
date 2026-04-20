import { ReviewsSection } from "@/components/index/ReviewsSection";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Book,
  Check,
  ChevronDown,
  Code2,
  Fingerprint,
  Heart,
  KeyRound,
  Lock,
  Send,
  Server,
  Shield,
  UserPlus,
} from "lucide-react";
import {
  GhostCTA,
  MockEnvEditor,
  Pill,
  PrimaryCTA,
  SectionShell,
  fakeCiphertext,
} from "./common";

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
        "rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

const HERO_CTAS = (
  <div className="mt-10 flex flex-wrap items-center gap-3">
    <PrimaryCTA href="/app/login">
      <span>Open dashboard</span>
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </PrimaryCTA>
    <GhostCTA href="https://github.com/cryptly-dev/cryptly">
      <GitHubIcon className="h-4 w-4" />
      <span>Source on GitHub</span>
    </GhostCTA>
  </div>
);

const HERO_GUARANTEES = (
  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-500">
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-neutral-400" /> End-to-end encrypted
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-neutral-400" /> Free, forever
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-neutral-400" /> Open source
    </span>
  </div>
);

function Hero() {
  return (
    <section className="min-h-screen flex items-center">
      <div className="mx-auto max-w-6xl w-full px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center">
          <div>
            <Pill>
              <Lock className="h-3 w-3" /> Zero-knowledge by construction
            </Pill>
            <h1 className="mt-6 text-5xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
              Secrets should be{" "}
              <span className="text-neutral-500">boring.</span>
              <br />
              We made them boring.
            </h1>
            <p className="mt-6 text-lg text-neutral-400 max-w-xl">
              Cryptly stores your{" "}
              <code className="text-neutral-200">.env</code> files encrypted
              in your browser. Our servers hold the ciphertext. The only
              thing we can see is that you exist.
            </p>
            {HERO_CTAS}
            {HERO_GUARANTEES}
          </div>
          <div>
            <MockEnvEditor
              rows={[
                { key: "# production credentials", value: "", comment: true },
                {
                  key: "DATABASE_URL",
                  value: "postgres://u:p@db.internal:5432/app",
                },
                { key: "STRIPE_SECRET_KEY", value: "sk_live_51Nxj7pLk..." },
                { key: "JWT_SIGNING_KEY", value: "kJ9f2LmN8aQq3PzVxT..." },
              ]}
            />
            <div className="mt-3 text-xs text-neutral-600">
              Hover a value to reveal it. Otherwise it stays dots — locally
              and everywhere else.
            </div>
          </div>
        </div>
      </div>
    </section>
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
          <div className="mt-3 text-6xl font-semibold text-neutral-100">
            $0
          </div>
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
