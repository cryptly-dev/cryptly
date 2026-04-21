import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  CircleDollarSign,
  Infinity as InfinityIcon,
  Lock,
  Minus,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B4 — "Value Stack Dense"
 * Formula B · Landing architecture. Pricing anchor. 4-tier value stack with
 * $/yr equivalents building a $3,600 number, then revealed as $0.
 * ──────────────────────────────────────────────────────────────────────────── */

function B4Hero() {
  return (
    <section className="relative min-h-[82vh] flex items-center bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.08),transparent_55%)]" />
      <div className="relative z-10 mx-auto max-w-6xl w-full px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-300 mb-8">
          <CircleDollarSign className="h-3.5 w-3.5" />
          <span>Everything in the $3,600/yr tier. For $0.</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight max-w-4xl mx-auto">
          We priced out every feature of a typical secrets manager.{" "}
          <span className="text-emerald-300">Then we zeroed it.</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
          Cryptly is zero-knowledge, open source, and priced at the number
          that makes sense for infrastructure you can't see inside of. The
          number is zero.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Claim the $3,600</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>See the source</span>
          </GhostCTA>
        </div>

        <div className="mt-14 inline-flex items-center gap-3 text-xs text-neutral-500 font-mono">
          <span>$3,600</span>
          <Minus className="h-3 w-3" />
          <span>$3,600</span>
          <span className="text-neutral-600">=</span>
          <span className="text-emerald-300">$0</span>
          <span className="text-neutral-700 ml-2">// see the math below</span>
        </div>
      </div>
    </section>
  );
}

const B4_PROBLEM_STATS = [
  {
    k: "$1,440/yr",
    t: "Average vault subscription",
    b: "15 seats × $8/mo on a commercial manager. And you still can't prove they can't read your data.",
  },
  {
    k: "$960/yr",
    t: "Hidden 'audit add-on'",
    b: "SOC2 evidence pack, SCIM, access logs — almost always behind a second line item.",
  },
  {
    k: "$1,200/yr",
    t: "Incident cleanup",
    b: "Amortized across the industry: the one time a year someone Slacks a key and it has to be rotated everywhere.",
  },
];

function B4Problem() {
  return (
    <SectionShell>
      <div className="max-w-3xl mb-14">
        <div className="text-xs uppercase tracking-[0.3em] text-emerald-400/80 mb-4">
          What you're already paying
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The secrets-management line items nobody wants to add up.
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {B4_PROBLEM_STATS.map((p, i) => (
          <motion.div
            key={p.k}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-7"
          >
            <div className="text-3xl font-semibold text-neutral-100 tracking-tight tabular-nums">
              {p.k}
            </div>
            <div className="mt-3 text-base font-semibold text-neutral-200">
              {p.t}
            </div>
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              {p.b}
            </p>
          </motion.div>
        ))}
      </div>
      <div className="mt-10 flex items-center justify-end gap-3 text-sm text-neutral-400 font-mono">
        <span>Running subtotal:</span>
        <span className="text-neutral-100 font-semibold tabular-nums">
          $3,600/yr
        </span>
      </div>
    </SectionShell>
  );
}

const B4_TIERS = [
  {
    tier: "Tier 1",
    icon: Lock,
    t: "The crypto itself",
    mkt: "$0",
    explanation:
      "Industry-standard primitives in the browser: AES-256-GCM, PBKDF2, RSA-OAEP. This is the part every vendor calls 'patented.' It isn't.",
    includes: [
      "Client-side encryption of every value",
      "Passphrase never touches the wire",
      "PBKDF2 key derivation with 600k iterations",
      "Ciphertext-only storage on our side",
    ],
    equivalent: "$0/yr at most vendors",
    running: "$0/yr",
  },
  {
    tier: "Tier 2",
    icon: Users,
    t: "Teams & key management",
    mkt: "$1,440/yr",
    explanation:
      "The hard part. Re-wrapping keys against public keys when someone joins, revoking when they leave, never holding the master on our side.",
    includes: [
      "Per-member RSA-OAEP key wrap",
      "Invite flow that's cryptographic, not custodial",
      "Revoke-and-rotate without vendor involvement",
      "Role-based access scoped to project",
    ],
    equivalent: "$1,440/yr on commercial managers",
    running: "$1,440/yr",
  },
  {
    tier: "Tier 3",
    icon: Shield,
    t: "Compliance & audit posture",
    mkt: "$960/yr",
    explanation:
      "The thing legal cares about. Because we can't read the values, the usual audit surface collapses to 'the architecture is in public.'",
    includes: [
      "Open-source threat model",
      "Every cryptographic line reviewable on GitHub",
      "Access logs you can verify yourself",
      "No 'our staff needs access' exception",
    ],
    equivalent: "$960/yr add-on tier on competitors",
    running: "$2,400/yr",
  },
  {
    tier: "Tier 4",
    icon: Zap,
    t: "The everyday ergonomics",
    mkt: "$1,200/yr",
    explanation:
      "The stuff that matters at 3pm on a Tuesday: CLI, GitHub Action, CI integration, fast dashboards. This is where teams usually pay the most.",
    includes: [
      "Single binary CLI (Rust)",
      "GitHub Action for secrets injection",
      "Fast dashboard — no 800ms button clicks",
      "Incident playbook baked into the docs",
    ],
    equivalent: "$1,200/yr in competitor 'platform' fees",
    running: "$3,600/yr",
  },
];

function B4ValueStack() {
  return (
    <SectionShell>
      <div className="max-w-3xl mb-14">
        <div className="text-xs uppercase tracking-[0.3em] text-emerald-400/80 mb-4">
          The stack
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Four tiers. Four line items you'd expect to pay.
        </h2>
        <p className="mt-5 text-lg text-neutral-400 leading-relaxed max-w-xl">
          We built the same stack. Then we flipped the price on every tier to
          zero. Here's what's in each one.
        </p>
      </div>

      <div className="space-y-5">
        {B4_TIERS.map((t, i) => (
          <motion.div
            key={t.tier}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden"
          >
            <div className="grid lg:grid-cols-[0.9fr_1.5fr_0.8fr] gap-6 p-6 md:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 grid place-items-center">
                    <t.icon className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                      {t.tier}
                    </div>
                    <div className="mt-0.5 text-lg font-semibold text-neutral-100 tracking-tight">
                      {t.t}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
                  {t.explanation}
                </p>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-3">
                  What's in this tier
                </div>
                <ul className="space-y-2">
                  {t.includes.map((inc) => (
                    <li
                      key={inc}
                      className="flex items-start gap-2 text-sm text-neutral-300"
                    >
                      <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col justify-between items-end text-right">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Market price
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-neutral-400 line-through decoration-rose-400/70 tabular-nums">
                    {t.mkt}
                  </div>
                  <div className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-400/80">
                    Cryptly
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-emerald-300 tabular-nums">
                    $0
                  </div>
                </div>
                <div className="mt-6 text-xs text-neutral-500 font-mono">
                  running: {t.running}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-400/80">
            Stack total
          </div>
          <div className="mt-1 text-sm text-neutral-300">
            Market equivalent · ${B4_TIERS.length} tiers
          </div>
        </div>
        <div className="text-right">
          <div className="text-neutral-500 line-through tabular-nums">
            $3,600/yr
          </div>
          <div className="text-3xl md:text-4xl font-semibold text-emerald-300 tabular-nums">
            $0/yr
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

const B4_COMPARE = [
  { row: "Client-side encryption", c: true, o: "partial" },
  { row: "Vendor can't read plaintext", c: true, o: false },
  { row: "Open-source crypto", c: true, o: false },
  { row: "Per-seat pricing", c: false, o: true },
  { row: "Hidden audit tier", c: false, o: true },
  { row: "SCIM / SSO included", c: true, o: "paid" },
  { row: "Bytes-in, bytes-out architecture", c: true, o: false },
  { row: "Free forever", c: true, o: false },
];

function B4CompareTable() {
  return (
    <SectionShell>
      <div className="max-w-3xl mb-10">
        <div className="text-xs uppercase tracking-[0.3em] text-emerald-400/80 mb-4">
          Vs. the rest of the category
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The cells that usually have asterisks.
        </h2>
      </div>

      <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
        <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr] text-xs uppercase tracking-[0.25em] text-neutral-500 border-b border-neutral-900">
          <div className="p-5">Feature</div>
          <div className="p-5 text-center border-l border-neutral-900 text-emerald-300">
            Cryptly
          </div>
          <div className="p-5 text-center border-l border-neutral-900">
            The rest
          </div>
        </div>
        {B4_COMPARE.map((r, i) => (
          <div
            key={r.row}
            className={cn(
              "grid grid-cols-[1.6fr_0.8fr_0.8fr] text-sm border-b border-neutral-900 last:border-b-0",
              i % 2 === 0 ? "bg-black/20" : "bg-transparent"
            )}
          >
            <div className="p-5 text-neutral-200">{r.row}</div>
            <div className="p-5 text-center border-l border-neutral-900">
              <CompareCell value={r.c} positive />
            </div>
            <div className="p-5 text-center border-l border-neutral-900">
              <CompareCell value={r.o} positive={false} />
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function CompareCell({
  value,
  positive,
}: {
  value: boolean | string;
  positive: boolean;
}) {
  if (value === true) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5",
          positive ? "text-emerald-300" : "text-neutral-300"
        )}
      >
        <Check className="h-4 w-4" />
        <span className="text-xs">yes</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1.5 text-neutral-600">
        <Minus className="h-4 w-4" />
        <span className="text-xs">no</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-amber-300/80">
      <span className="text-xs italic">{value}</span>
    </span>
  );
}

function B4SocialProof() {
  const quotes = [
    {
      q: "I did the math before I switched. We were paying $420/mo across two tools for capabilities Cryptly has for free. The surprise wasn't the money, it was that the free thing had a sharper threat model.",
      a: "Nina W.",
      r: "VP eng · Heliotrope",
    },
    {
      q: "My CFO asked what the catch was. I pulled up the GitHub repo. Two weeks later we'd retired the SKU.",
      a: "Dmitri A.",
      r: "Platform lead · Basalt",
    },
    {
      q: "I treat free tools with suspicion, but Cryptly's free because it literally can't upsell you — there's nothing it knows about your data to meter on.",
      a: "Chioma O.",
      r: "Staff eng · Moraine",
    },
  ];
  return (
    <SectionShell>
      <div className="max-w-3xl mb-10">
        <div className="text-xs uppercase tracking-[0.3em] text-emerald-400/80 mb-4">
          The 'why is this free' question
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Three people who asked, then stopped asking.
        </h2>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        {quotes.map((q, i) => (
          <motion.div
            key={q.a}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-7"
          >
            <blockquote className="text-neutral-200 leading-relaxed">
              "{q.q}"
            </blockquote>
            <div className="mt-6 pt-5 border-t border-neutral-900 text-sm text-neutral-400">
              <span className="text-neutral-100 font-semibold">{q.a}</span> ·{" "}
              {q.r}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B4Transformation() {
  const stages = [
    {
      k: "Before",
      t: "Invoice of $3,600/yr for a vault you trust on vibes.",
      c: "rose",
    },
    {
      k: "Signup",
      t: "Create a passphrase. We never see it.",
      c: "neutral",
    },
    {
      k: "After 20 min",
      t: "First project encrypted. Bill: $0.",
      c: "neutral",
    },
    {
      k: "Month 1",
      t: "Old tool cancelled. SOC2 section reduced to one sentence.",
      c: "emerald",
    },
  ];
  return (
    <SectionShell>
      <div className="max-w-3xl mb-14">
        <div className="text-xs uppercase tracking-[0.3em] text-emerald-400/80 mb-4">
          The migration
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          From $3,600/yr to $0 in four moves.
        </h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((s, i) => (
          <motion.div
            key={s.k}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={cn(
              "rounded-2xl border p-6",
              s.c === "rose" && "border-rose-500/20 bg-rose-500/[0.03]",
              s.c === "emerald" &&
                "border-emerald-500/30 bg-emerald-500/[0.05]",
              s.c === "neutral" && "border-neutral-900 bg-neutral-950/60"
            )}
          >
            <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              {s.k}
            </div>
            <div className="mt-3 text-lg font-semibold text-neutral-100 leading-snug">
              {s.t}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B4SecondaryCTA() {
  return (
    <SectionShell>
      <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-black to-black p-10 md:p-16 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-300 mb-6">
            <InfinityIcon className="h-3.5 w-3.5" />
            <span>Free forever, not free until Series C.</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
            Take the $3,600/yr stack. Pay $0. It's not a trick.
          </h2>
          <p className="mt-5 text-lg text-neutral-300 leading-relaxed max-w-xl">
            We can't monetize what we can't read. So we don't. Come take the
            whole stack and we'll see you never.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PrimaryCTA href="/app/login">
              <span>Start free</span>
              <ArrowRight className="h-4 w-4" />
            </PrimaryCTA>
            <GhostCTA href="https://github.com/cryptly-dev/cryptly">
              <GitHubIcon className="h-4 w-4" />
              <span>Read the crypto</span>
            </GhostCTA>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function B4Footer() {
  return (
    <footer className="border-t border-neutral-900 pt-12 pb-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-neutral-400">
          <Lock className="h-4 w-4" />
          <span className="font-semibold text-neutral-200">Cryptly</span>
          <span className="text-neutral-600">·</span>
          <span className="text-sm">$0/yr, not a typo.</span>
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

export function VariantB4() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B4Hero />
      <B4Problem />
      <B4ValueStack />
      <B4CompareTable />
      <B4SocialProof />
      <B4Transformation />
      <B4SecondaryCTA />
      <B4Footer />
    </div>
  );
}
