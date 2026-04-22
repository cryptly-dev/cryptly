import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C5 — "The Adversaries"
 * Formula C · Who asks, what they get.
 * ──────────────────────────────────────────────────────────────────────────── */

function C5Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Five adversaries.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Different letterheads, different motives. The same ciphertext
          goes home with each of them.
        </motion.p>
      </div>
    </section>
  );
}

const C5_ADVERSARIES = [
  {
    who: "A state actor",
    method: "National security letter, gag clause attached.",
    receives: "Ciphertext. We cannot be gagged about keys we do not have.",
  },
  {
    who: "A plaintiff's counsel",
    method: "Civil discovery request, third-party subpoena.",
    receives: "Ciphertext, produced in the format specified.",
  },
  {
    who: "A competitor",
    method: "A former employee with a grudge and a laptop.",
    receives: "Whatever they exfiltrated. Which is ciphertext.",
  },
  {
    who: "Our own future self",
    method: "A quiet pull request that tries to add read access.",
    receives: "A visible diff. No retroactive access to data at rest.",
  },
  {
    who: "Ransomware",
    method: "Full production database, encrypted by someone else on top.",
    receives: "Ciphertext, encrypted twice. Still useless without the users' keys.",
  },
];

function C5Adversaries() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-16">
        {C5_ADVERSARIES.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
            className="grid md:grid-cols-[180px_1fr] gap-6 md:gap-10"
          >
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500">
                {a.who}
              </div>
            </div>
            <div>
              <p className="text-lg text-neutral-400 leading-relaxed italic font-serif">
                {a.method}
              </p>
              <p className="mt-4 text-xl md:text-2xl text-neutral-100 leading-snug">
                {a.receives}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function C5Observation() {
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
          The threat model assumes all of them. The product is the same
          in every column.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function C5CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A vault that looks the same from every angle of attack.
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

export function VariantC5() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C5Hero />
      <C5Adversaries />
      <C5Observation />
      <C5CTA />
    </div>
  );
}
