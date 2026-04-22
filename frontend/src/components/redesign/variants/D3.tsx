import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D3 — "One Afternoon"
 * Formula D · From signup to first decrypt, quietly.
 * ──────────────────────────────────────────────────────────────────────────── */

function D3Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          An afternoon.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Not a quarter. Not a migration project. Just the hours between
          lunch and leaving the desk.
        </motion.p>
      </div>
    </section>
  );
}

const D3_CLOCK = [
  {
    t: "13:00",
    s: "Sign up, pick a passphrase, land on an empty dashboard.",
  },
  {
    t: "13:08",
    s: "Create a project. Paste the first secret. The browser encrypts it; the server stores ciphertext.",
  },
  {
    t: "13:30",
    s: "Migrate the remaining values from the old place. Twenty secrets, maybe. One coffee.",
  },
  {
    t: "14:00",
    s: "Invite two teammates. They accept, each with their own passphrase.",
  },
  {
    t: "14:20",
    s: "Wire up the SDK in one service. Redeploy. Decrypt succeeds on the first try.",
  },
  {
    t: "15:00",
    s: "Delete the old shared vault. Close the tab.",
  },
  {
    t: "15:10",
    s: "Done. The rest of the afternoon is yours.",
  },
];

function D3Clock() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-10">
        {D3_CLOCK.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.04 }}
            className="grid grid-cols-[80px_1fr] gap-6 items-start"
          >
            <div className="text-sm font-mono text-neutral-500 pt-1.5">
              {c.t}
            </div>
            <p className="text-lg md:text-2xl text-neutral-200 leading-snug font-serif">
              {c.s}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D3Context() {
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
          The afternoon above is what a typical Cryptly onboarding looks
          like. Across 77 users, 89 projects, 1,086 secret versions —
          this is the shape of it.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function D3CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Start before lunch. Finish before the meeting at three.
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

export function VariantD3() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D3Hero />
      <D3Clock />
      <D3Context />
      <D3CTA />
    </div>
  );
}
