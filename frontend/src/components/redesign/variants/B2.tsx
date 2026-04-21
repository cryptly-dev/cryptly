import Beams from "@/components/Beams";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Book,
  CheckCircle2,
  Clock,
  GitBranch,
  Lock,
  Rocket,
  Shield,
  Slack,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B2 — "Problem-First Funnel"
 * Formula B (reordered) · The page starts in pain.
 * Angle: Hero is a problem headline. The product reveal comes after agitation.
 * ──────────────────────────────────────────────────────────────────────────── */

/* ── 1. HERO (problem-first) ─────────────────────────────────────────────── */

function B2Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-black">
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
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />

      <div className="relative z-10 mx-auto max-w-5xl w-full px-6 py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-medium uppercase tracking-[0.22em] bg-rose-500/10 text-rose-300 border-rose-500/30">
          <AlertTriangle className="h-3 w-3" />
          honest diagnosis
        </div>
        <h1 className="mt-6 text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight">
          Your .env is in three Slack DMs and one ex-employee's laptop.
        </h1>
        <div className="mt-10 pl-6 border-l-2 border-emerald-500/40 max-w-2xl">
          <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-400/80">
            plot twist
          </div>
          <p className="mt-3 text-xl md:text-2xl text-neutral-300 leading-relaxed">
            It doesn't have to be. We built a vault so that "where's the .env?"
            becomes a URL.
          </p>
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <PrimaryCTA href="/app/login">
            <span>Fix it in 3 minutes</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="/blog">
            <Book className="h-4 w-4" />
            <span>Read how we built it</span>
          </GhostCTA>
        </div>
      </div>
    </section>
  );
}

/* ── 2. PROBLEM AGITATE (heavy) ─────────────────────────────────────────── */

const B2_AGITATIONS = [
  {
    Icon: Slack,
    title: "Secrets leak through Slack.",
    body: "Slack's search index is permanent. The STRIPE_SECRET_KEY you DM'd in March is indexed, backed up, replicated, and sitting in Slack's storage until the heat death of the universe.",
  },
  {
    Icon: Users,
    title: "Engineers leave. Access doesn't.",
    body: "You blocked their SSO. The .env on their laptop is still valid. You don't know which keys they saved to 1Password. You don't know which Notion docs they viewed. You don't rotate because rotation is hell.",
  },
  {
    Icon: Clock,
    title: "Rotations are a day-long chore.",
    body: "Rotate one key. Now update 5 GitHub Actions workflows, 3 Vercel projects, 2 docker-compose files, and message the team. Somebody's deploy breaks. You fix it at midnight.",
  },
  {
    Icon: AlertTriangle,
    title: "Your vault's breach is your breach.",
    body: "Most 'vaults' can read your plaintext. A subpoena, a vulnerability, a rogue admin — all of them get plaintext. You chose them, so their breach is yours.",
  },
];

function B2Problems() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Here's what you're actually paying for right now.
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          Four specific, recurring costs. Probably not line-items in any
          spreadsheet.
        </p>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {B2_AGITATIONS.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] p-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-rose-500/30 bg-rose-500/10 grid place-items-center text-rose-300">
                <a.Icon className="h-5 w-5" />
              </div>
              <div className="text-lg font-semibold text-neutral-100">
                {a.title}
              </div>
            </div>
            <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
              {a.body}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ── 3. INTRODUCTION (delayed reveal) ───────────────────────────────────── */

function B2Introduction() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium uppercase tracking-[0.22em] bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3" />
          the alternative
        </div>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Cryptly is the alternative you didn't know was possible.
        </h2>
        <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
          One vault. Encrypted before it leaves your browser. Open source.
          Architecturally unable to read your plaintext.
        </p>
      </div>

      <div className="mt-16 max-w-4xl mx-auto rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900/60 p-8 md:p-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
              Before
            </div>
            <ul className="mt-5 space-y-3 text-neutral-400">
              <li className="line-through decoration-rose-500/50">
                .env files in Slack DMs
              </li>
              <li className="line-through decoration-rose-500/50">
                Pinned messages with live credentials
              </li>
              <li className="line-through decoration-rose-500/50">
                Notion pages titled "onboarding"
              </li>
              <li className="line-through decoration-rose-500/50">
                Rotation rituals that take days
              </li>
              <li className="line-through decoration-rose-500/50">
                Vendor-held plaintext
              </li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-400">
              After
            </div>
            <ul className="mt-5 space-y-3 text-neutral-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-1 shrink-0" />
                One vault per project
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-1 shrink-0" />
                Invite links + passphrases
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-1 shrink-0" />
                GitHub Actions auto-sync
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-1 shrink-0" />
                Signed diff history
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-1 shrink-0" />
                Ciphertext-only on our servers
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ── 4. VALUE STACK ────────────────────────────────────────────────────── */

const STACK = [
  {
    Icon: Lock,
    name: "Vault",
    one: "Zero-knowledge secrets storage.",
    bullets: [
      "AES-256-GCM, client-side",
      "Unlimited projects & secrets",
      "Signed diffs per change",
    ],
    tag: "free",
  },
  {
    Icon: Users,
    name: "Team",
    one: "Invite, revoke, audit.",
    bullets: [
      "Re-wrapped per member key",
      "One-click revoke",
      "Per-project members",
    ],
    tag: "free",
  },
  {
    Icon: GitBranch,
    name: "CI sync",
    one: "Push to GitHub Actions.",
    bullets: [
      "Re-encrypted per repo",
      "No plaintext transit",
      "Multi-env support",
    ],
    tag: "free",
  },
  {
    Icon: Clock,
    name: "History",
    one: "Time travel with receipts.",
    bullets: [
      "Signed diff per save",
      "Filter by author & time",
      "Search the diff content",
    ],
    tag: "free",
  },
];

function B2ValueStack() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Four tiers. All free.
        </h2>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {STACK.map((t) => (
          <div
            key={t.name}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6 flex flex-col"
          >
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl border border-emerald-500/30 bg-emerald-500/10 grid place-items-center text-emerald-300">
                <t.Icon className="h-4 w-4" />
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 ml-auto">
                {t.tag}
              </div>
            </div>
            <div className="mt-5 text-base font-semibold text-neutral-100">
              {t.name}
            </div>
            <p className="mt-1 text-sm text-neutral-400">{t.one}</p>
            <ul className="mt-4 space-y-1.5 flex-1">
              {t.bullets.map((b) => (
                <li key={b} className="text-xs text-neutral-500 flex items-start gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400/80 mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ── 5. SOCIAL PROOF ────────────────────────────────────────────────────── */

function B2SocialProof() {
  const t = [
    {
      name: "Alex Chen",
      role: "Staff eng · fintech",
      avatar: "/avatars/alex-chen.svg",
      quote:
        "Cut three pages from our deployment runbook. GitHub sync alone paid for itself if it cost anything, which it doesn't.",
    },
    {
      name: "Priya Patel",
      role: "SRE · health-tech",
      avatar: "/avatars/priya-patel.svg",
      quote:
        "Our SOC 2 auditor understood the architecture in 4 minutes. 'Wait, you can't read it?' Correct.",
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO · 12-person startup",
      avatar: "/avatars/marcus-rodriguez.svg",
      quote:
        "Offboarding used to be a half-day ritual. Now one click and the next coffee.",
    },
  ];
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Shipped by people allergic to Slack .env DMs.
        </h2>
      </div>
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {t.map((q, i) => (
          <div
            key={i}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6"
          >
            <p className="text-sm text-neutral-300 leading-relaxed">
              "{q.quote}"
            </p>
            <div className="mt-4 flex items-center gap-3 border-t border-neutral-900 pt-4">
              <img
                src={q.avatar}
                alt=""
                className="h-9 w-9 rounded-full border border-neutral-800"
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-100 truncate">
                  {q.name}
                </div>
                <div className="text-xs text-neutral-500 truncate">{q.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ── 6. TRANSFORMATION ──────────────────────────────────────────────────── */

const STAGES = [
  { Icon: Zap, when: "Day 1", title: "Vault exists", body: "Secrets move in. Slack DMs stop." },
  { Icon: TrendingUp, when: "Week 1", title: "Habits change", body: "New hires self-serve. Rotations take seconds." },
  { Icon: Shield, when: "Month 1", title: "Auditor happy", body: "Every change has a signed receipt." },
  { Icon: Rocket, when: "Month 3", title: "Category solved", body: "You don't think about secrets anymore." },
];

function B2Transformation() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          The before/after, over 90 days.
        </h2>
      </div>

      <div className="mt-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
        {STAGES.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-5"
          >
            <div className="h-10 w-10 rounded-xl border border-violet-500/30 bg-violet-500/10 grid place-items-center text-violet-300">
              <s.Icon className="h-4 w-4" />
            </div>
            <div className="mt-4 text-[10px] uppercase tracking-[0.22em] text-neutral-500">
              {s.when}
            </div>
            <div className="mt-1 text-sm font-semibold text-neutral-100">
              {s.title}
            </div>
            <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
              {s.body}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ── 7. SECONDARY CTA ───────────────────────────────────────────────────── */

const AVATARS = [
  "/avatars/alex-chen.svg",
  "/avatars/priya-patel.svg",
  "/avatars/marcus-rodriguez.svg",
  "/avatars/nina-gupta.svg",
  "/avatars/david-kim.svg",
];

function B2SecondaryCTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-rose-500/0 p-8 md:p-10 text-center">
        <div className="flex items-center justify-center -space-x-2 mb-5">
          {AVATARS.map((a, i) => (
            <img
              key={i}
              src={a}
              alt=""
              className="h-10 w-10 rounded-full border-2 border-neutral-950"
            />
          ))}
        </div>
        <h3 className="text-2xl md:text-3xl font-semibold text-neutral-100 tracking-tight">
          Still on the fence? Let's re-read the first headline.
        </h3>
        <p className="mt-3 text-neutral-400 italic">
          "Your .env is in three Slack DMs and one ex-employee's laptop."
        </p>
        <p className="mt-1 text-neutral-400">
          It's not getting less true while you decide.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>OK, I'm in</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Audit first</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

/* ── 8. FOOTER ──────────────────────────────────────────────────────────── */

function B2Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-sm font-semibold text-neutral-200">Cryptly</div>
          <div className="mt-1 text-xs text-neutral-500">
            We couldn't read your secrets if we wanted to.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-neutral-500">
          <a href="/blog" className="hover:text-neutral-200">Blog</a>
          <a href="https://github.com/cryptly-dev/cryptly" className="hover:text-neutral-200">GitHub</a>
          <a href="https://cryptly.dev/blog/how-encryption-works" className="hover:text-neutral-200">Encryption</a>
          <a href="mailto:hi@cryptly.dev" className="hover:text-neutral-200">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export function VariantB2() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B2Hero />
      <B2Problems />
      <B2Introduction />
      <B2ValueStack />
      <B2SocialProof />
      <B2Transformation />
      <B2SecondaryCTA />
      <B2Footer />
    </div>
  );
}
