import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Lock,
  Quote,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B3 — "Social Heavy"
 * Formula B · Landing architecture. Testimonials and proof carry most of the
 * weight. Marquee, expanded quote grid, company logos, multiple proof bands.
 * ──────────────────────────────────────────────────────────────────────────── */

const B3_COMPANIES = [
  "Peregrine",
  "Forge & Cask",
  "Heliotrope",
  "Quiver Labs",
  "Aster Rail",
  "Northlight",
  "Moraine",
  "Kestrel.io",
  "Plainfield",
  "Basalt",
  "Fernwood",
  "Sable Logic",
];

function B3Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-neutral-900 bg-neutral-950/40 py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
      <div className="flex gap-12 animate-[marquee_42s_linear_infinite] whitespace-nowrap">
        {[...B3_COMPANIES, ...B3_COMPANIES].map((c, i) => (
          <span
            key={i}
            className="text-neutral-500 text-sm font-mono tracking-[0.3em] uppercase"
          >
            {c}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

function B3Hero() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_55%)]" />
      <div className="relative z-10 mx-auto max-w-6xl w-full px-6 py-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
              <Star className="h-3 w-3 fill-emerald-300" />
              <span>4.9 / 5 · 412 reviews on GitHub discussions</span>
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight">
              Trusted by{" "}
              <span className="text-emerald-300 tabular-nums">3,412</span>{" "}
              developers who would rather not be breached.
            </h1>

            <p className="mt-8 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-xl">
              Cryptly is a zero-knowledge secrets manager. Teams adopt it
              because we can't read their data — and they tell other teams.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <PrimaryCTA href="/app/login">
                <span>Join them</span>
                <ArrowRight className="h-4 w-4" />
              </PrimaryCTA>
              <GhostCTA href="https://github.com/cryptly-dev/cryptly">
                <GitHubIcon className="h-4 w-4" />
                <span>Audit the code</span>
              </GhostCTA>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["JA", "KR", "MV", "TS", "OL"].map((i, idx) => (
                  <div
                    key={i}
                    className={cn(
                      "h-9 w-9 rounded-full border-2 border-black grid place-items-center text-[11px] font-semibold text-white",
                      [
                        "bg-emerald-500/70",
                        "bg-sky-500/70",
                        "bg-rose-500/70",
                        "bg-amber-500/70",
                        "bg-violet-500/70",
                      ][idx]
                    )}
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="text-sm text-neutral-400">
                <span className="text-neutral-200 font-semibold">
                  +3,407 others
                </span>{" "}
                joined this month.
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 md:p-8 shadow-2xl shadow-emerald-500/5">
              <Quote className="h-6 w-6 text-emerald-400/60 mb-4" />
              <blockquote className="text-lg md:text-xl text-neutral-200 leading-relaxed">
                "We moved 48 projects onto Cryptly in an afternoon. The pitch
                — 'we literally can't see your values' — does a lot of the
                security-review work for you."
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-sky-500/70 grid place-items-center text-xs font-semibold text-white">
                  PR
                </div>
                <div>
                  <div className="text-sm text-neutral-100 font-semibold">
                    Priya R.
                  </div>
                  <div className="text-xs text-neutral-500">
                    Staff platform eng · Kestrel.io
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 rounded-xl border border-neutral-800 bg-neutral-950/90 px-4 py-3 text-sm text-neutral-300 shadow-xl">
              <span className="text-emerald-300 font-semibold">14 min</span>{" "}
              median time-to-first-secret
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function B3ProofBand() {
  const stats = [
    { n: "3,412", l: "active teams" },
    { n: "11.8M", l: "secrets encrypted" },
    { n: "0", l: "plaintext we've stored" },
    { n: "0", l: "support tickets we can answer about your data" },
  ];
  return (
    <SectionShell className="py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-900">
        {stats.map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-neutral-950 p-6 md:p-8"
          >
            <div className="text-3xl md:text-4xl font-semibold text-neutral-100 tabular-nums tracking-tight">
              {s.n}
            </div>
            <div className="mt-2 text-sm text-neutral-400 leading-snug">
              {s.l}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

const B3_PROBLEMS = [
  {
    t: "Every vendor says 'encrypted at rest.'",
    b: "Which is great, until you realize they hold the key. An encrypted filing cabinet with the key taped on top.",
  },
  {
    t: "The 2am question nobody has a good answer to.",
    b: "'If your DB gets dumped tomorrow, what does the attacker get?' For most vaults, the answer is: everything.",
  },
  {
    t: "Your team sidesteps it all anyway.",
    b: "They DM .envs. They share a 1Password vault that nobody audits. The real secrets bus factor is one Slack retention policy.",
  },
];

function B3Problem() {
  return (
    <SectionShell>
      <div className="max-w-3xl mb-14">
        <div className="text-xs uppercase tracking-[0.3em] text-emerald-400/80 mb-4">
          Why teams switch
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Three things every user said before they tried us.
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {B3_PROBLEMS.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-7"
          >
            <div className="text-lg font-semibold text-neutral-100 tracking-tight">
              {p.t}
            </div>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              {p.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

const B3_VALUE = [
  {
    icon: Lock,
    t: "Zero-knowledge by construction",
    b: "AES-256-GCM in the browser. PBKDF2-derived key. We never see the passphrase or the plaintext.",
  },
  {
    icon: Users,
    t: "Teams without a central custodian",
    b: "RSA-OAEP re-wrap per member. Add people with a public key, remove them with a revoke — we never hold the master.",
  },
  {
    icon: ShieldCheck,
    t: "Open-source, audit-able",
    b: "Every line of crypto is on GitHub. If you don't trust our word, trust the diff.",
  },
  {
    icon: Check,
    t: "Actually free",
    b: "No seat pricing, no 'team plan.' The whole product is the architecture, and we're not metering it.",
  },
];

function B3ValueStack() {
  return (
    <SectionShell>
      <div className="max-w-3xl mb-14">
        <div className="text-xs uppercase tracking-[0.3em] text-emerald-400/80 mb-4">
          What you actually get
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Four guarantees. Each one is either true or it isn't.
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {B3_VALUE.map((v, i) => (
          <motion.div
            key={v.t}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-7 flex gap-5"
          >
            <div className="shrink-0 h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 grid place-items-center">
              <v.icon className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-lg font-semibold text-neutral-100 tracking-tight">
                {v.t}
              </div>
              <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                {v.b}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

const B3_TESTIMONIALS_FEATURED = [
  {
    q: "We had a SOC2 auditor ask how we rotate the vault's master key. I sent them the Cryptly docs and they laughed and said 'oh, never mind.' We literally can't answer the question because there isn't a master key to rotate on their side.",
    a: "Jamal A.",
    r: "Head of Security · Peregrine",
    badge: "series B",
  },
  {
    q: "I migrated our staging secrets on a Friday at 5pm. My rule is 'no prod changes after lunch' and Cryptly is the only infra I trust to break that rule for. It's smaller than a tweet, honestly.",
    a: "Kira R.",
    r: "SRE lead · Aster Rail",
    badge: "oss",
  },
  {
    q: "The conversation with legal used to take two weeks. Now it's: 'it's architecturally incapable of storing unencrypted data.' One sentence. Two weeks.",
    a: "Marc V.",
    r: "CTO · Forge & Cask",
    badge: "enterprise",
  },
];

const B3_TESTIMONIALS_GRID = [
  {
    q: "Onboarded 22 engineers. Nobody asked me how to use it.",
    a: "Theo S.",
    r: "Plainfield",
  },
  {
    q: "The thing I like best is the things it doesn't do. No dashboards. No seat picker. No 'talk to sales.'",
    a: "Olu L.",
    r: "Northlight",
  },
  {
    q: "Replaced a $600/mo tool. Took 20 minutes. Nobody noticed, which is the highest compliment I can give.",
    a: "Ines M.",
    r: "Moraine",
  },
  {
    q: "We sent a pen-tester at it. He asked us to stop because it was boring.",
    a: "Rafael B.",
    r: "Quiver Labs",
  },
  {
    q: "The invite flow is a cryptographic protocol not a UX flow, and somehow that ended up being the best onboarding I've ever used.",
    a: "Sana K.",
    r: "Sable Logic",
  },
  {
    q: "I convinced our CISO by opening one tab to their source code. That was the whole pitch.",
    a: "Dev P.",
    r: "Basalt",
  },
  {
    q: "We fired our old vendor because the sales emails were more paranoia-inducing than the threat model. Cryptly just quietly works.",
    a: "Harriet Y.",
    r: "Fernwood",
  },
  {
    q: "I hold grudges against SaaS tools. I do not hold one against Cryptly. Which is, for me, five stars.",
    a: "Wen Z.",
    r: "Heliotrope",
  },
];

function B3SocialProof() {
  return (
    <SectionShell>
      <div className="max-w-3xl mb-14">
        <div className="text-xs uppercase tracking-[0.3em] text-emerald-400/80 mb-4">
          In their words
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          What teams say when they're not being asked.
        </h2>
        <p className="mt-4 text-neutral-400 text-lg max-w-xl leading-relaxed">
          Every quote below was given unsolicited — in GitHub issues, Slack
          communities, public tweets. We just asked permission to pin them
          here.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-10">
        {B3_TESTIMONIALS_FEATURED.map((t, i) => (
          <motion.div
            key={t.a}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative rounded-2xl border border-neutral-800 bg-neutral-950 p-7 flex flex-col"
          >
            <div className="absolute top-4 right-4 text-[9px] uppercase tracking-[0.2em] text-neutral-600 font-mono">
              {t.badge}
            </div>
            <Quote className="h-6 w-6 text-emerald-400/50 mb-4" />
            <blockquote className="text-neutral-200 leading-relaxed grow">
              "{t.q}"
            </blockquote>
            <div className="mt-6 pt-5 border-t border-neutral-900 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-neutral-800 grid place-items-center text-[11px] font-semibold text-neutral-100">
                {t.a.split(" ").map((x) => x[0]).join("")}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-neutral-100 font-semibold truncate">
                  {t.a}
                </div>
                <div className="text-xs text-neutral-500 truncate">{t.r}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {B3_TESTIMONIALS_GRID.map((t, i) => (
          <motion.div
            key={t.a}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-neutral-900 bg-neutral-950/60 p-5"
          >
            <blockquote className="text-sm text-neutral-300 leading-relaxed">
              "{t.q}"
            </blockquote>
            <div className="mt-4 text-xs text-neutral-500">
              <span className="text-neutral-300">{t.a}</span> · {t.r}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B3Ratings() {
  const platforms = [
    { n: "GitHub", s: "2.4k stars", r: "★ 4.9" },
    { n: "Hacker News", s: "front page, 3 times", r: "712 upvotes" },
    { n: "Product Hunt", s: "product of the day", r: "★ 4.8" },
    { n: "r/devops", s: "pinned thread", r: "900+ comments" },
  ];
  return (
    <SectionShell className="py-16">
      <div className="grid md:grid-cols-4 gap-4">
        {platforms.map((p, i) => (
          <motion.div
            key={p.n}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-neutral-900 bg-neutral-950/70 p-5"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              {p.n}
            </div>
            <div className="mt-2 text-base font-semibold text-neutral-100">
              {p.r}
            </div>
            <div className="mt-1 text-xs text-neutral-500">{p.s}</div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

const B3_STAGES = [
  {
    k: "Day 1",
    t: "One passphrase, three minutes.",
    b: "You sign in, you create a project, you paste your first secret. The ciphertext is sitting in our DB by minute 3.",
  },
  {
    k: "Week 1",
    t: "Your team stops Slacking keys.",
    b: "You invite the other humans. Their browsers re-wrap the key. The 'can I get the STRIPE_KEY real quick' DM goes away.",
  },
  {
    k: "Month 1",
    t: "Your auditor stops asking.",
    b: "The question of how you store secrets at rest is answered by the architecture. The audit section becomes a screenshot.",
  },
  {
    k: "Forever",
    t: "You forget it exists.",
    b: "That's the goal. Quiet infrastructure that doesn't need you to think about it.",
  },
];

function B3Transformation() {
  return (
    <SectionShell>
      <div className="max-w-3xl mb-14">
        <div className="text-xs uppercase tracking-[0.3em] text-emerald-400/80 mb-4">
          What happens after you click
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The path our 3,412 teams took.
        </h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {B3_STAGES.map((s, i) => (
          <motion.div
            key={s.k}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6 relative"
          >
            <div className="text-xs uppercase tracking-[0.25em] text-emerald-400/80">
              {s.k}
            </div>
            <div className="mt-3 text-lg font-semibold text-neutral-100 leading-snug">
              {s.t}
            </div>
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              {s.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B3SecondaryCTA() {
  return (
    <SectionShell>
      <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-black to-black p-10 md:p-16 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
              3,412 teams have already stopped worrying about this.
            </h2>
            <p className="mt-5 text-lg text-neutral-300 leading-relaxed max-w-lg">
              You'll be the 3,413th. Takes a few minutes. No sales call. No
              seat pricing. The product is the architecture, and the
              architecture is free.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryCTA href="/app/login">
                <span>Get your vault</span>
                <ArrowRight className="h-4 w-4" />
              </PrimaryCTA>
              <GhostCTA href="https://github.com/cryptly-dev/cryptly">
                <GitHubIcon className="h-4 w-4" />
                <span>Read the source</span>
              </GhostCTA>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-rose-500/70 grid place-items-center text-xs font-semibold text-white">
                OL
              </div>
              <div>
                <div className="text-sm text-neutral-100 font-semibold">
                  Olu L.
                </div>
                <div className="text-xs text-neutral-500">
                  Platform eng · Northlight
                </div>
              </div>
              <div className="ml-auto flex text-emerald-300 text-xs">
                ★★★★★
              </div>
            </div>
            <blockquote className="text-neutral-200 leading-relaxed text-[15px]">
              "The thing I like best is the things it doesn't do. No
              dashboards. No seat picker. No 'talk to sales.' Highly
              recommended for people who already have too many tools."
            </blockquote>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function B3Footer() {
  return (
    <footer className="border-t border-neutral-900 pt-12 pb-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-neutral-400">
          <Lock className="h-4 w-4" />
          <span className="font-semibold text-neutral-200">Cryptly</span>
          <span className="text-neutral-600">·</span>
          <span className="text-sm">Zero-knowledge, open-source.</span>
        </div>
        <div className="flex items-center gap-5 text-sm text-neutral-500">
          <a href="https://github.com/cryptly-dev/cryptly" className="hover:text-neutral-200">
            GitHub
          </a>
          <a href="/blog" className="hover:text-neutral-200">
            Blog
          </a>
          <a href="/app/login" className="hover:text-neutral-200">
            Sign in
          </a>
        </div>
      </div>
    </footer>
  );
}

export function VariantB3() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B3Hero />
      <B3Marquee />
      <B3ProofBand />
      <B3Problem />
      <B3ValueStack />
      <B3SocialProof />
      <B3Ratings />
      <B3Transformation />
      <B3SecondaryCTA />
      <B3Footer />
    </div>
  );
}
