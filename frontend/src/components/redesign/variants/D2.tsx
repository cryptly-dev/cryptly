import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D2 — "Ten Days In"
 * Formula D · A short arc, plainly told.
 * ──────────────────────────────────────────────────────────────────────────── */

function D2Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Day 0 to day 10.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          With no flourishes, no transformations. Just what tends to
          happen.
        </motion.p>
      </div>
    </section>
  );
}

const D2_DAYS = [
  {
    d: "day 0",
    t: "You sign up. You pick a passphrase. You create one project.",
  },
  {
    d: "day 1",
    t: "You migrate a few secrets in from wherever they were before. Usually .env files or a shared 1Password.",
  },
  {
    d: "day 2",
    t: "You invite one teammate. They accept. The vault is now open to both of you.",
  },
  {
    d: "day 3",
    t: "You close the old place. The .env goes to .gitignore; the shared password gets rotated.",
  },
  {
    d: "day 4",
    t: "Someone uses a secret in a deploy. It works. You notice nothing, which is what you wanted.",
  },
  {
    d: "day 7",
    t: "A third teammate joins the project. You invite them. Fifteen seconds, start to finish.",
  },
  {
    d: "day 10",
    t: "You realise you haven't thought about the vault in three days. That's how you'll know it worked.",
  },
];

function D2Days() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-10">
        {D2_DAYS.map((day, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.04 }}
            className="grid grid-cols-[80px_1fr] gap-6 items-start"
          >
            <div className="text-sm font-mono uppercase tracking-[0.2em] text-neutral-500 pt-1.5">
              {day.d}
            </div>
            <p className="text-lg md:text-2xl text-neutral-200 leading-snug font-serif">
              {day.t}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D2Numbers() {
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
          Across our 77 users, the arc above has repeated 77 times in
          some variation. Eighty-nine projects, by the last count.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function D2CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Day 0 takes about three minutes.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Start day 0</span>
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

export function VariantD2() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D2Hero />
      <D2Days />
      <D2Numbers />
      <D2CTA />
    </div>
  );
}
