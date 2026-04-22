import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D10 — "The Honest Arc"
 * Formula D · The four-stage arc, modest version.
 * ──────────────────────────────────────────────────────────────────────────── */

function D10Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          A small tool, a small arc.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Told straight, with the actual numbers.
        </motion.p>
      </div>
    </section>
  );
}

const D10_STAGES = [
  {
    n: "i",
    h: "Before.",
    b: "You had secrets in a .env, a Notion page, or a shared password manager whose master password nobody was sure about. The plan was always to fix this, and the plan was always to fix this next week.",
  },
  {
    n: "ii",
    h: "Signup.",
    b: "Three minutes. You pick a passphrase, create a project. No credit card, no sales call. You become one of the 77 users we currently have.",
  },
  {
    n: "iii",
    h: "Migration.",
    b: "Between an hour and an afternoon, depending on how many secrets there are. Each one encrypts in your browser before it leaves the tab. You add to the 1,086 versions we store.",
  },
  {
    n: "iv",
    h: "After.",
    b: "The vault runs itself. Your teammates can each decrypt independently. We hold ciphertext and nothing else. The pattern has repeated 89 times across our projects — that's the whole arc.",
  },
];

function D10Stages() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-24">
        {D10_STAGES.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.05 }}
          >
            <div className="flex items-baseline gap-5">
              <span className="font-serif italic text-neutral-600 text-lg">
                {s.n}.
              </span>
              <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
                {s.h}
              </h2>
            </div>
            <p className="mt-6 text-lg text-neutral-400 leading-[1.75] max-w-xl ml-8 font-serif">
              {s.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D10Honest() {
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
          Thirty stars. Seventy-seven users. Eighty-nine projects. One
          thousand and eighty-six versions. That is where we are. You
          are welcome to join.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function D10CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A quiet arc, told straight.
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

export function VariantD10() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D10Hero />
      <D10Stages />
      <D10Honest />
      <D10CTA />
    </div>
  );
}
