import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D9 — "Portraits"
 * Formula D · A few of the 77, in their own words.
 * ──────────────────────────────────────────────────────────────────────────── */

function D9Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          A few of the seventy-seven.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          In their own words, describing an afternoon.
        </motion.p>
      </div>
    </section>
  );
}

const D9_PORTRAITS = [
  {
    quote:
      "I ran a staging migration on a Tuesday afternoon. I'd have paid for something that worked this well, and I didn't have to.",
    who: "backend engineer · 4-person team",
  },
  {
    quote:
      "The thing I liked was that my passphrase never went to the server. I didn't have to take the marketing copy's word for it; I could read the code in the same tab.",
    who: "security engineer · solo project",
  },
  {
    quote:
      "We switched off a shared 1Password for our service's credentials. The onboarding ran about fifteen minutes per person.",
    who: "staff engineer · growing startup",
  },
  {
    quote:
      "I'm building a small side tool. I wanted a place for my API keys that wasn't my .env, which was not quite my .env, which was in my .gitignore but not really.",
    who: "weekend hacker · one project",
  },
];

function D9Portraits() {
  return (
    <SectionShell>
      <div className="max-w-2xl space-y-24">
        {D9_PORTRAITS.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.05 }}
          >
            <p className="text-2xl md:text-3xl text-neutral-200 leading-[1.5] font-serif italic">
              "{p.quote}"
            </p>
            <div className="mt-8 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
              — {p.who}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D9Note() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.15]"
        >
          Four of the seventy-seven. The other seventy-three are still
          at work, and will tell you about it themselves if you ask.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function D9CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Have your afternoon.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Begin</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Read the source</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantD9() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D9Hero />
      <D9Portraits />
      <D9Note />
      <D9CTA />
    </div>
  );
}
