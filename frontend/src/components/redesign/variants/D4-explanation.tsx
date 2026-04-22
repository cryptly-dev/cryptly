import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D4-explanation — "The Small Graph, Explained"
 * Formula D · Real small numbers + a three-entry primer on what they measure.
 * ──────────────────────────────────────────────────────────────────────────── */

function D4EHero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Four numbers, plainly.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Everything we have, what each number means, and — first — a
          short note on what they measure.
        </motion.p>
      </div>
    </section>
  );
}

const D4E_FEATURES = [
  {
    n: "i",
    t: "Write and save secrets.",
    b: "In the browser. Paste the value, hit save; the browser encrypts it with a key derived — locally — from a passphrase only you know. The passphrase never reaches us. The server stores ciphertext and nothing else.",
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

function D4EFeatures() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10">
          What the numbers are of
        </div>
        <div className="space-y-20">
          {D4E_FEATURES.map((f, i) => (
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

const D4E_NUMBERS = [
  {
    n: "30",
    l: "stars on GitHub.",
    b: "Small but real. Every star is someone who read the repo and thought the design was worth watching.",
  },
  {
    n: "77",
    l: "registered users.",
    b: "Each with their own passphrase, their own private key. We cannot read any of their data.",
  },
  {
    n: "89",
    l: "projects created.",
    b: "A little more than one per user, on average. Some have one project; one very enthusiastic user has twelve.",
  },
  {
    n: "1,086",
    l: "secret versions stored.",
    b: "Every time a secret is updated we keep the old wrapped copy. History without plaintext.",
  },
];

function D4ENumbers() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-20">
        {D4E_NUMBERS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.05 }}
          >
            <div className="flex items-baseline gap-5 flex-wrap">
              <span className="text-6xl md:text-8xl font-semibold text-neutral-100 tracking-tight tabular-nums">
                {item.n}
              </span>
              <span className="text-2xl md:text-3xl text-neutral-500 font-serif italic">
                {item.l}
              </span>
            </div>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
              {item.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D4EReflection() {
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
          A small graph, drawn honestly. We'd rather you see it now than
          be surprised by it later.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function D4ECTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Each of those numbers ticks up one when you sign up.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Become the 78th</span>
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

export function VariantD4Explanation() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D4EHero />
      <D4EFeatures />
      <D4ENumbers />
      <D4EReflection />
      <D4ECTA />
    </div>
  );
}
