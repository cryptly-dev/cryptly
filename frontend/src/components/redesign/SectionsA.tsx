import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CommandIcon,
  Dot,
  FileText,
  GitBranch,
  History,
  KeyRound,
  LogIn,
  Plus,
  Send,
  Server,
  Terminal,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  BrowserChrome,
  CopyPill,
  DottedMask,
  HoverRevealMask,
  MockEnvEditor,
  SectionShell,
  StatTile,
  fakeCiphertext,
  passphraseEntropyBits,
} from "./common";

function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        center && "mx-auto text-center",
        "mb-12"
      )}
    >
      {eyebrow && (
        <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-semibold text-neutral-100 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-neutral-400">{subtitle}</p>
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

// ── Section 1 ─────────────────────────────────────────────────────────────
// Stats — only honest ones. The "secrets stored" one is intentionally a shrug,
// which is the whole point of the product.
export function S1Stats() {
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="By the numbers"
        title="Stats we can give you"
        subtitle="And some we literally cannot. Both count."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile
          label="Secrets stored"
          value={<span className="text-neutral-400">¯\_(ツ)_/¯</span>}
          note="We can't see them. Neither can SQL."
        />
        <StatTile
          label="Secrets seen by us"
          value="0"
          note="By construction, not by promise."
        />
        <StatTile label="Price" value="$0" note="All tiers. All features." />
        <StatTile
          label="Open-source license"
          value="MIT"
          note="Fork it. Host it. Break it."
        />
      </div>
    </SectionShell>
  );
}

// ── Section 2 ─────────────────────────────────────────────────────────────
// "What you see vs what we see" — the central mental model of zero-knowledge,
// phrased as observation rather than comparison.
export function S2TwoViews() {
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Observation, not promise"
        title="Two views of the same data"
        subtitle={
          <>
            Encrypted end-to-end means the bytes we store and the bytes you read
            are genuinely different bytes.
          </>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" /> In your browser
            </span>
            <span>after local decryption</span>
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
              <Server className="h-3.5 w-3.5" /> On our disk
            </span>
            <span>ciphertext</span>
          </div>
          <div className="p-4 font-mono text-[11px] leading-5 text-neutral-500 break-all">
            {fakeCiphertext("what-we-see", 520)}
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── Section 3 ─────────────────────────────────────────────────────────────
// Interactive: type a plaintext value and see a believable ciphertext update
// in real time. (It's a deterministic hash, not real AES — but the point
// lands: "we only ever see the right side".)
export function S3EncryptDemo() {
  const [plain, setPlain] = useState("sk_live_my_stripe_key");
  const ct = fakeCiphertext(`s3-${plain}`, 220);
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Try it"
        title="What the network actually carries"
        subtitle="Type on the left. The right is the byte-for-byte view our server gets."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <label className="text-xs uppercase tracking-wider text-neutral-500">
            Your value
          </label>
          <input
            type="text"
            value={plain}
            onChange={(e) => setPlain(e.target.value)}
            className="mt-2 w-full rounded-lg border border-neutral-800 bg-black px-3 py-2.5 text-sm text-neutral-100 font-mono outline-none focus:border-neutral-600"
          />
          <div className="mt-3 text-xs text-neutral-500">
            Encrypted in-browser before it leaves your device.
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-wider text-neutral-500">
            What leaves your browser
          </div>
          <pre className="mt-2 rounded-lg border border-neutral-900 bg-black p-3 text-[11px] leading-5 text-neutral-500 font-mono break-all whitespace-pre-wrap">
            {ct}
          </pre>
          <div className="mt-3 text-xs text-neutral-500">
            Demo uses a deterministic mock. Production uses RSA-OAEP +
            AES-256-GCM.
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── Section 4 ─────────────────────────────────────────────────────────────
// Passphrase entropy simulator. A companion to Hero 5 but framed as an
// explainer — what "strong" means in bits and why we care.
export function S4Entropy() {
  const [pass, setPass] = useState("my dog's name is rex");
  const bits = passphraseEntropyBits(pass);
  const bucket =
    bits < 40
      ? { label: "Crackable over coffee", tone: "text-neutral-400" }
      : bits < 60
        ? { label: "Fine for side projects", tone: "text-amber-400" }
        : bits < 80
          ? { label: "Solid", tone: "text-emerald-400" }
          : { label: "Paranoid, we like that", tone: "text-emerald-400" };
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Passphrase math"
        title="How many bits are you protecting with?"
        subtitle="Your passphrase is what derives the key that decrypts your private key. Longer is cheaper than clever."
      />
      <Card className="max-w-2xl mx-auto">
        <input
          type="text"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-3 text-base text-neutral-100 font-mono outline-none focus:border-neutral-600"
        />
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-neutral-900 overflow-hidden">
            <motion.div
              className={cn(
                "h-full",
                bits < 40 && "bg-neutral-600",
                bits >= 40 && bits < 60 && "bg-amber-500",
                bits >= 60 && "bg-emerald-500"
              )}
              animate={{ width: `${Math.min(100, bits)}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="w-20 text-right text-sm font-mono text-neutral-300">
            {bits} bits
          </div>
        </div>
        <div className={cn("mt-2 text-sm", bucket.tone)}>{bucket.label}</div>
      </Card>
    </SectionShell>
  );
}

// ── Section 5 ─────────────────────────────────────────────────────────────
// Larger interactive editor preview with realistic masking behaviour. An
// island of the actual product in the marketing page.
export function S5EditorIsland() {
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="The editor, live"
        title="Not a screenshot."
        subtitle="Hover any value below. It reveals. Move away. It goes back to dots."
      />
      <BrowserChrome url="cryptly.dev/app/project/production" className="max-w-4xl mx-auto">
        <div className="p-6">
          <MockEnvEditor
            rows={[
              { key: "# shared across the API", value: "", comment: true },
              { key: "DATABASE_URL", value: "postgres://u:p@db.internal:5432/app" },
              { key: "REDIS_URL", value: "redis://default:r3dis@redis:6379" },
              { key: "JWT_SECRET", value: "kJ9f2LmN8aQq3PzVxT4wYrUi" },
              { key: "# third-party", value: "", comment: true },
              { key: "STRIPE_SECRET_KEY", value: "sk_live_51Nxj7p..." },
              { key: "OPENAI_API_KEY", value: "sk-proj-AbcDef123..." },
              { key: "SENTRY_DSN", value: "https://abc@o0.ingest.sentry.io/1" },
            ]}
          />
          <div className="mt-4 flex items-center justify-between text-[11px] text-neutral-500">
            <span>8 secrets · last saved 2m ago</span>
            <span className="inline-flex items-center gap-2">
              <Kbd className="!bg-neutral-800 !text-neutral-200">
                <CommandIcon className="h-3 w-3" />
              </Kbd>
              <span>+</span>
              <Kbd className="!bg-neutral-800 !text-neutral-200">S</Kbd>
              <span className="ml-1">to save</span>
            </span>
          </div>
        </div>
      </BrowserChrome>
    </SectionShell>
  );
}

// ── Section 6 ─────────────────────────────────────────────────────────────
// GitHub sync island — a stripped-down version of IntegrationsSection focused
// on just the push flow.
export function S6GithubSync() {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const runSync = () => {
    setSyncing(true);
    setSynced(false);
    window.setTimeout(() => {
      setSyncing(false);
      setSynced(true);
    }, 1100);
  };
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="GitHub Actions"
        title="One push. Every repo."
        subtitle="We decrypt locally, re-encrypt for each repo's public key, and call the GitHub API. Your plaintext never touches our servers."
      />
      <div className="max-w-xl mx-auto">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-2 text-sm text-neutral-300">
              <GitHubIcon className="h-4 w-4" /> cryptly-dev/api
            </span>
            <span className="text-xs text-neutral-500">12 secrets tracked</span>
          </div>
          <div className="space-y-1.5 font-mono text-xs text-neutral-400 mb-4">
            {[
              "DATABASE_URL",
              "REDIS_URL",
              "JWT_SECRET",
              "STRIPE_SECRET_KEY",
            ].map((k) => (
              <div
                key={k}
                className="flex items-center justify-between rounded-md bg-black/40 border border-neutral-900 px-3 py-1.5"
              >
                <span className="text-sky-400">{k}</span>
                <DottedMask value="xxxxxxxxxxxx" />
              </div>
            ))}
            <div className="text-neutral-600 pl-3 pt-1">+ 8 more</div>
          </div>
          <button
            onClick={runSync}
            disabled={syncing}
            className={cn(
              "w-full rounded-full py-2.5 text-sm font-medium transition-colors",
              synced
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-white text-black hover:bg-neutral-100",
              syncing && "opacity-70"
            )}
          >
            {syncing ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                Pushing to GitHub…
              </span>
            ) : synced ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <Check className="h-4 w-4" /> Synced to cryptly-dev/api
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 justify-center">
                Push to GitHub <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── Section 7 ─────────────────────────────────────────────────────────────
// Pricing — one row, one price, one footnote. No sliders, no "contact sales".
export function S7Pricing() {
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Pricing"
        title="$0. Every feature. Every seat."
        subtitle="We don't have a team plan because we don't have a personal plan to sell you up from."
      />
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500">
            One plan
          </div>
          <div className="mt-3 text-6xl font-semibold text-neutral-100">$0</div>
          <div className="mt-1 text-sm text-neutral-500">per seat · per month · per year · per whatever</div>
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
          <div className="mt-6 text-xs text-neutral-600">
            If we ever charge, the announcement will be a GitHub issue first.
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── Section 8 ─────────────────────────────────────────────────────────────
// Open-source repo card. Plausible numbers — you can ground-truth by clicking.
export function S8OpenSource() {
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Built in the open"
        title="You can read the code that encrypts your secrets."
        subtitle="Every cryptographic choice is in the repo, in the same pull request as the feature that introduced it."
      />
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="flex items-center gap-3">
            <GitHubIcon className="h-6 w-6" />
            <div className="flex-1">
              <div className="text-sm text-neutral-300">
                cryptly-dev/cryptly
              </div>
              <div className="text-xs text-neutral-500">
                Zero-knowledge environment secrets for small teams.
              </div>
            </div>
            <a
              href="https://github.com/cryptly-dev/cryptly"
              className="text-xs text-neutral-400 underline underline-offset-2 hover:text-neutral-200"
            >
              View repo →
            </a>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-neutral-900 bg-black/30 py-3">
              <div className="text-xl font-semibold text-neutral-100">MIT</div>
              <div className="text-[11px] text-neutral-500 mt-1">License</div>
            </div>
            <div className="rounded-lg border border-neutral-900 bg-black/30 py-3">
              <div className="text-xl font-semibold text-neutral-100">
                TypeScript
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Stack</div>
            </div>
            <div className="rounded-lg border border-neutral-900 bg-black/30 py-3">
              <div className="text-xl font-semibold text-neutral-100">
                Active
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Status</div>
            </div>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── Section 9 ─────────────────────────────────────────────────────────────
// Principles — a short, declarative list. No icons fighting for attention.
export function S9Principles() {
  const items: { t: string; d: string }[] = [
    {
      t: "Encrypt in the browser or not at all.",
      d: "All cryptography happens on your device. Plaintext never touches our network.",
    },
    {
      t: "Keep the passphrase on the device it was typed on.",
      d: "We never transmit it. We never derive it remotely. We never ask you to recover it.",
    },
    {
      t: "Open, down to the cipher choice.",
      d: "RSA-OAEP wraps an AES-256-GCM file key. Both choices are in the repo.",
    },
    {
      t: "Fewer features, fewer foot-guns.",
      d: "We ship things we'd trust with our own credentials. When in doubt, we don't ship.",
    },
    {
      t: "No telemetry on secret contents.",
      d: "We measure usage. We do not measure what's inside your vault.",
    },
    {
      t: "Lock-in is a bug.",
      d: "Export as .env at any time. Import from any secrets manager on day one.",
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Operating principles"
        title="Six things we don't compromise on."
        subtitle="Everything else is up for discussion in the issues."
      />
      <div className="max-w-3xl mx-auto divide-y divide-neutral-900 border border-neutral-900 rounded-2xl overflow-hidden">
        {items.map((p, i) => (
          <div key={i} className="grid grid-cols-[3rem_1fr] gap-4 px-6 py-5">
            <div className="text-sm text-neutral-500 font-mono">
              0{i + 1}
            </div>
            <div>
              <div className="text-neutral-100 font-medium">{p.t}</div>
              <div className="mt-1 text-sm text-neutral-400">{p.d}</div>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 10 ────────────────────────────────────────────────────────────
// Threat model — what an attacker at each position actually gets. Plain talk.
export function S10Threat() {
  const rows = [
    {
      who: "Someone at our company",
      gets: "Ciphertext. Access logs. Your email.",
    },
    {
      who: "Our database hoster",
      gets: "Ciphertext. Nothing else, because we encrypt at rest as well.",
    },
    {
      who: "Someone tapping your WiFi",
      gets: "TLS noise. Then ciphertext. Still not secrets.",
    },
    {
      who: "Someone with your laptop unlocked",
      gets: "Everything you can see. That's on you, not crypto.",
    },
    {
      who: "Someone with your passphrase",
      gets: "Full access, exactly as if they were you.",
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Threat model"
        title="Who sees what, concretely."
        subtitle="No abstractions, no hand-waving."
      />
      <div className="max-w-3xl mx-auto rounded-2xl border border-neutral-900 overflow-hidden">
        <div className="grid grid-cols-[1fr_1.4fr] text-[11px] uppercase tracking-wider text-neutral-500 bg-neutral-950/60 border-b border-neutral-900">
          <div className="px-5 py-3">Actor</div>
          <div className="px-5 py-3">Sees</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1.4fr] border-b border-neutral-900 last:border-b-0 text-sm"
          >
            <div className="px-5 py-4 text-neutral-200">{r.who}</div>
            <div className="px-5 py-4 text-neutral-400">{r.gets}</div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 11 ────────────────────────────────────────────────────────────
// FAQ — accordion with six developer-real questions.
export function S11Faq() {
  const items: { q: string; a: React.ReactNode }[] = [
    {
      q: "If I forget my passphrase, can you reset it?",
      a: "No. That's the whole point. Your passphrase is the only thing that derives the key that decrypts your private key. Lose it and your data is unrecoverable — by us, by law enforcement, by you.",
    },
    {
      q: "How is this different from a paid secrets manager?",
      a: "Honestly: fewer features. We only do the parts we'd trust with our own keys. If you need HSM-backed audit-compliance dashboards, go buy the expensive one. If you need a .env that stays private, stay here.",
    },
    {
      q: "Can I self-host?",
      a: "Yes. Clone the repo, run docker-compose, point your DNS. We'll treat self-hosting as a first-class path, not a footnote.",
    },
    {
      q: "Where are my secrets actually stored?",
      a: "As encrypted blobs in a Postgres database. You can verify the encryption in the repo — it's AES-256-GCM with a per-project key, wrapped with your RSA public key.",
    },
    {
      q: "Do you read the GitHub OAuth permissions you ask for?",
      a: "We only ask for what's needed to write repository secrets and list installations. The scopes are documented in our GitHub app manifest, which is in the repo.",
    },
    {
      q: "What happens if Cryptly disappears?",
      a: "Export your secrets as .env at any time. They're decrypted in your browser and downloaded locally — no server call involved in the export.",
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="FAQ"
        title="Questions a skeptical dev would ask."
      />
      <div className="max-w-3xl mx-auto space-y-2">
        {items.map((it, i) => (
          <FaqRow key={i} q={it.q} a={it.a} />
        ))}
      </div>
    </SectionShell>
  );
}

function FaqRow({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="w-full text-left rounded-xl border border-neutral-900 bg-neutral-950/60 px-5 py-4 hover:border-neutral-800 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-medium text-neutral-200">{q}</div>
        <Plus
          className={cn(
            "h-4 w-4 text-neutral-500 transition-transform",
            open && "rotate-45"
          )}
        />
      </div>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="pt-3 text-sm text-neutral-400 leading-relaxed">
          {a}
        </div>
      </motion.div>
    </button>
  );
}

// ── Section 12 ────────────────────────────────────────────────────────────
// Feature matrix — factual, not comparative. Just the features the product
// offers, signaled with checks. No "we beat X" framing.
export function S12FeatureMatrix() {
  const groups: { label: string; items: string[] }[] = [
    {
      label: "Core",
      items: [
        "Unlimited .env files per project",
        "Unlimited projects",
        "Unlimited members per project",
        "End-to-end encryption",
      ],
    },
    {
      label: "Workflow",
      items: [
        "Cmd+S to save",
        "Diff view per commit",
        "Search across all projects",
        "First-time-user walkthrough",
      ],
    },
    {
      label: "Integrations",
      items: [
        "GitHub Actions push",
        "OAuth with Google or GitHub",
        ".env export at any time",
        "Invite by email",
      ],
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="What's in the box"
        title="Everything, with a straight face."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groups.map((g) => (
          <Card key={g.label}>
            <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-3">
              {g.label}
            </div>
            <div className="space-y-2">
              {g.items.map((it) => (
                <div
                  key={it}
                  className="flex items-start gap-2 text-sm text-neutral-300"
                >
                  <Check className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
                  <span>{it}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 13 ────────────────────────────────────────────────────────────
// Architecture — clean schematic. No metaphor, no planets, no locks with chains.
export function S13Architecture() {
  const steps = [
    {
      title: "Browser",
      desc: "Reads passphrase. Derives key. Runs RSA + AES.",
    },
    {
      title: "API",
      desc: "Stores ciphertext. Routes invitations. Never decrypts.",
    },
    {
      title: "GitHub",
      desc: "Receives secrets, re-encrypted to the repo's public key.",
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Architecture"
        title="Three actors. One direction."
        subtitle="Plaintext only ever lives in the leftmost box."
      />
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {steps.map((s, i) => (
          <Card key={i}>
            <div className="flex items-center gap-2 text-neutral-500 text-xs">
              <span className="font-mono">0{i + 1}</span>
              <Dot className="h-3 w-3" />
              <span className="uppercase tracking-wider">{s.title}</span>
            </div>
            <div className="mt-3 text-sm text-neutral-300 leading-relaxed">
              {s.desc}
            </div>
            <div className="mt-4 h-16 rounded-lg border border-dashed border-neutral-900 bg-black/30 flex items-center justify-center font-mono text-[11px] text-neutral-500">
              {i === 0
                ? "plaintext"
                : i === 1
                  ? "ciphertext"
                  : "repo-wrapped ciphertext"}
            </div>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 14 ────────────────────────────────────────────────────────────
// Copy-a-secret interactive block.
export function S14CopyInteractive() {
  const secrets = [
    { k: "DATABASE_URL", v: "postgres://u:p@db.internal/app" },
    { k: "JWT_SECRET", v: "kJ9f2LmN8aQq3PzVxT4wYrUi" },
    { k: "STRIPE_KEY", v: "sk_live_51Nxj7pLkMn..." },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Tiny touch"
        title="Click a secret, copy a secret."
        subtitle="No tooltip sprint. No three-step menu."
      />
      <div className="max-w-xl mx-auto space-y-2">
        {secrets.map((s) => (
          <div
            key={s.k}
            className="flex items-center justify-between rounded-lg border border-neutral-900 bg-neutral-950/60 px-4 py-2.5"
          >
            <span className="font-mono text-sm text-sky-400">{s.k}</span>
            <CopyPill value={s.v} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 15 ────────────────────────────────────────────────────────────
// Multi-env tabs — a mini editor with staging/prod/test tabs.
export function S15MultiEnv() {
  const envs: Record<
    string,
    { key: string; value: string; comment?: boolean }[]
  > = {
    staging: [
      { key: "NODE_ENV", value: "staging" },
      { key: "DATABASE_URL", value: "postgres://staging:pw@db-st/app" },
      { key: "FEATURE_FLAGS", value: "new_onboarding,checkout_v2" },
    ],
    production: [
      { key: "NODE_ENV", value: "production" },
      { key: "DATABASE_URL", value: "postgres://prod:pw@db-prod/app" },
      { key: "FEATURE_FLAGS", value: "checkout_v2" },
    ],
    test: [
      { key: "NODE_ENV", value: "test" },
      { key: "DATABASE_URL", value: "postgres://test:pw@localhost/test" },
      { key: "FEATURE_FLAGS", value: "" },
    ],
  };
  const [active, setActive] = useState<"staging" | "production" | "test">(
    "production"
  );
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Environments"
        title="Keep your envs honest."
        subtitle="Same keys across staging, production, test — different values where they should differ, identical where they shouldn't."
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-1 mb-3">
          {(Object.keys(envs) as (keyof typeof envs)[]).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setActive(e as typeof active)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md transition-colors",
                active === e
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              {e}
            </button>
          ))}
        </div>
        <MockEnvEditor rows={envs[active]} />
      </div>
    </SectionShell>
  );
}

// ── Section 16 ────────────────────────────────────────────────────────────
// Diff preview — minimal 3-line diff between two versions.
export function S16DiffPreview() {
  const lines: { kind: "eq" | "add" | "del"; text: string }[] = [
    { kind: "eq", text: "DATABASE_URL=postgres://u:p@db.internal/app" },
    { kind: "del", text: "STRIPE_KEY=sk_test_abc123" },
    { kind: "add", text: "STRIPE_KEY=sk_live_xyz987" },
    { kind: "eq", text: "JWT_SECRET=kJ9f2LmN8aQq3PzVxT4wYrUi" },
    { kind: "add", text: "OPENAI_API_KEY=sk-proj-AbcDef123..." },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="History"
        title="See every change, including who made it."
        subtitle="Every save creates a commit. Diffs are decrypted and rendered locally."
      />
      <Card className="max-w-2xl mx-auto p-0 overflow-hidden">
        <div className="px-4 py-2 border-b border-neutral-900 text-xs text-neutral-500 flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <GitBranch className="h-3.5 w-3.5" /> production
          </span>
          <span>Alice · 12 minutes ago</span>
        </div>
        <div className="font-mono text-[13px] leading-6 p-4">
          {lines.map((l, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                l.kind === "add" && "text-emerald-300 bg-emerald-500/5 px-2 -mx-2 rounded",
                l.kind === "del" && "text-neutral-500 bg-neutral-900/40 px-2 -mx-2 rounded line-through decoration-neutral-700"
              )}
            >
              <span className="w-3 shrink-0 select-none text-neutral-600">
                {l.kind === "add" ? "+" : l.kind === "del" ? "-" : " "}
              </span>
              <HoverRevealMask value={l.text} />
            </div>
          ))}
        </div>
      </Card>
    </SectionShell>
  );
}

// ── Section 17 ────────────────────────────────────────────────────────────
// Audit timeline — a tight list of who did what.
export function S17Timeline() {
  const events = [
    {
      who: "Alice",
      avatar: "/avatars/alex-chen.svg",
      what: "rotated STRIPE_SECRET_KEY",
      when: "2 minutes ago",
    },
    {
      who: "Marcus",
      avatar: "/avatars/marcus-rodriguez.svg",
      what: "pushed production to cryptly-dev/api",
      when: "14 minutes ago",
    },
    {
      who: "Priya",
      avatar: "/avatars/priya-patel.svg",
      what: "invited david@team.dev (read-only)",
      when: "1 hour ago",
    },
    {
      who: "Sam",
      avatar: "/avatars/nina-gupta.svg",
      what: "added 3 secrets to staging",
      when: "yesterday",
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Audit log"
        title="Every change has a name on it."
        subtitle="Stored alongside the ciphertext, visible in the history tab."
      />
      <div className="max-w-2xl mx-auto rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
        {events.map((e, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-4 px-5 py-4",
              i !== events.length - 1 && "border-b border-neutral-900"
            )}
          >
            <img
              src={e.avatar}
              alt=""
              className="h-8 w-8 rounded-full border border-neutral-800"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-neutral-200">
                <span className="text-neutral-100 font-medium">{e.who}</span>{" "}
                <span className="text-neutral-400">{e.what}</span>
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">{e.when}</div>
            </div>
            <History className="h-4 w-4 text-neutral-600" />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 18 ────────────────────────────────────────────────────────────
// Team & roles — small matrix, honest naming.
export function S18Roles() {
  const rows = [
    { role: "Read", desc: "Can see secrets. Cannot save. Cannot push." },
    { role: "Write", desc: "Can edit and save secrets. Cannot change team." },
    { role: "Admin", desc: "Everything above + invites, integrations, delete." },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Access"
        title="Three roles. Named like you'd name them."
      />
      <div className="max-w-3xl mx-auto rounded-2xl border border-neutral-900 overflow-hidden">
        {rows.map((r, i) => (
          <div
            key={i}
            className={cn(
              "grid grid-cols-[6rem_1fr] items-center px-5 py-4",
              i !== rows.length - 1 && "border-b border-neutral-900"
            )}
          >
            <div className="text-sm font-mono text-neutral-300">{r.role}</div>
            <div className="text-sm text-neutral-400">{r.desc}</div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 19 ────────────────────────────────────────────────────────────
// Shortcuts wall — four columns of Kbds.
export function S19Shortcuts() {
  const shortcuts: { label: string; keys: React.ReactNode[] }[] = [
    { label: "Save", keys: [<CommandIcon key="c" />, "S"] },
    { label: "Command palette", keys: [<CommandIcon key="c" />, "K"] },
    { label: "Search", keys: ["/"] },
    { label: "Switch project", keys: [<CommandIcon key="c" />, "P"] },
    { label: "Push to integrations", keys: [<CommandIcon key="c" />, "⇧", "P"] },
    { label: "Reveal secret", keys: ["Hover"] },
    { label: "Copy secret", keys: ["Click"] },
    { label: "Lock browser", keys: [<CommandIcon key="c" />, "L"] },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Shortcuts"
        title="Keys your fingers already know."
      />
      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
        {shortcuts.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-neutral-900 bg-neutral-950/60 px-4 py-3"
          >
            <span className="text-sm text-neutral-300">{s.label}</span>
            <div className="flex items-center gap-1">
              {s.keys.map((k, j) => (
                <Kbd key={j} className="!bg-neutral-800 !text-neutral-200">
                  {k}
                </Kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 20 ────────────────────────────────────────────────────────────
// Invite-teammate flow mock.
export function S20Invite() {
  const [email, setEmail] = useState("david@team.dev");
  const [sent, setSent] = useState(false);
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Team"
        title="Invite someone without mailing them your vault."
        subtitle="They generate their own keypair. We re-wrap the project key for them. You never send plaintext."
      />
      <Card className="max-w-xl mx-auto">
        <div className="flex items-center gap-3">
          <UserPlus className="h-4 w-4 text-neutral-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-800 bg-black px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-600"
          />
          <select className="rounded-lg border border-neutral-800 bg-black px-3 py-2.5 text-sm text-neutral-300">
            <option>Write</option>
            <option>Read</option>
            <option>Admin</option>
          </select>
          <button
            onClick={() => {
              setSent(true);
              window.setTimeout(() => setSent(false), 1800);
            }}
            className="rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            <span className="inline-flex items-center gap-2">
              <Send className="h-3.5 w-3.5" /> Invite
            </span>
          </button>
        </div>
        {sent && (
          <div className="mt-4 text-sm text-emerald-400 inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Invitation sent. {email} will unlock it with their own passphrase.
          </div>
        )}
      </Card>
    </SectionShell>
  );
}

// ── Section 21 ────────────────────────────────────────────────────────────
// Quickstart — three steps, zero ceremony.
export function S21Quickstart() {
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Quickstart"
        title="Three steps. Nothing to install."
      />
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            n: "01",
            title: "Sign in",
            body: "Google or GitHub. We store only your email and your public key.",
            icon: LogIn,
          },
          {
            n: "02",
            title: "Set a passphrase",
            body: "We derive a symmetric key in your browser. It never leaves.",
            icon: KeyRound,
          },
          {
            n: "03",
            title: "Paste your .env",
            body: "We encrypt it. You can push it to GitHub from the same screen.",
            icon: FileText,
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i}>
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                {s.n}
                <Dot className="h-3 w-3" />
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="mt-3 text-neutral-100 font-medium">{s.title}</div>
              <div className="mt-1 text-sm text-neutral-400">{s.body}</div>
            </Card>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── Section 22 ────────────────────────────────────────────────────────────
// Integrations roadmap — honest about what exists and what doesn't.
export function S22Integrations() {
  const items = [
    { name: "GitHub Actions", status: "live" },
    { name: "Vercel", status: "soon" },
    { name: "Cloudflare Workers", status: "soon" },
    { name: "AWS Secrets Manager", status: "considering" },
    { name: "Netlify", status: "considering" },
    { name: "Fly.io", status: "considering" },
    { name: "Railway", status: "considering" },
    { name: "Render", status: "considering" },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Integrations"
        title="Where your secrets actually get used."
        subtitle="One lives. Others are in the issue tracker. Vote, or just build it."
      />
      <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {items.map((it) => (
          <div
            key={it.name}
            className={cn(
              "rounded-lg border px-4 py-3",
              it.status === "live"
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-neutral-900 bg-neutral-950/60"
            )}
          >
            <div className="text-sm text-neutral-200">{it.name}</div>
            <div
              className={cn(
                "text-xs mt-1",
                it.status === "live" && "text-emerald-400",
                it.status === "soon" && "text-neutral-400",
                it.status === "considering" && "text-neutral-600"
              )}
            >
              {it.status === "live"
                ? "available"
                : it.status === "soon"
                  ? "in progress"
                  : "vote on GitHub"}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 23 ────────────────────────────────────────────────────────────
// Roadmap — a short honest list.
export function S23Roadmap() {
  const items = [
    { status: "done", text: "End-to-end encryption of env files" },
    { status: "done", text: "Team sharing with per-user keypair" },
    { status: "done", text: "GitHub Actions push" },
    { status: "done", text: "Full history + diff view" },
    { status: "next", text: "Vercel sync" },
    { status: "next", text: "CLI for CI pipelines" },
    { status: "later", text: "Scheduled rotation reminders" },
    { status: "later", text: "Audit log exports" },
  ];
  return (
    <SectionShell>
      <SectionTitle eyebrow="Roadmap" title="What's done, what's next." />
      <div className="max-w-2xl mx-auto space-y-1.5">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-neutral-900 bg-neutral-950/40 px-4 py-2.5"
          >
            <span
              className={cn(
                "inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-mono",
                it.status === "done" && "bg-emerald-500/20 text-emerald-400",
                it.status === "next" && "bg-sky-500/20 text-sky-400",
                it.status === "later" && "bg-neutral-800 text-neutral-500"
              )}
            >
              {it.status === "done" ? <Check className="h-3 w-3" /> : "·"}
            </span>
            <span className="text-sm text-neutral-300">{it.text}</span>
            <span className="ml-auto text-[11px] text-neutral-500 font-mono">
              {it.status}
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 24 ────────────────────────────────────────────────────────────
// Self-host — tiny Docker snippet. No 12-page install manual.
export function S24Selfhost() {
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Self-host"
        title="One compose file. Your infra."
        subtitle="The hosted version is the same bits you'd run at home."
      />
      <div className="max-w-2xl mx-auto">
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 text-xs text-neutral-500 flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5" /> ~/cryptly
          </div>
          <pre className="p-4 font-mono text-[13px] leading-6 text-neutral-300">
            <span className="text-neutral-500">$</span> git clone
            github.com/cryptly-dev/cryptly
            <br />
            <span className="text-neutral-500">$</span> cd cryptly
            <br />
            <span className="text-neutral-500">$</span> docker compose up -d
            <br />
            <span className="text-emerald-400">✓</span> Running on
            http://localhost:3000
          </pre>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── Section 25 ────────────────────────────────────────────────────────────
// "Anatomy of a secret" — annotated breakdown.
export function S25Anatomy() {
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Anatomy"
        title="What a Cryptly secret actually is."
      />
      <div className="max-w-3xl mx-auto">
        <Card className="font-mono text-sm">
          <div className="flex items-center gap-1">
            <span className="text-sky-400">STRIPE_SECRET_KEY</span>
            <span className="text-neutral-500">=</span>
            <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-emerald-300">
              sk_live_51Nxj7p...
            </span>
          </div>
          <div className="mt-8 grid grid-cols-[1fr_2fr] gap-x-6 gap-y-4 text-xs">
            <div className="text-sky-400">key</div>
            <div className="text-neutral-400">
              Uppercase-snake. Parsed identically to a dotenv line.
            </div>
            <div className="text-neutral-500">=</div>
            <div className="text-neutral-400">
              Single equals, no spaces. Anything else is treated as a comment.
            </div>
            <div className="text-emerald-300">value</div>
            <div className="text-neutral-400">
              Encrypted with the per-project AES key, which is itself wrapped
              by your RSA public key. Stored as base64 ciphertext.
            </div>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

export const SECTIONS_A: {
  id: string;
  title: string;
  subtitle: string;
  render: () => React.ReactNode;
}[] = [
  {
    id: "sec-1",
    title: "Honest stats row",
    subtitle: 'Numbers + "we literally don\'t know" shrugs.',
    render: () => <S1Stats />,
  },
  {
    id: "sec-2",
    title: "Two views of the same data",
    subtitle: "Plaintext vs. ciphertext side-by-side.",
    render: () => <S2TwoViews />,
  },
  {
    id: "sec-3",
    title: "Live encrypt demo",
    subtitle: "Type, see the ciphertext update.",
    render: () => <S3EncryptDemo />,
  },
  {
    id: "sec-4",
    title: "Passphrase entropy meter",
    subtitle: "Educational + interactive.",
    render: () => <S4Entropy />,
  },
  {
    id: "sec-5",
    title: "Editor island (real-app preview)",
    subtitle: "Hover any value to reveal.",
    render: () => <S5EditorIsland />,
  },
  {
    id: "sec-6",
    title: "GitHub sync island",
    subtitle: "One-click push to a repo.",
    render: () => <S6GithubSync />,
  },
  {
    id: "sec-7",
    title: "Pricing — $0",
    subtitle: "Single tier, no asterisk.",
    render: () => <S7Pricing />,
  },
  {
    id: "sec-8",
    title: "Open-source repo card",
    subtitle: "License, stack, status.",
    render: () => <S8OpenSource />,
  },
  {
    id: "sec-9",
    title: "Operating principles",
    subtitle: "Six declarative rules.",
    render: () => <S9Principles />,
  },
  {
    id: "sec-10",
    title: "Threat model grid",
    subtitle: "Who sees what, concretely.",
    render: () => <S10Threat />,
  },
  {
    id: "sec-11",
    title: "Developer FAQ",
    subtitle: "Six skeptical questions.",
    render: () => <S11Faq />,
  },
  {
    id: "sec-12",
    title: "Feature matrix (non-comparative)",
    subtitle: "Just what's in the box.",
    render: () => <S12FeatureMatrix />,
  },
  {
    id: "sec-13",
    title: "Architecture schematic",
    subtitle: "Browser → API → GitHub.",
    render: () => <S13Architecture />,
  },
  {
    id: "sec-14",
    title: "Click-to-copy secrets",
    subtitle: "Tiny interaction island.",
    render: () => <S14CopyInteractive />,
  },
  {
    id: "sec-15",
    title: "Multi-env tabs",
    subtitle: "Staging / production / test.",
    render: () => <S15MultiEnv />,
  },
  {
    id: "sec-16",
    title: "Diff preview",
    subtitle: "Additions, removals, reveal-on-hover.",
    render: () => <S16DiffPreview />,
  },
  {
    id: "sec-17",
    title: "Audit timeline",
    subtitle: "Who changed what, when.",
    render: () => <S17Timeline />,
  },
  {
    id: "sec-18",
    title: "Team & roles",
    subtitle: "Read / Write / Admin.",
    render: () => <S18Roles />,
  },
  {
    id: "sec-19",
    title: "Keyboard shortcuts wall",
    subtitle: "Eight shortcuts in a grid.",
    render: () => <S19Shortcuts />,
  },
  {
    id: "sec-20",
    title: "Invite-teammate demo",
    subtitle: "Interactive email + role.",
    render: () => <S20Invite />,
  },
  {
    id: "sec-21",
    title: "Quickstart — 3 steps",
    subtitle: "Sign in, passphrase, paste.",
    render: () => <S21Quickstart />,
  },
  {
    id: "sec-22",
    title: "Integrations roadmap grid",
    subtitle: "Live / soon / considering.",
    render: () => <S22Integrations />,
  },
  {
    id: "sec-23",
    title: "Product roadmap",
    subtitle: "Done / next / later.",
    render: () => <S23Roadmap />,
  },
  {
    id: "sec-24",
    title: "Self-host snippet",
    subtitle: "Three docker compose lines.",
    render: () => <S24Selfhost />,
  },
  {
    id: "sec-25",
    title: "Anatomy of a secret",
    subtitle: "Annotated KEY=value breakdown.",
    render: () => <S25Anatomy />,
  },
];
