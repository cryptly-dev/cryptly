import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C2 — "The Transcript"
 * Formula C · A short court transcript, condensed.
 * ──────────────────────────────────────────────────────────────────────────── */

function C2Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Transcript · condensed · courtroom 14
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          An exchange, verbatim.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Not a real case. A likely one.
        </motion.p>
      </div>
    </section>
  );
}

const C2_LINES: { who: "COURT" | "CRYPTLY"; t: string }[] = [
  {
    who: "COURT",
    t: "Produce the plaintext of the secrets stored for the entity identified in Schedule A.",
  },
  {
    who: "CRYPTLY",
    t: "Your Honor, we are unable.",
  },
  {
    who: "COURT",
    t: "Unable, or unwilling?",
  },
  {
    who: "CRYPTLY",
    t: "Unable. No employee, process, or system at Cryptly possesses the decryption key.",
  },
  {
    who: "COURT",
    t: "You host the data.",
  },
  {
    who: "CRYPTLY",
    t: "We host ciphertext. The keys live in the browsers of the entity's own personnel, and in no other place.",
  },
  {
    who: "COURT",
    t: "Could you modify your software to gain the ability?",
  },
  {
    who: "CRYPTLY",
    t: "Only prospectively, and only visibly. The client is open source; any change would appear as a public diff. We would not be able to reach already-stored ciphertext.",
  },
  {
    who: "COURT",
    t: "What can you produce?",
  },
  {
    who: "CRYPTLY",
    t: "The ciphertext, on request. It will not decrypt without the entity's key.",
  },
];

function C2Transcript() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-10">
        {C2_LINES.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.04 }}
            className="grid grid-cols-[120px_1fr] gap-6 items-start"
          >
            <div
              className={cn(
                "text-xs font-mono uppercase tracking-[0.2em] pt-1.5",
                l.who === "COURT" ? "text-neutral-500" : "text-sky-300/70"
              )}
            >
              {l.who}
            </div>
            <p className="text-lg md:text-2xl text-neutral-200 leading-[1.5] font-serif">
              {l.t}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function C2Reading() {
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
          The transcript is the product. A service you can say these
          sentences about, honestly, under oath.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function C2CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          "Unable" is architecture. We wrote it that way.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Begin</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Read the architecture</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantC2() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C2Hero />
      <C2Transcript />
      <C2Reading />
      <C2CTA />
    </div>
  );
}
