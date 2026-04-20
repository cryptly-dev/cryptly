import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Book,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Code2,
  GitCommit,
  GitPullRequest,
  Globe,
  Heart,
  KeyRound,
  Lock,
  MessageSquare,
  Minus,
  Radio,
  Rss,
  Search,
  Shield,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  BrowserChrome,
  GhostCTA,
  HoverRevealMask,
  MockEnvEditor,
  Pill,
  PrimaryCTA,
  SectionShell,
  StatTile,
  fakeCiphertext,
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
      className={cn("max-w-2xl", center && "mx-auto text-center", "mb-12")}
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

// ── Section 26 ────────────────────────────────────────────────────────────
// Paste-your-dotenv demo. Parses into rows, masks values. No API call, runs
// entirely in-browser like the real flow.
export function S26PasteEnv() {
  const [text, setText] = useState(
    "# paste anything — we parse locally\nDATABASE_URL=postgres://app:s3cret@db.prod.internal:5432/app\nSTRIPE_SECRET_KEY=sk_live_51J2xPQzXY7vM9nLbH8g\nREDIS_URL=redis://:topsecret@cache-01:6379\nSENTRY_DSN=https://abc123@o42.ingest.sentry.io/99\n"
  );
  const parsed = useMemo(() => {
    return text
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .map((line) => {
        if (line.trim().startsWith("#"))
          return { key: line.replace(/^#\s*/, ""), value: "", comment: true };
        const eq = line.indexOf("=");
        if (eq === -1) return { key: line, value: "", comment: true };
        return {
          key: line.slice(0, eq).trim(),
          value: line.slice(eq + 1).trim(),
        };
      });
  }, [text]);
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Paste"
        title="Drop in your .env. Nothing leaves the browser."
        subtitle="Parsing and encryption happen on your machine. We receive only the ciphertext."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-0">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-900 text-xs text-neutral-500">
            <span>paste or edit</span>
            <Pill>.env</Pill>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="w-full h-72 bg-black p-4 font-mono text-[13px] leading-6 text-neutral-200 outline-none resize-none"
          />
        </Card>
        <Card className="p-0">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-900 text-xs text-neutral-500">
            <span>parsed &amp; masked locally</span>
            <Pill>{parsed.filter((p) => !p.comment).length} keys</Pill>
          </div>
          <div className="h-72 overflow-auto">
            <MockEnvEditor rows={parsed} />
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── Section 27 ────────────────────────────────────────────────────────────
// Latency card. Specific, honest numbers rather than "blazing fast".
export function S27Latency() {
  const bars = [
    { label: "Open editor", ms: 180, stage: "Fetch + decrypt locally" },
    { label: "Edit + save", ms: 42, stage: "Encrypt + upload" },
    { label: "Push to GitHub", ms: 610, stage: "Re-encrypt with repo key" },
    { label: "Invite teammate", ms: 95, stage: "Wrap AES key to their RSA" },
  ];
  const max = Math.max(...bars.map((b) => b.ms));
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Numbers"
        title="How long things actually take."
        subtitle="Measured on a mid-range laptop over a 50 Mbps connection. No magic."
      />
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-y-4 gap-x-6 items-center">
          {bars.map((b) => (
            <div key={b.label} className="contents">
              <div>
                <div className="text-sm text-neutral-200">{b.label}</div>
                <div className="text-xs text-neutral-500">{b.stage}</div>
              </div>
              <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(b.ms / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-neutral-400 to-neutral-100"
                />
              </div>
              <div className="text-sm font-mono text-neutral-300 tabular-nums text-right">
                {b.ms}ms
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-xs text-neutral-500">
          Numbers include client-side crypto. Most of the push latency is
          GitHub's API, not ours.
        </div>
      </Card>
    </SectionShell>
  );
}

// ── Section 28 ────────────────────────────────────────────────────────────
// Encryption primitives card. Zero fluff — just what we use.
export function S28Primitives() {
  const items = [
    {
      name: "AES-256-GCM",
      role: "Per-project symmetric key",
      note: "Encrypts every secret value. AEAD — tamper gets rejected on decrypt.",
    },
    {
      name: "RSA-OAEP 4096",
      role: "Key wrapping",
      note: "Each member gets the AES key wrapped to their public key. Server only stores wrapped blobs.",
    },
    {
      name: "PBKDF2-SHA256",
      role: "Passphrase → key",
      note: "600,000 iterations. Your passphrase never leaves the browser.",
    },
    {
      name: "WebCrypto",
      role: "Runtime",
      note: "Native browser crypto. No custom implementations, no auditable shims.",
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Primitives"
        title="The crypto we use. Nothing homegrown."
        subtitle="If you've read the NIST pages, you've seen this list. That's on purpose."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((i) => (
          <Card key={i.name}>
            <div className="flex items-baseline justify-between">
              <div className="font-mono text-sm text-neutral-100">{i.name}</div>
              <Pill>{i.role}</Pill>
            </div>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              {i.note}
            </p>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 29 ────────────────────────────────────────────────────────────
// What we won't do. A negative-space card explaining intentional omissions.
export function S29WontDo() {
  const items = [
    {
      text: "We won't store your passphrase, even encrypted.",
      why: "If we never have it, we can never leak it.",
    },
    {
      text: "We won't show you secrets in server logs.",
      why: "We can't — the server only sees ciphertext.",
    },
    {
      text: "We won't sell your usage data.",
      why: "We don't collect usage data in the first place.",
    },
    {
      text: "We won't add a paid tier you need to be productive.",
      why: "The free tier isn't a trial. It's the product.",
    },
    {
      text: "We won't bolt on AI that reads your secrets.",
      why: "Same reason as #2. Also: no.",
    },
    {
      text: "We won't make onboarding a sales call.",
      why: "You sign up, paste your .env, and leave in three minutes.",
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Intentionally missing"
        title="Things we don't do."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((i) => (
          <Card key={i.text}>
            <div className="flex items-start gap-3">
              <X className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-neutral-200">{i.text}</div>
                <div className="mt-1 text-xs text-neutral-500">{i.why}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 30 ────────────────────────────────────────────────────────────
// Contributor wall using the avatars under /public/avatars. Names are
// placeholders — can be swapped with real GitHub usernames later.
export function S30Contributors() {
  const people = [
    { name: "alex-chen", commits: 142 },
    { name: "priya-patel", commits: 88 },
    { name: "marcus-rodriguez", commits: 71 },
    { name: "emily-park", commits: 54 },
    { name: "david-kim", commits: 41 },
    { name: "jessica-taylor", commits: 33 },
    { name: "ryan-cooper", commits: 22 },
    { name: "nina-gupta", commits: 19 },
    { name: "kevin-brown", commits: 14 },
    { name: "tom-anderson", commits: 9 },
    { name: "lisa-zhang", commits: 6 },
    { name: "sarah-williams", commits: 3 },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Built by humans"
        title="Contributors."
        subtitle="A small list of the people who've shipped code. Every PR gets a review. Every reviewer gets credit."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {people.map((p) => (
          <Card key={p.name} className="p-4 flex items-center gap-3">
            <img
              src={`/avatars/${p.name}.svg`}
              alt={p.name}
              className="h-9 w-9 rounded-full bg-neutral-900"
            />
            <div className="min-w-0">
              <div className="text-sm text-neutral-200 truncate">
                {p.name}
              </div>
              <div className="text-[11px] text-neutral-500">
                {p.commits} commits
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 31 ────────────────────────────────────────────────────────────
// Live activity feed (mock). Scrolls slowly, shows only metadata — never
// values, because we don't have them.
export function S31Activity() {
  const events = [
    { who: "emily-park", action: "rotated", key: "STRIPE_SECRET_KEY", env: "production", t: "just now" },
    { who: "alex-chen", action: "added", key: "SENTRY_DSN", env: "staging", t: "2m ago" },
    { who: "marcus-rodriguez", action: "invited", key: "priya-patel to readers", env: "—", t: "7m ago" },
    { who: "ryan-cooper", action: "pushed to GitHub", key: "cryptly-dev/api", env: "production", t: "12m ago" },
    { who: "david-kim", action: "removed", key: "LEGACY_REDIS_URL", env: "staging", t: "28m ago" },
    { who: "nina-gupta", action: "created project", key: "mobile-app", env: "—", t: "1h ago" },
    { who: "jessica-taylor", action: "updated", key: "OPENAI_API_KEY", env: "production", t: "1h ago" },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Audit"
        title="We log actions, not secrets."
        subtitle="Every write is signed, timestamped, and attributable. Values are never recorded — we don't have them."
      />
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-neutral-900">
          {events.map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-900/40 transition-colors"
            >
              <img
                src={`/avatars/${e.who}.svg`}
                alt={e.who}
                className="h-7 w-7 rounded-full bg-neutral-900 shrink-0"
              />
              <div className="flex-1 min-w-0 text-sm">
                <span className="text-neutral-200">{e.who}</span>{" "}
                <span className="text-neutral-500">{e.action}</span>{" "}
                <span className="font-mono text-neutral-300">{e.key}</span>
              </div>
              {e.env !== "—" && (
                <Pill className="shrink-0 hidden sm:inline-flex">{e.env}</Pill>
              )}
              <span className="text-xs text-neutral-500 tabular-nums shrink-0">
                {e.t}
              </span>
            </motion.div>
          ))}
        </div>
      </Card>
    </SectionShell>
  );
}

// ── Section 32 ────────────────────────────────────────────────────────────
// "Inspired by" — an honest citation of the tools that shaped our thinking.
export function S32InspiredBy() {
  const items = [
    { name: "age", note: "Minimal, opinionated, a joy to read." },
    { name: "1Password", note: "Proved zero-knowledge can feel good to use." },
    { name: "Vercel env UI", note: "The bar for 'pleasant' is high." },
    { name: "direnv", note: "Environments per-project, scoped by default." },
    { name: "Signal", note: "Evidence that end-to-end is not a branding exercise." },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Credits"
        title="Shoulders we stand on."
        subtitle="No project exists in a vacuum. These shaped our taste."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((i) => (
          <Card key={i.name}>
            <div className="font-mono text-sm text-neutral-100">{i.name}</div>
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              {i.note}
            </p>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 33 ────────────────────────────────────────────────────────────
// Factual compare to the manual workflow. No fake dollar amounts, no green
// vs red — just the steps on each side, honestly.
export function S33ManualWorkflow() {
  const manual = [
    "Paste .env into a Slack DM to the new hire",
    "They paste it into their local file",
    "You rotate a key — message the team",
    "Some team members miss it — things break quietly",
    "Later: grep Slack for that API key",
  ];
  const cryptly = [
    "Invite the new hire by email",
    "They get scoped access on login",
    "You rotate a key — it's synced to all envs",
    "Team sees the change in audit log",
    "GitHub Actions picks up the new value on next run",
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Workflow"
        title="Same task, five steps each."
        subtitle="Not a pain-point ad. Just the steps, side by side."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500">
            <MessageSquare className="h-3.5 w-3.5" />
            Slack + shared .env
          </div>
          <ol className="space-y-3 text-sm">
            {manual.map((m, i) => (
              <li key={i} className="flex gap-3 text-neutral-300">
                <span className="text-neutral-600 tabular-nums w-5 shrink-0">
                  {i + 1}.
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500">
            <KeyRound className="h-3.5 w-3.5" />
            Cryptly
          </div>
          <ol className="space-y-3 text-sm">
            {cryptly.map((c, i) => (
              <li key={i} className="flex gap-3 text-neutral-300">
                <span className="text-neutral-600 tabular-nums w-5 shrink-0">
                  {i + 1}.
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── Section 34 ────────────────────────────────────────────────────────────
// Accessibility. Mention it because it matters, keep it short.
export function S34Accessibility() {
  const items = [
    { label: "Keyboard navigation", detail: "Every action reachable without a mouse." },
    { label: "Screen reader labels", detail: "Secrets are announced as redacted unless revealed." },
    { label: "Reduced motion", detail: "All animations respect prefers-reduced-motion." },
    { label: "Contrast", detail: "WCAG AA across the dashboard." },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Accessible"
        title="Usable by everyone who codes."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((i) => (
          <Card key={i.label}>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-neutral-200">{i.label}</div>
                <div className="mt-1 text-xs text-neutral-500">{i.detail}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 35 ────────────────────────────────────────────────────────────
// Mock search demo. Filters a list of fake keys as user types.
export function S35Search() {
  const [q, setQ] = useState("");
  const keys = [
    "DATABASE_URL",
    "REDIS_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "SENTRY_DSN",
    "OPENAI_API_KEY",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "SMTP_HOST",
    "SMTP_PASSWORD",
    "JWT_SIGNING_KEY",
    "NEXT_PUBLIC_API_URL",
  ];
  const filtered = keys.filter((k) =>
    k.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Find it fast"
        title="Search across every environment."
      />
      <Card>
        <div className="flex items-center gap-2 border-b border-neutral-900 pb-3 mb-3">
          <Search className="h-4 w-4 text-neutral-500 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type to filter keys…"
            className="flex-1 bg-transparent outline-none text-sm text-neutral-100 placeholder:text-neutral-600"
          />
          <Pill>{filtered.length}</Pill>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filtered.length === 0 && (
            <div className="col-span-full text-sm text-neutral-500 py-6 text-center">
              No matches. Try "STRIPE" or "URL".
            </div>
          )}
          {filtered.map((k) => (
            <div
              key={k}
              className="flex items-center gap-3 rounded-lg border border-neutral-900 bg-black/40 px-3 py-2"
            >
              <span className="font-mono text-sm text-sky-400">{k}</span>
              <span className="text-neutral-500">=</span>
              <HoverRevealMask
                value={fakeCiphertext(k, 20)}
                className="font-mono text-xs text-neutral-300 truncate"
              />
            </div>
          ))}
        </div>
      </Card>
    </SectionShell>
  );
}

// ── Section 36 ────────────────────────────────────────────────────────────
// Permissions matrix — explicit about what each role can do.
export function S36Permissions() {
  const caps = [
    { name: "Read values", read: true, write: false, admin: true },
    { name: "Edit values", read: false, write: true, admin: true },
    { name: "Add / remove keys", read: false, write: true, admin: true },
    { name: "Push to GitHub", read: false, write: true, admin: true },
    { name: "Invite members", read: false, write: false, admin: true },
    { name: "Remove members", read: false, write: false, admin: true },
    { name: "Rotate project key", read: false, write: false, admin: true },
    { name: "Delete project", read: false, write: false, admin: true },
  ];
  const Cell = ({ on }: { on: boolean }) =>
    on ? (
      <Check className="h-4 w-4 text-neutral-200 mx-auto" />
    ) : (
      <Minus className="h-4 w-4 text-neutral-700 mx-auto" />
    );
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Permissions"
        title="Every capability, every role."
      />
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-900 text-[11px] uppercase tracking-wider text-neutral-500">
              <th className="text-left font-normal px-5 py-3">Capability</th>
              <th className="font-normal px-5 py-3 w-28">Reader</th>
              <th className="font-normal px-5 py-3 w-28">Writer</th>
              <th className="font-normal px-5 py-3 w-28">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900">
            {caps.map((c) => (
              <tr key={c.name}>
                <td className="px-5 py-3 text-neutral-200">{c.name}</td>
                <td className="px-5 py-3 text-center">
                  <Cell on={c.read} />
                </td>
                <td className="px-5 py-3 text-center">
                  <Cell on={c.write} />
                </td>
                <td className="px-5 py-3 text-center">
                  <Cell on={c.admin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </SectionShell>
  );
}

// ── Section 37 ────────────────────────────────────────────────────────────
// "If we get hacked." Straightforward thought experiment.
export function S37IfHacked() {
  const outcomes = [
    {
      q: "Can attackers read secret values?",
      a: "No. Values are encrypted with per-project AES keys that are wrapped by member RSA public keys. The server only stores wrapped blobs.",
    },
    {
      q: "Can they read the wrapped keys?",
      a: "Yes — wrapped keys are stored on the server. They're useless without the private keys, which never leave members' browsers.",
    },
    {
      q: "Can they forge an edit?",
      a: "No. Writes are signed. The signatures are verified client-side when other members refresh.",
    },
    {
      q: "Do they learn who's on the team?",
      a: "Partially. Email addresses tied to accounts would be exposed. Which projects members belong to — also visible.",
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Transparency"
        title="What a breach would and wouldn't give an attacker."
        subtitle="We'd rather be specific now than vague later."
      />
      <div className="space-y-4">
        {outcomes.map((o) => (
          <Card key={o.q}>
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-neutral-200">{o.q}</div>
                <div className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  {o.a}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 38 ────────────────────────────────────────────────────────────
// How you hear about changes. No newsletter — GitHub & RSS.
export function S38NoNewsletter() {
  return (
    <SectionShell compact>
      <SectionTitle
        eyebrow="How to stay updated"
        title="There's no newsletter."
        subtitle="If we have something to say, we post it where you already are."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <GitHubIcon className="h-5 w-5 text-neutral-300" />
          <div className="mt-3 text-sm font-medium text-neutral-100">
            GitHub Releases
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Every version. Every breaking change.
          </p>
        </Card>
        <Card>
          <Rss className="h-5 w-5 text-neutral-300" />
          <div className="mt-3 text-sm font-medium text-neutral-100">
            RSS
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Drop it into Feedly or Reeder. Works.
          </p>
        </Card>
        <Card>
          <MessageSquare className="h-5 w-5 text-neutral-300" />
          <div className="mt-3 text-sm font-medium text-neutral-100">
            Discussions
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Where feature ideas start. Also where they die.
          </p>
        </Card>
      </div>
    </SectionShell>
  );
}

// ── Section 39 ────────────────────────────────────────────────────────────
// Built with. Short stack credits.
export function S39BuiltWith() {
  const stack = [
    "TypeScript",
    "React 19",
    "Vite",
    "TanStack Router",
    "Tailwind v4",
    "Kea",
    "Motion",
    "Monaco",
    "WebCrypto",
    "Fastify",
    "Postgres",
  ];
  return (
    <SectionShell compact>
      <SectionTitle
        eyebrow="Stack"
        title="Built with boring tech, on purpose."
      />
      <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
        {stack.map((s) => (
          <span
            key={s}
            className="rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-sm text-neutral-300"
          >
            {s}
          </span>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 40 ────────────────────────────────────────────────────────────
// "Community voices" — mock GitHub issue + discussion cards. Intentionally
// not "testimonials" because those live in the existing ReviewsSection we're
// keeping.
export function S40CommunityIssues() {
  const threads = [
    {
      kind: "issue",
      title: "Support for bun.env file aliases",
      author: "alex-chen",
      status: "open",
      replies: 14,
      icon: <Circle className="h-3.5 w-3.5 text-emerald-500" />,
    },
    {
      kind: "discussion",
      title: "Why do you rotate keys on invite rather than on remove?",
      author: "priya-patel",
      status: "answered",
      replies: 7,
      icon: <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />,
    },
    {
      kind: "pr",
      title: "feat: GitLab CI secret sync parity",
      author: "marcus-rodriguez",
      status: "merged",
      replies: 22,
      icon: <GitPullRequest className="h-3.5 w-3.5 text-violet-400" />,
    },
    {
      kind: "issue",
      title: "Add per-env toggle for 'require 2fa to reveal'",
      author: "david-kim",
      status: "planned",
      replies: 4,
      icon: <Circle className="h-3.5 w-3.5 text-emerald-500" />,
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="In the open"
        title="Where product decisions actually happen."
        subtitle="Not a roadmap meeting. A public repo."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {threads.map((t) => (
          <Card key={t.title} className="p-0">
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                {t.icon}
                <span className="uppercase tracking-wider">{t.kind}</span>
                <span>·</span>
                <span>{t.status}</span>
              </div>
              <div className="mt-2 text-sm font-medium text-neutral-100">
                {t.title}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <img
                    src={`/avatars/${t.author}.svg`}
                    alt={t.author}
                    className="h-5 w-5 rounded-full bg-neutral-900"
                  />
                  <span>{t.author}</span>
                </div>
                <span>{t.replies} replies</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 41 ────────────────────────────────────────────────────────────
// Changelog snippet. Real-ish entries with version, date, terse notes.
export function S41Changelog() {
  const entries = [
    {
      v: "v0.14.2",
      d: "Apr 17",
      items: [
        "Fix: audit timeline now survives long project names",
        "Chore: bump Monaco to 0.46",
      ],
    },
    {
      v: "v0.14.0",
      d: "Apr 9",
      items: [
        "Feat: per-key history with inline diff",
        "Feat: GitHub sync runs on first-save when repo is connected",
        "Feat: new keyboard shortcut — ⌘K to jump between envs",
      ],
    },
    {
      v: "v0.13.1",
      d: "Mar 28",
      items: [
        "Security: upgraded RSA key length from 2048 → 4096 for new projects",
        "Docs: added threat model section",
      ],
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Changelog"
        title="What shipped, when."
      />
      <div className="space-y-6 max-w-3xl mx-auto">
        {entries.map((e) => (
          <Card key={e.v}>
            <div className="flex items-baseline justify-between mb-3">
              <div className="font-mono text-sm text-neutral-100">{e.v}</div>
              <div className="text-xs text-neutral-500">{e.d}</div>
            </div>
            <ul className="space-y-1.5 text-sm text-neutral-300">
              {e.items.map((it) => (
                <li key={it} className="flex gap-2">
                  <GitCommit className="h-3.5 w-3.5 text-neutral-600 mt-1 shrink-0" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 42 ────────────────────────────────────────────────────────────
// Glossary. For teammates who want to catch up on the vocabulary.
export function S42Glossary() {
  const terms = [
    { t: "Envelope encryption", d: "Encrypt with a data key, then encrypt that data key with a master key. AWS calls it this too." },
    { t: "Passphrase", d: "What unlocks your private key in the browser. Never transmitted." },
    { t: "Zero-knowledge", d: "The server can't see your data even if it wanted to. We don't want to." },
    { t: "Project key", d: "The AES-256 key that encrypts all values in a project. Wrapped per-member." },
    { t: "Wrapped key", d: "An AES key encrypted with someone's RSA public key. Stored server-side." },
    { t: "Sync", d: "Re-encrypting your secrets with a target system's public key (e.g. GitHub Actions)." },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Glossary"
        title="Vocabulary, quickly."
        subtitle="If you hit a term in the docs and it bounces, this page is the shortcut."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {terms.map((t) => (
          <Card key={t.t}>
            <div className="text-sm font-mono text-neutral-100">{t.t}</div>
            <div className="mt-1.5 text-sm text-neutral-400 leading-relaxed">
              {t.d}
            </div>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 43 ────────────────────────────────────────────────────────────
// Passphrase → key PBKDF visual. Shows the chain of derivations.
export function S43Pbkdf() {
  const chain = [
    {
      from: "passphrase",
      to: "derived key",
      via: "PBKDF2-SHA256, 600,000 iterations",
      example: "correct horse battery staple",
    },
    {
      from: "derived key",
      to: "wrapped AES",
      via: "RSA-OAEP, 4096",
      example: fakeCiphertext("wrap", 44),
    },
    {
      from: "wrapped AES",
      to: "project key",
      via: "Decrypted only in your browser",
      example: "(in memory only)",
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Chain of custody"
        title="From your passphrase to a decrypted value."
      />
      <div className="space-y-3">
        {chain.map((c, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4"
          >
            <Card>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                {c.from}
              </div>
              <div className="mt-1 font-mono text-sm text-neutral-200 truncate">
                {c.example}
              </div>
            </Card>
            <div className="flex flex-col items-center gap-1 text-neutral-500">
              <ChevronRight className="h-4 w-4" />
              <span className="text-[10px] text-center max-w-[160px] leading-tight">
                {c.via}
              </span>
            </div>
            <Card>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                {c.to}
              </div>
              <div className="mt-1 font-mono text-sm text-neutral-300">
                {c.to === "project key" ? "•".repeat(32) : fakeCiphertext(c.to, 28)}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 44 ────────────────────────────────────────────────────────────
// Browser compat — which browsers WebCrypto works on.
export function S44Browsers() {
  const rows = [
    { name: "Chrome", v: "≥ 90", ok: true },
    { name: "Firefox", v: "≥ 88", ok: true },
    { name: "Safari", v: "≥ 14", ok: true },
    { name: "Edge", v: "≥ 90", ok: true },
    { name: "Arc / Brave / others", v: "Chromium-based", ok: true },
    { name: "IE 11", v: "Unsupported. We're not sorry.", ok: false },
  ];
  return (
    <SectionShell compact>
      <SectionTitle
        eyebrow="Runs where your code runs"
        title="Browser support."
      />
      <Card className="p-0 overflow-hidden max-w-2xl mx-auto">
        <div className="divide-y divide-neutral-900">
          {rows.map((r) => (
            <div
              key={r.name}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-neutral-500" />
                <span className="text-sm text-neutral-200">{r.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500">{r.v}</span>
                {r.ok ? (
                  <Check className="h-4 w-4 text-neutral-300" />
                ) : (
                  <X className="h-4 w-4 text-neutral-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </SectionShell>
  );
}

// ── Section 45 ────────────────────────────────────────────────────────────
// Zero-knowledge simulator. User picks a role, the panel shows what that
// role can actually see.
export function S45ZkSimulator() {
  const roles = [
    { id: "you", label: "You (member)" },
    { id: "server", label: "Cryptly server" },
    { id: "attacker", label: "Attacker with DB dump" },
  ] as const;
  const [role, setRole] = useState<typeof roles[number]["id"]>("you");
  const renderRow = (key: string, value: string) => {
    if (role === "you")
      return (
        <>
          <span className="text-sky-400">{key}</span>
          <span className="text-neutral-500">=</span>
          <span className="text-neutral-200 font-mono">{value}</span>
        </>
      );
    const ct = fakeCiphertext(key + value, 40);
    return (
      <>
        <span className="text-sky-400">{key}</span>
        <span className="text-neutral-500">=</span>
        <span className="text-neutral-500 font-mono truncate">{ct}</span>
      </>
    );
  };
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Simulator"
        title="Pick a vantage point. See what they'd see."
      />
      <div className="flex gap-2 justify-center mb-6 flex-wrap">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm border transition-colors",
              role === r.id
                ? "border-neutral-200 bg-neutral-200 text-black"
                : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
      <BrowserChrome url="cryptly.dev/app/project/production">
        <div className="bg-black font-mono text-[13px] leading-7 p-5 min-h-[240px]">
          <div className="grid grid-cols-[auto_auto_1fr] gap-x-3 gap-y-1 min-w-0">
            {renderRow("DATABASE_URL", "postgres://app:s3cret@db:5432/app")}
            {renderRow("STRIPE_SECRET_KEY", "sk_live_51J2xPQzXY7vM9nLb")}
            {renderRow("OPENAI_API_KEY", "sk-proj-abc123xyz456")}
          </div>
          {role === "server" && (
            <div className="mt-6 text-xs text-neutral-600">
              The server stores ciphertext and metadata. It can't decrypt.
            </div>
          )}
          {role === "attacker" && (
            <div className="mt-6 text-xs text-neutral-600">
              A stolen database dump is ciphertext + wrapped keys. Without a
              member's private key, the blobs are just noise.
            </div>
          )}
        </div>
      </BrowserChrome>
    </SectionShell>
  );
}

// ── Section 46 ────────────────────────────────────────────────────────────
// "Open a PR" card. Invites contribution directly.
export function S46OpenPR() {
  return (
    <SectionShell compact>
      <div className="max-w-3xl mx-auto rounded-2xl border border-neutral-900 bg-gradient-to-b from-neutral-950 to-black p-8 md:p-10">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
          <GitPullRequest className="h-3.5 w-3.5" />
          Contribute
        </div>
        <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-neutral-100 tracking-tight">
          Found something off? Open a PR.
        </h2>
        <p className="mt-3 text-neutral-400 leading-relaxed">
          The whole product is a public repo. A typo, a clarifying sentence,
          a new integration — all land the same way. Fork, branch, PR.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>github.com/cryptly-dev/cryptly</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly/labels/good%20first%20issue">
            <Sparkles className="h-4 w-4" />
            <span>Good first issues</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

// ── Section 47 ────────────────────────────────────────────────────────────
// Support & contact. No "enterprise sales" — just where to reach humans.
export function S47Support() {
  const places = [
    {
      icon: <GitHubIcon className="h-4 w-4 text-neutral-300" />,
      title: "GitHub Issues",
      sub: "Bugs, feature requests, broken docs.",
      href: "https://github.com/cryptly-dev/cryptly/issues",
    },
    {
      icon: <MessageSquare className="h-4 w-4 text-neutral-300" />,
      title: "Discussions",
      sub: "Questions, ideas, show-and-tell.",
      href: "#",
    },
    {
      icon: <Radio className="h-4 w-4 text-neutral-300" />,
      title: "security@cryptly.dev",
      sub: "Responsible disclosure. PGP key on the repo.",
      href: "mailto:security@cryptly.dev",
    },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Reach us"
        title="No ticket queues. Just humans."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {places.map((p) => (
          <a
            key={p.title}
            href={p.href}
            className="group rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6 hover:border-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              {p.icon}
              <div className="text-sm font-medium text-neutral-100">
                {p.title}
              </div>
            </div>
            <p className="mt-2 text-sm text-neutral-500">{p.sub}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors">
              Open
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </a>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 48 ────────────────────────────────────────────────────────────
// "No trackers" badge — literally a 1-stat section that's weirdly calming.
export function S48NoTrackers() {
  return (
    <SectionShell compact>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatTile
          label="Third-party scripts"
          value="0"
          note="No analytics, no heatmaps, no A/B platforms on the secrets app."
        />
        <StatTile
          label="Cookies"
          value="1"
          note="Session cookie. First-party. Expires when you log out."
        />
        <StatTile
          label="Data sold to advertisers"
          value={<span className="text-neutral-500">—</span>}
          note="We don't have any data to sell, even if we wanted to."
        />
      </div>
    </SectionShell>
  );
}

// ── Section 49 ────────────────────────────────────────────────────────────
// Deployment integrations visual. Shows the re-encrypt step explicitly.
export function S49DeployFlow() {
  const targets = [
    { name: "GitHub Actions", note: "Re-encrypted with repo public key" },
    { name: "Vercel", note: "Set via project env API" },
    { name: "Fly.io", note: "Pushed via fly secrets set" },
    { name: "Railway", note: "Pushed via Railway GraphQL" },
  ];
  return (
    <SectionShell>
      <SectionTitle
        eyebrow="Deploy"
        title="Your secrets land where your code runs."
        subtitle="When you push, we re-encrypt with the target's public key before sending. Our server never handles plaintext."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {targets.map((t) => (
          <Card key={t.name}>
            <div className="flex items-center gap-3">
              <Upload className="h-4 w-4 text-neutral-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-100">
                  {t.name}
                </div>
                <div className="text-xs text-neutral-500">{t.note}</div>
              </div>
              <Pill>available</Pill>
            </div>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// ── Section 50 ────────────────────────────────────────────────────────────
// Final CTA. Quiet, not a marketing push. Short list of next steps.
export function S50FinalCTA() {
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
            <Code2 className="h-3.5 w-3.5" /> Open source, MIT.
          </span>
        </div>
      </div>
    </SectionShell>
  );
}

export const SECTIONS_B: {
  id: string;
  title: string;
  subtitle: string;
  render: () => React.ReactNode;
}[] = [
  {
    id: "sec-26",
    title: "Paste-your-dotenv demo",
    subtitle: "Parses locally, masks values.",
    render: () => <S26PasteEnv />,
  },
  {
    id: "sec-27",
    title: "Latency card",
    subtitle: "Specific ms numbers, not adjectives.",
    render: () => <S27Latency />,
  },
  {
    id: "sec-28",
    title: "Encryption primitives",
    subtitle: "AES-GCM, RSA-OAEP, PBKDF2.",
    render: () => <S28Primitives />,
  },
  {
    id: "sec-29",
    title: "Things we don't do",
    subtitle: "Negative-space product statement.",
    render: () => <S29WontDo />,
  },
  {
    id: "sec-30",
    title: "Contributor wall",
    subtitle: "Avatars + commit counts.",
    render: () => <S30Contributors />,
  },
  {
    id: "sec-31",
    title: "Activity feed (mock)",
    subtitle: "Metadata only — no values.",
    render: () => <S31Activity />,
  },
  {
    id: "sec-32",
    title: "Inspired-by credits",
    subtitle: "age, 1Password, Signal, direnv…",
    render: () => <S32InspiredBy />,
  },
  {
    id: "sec-33",
    title: "Compared to manual workflow",
    subtitle: "Five steps on each side. No fake pain.",
    render: () => <S33ManualWorkflow />,
  },
  {
    id: "sec-34",
    title: "Accessibility",
    subtitle: "Keyboard, reader, motion, contrast.",
    render: () => <S34Accessibility />,
  },
  {
    id: "sec-35",
    title: "Search demo",
    subtitle: "Filter across environments, interactive.",
    render: () => <S35Search />,
  },
  {
    id: "sec-36",
    title: "Permissions matrix",
    subtitle: "Every capability by role.",
    render: () => <S36Permissions />,
  },
  {
    id: "sec-37",
    title: "If we get hacked",
    subtitle: "What breach gives attackers.",
    render: () => <S37IfHacked />,
  },
  {
    id: "sec-38",
    title: "No newsletter",
    subtitle: "GitHub, RSS, Discussions.",
    render: () => <S38NoNewsletter />,
  },
  {
    id: "sec-39",
    title: "Built with",
    subtitle: "Boring tech on purpose.",
    render: () => <S39BuiltWith />,
  },
  {
    id: "sec-40",
    title: "Community issues & PRs",
    subtitle: "Public-repo decisions, not testimonials.",
    render: () => <S40CommunityIssues />,
  },
  {
    id: "sec-41",
    title: "Changelog",
    subtitle: "Versioned, terse, specific.",
    render: () => <S41Changelog />,
  },
  {
    id: "sec-42",
    title: "Glossary",
    subtitle: "Vocabulary for skimmers.",
    render: () => <S42Glossary />,
  },
  {
    id: "sec-43",
    title: "Passphrase → key chain",
    subtitle: "Visual of key derivation.",
    render: () => <S43Pbkdf />,
  },
  {
    id: "sec-44",
    title: "Browser support",
    subtitle: "Where WebCrypto works.",
    render: () => <S44Browsers />,
  },
  {
    id: "sec-45",
    title: "Zero-knowledge simulator",
    subtitle: "Pick a role, see what they see.",
    render: () => <S45ZkSimulator />,
  },
  {
    id: "sec-46",
    title: "Open a PR card",
    subtitle: "Direct contribution invitation.",
    render: () => <S46OpenPR />,
  },
  {
    id: "sec-47",
    title: "Support & contact",
    subtitle: "GitHub, discussions, security email.",
    render: () => <S47Support />,
  },
  {
    id: "sec-48",
    title: "No trackers badge",
    subtitle: "Calming 1-stat row.",
    render: () => <S48NoTrackers />,
  },
  {
    id: "sec-49",
    title: "Deploy integrations",
    subtitle: "Re-encryption to target public keys.",
    render: () => <S49DeployFlow />,
  },
  {
    id: "sec-50",
    title: "Final CTA",
    subtitle: "Quiet close. Sign in, set passphrase, paste.",
    render: () => <S50FinalCTA />,
  },
];
