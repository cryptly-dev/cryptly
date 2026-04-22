import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D7 — "Eighty-Nine Projects"
 * Formula D · Project-level view of the tool's life.
 * ──────────────────────────────────────────────────────────────────────────── */

function D7Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Eighty-nine projects.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          A brief tour of what lives in them, told roughly and without
          names.
        </motion.p>
      </div>
    </section>
  );
}

const D7_KINDS = [
  {
    count: "42",
    t: "Weekend projects and side tools.",
    b: "A single developer, two or three secrets, one deploy. Most of the 89 are these. They are the reason the tool is free.",
  },
  {
    count: "24",
    t: "Small teams, two to four members.",
    b: "A shared vault for a real product. Usually one project per service, ten or so secrets per project.",
  },
  {
    count: "15",
    t: "Service-per-project setups.",
    b: "Teams that split by service rather than by team. Lots of small projects, tidy namespacing, fewer teammates per project.",
  },
  {
    count: "5",
    t: "Self-hosted installations.",
    b: "Projects we do not see and do not count — but the operators told us about them, and we trust them.",
  },
  {
    count: "3",
    t: "Experimental.",
    b: "People kicking the tires, reading the source, filing issues. We love the experimental projects; they have produced most of the better ideas.",
  },
];

function D7Kinds() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-16">
        {D7_KINDS.map((k, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
            className="grid md:grid-cols-[120px_1fr] gap-6 md:gap-10 items-baseline"
          >
            <div className="text-5xl md:text-7xl font-semibold text-neutral-100 tracking-tight tabular-nums">
              {k.count}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-neutral-100 tracking-tight leading-snug">
                {k.t}
              </h2>
              <p className="mt-4 text-lg text-neutral-400 leading-relaxed max-w-xl">
                {k.b}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D7Totals() {
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
          Across all of them: 77 users, 1,086 secret versions, zero
          plaintext ever in our possession.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function D7CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Make it ninety.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Create a project</span>
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

export function VariantD7() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D7Hero />
      <D7Kinds />
      <D7Totals />
      <D7CTA />
    </div>
  );
}
