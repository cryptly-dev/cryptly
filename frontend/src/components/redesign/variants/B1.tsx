import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B1 — "Axioms"
 * Formula B · Four postulates, then the product.
 * ──────────────────────────────────────────────────────────────────────────── */

function B1Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Four things we hold to be true.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl mx-auto leading-relaxed"
        >
          The rest follows.
        </motion.p>
      </div>
    </section>
  );
}

const B1_AXIOMS = [
  {
    n: "i",
    t: "A secret is safest where it was typed.",
    b: "The browser. Not the server, not the logs, not the incident-response tool.",
  },
  {
    n: "ii",
    t: "A vendor that can read your data is a vendor that might.",
    b: "Employees change. Databases get dumped. Subpoenas arrive. Read-access is a latent risk.",
  },
  {
    n: "iii",
    t: "Redundancy of keys, not of copies.",
    b: "Many humans should be able to decrypt. Only the ciphertext should travel.",
  },
  {
    n: "iv",
    t: "Architecture beats policy.",
    b: "Policies can change quietly. Architectures require a new release.",
  },
];

function B1Axioms() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto space-y-20">
        {B1_AXIOMS.map((a, i) => (
          <motion.div
            key={a.n}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
          >
            <div className="text-xs text-neutral-600 font-mono tracking-[0.3em] uppercase mb-4">
              {a.n}
            </div>
            <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
              {a.t}
            </h2>
            <p className="mt-5 text-lg text-neutral-400 leading-relaxed max-w-xl">
              {a.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B1Therefore() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Therefore,
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.1]">
          we wrote Cryptly. A small, open-source secrets vault, encrypted
          in your browser. Wrapped per teammate. Bytes-in, bytes-out on
          our side. Free.
        </h2>
      </div>
    </SectionShell>
  );
}

function B1CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Try it, if it rings true.
        </h2>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
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

export function VariantB1() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B1Hero />
      <B1Axioms />
      <B1Therefore />
      <B1CTA />
    </div>
  );
}
