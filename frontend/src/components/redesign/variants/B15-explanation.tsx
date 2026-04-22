import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B15-explanation — "Small and Used, Explained"
 * Formula B · Manifesto voice + a three-entry primer on what the product does.
 * ──────────────────────────────────────────────────────────────────────────── */

function B15EHero() {
  return (
    <section className="relative min-h-[100vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Small and used.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          A few facts, told with a steady voice — and a short primer on
          what this thing actually is.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-12 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Open your vault</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Read the source</span>
          </GhostCTA>
          <GhostCTA href="/blog">
            <span>Read the blog</span>
          </GhostCTA>
        </motion.div>
      </div>
    </section>
  );
}

const B15E_FEATURES = [
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

function B15EFeatures() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10">
          What it does, in three entries
        </div>
        <div className="space-y-20">
          {B15E_FEATURES.map((f, i) => (
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

const B15E_STATEMENTS = [
  {
    t: "Seventy-seven people use this.",
    b: "Including the teams at logdash, signosh, bluemenu, and jobref. The list will grow, but slowly.",
  },
  {
    t: "Eighty-nine projects live inside it.",
    b: "Most are small — three to five secrets, two or three teammates. The shape we built for.",
  },
  {
    t: "One thousand and eighty-six versions.",
    b: "Each one encrypted in someone's browser, handed to us sealed.",
  },
  {
    t: "Thirty stars.",
    b: "One for every person who read the source and thought about it afterwards.",
  },
];

function B15EStatements() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-24">
        {B15E_STATEMENTS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.05 }}
          >
            <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
              {s.t}
            </h2>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
              {s.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B15EVoices() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.blockquote
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-4xl text-neutral-100 leading-[1.3] font-serif italic max-w-2xl"
        >
          "We'd been trying to sunset the shared password manager for a
          year. A Tuesday afternoon, and it was done."
        </motion.blockquote>
        <div className="mt-8 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — Dominik Mackiewicz · cofounder, bluemenu
        </div>
      </div>
    </SectionShell>
  );
}

function B15EClosing() {
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
          Small, open, free. More on the{" "}
          <a
            href="/blog"
            className={cn(
              "underline underline-offset-[6px] decoration-neutral-700 hover:decoration-neutral-400"
            )}
          >
            blog
          </a>
          .
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function B15ECTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Make it seventy-eight.
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

export function VariantB15Explanation() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B15EHero />
      <B15EFeatures />
      <B15EStatements />
      <B15EVoices />
      <B15EClosing />
      <B15ECTA />
    </div>
  );
}
