import Beams from "@/components/Beams";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Code2,
  Eye,
  EyeOff,
  Heart,
  KeyRound,
  Lock,
  Minus,
  Plus,
  Slack,
} from "lucide-react";
import { useMemo, useState } from "react";
import { fakeCiphertext, GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A1 — "The Confessional"
 * Formula A · Narrative arc: status quo → tension → new world → bridge → proof → CTA
 * Angle: Tell the uncomfortable truth, then resolve it.
 * ──────────────────────────────────────────────────────────────────────────── */

function StepHeader({ step, label }: { step: number; label: string }) {
  return (
    <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
      <span className="text-neutral-600 tabular-nums">
        {String(step).padStart(2, "0")} / 06
      </span>
      <span className="h-px flex-1 bg-neutral-900" />
      <span className="text-neutral-400 font-semibold">{label}</span>
    </div>
  );
}

function A1Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-black">
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

      <div className="relative z-10 mx-auto max-w-4xl w-full px-6 py-24 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium uppercase tracking-[0.22em] bg-rose-500/10 text-rose-300 border-rose-500/30">
          A confession
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight">
          Your team has a Google Doc full of API keys.
        </h1>
        <p className="mt-7 text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          And a Slack DM. And a pinned channel. And a 'temp_prod_creds_FINAL.txt' nobody has deleted since 2023.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Fix it</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </PrimaryCTA>
          <GhostCTA href="#step-one">
            <span>Or let me scroll, I guess</span>
          </GhostCTA>
        </div>
      </div>
    </section>
  );
}

const A1_CHAOS = [
  { who: "marcus", text: "hey can u resend the stripe key", at: "yesterday" },
  { who: "priya", text: "DATABASE_URL=postgres://… (expires tomorrow pls rotate)", at: "2d" },
  { who: "alex", text: "oh the .env is pinned in #eng-random btw", at: "3d" },
  { who: "nina", text: "lol wait which one is prod again", at: "4d" },
  { who: "marcus", text: "ignore last msg forgot to rotate OPENAI_API_KEY", at: "5d" },
  { who: "ex-dev", text: "still have access to the vault just fyi 👋", at: "last week" },
];

function A1StatusQuo() {
  return (
    <div id="step-one">
      <SectionShell>
        <StepHeader step={1} label="Name the status quo" />
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            This is how most teams ship secrets.
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Nobody is proud of it. Everybody is doing it.
          </p>
        </div>

        <div className="mt-16 max-w-xl mx-auto">
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-900 text-xs text-neutral-400">
              <Slack className="h-3.5 w-3.5" />
              <span>#eng-ops</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-600">34 unread</span>
            </div>
            <div className="p-4 space-y-3">
              {A1_CHAOS.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 h-7 w-7 rounded-md bg-neutral-800 border border-neutral-700 grid place-items-center text-[10px] uppercase text-neutral-300">
                    {m.who.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-200">
                        @{m.who}
                      </span>
                      <span className="text-[11px] text-neutral-600">
                        {m.at}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-400 font-mono break-all">
                      {m.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}

function A1Tension() {
  return (
    <SectionShell>
      <StepHeader step={2} label="Name the tension" />
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] text-center">
          Each one is a breach waiting to happen.
        </h2>
        <div className="mt-12 rounded-2xl border border-rose-500/30 bg-rose-500/[0.03] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-rose-300 mt-1 shrink-0" />
            <div className="text-neutral-300 leading-relaxed space-y-4">
              <p>
                Slack is a persistent search index. Google Docs are shared with six
                people who don't work here anymore. Laptops go missing. Browser
                extensions read your clipboard. An AWS key in <code>#eng-random</code>{" "}
                is a subpoena, a phish, or a disgruntled ex-hire away from the
                front page.
              </p>
              <p className="text-neutral-400">
                The attack surface isn't your code. It's the seventeen places
                your team accidentally wrote down a credential this quarter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

const A1_PROMISES = [
  {
    label: "One vault",
    body: "Every credential in one place. Encrypted before it leaves your browser.",
  },
  {
    label: "One source of truth",
    body: "Rotate once. CI, staging, every dev machine picks it up. No Slack followups.",
  },
  {
    label: "One revoke",
    body: "Engineer leaves? One click. Access is gone. Key is rewrapped for everyone else.",
  },
  {
    label: "Zero leverage",
    body: "Our database holds ciphertext. A breach of us publishes noise.",
  },
];

function A1NewWorld() {
  return (
    <SectionShell>
      <StepHeader step={3} label="Paint the new world" />
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Imagine a quieter way to ship.
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          No more "can you send me the .env?" No more archaeology when someone
          leaves. No more pinned messages full of live credentials.
        </p>
      </div>
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {A1_PROMISES.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6"
          >
            <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
              {f.label}
            </div>
            <p className="mt-3 text-neutral-300 leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

const A1_BRIDGE_ROWS = [
  { key: "DATABASE_URL", value: "postgres://u:p@db.internal/app" },
  { key: "STRIPE_SECRET_KEY", value: "sk_live_72Mky8qRt9tWnOpC" },
  { key: "JWT_SIGNING_KEY", value: "kJ9f2LmN8aQq3PzVxT4wYrUi" },
  { key: "OPENAI_API_KEY", value: "sk-proj-AbcDef123xyz456" },
];

function A1Bridge() {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  return (
    <SectionShell>
      <StepHeader step={4} label="Bridge the gap" />
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Meet Cryptly.
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          The vault we built because we didn't trust anyone else's — including our own.
        </p>
      </div>

      <div className="mt-16 max-w-2xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl shadow-black/50">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-900">
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
          <div className="ml-3 text-xs text-neutral-500 font-mono">
            production · .env
          </div>
        </div>
        <div className="p-4 space-y-2 font-mono text-sm">
          {A1_BRIDGE_ROWS.map((r) => {
            const isRev = !!revealed[r.key];
            return (
              <div
                key={r.key}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-900/40 border border-neutral-800/50"
              >
                <Lock className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
                <span className="text-sky-400 shrink-0">{r.key}</span>
                <span className="text-neutral-600">=</span>
                <span
                  className={cn(
                    "flex-1 truncate min-w-0",
                    isRev
                      ? "text-neutral-300"
                      : "text-neutral-500 tracking-widest"
                  )}
                >
                  {isRev ? r.value : "•".repeat(20)}
                </span>
                <button
                  onClick={() =>
                    setRevealed((p) => ({ ...p, [r.key]: !p[r.key] }))
                  }
                  className="text-neutral-500 hover:text-neutral-200"
                >
                  {isRev ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-2.5 border-t border-neutral-900 text-[11px] text-neutral-500 flex items-center gap-2">
          <Lock className="h-3 w-3" /> values decrypt in your browser only
        </div>
      </div>
    </SectionShell>
  );
}

function A1Proof() {
  const dump = useMemo(() => fakeCiphertext("a1-proof", 1400), []);
  return (
    <SectionShell>
      <StepHeader step={5} label="Prove it's possible" />
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Here's what a breach of us would publish.
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          One opaque ciphertext blob per project. Useless without a passphrase
          that never left your browser.
        </p>
      </div>
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-900 text-xs">
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="font-mono">project.vault — cryptly/prod</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-600">
              raw
            </span>
          </div>
          <div
            className="p-5 md:p-6 font-mono text-[11px] md:text-[12px] leading-5 text-neutral-500 break-all"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {dump}
          </div>
          <div className="px-5 pb-3 text-[11px] text-neutral-600">
            Publish this. Enjoy.
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function A1CTA() {
  return (
    <SectionShell>
      <StepHeader step={6} label="Call to the next step" />
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="mt-4 text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.05]">
          Close the Slack tab. Open Cryptly.
        </h2>
        <p className="mt-5 text-neutral-400 text-lg leading-relaxed">
          Three minutes from here to a vault your team actually wants to use.
          No plan, no upsell, no catch.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Sign in</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>See the source</span>
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
            <Code2 className="h-3.5 w-3.5" /> MIT-licensed.
          </span>
        </div>
      </div>
    </SectionShell>
  );
}

const A1_FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Isn't this embarrassing?",
    a: "Mildly. Everyone does it — we're just the first to print the confession on our landing page. The point isn't shame; it's that the tooling should remove the temptation to DM secrets in the first place.",
  },
  {
    q: "What does 'we can't read it' actually mean?",
    a: "AES-256-GCM with a key derived from your passphrase in your browser. Our database receives a ciphertext blob. We do not hold the key — not architecturally, not by policy.",
  },
  {
    q: "Lose passphrase = lose vault?",
    a: "Yes. That's what makes the claim truthful. We recommend a personal password manager for the passphrase, plus at least one co-owner per project.",
  },
];

function A1FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight text-center">
          Questions we've had to answer.
        </h2>
        <div className="mt-10 rounded-2xl border border-neutral-900 bg-neutral-950/40 px-6">
          {A1_FAQS.map((f, i) => (
            <div
              key={i}
              className="border-b border-neutral-900 last:border-b-0"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center gap-4 py-5 text-left"
              >
                <span className="flex-1 text-base md:text-lg font-medium text-neutral-100">
                  {f.q}
                </span>
                <span className="h-7 w-7 rounded-full border border-neutral-800 grid place-items-center text-neutral-400">
                  {openIdx === i ? (
                    <Minus className="h-3.5 w-3.5" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-5 pr-12 text-neutral-400 text-sm leading-relaxed">
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantA1() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A1Hero />
      <A1StatusQuo />
      <A1Tension />
      <A1NewWorld />
      <A1Bridge />
      <A1Proof />
      <A1FAQ />
      <A1CTA />
    </div>
  );
}
