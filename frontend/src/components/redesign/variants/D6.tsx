import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D6 — "A Slow Morning"
 * Formula D · A single morning's migration.
 * ──────────────────────────────────────────────────────────────────────────── */

function D6Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Between coffee and lunch,
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          the vault is yours.
        </motion.h2>
      </div>
    </section>
  );
}

const D6_MORNING = [
  {
    t: "08:50",
    s: "You open the laptop. Coffee's warm. The old vault is a shared 1Password, which nobody really shares, and a Notion page titled 'keys (temp).'",
  },
  {
    t: "09:05",
    s: "You sign up to Cryptly. You pick a passphrase. You create one project for the service you're responsible for.",
  },
  {
    t: "09:20",
    s: "You copy four secrets out of the old place, paste them into the new one. The values encrypt as you hit save.",
  },
  {
    t: "09:45",
    s: "You invite the other engineer on your service. They're in a meeting, but they'll accept during their next coffee.",
  },
  {
    t: "10:10",
    s: "You wire the SDK into one deploy. First run, it fetches. First run, it decrypts. You redeploy staging.",
  },
  {
    t: "10:40",
    s: "The other engineer accepts. Their browser unwraps the data key. The vault now opens for either of you, independently.",
  },
  {
    t: "11:15",
    s: "You rotate the old Notion page to .archive and close the tab. The morning is not over; the migration is.",
  },
];

function D6Morning() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-10">
        {D6_MORNING.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.04 }}
            className="grid grid-cols-[80px_1fr] gap-6 items-start"
          >
            <div className="text-sm font-mono text-neutral-500 pt-1.5">
              {m.t}
            </div>
            <p className="text-lg md:text-2xl text-neutral-200 leading-snug font-serif">
              {m.s}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D6Reflection() {
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
          Our 77 users have all had a morning that looks roughly like
          this one. Nothing dramatic happens; that's the whole point.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function D6CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Pour the coffee. Open a tab. See you at lunch.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Start the morning</span>
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

export function VariantD6() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D6Hero />
      <D6Morning />
      <D6Reflection />
      <D6CTA />
    </div>
  );
}
