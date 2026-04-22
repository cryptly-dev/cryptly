import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B15 — "Small and Used"
 * Formula B · Manifesto voice, threaded with names and numbers.
 * ──────────────────────────────────────────────────────────────────────────── */

function B15Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Small and used.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          A few facts, told with a steady voice.
        </motion.p>
      </div>
    </section>
  );
}

const B15_STATEMENTS = [
  {
    t: "Seventy-seven people use this.",
    b: "Including the teams at logdash, signosh, bluemenu, and jobref. The list will grow, but slowly.",
  },
  {
    t: "Eighty-nine projects live inside it.",
    b: "Most are small — three to five secrets, two or three teammates. The shape we built for.",
  },
  {
    t: "One thousand and eighty-six versions.",
    b: "Each one encrypted in someone's browser, handed to us sealed.",
  },
  {
    t: "Thirty stars.",
    b: "One for every person who read the source and thought about it afterwards.",
  },
];

function B15Statements() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-24">
        {B15_STATEMENTS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.05 }}
          >
            <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
              {s.t}
            </h2>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
              {s.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B15Voices() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.blockquote
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-4xl text-neutral-100 leading-[1.3] font-serif italic max-w-2xl"
        >
          "We'd been trying to sunset the shared password manager for a
          year. A Tuesday afternoon, and it was done."
        </motion.blockquote>
        <div className="mt-8 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — Dominik Mackiewicz · cofounder, bluemenu
        </div>
      </div>
    </SectionShell>
  );
}

function B15Closing() {
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
          Small, open, free. More on the{" "}
          <a
            href="/blog"
            className={cn(
              "underline underline-offset-[6px] decoration-neutral-700 hover:decoration-neutral-400"
            )}
          >
            blog
          </a>
          .
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function B15CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Make it seventy-eight.
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

export function VariantB15() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B15Hero />
      <B15Statements />
      <B15Voices />
      <B15Closing />
      <B15CTA />
    </div>
  );
}
