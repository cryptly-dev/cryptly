import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D1 — "The Seventy-Seven"
 * Formula D · A short, honest tour for a small group.
 * ──────────────────────────────────────────────────────────────────────────── */

function D1Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Seventy-seven people use this.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Here's what happens, step by step, when you become the
          seventy-eighth.
        </motion.p>
      </div>
    </section>
  );
}

const D1_STEPS = [
  {
    n: "1",
    t: "You land on /login.",
    b: "No credit card, no setup call. You authenticate with GitHub or your email. That is the entire signup.",
  },
  {
    n: "2",
    t: "You pick a passphrase.",
    b: "It's used locally to derive your user key. The passphrase does not leave your device. We do not see it, now or ever.",
  },
  {
    n: "3",
    t: "You create a project.",
    b: "A project is a folder of secrets. One of our 77 users currently has 12 of them; the median user has 1.",
  },
  {
    n: "4",
    t: "You add a secret.",
    b: "You paste a value. Your browser encrypts it before it leaves the tab. Our server stores the ciphertext and nothing else.",
  },
  {
    n: "5",
    t: "You invite a teammate.",
    b: "They accept with their own passphrase. The data key gets wrapped for them too. Now either of you can decrypt, independently.",
  },
];

function D1Steps() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-16">
        {D1_STEPS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
          >
            <div className="flex items-baseline gap-5">
              <span className="font-mono text-neutral-600 text-sm pt-2">
                {s.n}
              </span>
              <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
                {s.t}
              </h2>
            </div>
            <p className="mt-5 text-lg text-neutral-400 leading-relaxed max-w-xl ml-7">
              {s.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D1Stats() {
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
          Our numbers are small. Seventy-seven users, eighty-nine
          projects, one thousand and eighty-six secret versions, thirty
          stars on GitHub. We think you should know that before you
          sign up.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function D1CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Be number seventy-eight, if you'd like.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Sign up</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Be the 31st star</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantD1() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D1Hero />
      <D1Steps />
      <D1Stats />
      <D1CTA />
    </div>
  );
}
