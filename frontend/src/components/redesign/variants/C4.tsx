import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C4 — "Under Oath"
 * Formula C · Sworn declaration format.
 * ──────────────────────────────────────────────────────────────────────────── */

function C4Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Declaration, sworn
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          I declare, under penalty of perjury,
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed font-serif"
        >
          that the following is true and correct to the best of my
          knowledge, and believed to remain true so long as the
          architecture described below is the one in production.
        </motion.p>
      </div>
    </section>
  );
}

const C4_CLAUSES = [
  {
    n: "1.",
    t: "I am an engineer at Cryptly, with access to the source code, infrastructure, and production data of the service.",
  },
  {
    n: "2.",
    t: "Cryptly stores, on its servers, only the encrypted form of user secrets. The plaintext is never received by any system under our control.",
  },
  {
    n: "3.",
    t: "The encryption keys used to decrypt that ciphertext are not held by Cryptly. They are derived in the end user's browser from a passphrase that does not leave the user's device.",
  },
  {
    n: "4.",
    t: "There is no mechanism — privileged account, internal tool, hidden endpoint — by which a Cryptly employee can obtain a user's plaintext.",
  },
  {
    n: "5.",
    t: "Any future change to the above would require a modification to the open-source client, visible as a public commit, and would not retroactively grant access to ciphertext already at rest.",
  },
];

function C4Clauses() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-12">
        {C4_CLAUSES.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
            className="grid grid-cols-[50px_1fr] gap-4"
          >
            <span className="font-mono text-sm text-neutral-600 pt-2">
              {c.n}
            </span>
            <p className="text-xl md:text-2xl text-neutral-200 leading-[1.6] font-serif">
              {c.t}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function C4Signature() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-lg md:text-xl text-neutral-300 leading-relaxed font-serif italic max-w-2xl"
        >
          Executed this day, anywhere the service is running. The
          declaration would be worth less, we recognize, without the
          public source to substantiate it — so we have also provided
          that.
        </motion.div>
        <div className="mt-12 text-sm font-mono uppercase tracking-[0.3em] text-neutral-500">
          — the cryptly authors
        </div>
      </div>
    </SectionShell>
  );
}

function C4CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A tool you could be sworn to, without flinching.
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

export function VariantC4() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C4Hero />
      <C4Clauses />
      <C4Signature />
      <C4CTA />
    </div>
  );
}
