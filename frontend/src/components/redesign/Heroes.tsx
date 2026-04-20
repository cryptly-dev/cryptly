import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { CryptlyLogo } from "@/components/ui/CryptlyLogo";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  CommandIcon,
  Fingerprint,
  KeyRound,
  Lock,
  Shield,
  Sparkles,
  Terminal,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  BrowserChrome,
  FakeTerminal,
  GhostCTA,
  HeroHeadline,
  HeroShell,
  HoverRevealMask,
  MockEnvEditor,
  Pill,
  PrimaryCTA,
  fakeCiphertext,
  passphraseEntropyBits,
} from "./common";

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

const GUARANTEES = (
  <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-500">
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-neutral-400" /> End-to-end encrypted
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-neutral-400" /> Free, forever
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-neutral-400" /> Open source
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-neutral-400" /> No telemetry on secrets
    </span>
  </div>
);

// ── Hero 1 ─────────────────────────────────────────────────────────────────
// "Secrets should be boring" — large restrained headline with a small
// encrypted .env preview floating under it. Minimal, editorial.
export function Hero1() {
  return (
    <HeroShell>
      <div className="max-w-3xl">
        <Pill>
          <Lock className="h-3 w-3" /> Zero-knowledge by construction
        </Pill>
        <h1 className="mt-6 text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight">
          Secrets should be{" "}
          <span className="text-neutral-500">boring.</span>
          <br />
          We made them boring.
        </h1>
        <p className="mt-6 text-lg text-neutral-400 max-w-xl">
          Cryptly stores your <code className="text-neutral-200">.env</code>{" "}
          files encrypted in your browser. Our servers hold the ciphertext. The
          only thing we can see is that you exist.
        </p>
        {HERO_CTAS}
      </div>
      <div className="mt-14 max-w-2xl">
        <MockEnvEditor
          rows={[
            { key: "# production credentials", value: "", comment: true },
            { key: "DATABASE_URL", value: "postgres://u:p@db.internal:5432/app" },
            { key: "STRIPE_SECRET_KEY", value: "sk_live_51Nxj7pLk..." },
            { key: "JWT_SIGNING_KEY", value: "kJ9f2LmN8aQq3PzVxT..." },
          ]}
        />
        <div className="mt-3 text-xs text-neutral-600">
          Hover a value to reveal it. Otherwise it stays dots — locally and
          everywhere else.
        </div>
      </div>
    </HeroShell>
  );
}

// ── Hero 2 ─────────────────────────────────────────────────────────────────
// Manifesto — single sentence, serif-ish weight, dead center, almost nothing
// else. For people who think marketing pages are noise.
export function Hero2() {
  return (
    <HeroShell className="items-center text-center">
      <div className="mx-auto">
        <CryptlyLogo size={48} className="mx-auto mb-8" active />
        <h1 className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1.05] tracking-tight max-w-3xl">
          Your secrets are none of our business.
        </h1>
        <p className="mt-6 text-lg text-neutral-400 max-w-xl mx-auto">
          A secrets manager built so that even we can't read what's in it. Open
          source. Free. Unapologetically small.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            Start using it
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            Read the source
          </GhostCTA>
        </div>
        <div className="mt-14 text-xs text-neutral-600">
          No trial. No "book a demo". No pricing page.
        </div>
      </div>
    </HeroShell>
  );
}

// ── Hero 3 ─────────────────────────────────────────────────────────────────
// Interactive terminal — types out a `cryptly push` that synchronises secrets
// to GitHub Actions. Feels like watching a dev at work.
export function Hero3() {
  const script = useMemo(
    () => [
      { kind: "prompt" as const, text: "cryptly push production" },
      { kind: "dim" as const, text: "→ decrypting locally with your passphrase" },
      { kind: "dim" as const, text: "→ computing repo secret diffs" },
      { kind: "ok" as const, text: "✓ 12 secrets pushed to cryptly-dev/api" },
      { kind: "ok" as const, text: "✓ 12 secrets pushed to cryptly-dev/web" },
      { kind: "dim" as const, text: "   (server never saw a plaintext byte)" },
    ],
    []
  );
  const [shown, setShown] = useState(1);
  useEffect(() => {
    if (shown >= script.length) return;
    const t = window.setTimeout(() => setShown((s) => s + 1), 550);
    return () => window.clearTimeout(t);
  }, [shown, script.length]);
  return (
    <HeroShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div>
          <Pill>
            <Terminal className="h-3 w-3" /> Built for people who live in a
            terminal
          </Pill>
          <h1 className="mt-6 text-5xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
            Push secrets the same way you push code.
          </h1>
          <p className="mt-6 text-lg text-neutral-400 max-w-xl">
            Write them once. Sync to every repo with one command — or one
            button, if you're into that. Your plaintext stays on your laptop.
          </p>
          {HERO_CTAS}
          {GUARANTEES}
        </div>
        <FakeTerminal lines={script.slice(0, shown)} />
      </div>
    </HeroShell>
  );
}

// ── Hero 4 ─────────────────────────────────────────────────────────────────
// Real-app glimpse — a shrunk mock of the editor inside a browser chrome.
// The CTA promises you land exactly here.
export function Hero4() {
  return (
    <HeroShell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <Pill>
            <Sparkles className="h-3 w-3" /> The whole product in one screen
          </Pill>
          <h1 className="mt-6 text-5xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
            One tab. One passphrase. Every secret you own.
          </h1>
          <p className="mt-6 text-lg text-neutral-400 max-w-xl">
            No new CLI to learn. No YAML to hand-roll. It's the editor you'd
            have built — except the values stay encrypted the whole way down.
          </p>
          {HERO_CTAS}
        </div>
        <BrowserChrome url="cryptly.dev/app/project/api-prod">
          <div className="p-4">
            <MockEnvEditor
              rows={[
                { key: "NODE_ENV", value: "production" },
                { key: "DATABASE_URL", value: "postgres://prod:XxYy...@db/x" },
                { key: "REDIS_URL", value: "redis://default:pw@redis:6379" },
                { key: "OPENAI_API_KEY", value: "sk-proj-AbcDef123..." },
                { key: "SENTRY_DSN", value: "https://abc@o0.ingest.sentry.io/1" },
                { key: "S3_ACCESS_KEY", value: "AKIA7LMNOP..." },
              ]}
            />
            <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-neutral-500">
              <span>6 secrets · saved 14s ago</span>
              <span className="inline-flex items-center gap-1">
                <GitHubIcon className="h-3 w-3" /> synced to cryptly-dev/api
              </span>
            </div>
          </div>
        </BrowserChrome>
      </div>
    </HeroShell>
  );
}

// ── Hero 5 ─────────────────────────────────────────────────────────────────
// Interactive passphrase — user types one, sees a live entropy meter, and the
// "vault" opens once it's strong enough. Feels tactile.
export function Hero5() {
  const [pass, setPass] = useState("");
  const bits = passphraseEntropyBits(pass);
  const unlocked = bits >= 60;
  return (
    <HeroShell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <Pill>
            <KeyRound className="h-3 w-3" /> Derived, never stored
          </Pill>
          <h1 className="mt-6 text-5xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
            Your passphrase is the key.
            <br />
            <span className="text-neutral-500">Literally.</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-400 max-w-xl">
            Type something only you know. We stretch it into an AES-256 key in
            your browser and use it to decrypt your private key. Lose it and
            nobody — us included — can help.
          </p>
          {HERO_CTAS}
        </div>
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6">
          <label className="text-xs uppercase tracking-wider text-neutral-500">
            Try a passphrase
          </label>
          <input
            type="text"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="correct horse battery staple"
            className="mt-2 w-full rounded-lg border border-neutral-800 bg-black px-3 py-2.5 text-sm text-neutral-100 font-mono outline-none focus:border-neutral-600"
          />
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-neutral-900 overflow-hidden">
              <motion.div
                className={cn(
                  "h-full",
                  bits < 40 && "bg-neutral-700",
                  bits >= 40 && bits < 60 && "bg-amber-600",
                  bits >= 60 && "bg-emerald-500"
                )}
                animate={{ width: `${Math.min(100, (bits / 100) * 100)}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <div className="text-xs text-neutral-500 w-16 text-right font-mono">
              {bits} bits
            </div>
          </div>
          <motion.div
            className="mt-6 rounded-lg border border-neutral-900 bg-black p-4 flex items-center gap-3"
            animate={{ opacity: unlocked ? 1 : 0.4 }}
          >
            <motion.div animate={{ rotate: unlocked ? 0 : -20 }}>
              <Lock
                className={cn(
                  "h-5 w-5",
                  unlocked ? "text-emerald-400" : "text-neutral-500"
                )}
              />
            </motion.div>
            <div className="text-sm">
              <div className="text-neutral-200">
                {unlocked ? "Vault unlocked" : "Keep typing…"}
              </div>
              <div className="text-xs text-neutral-500">
                {unlocked
                  ? "Private key decrypted locally. Server saw nothing."
                  : "We want at least 60 bits of entropy."}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </HeroShell>
  );
}

// ── Hero 6 ─────────────────────────────────────────────────────────────────
// Zero-knowledge split — two side-by-side panels, yours (decrypted) vs ours
// (dotted). Slides in as you scroll. No good/evil framing — it's just the
// physics of the system.
export function Hero6() {
  const rows = [
    { key: "DATABASE_URL", value: "postgres://prod:s3cret@db:5432/app" },
    { key: "STRIPE_KEY", value: "sk_live_abc123def456" },
    { key: "JWT_SECRET", value: "kJ9f2LmN8aQq3PzVxT4wYrUi" },
  ];
  return (
    <HeroShell>
      <div className="text-center max-w-2xl mx-auto">
        <HeroHeadline
          eyebrow="Zero knowledge, not zero effort"
          title={
            <>
              This is what <span className="text-neutral-500">you</span> see.
              <br />
              This is what <span className="text-neutral-500">we</span> see.
            </>
          }
          subtitle={
            <>
              Same data, two views. The only difference is whether the
              passphrase is on this device.
            </>
          }
          className="text-center"
        />
      </div>
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Fingerprint className="h-3.5 w-3.5" /> You
            </span>
            <span>decrypted in-browser</span>
          </div>
          <div className="p-3 font-mono text-[13px] leading-6">
            {rows.map((r, i) => (
              <div key={i} className="flex">
                <span className="text-sky-400">{r.key}</span>
                <span className="text-neutral-500">=</span>
                <span className="text-neutral-300 truncate">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Our servers
            </span>
            <span>ciphertext only</span>
          </div>
          <div className="p-3 font-mono text-[11px] leading-5 text-neutral-400 break-all">
            {fakeCiphertext("cryptly-hero-6-demo", 360)}
          </div>
        </div>
      </div>
      <div className="mt-10 flex justify-center">{HERO_CTAS}</div>
    </HeroShell>
  );
}

// ── Hero 7 ─────────────────────────────────────────────────────────────────
// Typography hero — the headline itself contains dotted masks, making the
// product idea visible before you read a word.
export function Hero7() {
  return (
    <HeroShell className="items-center text-center">
      <div className="mx-auto max-w-4xl">
        <Pill>
          <Lock className="h-3 w-3" /> Hover the blanks
        </Pill>
        <h1 className="mt-6 text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Every API key,{" "}
          <HoverRevealMask
            value="encrypted"
            className="px-2 text-neutral-200"
          />
          .
          <br />
          Every teammate,{" "}
          <HoverRevealMask
            value="invited"
            className="px-2 text-neutral-200"
          />
          .
          <br />
          Every server,{" "}
          <HoverRevealMask
            value="in-sync"
            className="px-2 text-neutral-200"
          />
          .
        </h1>
        <p className="mt-8 text-lg text-neutral-400 max-w-xl mx-auto">
          Cryptly gives every secret the same treatment as the ones in the
          headline. Dots until you need them.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <PrimaryCTA>
            Open dashboard
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" /> Source
          </GhostCTA>
        </div>
      </div>
    </HeroShell>
  );
}

// ── Hero 8 ─────────────────────────────────────────────────────────────────
// Animated sync — a stylised "push" button with three targets filling in one
// by one. Shows the core verb of the product without comparing to anything.
export function Hero8() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setStep((s) => (s + 1) % 5), 900);
    return () => window.clearTimeout(t);
  });
  return (
    <HeroShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
        <div>
          <Pill>
            <Upload className="h-3 w-3" /> One click. Every repo. Every env.
          </Pill>
          <h1 className="mt-6 text-5xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
            Write once.
            <br />
            Push everywhere.
          </h1>
          <p className="mt-6 text-lg text-neutral-400 max-w-xl">
            A single <code className="text-neutral-200">Push</code> decrypts
            locally, re-encrypts for each target, and ships your secrets to
            every repo you've connected.
          </p>
          {HERO_CTAS}
        </div>
        <div className="relative rounded-2xl border border-neutral-900 bg-neutral-950/60 p-10">
          <div className="relative h-64 flex items-center justify-center">
            <div className="relative z-10">
              <div className="rounded-full bg-white text-black px-8 py-3 font-semibold shadow-2xl">
                Push
              </div>
            </div>
            {[
              { dx: 200, dy: -80, label: "api" },
              { dx: 210, dy: 10, label: "web" },
              { dx: 195, dy: 95, label: "workers" },
            ].map((t, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `translate(calc(-50% + ${t.dx}px), calc(-50% + ${t.dy}px))`,
                }}
              >
                <motion.div
                  className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs text-neutral-300"
                  animate={{
                    borderColor:
                      step > i
                        ? "rgb(16 185 129 / 0.6)"
                        : "rgb(38 38 38)",
                  }}
                >
                  <GitHubIcon className="h-3 w-3" />
                  cryptly-dev/{t.label}
                  <AnimatePresence>
                    {step > i && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-emerald-400"
                      >
                        <Check className="h-3 w-3" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            ))}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 400 260"
            >
              {[
                { y1: 130, y2: 50 },
                { y1: 130, y2: 140 },
                { y1: 130, y2: 225 },
              ].map((l, i) => (
                <line
                  key={i}
                  x1={200}
                  y1={l.y1}
                  x2={340}
                  y2={l.y2}
                  stroke={
                    step > i ? "rgb(16 185 129 / 0.6)" : "rgb(38 38 38)"
                  }
                  strokeWidth={1.5}
                  strokeDasharray="3 4"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </HeroShell>
  );
}

// ── Hero 9 ─────────────────────────────────────────────────────────────────
// Shortcut-forward — for devs who will judge the product by whether it has
// Cmd+S wired up.
export function Hero9() {
  return (
    <HeroShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
        <div>
          <Pill>
            <CommandIcon className="h-3 w-3" /> Keyboard-first
          </Pill>
          <h1 className="mt-6 text-5xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
            Edit. Save. Push.
            <br />
            <span className="text-neutral-500">Everything is a shortcut.</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-400 max-w-xl">
            Every action you'd reach for with a mouse has a shortcut. Most
            secrets flows are three keystrokes from done.
          </p>
          {HERO_CTAS}
        </div>
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6 space-y-3">
          {[
            {
              label: "Save the current file",
              keys: [
                <CommandIcon key="c" className="h-3 w-3" />,
                "S",
              ] as React.ReactNode[],
            },
            {
              label: "Open command palette",
              keys: [
                <CommandIcon key="c" className="h-3 w-3" />,
                "K",
              ] as React.ReactNode[],
            },
            { label: "Search across projects", keys: ["/"] as React.ReactNode[] },
            {
              label: "Switch project",
              keys: [
                <CommandIcon key="c" className="h-3 w-3" />,
                "P",
              ] as React.ReactNode[],
            },
            {
              label: "Push to integrations",
              keys: [
                <CommandIcon key="c" className="h-3 w-3" />,
                "⇧",
                "P",
              ] as React.ReactNode[],
            },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-neutral-900 bg-black/40 px-4 py-2.5"
            >
              <span className="text-sm text-neutral-300">{row.label}</span>
              <div className="flex items-center gap-1">
                {row.keys.map((k, j) => (
                  <Kbd key={j} className="!bg-neutral-800 !text-neutral-200">
                    {k}
                  </Kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </HeroShell>
  );
}

// ── Hero 10 ────────────────────────────────────────────────────────────────
// Community-first — the product pitch framed as "a thing built in the open".
// Warmer tone, lighter copy.
export function Hero10() {
  return (
    <HeroShell className="items-center text-center">
      <div className="mx-auto max-w-3xl">
        <Pill>
          <GitHubIcon className="h-3 w-3" /> Built in the open, by a few of us
        </Pill>
        <h1 className="mt-6 text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A secrets manager you can actually read.
        </h1>
        <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto">
          Every line of Cryptly is on GitHub. Every decision has an issue. If
          you don't like how we encrypt something, open a PR — we'll probably
          merge it.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA>
            Try it
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            Read the code first
          </GhostCTA>
        </div>
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {[
            { label: "License", value: "MIT" },
            { label: "Price", value: "$0" },
            { label: "Tracking", value: "None" },
            { label: "Lock-in", value: "Zero" },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-900 bg-neutral-950/50 px-4 py-3"
            >
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">
                {s.label}
              </div>
              <div className="mt-1 text-lg font-semibold text-neutral-100">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </HeroShell>
  );
}

export const HEROES: {
  id: string;
  title: string;
  subtitle: string;
  render: () => React.ReactNode;
}[] = [
  {
    id: "hero-1",
    title: "Editorial manifesto + live editor",
    subtitle: '"Secrets should be boring."',
    render: () => <Hero1 />,
  },
  {
    id: "hero-2",
    title: "One-sentence manifesto",
    subtitle: '"Your secrets are none of our business."',
    render: () => <Hero2 />,
  },
  {
    id: "hero-3",
    title: "Terminal-first dev hero",
    subtitle: "Self-typing `cryptly push` demo.",
    render: () => <Hero3 />,
  },
  {
    id: "hero-4",
    title: "Real-app glimpse in browser chrome",
    subtitle: "Shows the actual editor layout.",
    render: () => <Hero4 />,
  },
  {
    id: "hero-5",
    title: "Interactive passphrase vault",
    subtitle: "Entropy meter unlocks a vault preview.",
    render: () => <Hero5 />,
  },
  {
    id: "hero-6",
    title: "Zero-knowledge split view",
    subtitle: "You vs. us — same data, two views.",
    render: () => <Hero6 />,
  },
  {
    id: "hero-7",
    title: "Typography with dotted masks",
    subtitle: "The product idea hides inside the headline.",
    render: () => <Hero7 />,
  },
  {
    id: "hero-8",
    title: "Animated push-to-every-repo",
    subtitle: "One button fans out to connected repos.",
    render: () => <Hero8 />,
  },
  {
    id: "hero-9",
    title: "Keyboard-first pitch",
    subtitle: "Shortcut list on the right.",
    render: () => <Hero9 />,
  },
  {
    id: "hero-10",
    title: "Community & open-source angle",
    subtitle: "Warmer, built-in-the-open framing.",
    render: () => <Hero10 />,
  },
];
