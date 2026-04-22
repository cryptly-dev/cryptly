import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B6 — "The Koan"
 * Formula B · Small questions, careful answers.
 * ──────────────────────────────────────────────────────────────────────────── */

function B6Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          What cannot be stolen?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-12 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed italic"
        >
          A small series of questions. Each answer shorter than the last.
        </motion.p>
      </div>
    </section>
  );
}

const B6_KOANS = [
  {
    q: "What cannot be stolen from a server?",
    a: "A thing that is not on the server.",
  },
  {
    q: "Then where should the secret be?",
    a: "In the browser that typed it. On the way in and the way out.",
  },
  {
    q: "But the server holds something.",
    a: "Yes. Ciphertext. We encourage you to steal it.",
  },
  {
    q: "Who holds the key?",
    a: "The teammates. One copy each, wrapped for them alone.",
  },
  {
    q: "And you?",
    a: "We hold nothing that opens.",
  },
];

function B6Koans() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-28">
        {B6_KOANS.map((k, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i * 0.05 }}
          >
            <h2 className="text-2xl md:text-4xl font-semibold text-neutral-100 tracking-tight leading-snug">
              {k.q}
            </h2>
            <p className="mt-8 text-xl md:text-3xl text-neutral-500 leading-relaxed italic font-serif">
              — {k.a}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B6Closing() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.1]"
        >
          Cryptly is the tool made of these answers. Small, open, and
          unable to betray you.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function B6CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Sit with it.
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

export function VariantB6() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B6Hero />
      <B6Koans />
      <B6Closing />
      <B6CTA />
    </div>
  );
}
