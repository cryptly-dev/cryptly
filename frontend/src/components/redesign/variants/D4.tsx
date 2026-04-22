import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D4 — "The Small Graph"
 * Formula D · Real numbers. Small ones.
 * ──────────────────────────────────────────────────────────────────────────── */

function D4Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Four numbers, plainly.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Everything we have, and what each number means.
        </motion.p>
      </div>
    </section>
  );
}

const D4_NUMBERS = [
  {
    n: "30",
    l: "stars on GitHub.",
    b: "Small but real. Every star is someone who read the repo and thought the design was worth watching.",
  },
  {
    n: "77",
    l: "registered users.",
    b: "Each with their own passphrase, their own private key. We cannot read any of their data.",
  },
  {
    n: "89",
    l: "projects created.",
    b: "A little more than one per user, on average. Some have one project; one very enthusiastic user has twelve.",
  },
  {
    n: "1,086",
    l: "secret versions stored.",
    b: "Every time a secret is updated we keep the old wrapped copy. History without plaintext.",
  },
];

function D4Numbers() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-20">
        {D4_NUMBERS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.05 }}
          >
            <div className="flex items-baseline gap-5 flex-wrap">
              <span className="text-6xl md:text-8xl font-semibold text-neutral-100 tracking-tight tabular-nums">
                {item.n}
              </span>
              <span className="text-2xl md:text-3xl text-neutral-500 font-serif italic">
                {item.l}
              </span>
            </div>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
              {item.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D4Reflection() {
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
          A small graph, drawn honestly. We'd rather you see it now than
          be surprised by it later.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function D4CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Each of those numbers ticks up one when you sign up.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Become the 78th</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Be the 31st star</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantD4() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D4Hero />
      <D4Numbers />
      <D4Reflection />
      <D4CTA />
    </div>
  );
}
