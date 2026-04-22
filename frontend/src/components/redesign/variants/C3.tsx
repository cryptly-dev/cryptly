import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C3 — "Four Requests"
 * Formula C · Subpoena, NSL, GDPR, rogue insider — one answer.
 * ──────────────────────────────────────────────────────────────────────────── */

function C3Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Four very different letters.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          One reply.
        </motion.h2>
      </div>
    </section>
  );
}

const C3_LETTERS = [
  {
    from: "A subpoena",
    ask: "\"Produce all customer data held on behalf of the entity.\"",
    reply: "The ciphertext. It will not decrypt with anything in our possession.",
  },
  {
    from: "A national security letter",
    ask: "\"Provide keys or credentials that would allow decryption.\"",
    reply: "We have none. The keys are in the users' browsers. We cannot send what we do not hold.",
  },
  {
    from: "A GDPR erasure request",
    ask: "\"Delete all personal data pertaining to the data subject.\"",
    reply: "Gladly. We delete the ciphertext and its metadata. We could not have read either.",
  },
  {
    from: "A rogue insider",
    ask: "Dumps the production database.",
    reply: "They leave with ciphertext. So would we, if we did it ourselves.",
  },
];

function C3Letters() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-20">
        {C3_LETTERS.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
          >
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-4">
              {l.from}
            </div>
            <p className="text-2xl md:text-3xl text-neutral-300 leading-snug font-serif italic">
              {l.ask}
            </p>
            <p className="mt-8 text-xl md:text-2xl text-neutral-100 leading-relaxed max-w-2xl">
              {l.reply}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function C3Observation() {
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
          Four adversaries with four different levers. All of them
          rebound off the same wall, which is the wall we built on
          purpose.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function C3CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Let the letters come. The ciphertext is all there is.
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

export function VariantC3() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C3Hero />
      <C3Letters />
      <C3Observation />
      <C3CTA />
    </div>
  );
}
