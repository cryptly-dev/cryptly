import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D1-explanation — "The Seventy-Seven, Explained"
 * Formula D · Tour for a small group + a three-entry primer on what it does.
 * ──────────────────────────────────────────────────────────────────────────── */

function D1EHero() {
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
          Here's what the thing is, and what happens — step by step —
          when you become the seventy-eighth.
        </motion.p>
      </div>
    </section>
  );
}

const D1E_FEATURES = [
  {
    n: "i",
    t: "Write and save secrets.",
    b: "In the browser. Paste the value, hit save; the browser encrypts before the request leaves the tab. The server stores ciphertext and nothing else.",
  },
  {
    n: "ii",
    t: "Invite people.",
    b: "By invite link, from a list of suggested teammates, or (soon) by team. Each invitation rewraps the project key for the new member locally — no plaintext crosses our side.",
  },
  {
    n: "iii",
    t: "See history, from any seat.",
    b: "Every update is a new wrapped copy. Teammates on the project can browse the history from their own browser. We can't — the versions are ciphertext on our side.",
  },
];

function D1EFeatures() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10">
          What the product does
        </div>
        <div className="space-y-20">
          {D1E_FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.05 }}
            >
              <div className="flex items-baseline gap-5">
                <span className="font-serif italic text-neutral-600 text-lg">
                  {f.n}.
                </span>
                <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
                  {f.t}
                </h2>
              </div>
              <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl ml-8">
                {f.b}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

const D1E_STEPS = [
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

function D1ESteps() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10">
          Your first five minutes
        </div>
        <div className="space-y-16">
          {D1E_STEPS.map((s, i) => (
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
      </div>
    </SectionShell>
  );
}

function D1EStats() {
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

function D1ECTA() {
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

export function VariantD1Explanation() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D1EHero />
      <D1EFeatures />
      <D1ESteps />
      <D1EStats />
      <D1ECTA />
    </div>
  );
}
