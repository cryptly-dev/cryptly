import Beams from "@/components/Beams";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  GitBranch,
  Lock,
  Minus,
  Plus,
  Rocket,
  Shield,
  Slack,
  Star,
  Timer,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B1 — "Classic Funnel"
 * Formula B · Textbook 8-section architecture
 * Hero → (Success) → Problem-Agitate → Value Stack → Social Proof →
 * Transformation → Secondary CTA → Footer
 * ──────────────────────────────────────────────────────────────────────────── */

/* ── 1. HERO ─────────────────────────────────────────────────────────────── */

function B1Hero() {
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium uppercase tracking-[0.22em] bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
          <BadgeCheck className="h-3 w-3" />
          free · open source · zero-knowledge
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight">
          Secrets management that doesn't secretly store your secrets.
        </h1>
        <p className="mt-7 text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Cryptly is an open-source vault with one catch: we architected it so
          even we can't read what's inside. Ship secrets in minutes, rotate in
          seconds.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Start for free</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Star on GitHub</span>
          </GhostCTA>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" />
            AES-256 client-side
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            SOC 2 ready architecture
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            Unlimited seats
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            2.4k stars
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 2. PROBLEM-AGITATE ─────────────────────────────────────────────────── */

function B1Problem() {
  const problems = [
    {
      Icon: Slack,
      title: "Slack DMs run your infrastructure.",
      body: "Every new engineer is onboarded with 'hey, can you send me the .env?' — and the sender is usually guessing which file is current.",
    },
    {
      Icon: Users,
      title: "Departed engineers never really leave.",
      body: "Access lives in a dozen places: 1Password vaults, .env files on laptops, Notion pages, pinned Slack messages. You're not revoking all of them.",
    },
    {
      Icon: Timer,
      title: "Rotations turn into week-long rituals.",
      body: "Rotate one key. Now chase every machine, every CI runner, every doc, every pinned message. Nobody has time, so nobody does it.",
    },
  ];
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium uppercase tracking-[0.22em] bg-rose-500/10 text-rose-300 border-rose-500/30">
          The status quo
        </div>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          You've been living with this. It's been expensive.
        </h2>
      </div>
      <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {problems.map((p, i) => (
          <div
            key={i}
            className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] p-6"
          >
            <div className="h-10 w-10 rounded-xl border border-rose-500/30 bg-rose-500/10 grid place-items-center text-rose-300">
              <p.Icon className="h-5 w-5" />
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
      <div className="mt-10 text-center text-neutral-500 italic max-w-2xl mx-auto">
        None of this is unusual. It's just expensive to keep ignoring.
      </div>
    </SectionShell>
  );
}

/* ── 3. VALUE STACK ──────────────────────────────────────────────────────── */

const STACK = [
  {
    Icon: Lock,
    name: "Tier 1 · The vault",
    one: "Zero-knowledge secrets storage.",
    bullets: [
      "AES-256-GCM, encrypted client-side",
      "Unlimited projects, unlimited secrets",
      "Signed diffs for every change",
      "Ciphertext-only on our servers",
    ],
    worth: "$1,200/yr equivalent",
  },
  {
    Icon: Users,
    name: "Tier 2 · Team collaboration",
    one: "Invite, revoke, audit in minutes.",
    bullets: [
      "Re-wrapped keys per member",
      "Invite links + passphrases",
      "Remove access in one click",
      "Per-project member lists",
    ],
    worth: "$960/yr equivalent",
  },
  {
    Icon: GitBranch,
    name: "Tier 3 · GitHub Actions sync",
    one: "Push every secret to CI. One click.",
    bullets: [
      "Re-encrypted per repo, client-side",
      "No plaintext on our side",
      "Drop-in replacement for manual steps",
      "Multiple repos, multiple envs",
    ],
    worth: "$720/yr equivalent",
  },
  {
    Icon: Clock,
    name: "Tier 4 · Time travel",
    one: "Audit every change with receipts.",
    bullets: [
      "Signed diff for every save",
      "Filter by author, scope, time",
      "Search inside the diff itself",
      "Decrypted only in your browser",
    ],
    worth: "$720/yr equivalent",
  },
];

function B1ValueStack() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium uppercase tracking-[0.22em] bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
          Everything. Always. Free.
        </div>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Everything you're paying $3,600/yr for. For $0.
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          Open source. Self-host or use ours. Same feature set, no seat gate.
        </p>
      </div>

      <div className="mt-16 md:mt-20 max-w-3xl mx-auto space-y-4">
        {STACK.map((t, i) => (
          <div
            key={i}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-5 md:p-6 flex items-start gap-5"
          >
            <div className="hidden sm:grid h-12 w-12 rounded-xl border border-emerald-500/30 bg-emerald-500/10 place-items-center text-emerald-300 shrink-0">
              <t.Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  {t.name}
                </div>
                <div className="text-[11px] px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  {t.worth}
                </div>
              </div>
              <div className="mt-1 text-lg font-semibold text-neutral-100">
                {t.one}
              </div>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {t.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-neutral-400"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400/80 mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 p-6 text-center">
          <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Total value
          </div>
          <div className="mt-2 text-2xl text-neutral-300 line-through decoration-rose-500/60">
            $3,600/year
          </div>
          <div className="mt-1 text-5xl font-semibold text-emerald-300">$0</div>
          <div className="mt-2 text-sm text-neutral-500">
            per seat · per month · per year · per whatever
          </div>
          <div className="mt-6 flex justify-center">
            <PrimaryCTA href="/app/login">
              <span>Claim free forever</span>
              <ArrowRight className="h-4 w-4" />
            </PrimaryCTA>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ── 4. SOCIAL PROOF ────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    name: "Alex Chen",
    role: "Staff engineer · Series B fintech",
    avatar: "/avatars/alex-chen.svg",
    quote:
      "We moved 37 projects over in an afternoon. The killer feature is the GitHub Actions sync — it eliminated three pages of our runbook.",
    result: "37 projects migrated in 1 day",
  },
  {
    name: "Priya Patel",
    role: "Principal SRE · Health-tech",
    avatar: "/avatars/priya-patel.svg",
    quote:
      "SOC 2 auditor spent 4 minutes on our secrets story. 'Wait, your provider can't read these?' Correct, architecturally.",
    result: "Cut SOC 2 evidence prep by 80%",
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO · 12-person startup",
    avatar: "/avatars/marcus-rodriguez.svg",
    quote:
      "Our last engineer leaving used to be a half-day of rotations. Now it's a one-click revoke and the next coffee.",
    result: "Half-day → one click",
  },
];

function B1SocialProof() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Don't take our word for it.
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          Three specific before/after moments from three teams.
        </p>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6 flex flex-col"
          >
            <div className="flex items-center gap-3">
              <img
                src={t.avatar}
                alt=""
                className="h-10 w-10 rounded-full border border-neutral-800"
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-100 truncate">
                  {t.name}
                </div>
                <div className="text-xs text-neutral-500 truncate">
                  {t.role}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-neutral-300 leading-relaxed flex-1">
              "{t.quote}"
            </p>
            <div className="mt-4 text-[11px] uppercase tracking-wider text-amber-400 border-t border-neutral-900 pt-3">
              → {t.result}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ── 5. TRANSFORMATION ──────────────────────────────────────────────────── */

const STAGES = [
  {
    Icon: Zap,
    when: "Day 1",
    title: "Quick win",
    body: "Your team's .env files move into Cryptly. Passphrases replace pinned Slack messages. First rotation takes 2 minutes.",
  },
  {
    Icon: TrendingUp,
    when: "Week 1",
    title: "Compound",
    body: "New hires onboard without a Slack ping. Leavers lose access in one click. CI picks up rotations automatically.",
  },
  {
    Icon: Shield,
    when: "Month 1",
    title: "Advantage",
    body: "Security review no longer involves 40 minutes of Google Docs. 'Where is secret X?' becomes a URL, not a search.",
  },
  {
    Icon: Rocket,
    when: "Month 3",
    title: "10× outcome",
    body: "Secrets are just infrastructure. You ship faster because you're not the team's human key rotation service.",
  },
];

function B1Transformation() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium uppercase tracking-[0.22em] bg-violet-500/10 text-violet-300 border-violet-500/30">
          Transformation
        </div>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Where you'll be in 90 days.
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          The reason most teams don't rotate secrets isn't laziness — it's cost.
          Cryptly collapses that cost.
        </p>
      </div>

      <div className="mt-16 max-w-5xl mx-auto">
        <div className="relative">
          <div className="hidden md:block absolute top-[38px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 relative">
            {STAGES.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative"
              >
                <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-0">
                  <div className="h-[76px] w-[76px] rounded-2xl border border-neutral-800 bg-neutral-950 grid place-items-center relative z-10 shrink-0">
                    <s.Icon className="h-7 w-7 text-neutral-300" />
                  </div>
                  <div className="md:mt-6 flex-1">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                      {s.when}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-neutral-100">
                      {s.title}
                    </div>
                    <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                      {s.body}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ── 6. SECONDARY CTA ───────────────────────────────────────────────────── */

const SCROLLER_AVATARS = [
  "/avatars/alex-chen.svg",
  "/avatars/marcus-rodriguez.svg",
  "/avatars/priya-patel.svg",
  "/avatars/nina-gupta.svg",
  "/avatars/david-kim.svg",
  "/avatars/emily-park.svg",
];

function B1SecondaryCTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto rounded-2xl border border-neutral-900 bg-gradient-to-br from-neutral-950 to-neutral-900/40 p-8 md:p-10 text-center">
        <div className="flex items-center justify-center -space-x-2 mb-6">
          {SCROLLER_AVATARS.map((a, i) => (
            <img
              key={i}
              src={a}
              alt=""
              className="h-10 w-10 rounded-full border-2 border-neutral-950"
            />
          ))}
          <div className="h-10 w-10 rounded-full border-2 border-neutral-950 bg-neutral-900 text-[11px] text-neutral-400 grid place-items-center">
            +3k
          </div>
        </div>
        <h3 className="text-2xl md:text-3xl font-semibold text-neutral-100 tracking-tight">
          You've scrolled this far. That's 73% more than most.
        </h3>
        <p className="mt-3 text-neutral-400">
          Three minutes of setup. Zero plaintext on our side, forever.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Yes, sign me in</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Star on GitHub</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

/* ── 7. FAQ ─────────────────────────────────────────────────────────────── */

const B1_FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How is it actually free?",
    a: "Open source, self-hostable, encrypted client-side — there's no plaintext to monetize, no analytics to sell, no AI to train. The business model never required your data.",
  },
  {
    q: "What if I lose my passphrase?",
    a: "The vault is unrecoverable. That's what makes us unable to read it. We recommend a personal password manager plus at least one co-owner per project.",
  },
  {
    q: "Zero-knowledge — really?",
    a: "Yes. AES-256-GCM keys derive from your passphrase via PBKDF2, in your browser. We receive ciphertext. An audit of our source code is one `git clone` away.",
  },
  {
    q: "GitHub Actions sync?",
    a: "One click. Your browser re-encrypts each value against the repo's public key and forwards ciphertext to GitHub. We never see plaintext.",
  },
];

function B1FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            Questions, answered tersely.
          </h2>
        </div>
        <div className="mt-12 rounded-2xl border border-neutral-900 bg-neutral-950/40 px-6">
          {B1_FAQS.map((f, i) => (
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

/* ── 8. FOOTER ──────────────────────────────────────────────────────────── */

function B1Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-sm font-semibold text-neutral-200">Cryptly</div>
          <div className="mt-1 text-xs text-neutral-500">
            A secrets manager we can't snitch on.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-neutral-500">
          <a href="/blog" className="hover:text-neutral-200">Blog</a>
          <a href="https://github.com/cryptly-dev/cryptly" className="hover:text-neutral-200">GitHub</a>
          <a href="https://cryptly.dev/blog/how-encryption-works" className="hover:text-neutral-200">Encryption</a>
          <a href="https://cryptly.dev/blog/why-is-it-free" className="hover:text-neutral-200">Pricing</a>
          <a href="mailto:hi@cryptly.dev" className="hover:text-neutral-200">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export function VariantB1() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B1Hero />
      <B1Problem />
      <B1ValueStack />
      <B1SocialProof />
      <B1Transformation />
      <B1FAQ />
      <B1SecondaryCTA />
      <B1Footer />
    </div>
  );
}
