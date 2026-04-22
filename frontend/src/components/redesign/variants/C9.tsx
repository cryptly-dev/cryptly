import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C9 — "The Motion"
 * Formula C · A motion to quash, as a landing page.
 * ──────────────────────────────────────────────────────────────────────────── */

function C9Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Motion · respectfully submitted
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          Respectfully: we can't.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          Not won't. Can't.
        </motion.h2>
      </div>
    </section>
  );
}

const C9_GROUNDS = [
  {
    n: "i.",
    t: "Impossibility.",
    b: "The plaintext does not exist in any system under our control. It exists, if at all, in the browser memory of a person who is not us.",
  },
  {
    n: "ii.",
    t: "Absence of keys.",
    b: "The keys that would decrypt the ciphertext are derived from passphrases that never transit our network. We cannot surrender what we have not received.",
  },
  {
    n: "iii.",
    t: "Non-retroactivity of software changes.",
    b: "A court-ordered modification of our client could, in theory, affect future data. It would not affect ciphertext already at rest, which is bound to keys we do not hold.",
  },
  {
    n: "iv.",
    t: "Public auditability.",
    b: "The client is open source. A silent change to gain access would be a visible change. The court may examine the commit log to verify compliance, not merely take our word.",
  },
];

function C9Grounds() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Grounds
        </motion.div>
        <div className="space-y-16">
          {C9_GROUNDS.map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.05 }}
            >
              <div className="flex items-baseline gap-4">
                <span className="font-serif italic text-neutral-600 text-lg">
                  {g.n}
                </span>
                <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight">
                  {g.t}
                </h2>
              </div>
              <p className="mt-6 text-lg text-neutral-400 leading-[1.75] font-serif max-w-2xl ml-8">
                {g.b}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function C9Prayer() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10">
          Relief sought
        </div>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.15] font-serif"
        >
          That the order be modified to request only what is in our
          possession: the ciphertext, and a description of why it is not
          readable by us.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function C9CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A product that lets the motion be this short.
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

export function VariantC9() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C9Hero />
      <C9Grounds />
      <C9Prayer />
      <C9CTA />
    </div>
  );
}
