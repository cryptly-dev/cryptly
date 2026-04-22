import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D8 — "The Version Log"
 * Formula D · Seen through the 1,086 versions we've written.
 * ──────────────────────────────────────────────────────────────────────────── */

function D8Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          One thousand and eighty-six versions.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Every update we have ever stored, each one still wrapped.
        </motion.p>
      </div>
    </section>
  );
}

const D8_NOTES = [
  {
    t: "We keep history.",
    b: "When you change a secret, we don't overwrite the old one. We keep the old wrapped copy, so you can roll back without losing the trail.",
  },
  {
    t: "History is ciphertext, too.",
    b: "Every one of the 1,086 versions is encrypted with the project key. We couldn't show you the history even if we wanted to.",
  },
  {
    t: "Your teammates can read the history.",
    b: "Because they are on the project's member list, their browsers can unwrap past versions. The log is readable, but only from the right browser.",
  },
  {
    t: "A version isn't a backup.",
    b: "It's a point-in-time snapshot of what the secret was. If you lose access to the project, the history is as inaccessible as the current value.",
  },
];

function D8Notes() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-20">
        {D8_NOTES.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
          >
            <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
              {n.t}
            </h2>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
              {n.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D8Scale() {
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
          Across 77 users and 89 projects, we've written 1,086 envelopes.
          Each one sealed, each one ours only to store.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function D8CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Write the 1,087th.
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

export function VariantD8() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D8Hero />
      <D8Notes />
      <D8Scale />
      <D8CTA />
    </div>
  );
}
