import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B9 — "The Architecture"
 * Formula B · Three boundaries, described.
 * ──────────────────────────────────────────────────────────────────────────── */

function B9Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Three boundaries.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          The passphrase does not cross any of them.
        </motion.p>
      </div>
    </section>
  );
}

const B9_BOUNDARIES = [
  {
    n: "first",
    t: "Between your fingers and your browser.",
    b: "You type the secret. The browser holds it, briefly, in memory. This is the only place plaintext lives.",
  },
  {
    n: "second",
    t: "Between your browser and the network.",
    b: "What crosses is ciphertext, sealed with a key derived on your device. The passphrase never goes over the wire.",
  },
  {
    n: "third",
    t: "Between the network and our servers.",
    b: "What we receive is ciphertext, and what we return is ciphertext. We store it, replicate it, back it up. We cannot read it.",
  },
];

function B9Boundaries() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-24">
        {B9_BOUNDARIES.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.05 }}
          >
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-600 mb-4">
              the {b.n}
            </div>
            <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
              {b.t}
            </h2>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
              {b.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B9Crossing() {
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
          A secret crosses one boundary. Your passphrase crosses none.
          Everything else — everything we see — is already sealed.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function B9Implementation() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight"
        >
          Cryptly is the implementation.
        </motion.h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
          A small, free, open-source vault that preserves the three
          boundaries above. The code is in the open; the architecture is
          what you are looking at.
        </p>
      </div>
    </SectionShell>
  );
}

function B9CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Three boundaries, preserved.
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

export function VariantB9() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B9Hero />
      <B9Boundaries />
      <B9Crossing />
      <B9Implementation />
      <B9CTA />
    </div>
  );
}
