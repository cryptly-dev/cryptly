import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C7 — "The Warrant Canary"
 * Formula C · Quiet, dated, honest.
 * ──────────────────────────────────────────────────────────────────────────── */

function C7Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Canary · q2 2026
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          As of today,
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight max-w-2xl"
        >
          Cryptly has received zero requests for customer data.
        </motion.h2>
      </div>
    </section>
  );
}

const C7_FACTS = [
  {
    t: "Subpoenas received this quarter",
    v: "0",
  },
  {
    t: "National security letters received",
    v: "0",
  },
  {
    t: "Gag orders in effect",
    v: "0",
  },
  {
    t: "Requests we could honor if received",
    v: "0",
  },
];

function C7Counts() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-14">
        {C7_FACTS.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
            className="flex items-baseline justify-between border-b border-neutral-900 pb-6"
          >
            <div className="text-lg md:text-xl text-neutral-400 max-w-md leading-relaxed">
              {f.t}
            </div>
            <div className="text-4xl md:text-6xl font-semibold text-neutral-100 tracking-tight">
              {f.v}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function C7Honest() {
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
          The last row is the important one. The first three will
          eventually change. The last one will not.
        </motion.h2>
        <p className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-xl">
          A request we cannot honor is not a refusal. It is the absence
          of a thing to hand over.
        </p>
      </div>
    </SectionShell>
  );
}

function C7CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A number that stays at zero, by design.
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

export function VariantC7() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C7Hero />
      <C7Counts />
      <C7Honest />
      <C7CTA />
    </div>
  );
}
