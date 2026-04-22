import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B2 — "The Vow"
 * Formula B · Written as a promise, kept by construction.
 * ──────────────────────────────────────────────────────────────────────────── */

function B2Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          We promise this.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          The architecture keeps the promise, so we don't have to.
        </motion.p>
      </div>
    </section>
  );
}

const B2_VOWS = [
  {
    t: "We will not read your secrets.",
    b: "Because we can't. The ciphertext reaches us already sealed, and the key never does.",
  },
  {
    t: "We will not be a single point of loss.",
    b: "Any teammate on the project can decrypt. You don't need us — you need each other.",
  },
  {
    t: "We will not silently change the rules.",
    b: "The crypto is in the client, in the open. The moment we change it, you see the diff.",
  },
  {
    t: "We will not grow into what we promised not to be.",
    b: "Read-access isn't something we can gain by accident. The only way in is a rewrite you'd notice.",
  },
];

function B2Vows() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-24">
        {B2_VOWS.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
          >
            <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
              {v.t}
            </h2>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
              {v.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B2Signature() {
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
          These aren't policies. Policies change in a meeting. These are
          properties of the code that runs in your browser — the kind that
          change only in a pull request, with a diff, in public.
        </motion.h2>
        <div className="mt-12 text-sm font-mono uppercase tracking-[0.3em] text-neutral-500">
          — the cryptly authors
        </div>
      </div>
    </SectionShell>
  );
}

function B2CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Hold us to it.
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

export function VariantB2() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B2Hero />
      <B2Vows />
      <B2Signature />
      <B2CTA />
    </div>
  );
}
