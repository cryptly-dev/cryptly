import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C13 — "Stipulated"
 * Formula C · Two columns: what each party concedes, side by side.
 * ──────────────────────────────────────────────────────────────────────────── */

function C13Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Stipulated facts
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          What both sides
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="mt-4 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          are willing to agree on.
        </motion.h2>
      </div>
    </section>
  );
}

const C13_STIPULATIONS = [
  {
    court:
      "Secrets of significant commercial value are stored on the respondent's infrastructure.",
    us:
      "They are. 1,086 versions, 89 projects, 77 members of record.",
  },
  {
    court:
      "The respondent provides a service for managing those secrets.",
    us:
      "Used, as of today, by logdash, signosh, bluemenu, jobref, and seventy-three more.",
  },
  {
    court:
      "The respondent has a commercial interest in the continued operation of that service.",
    us: "We do.",
  },
  {
    court:
      "A properly served order may require disclosure of stored records.",
    us:
      "Our stored records are ciphertext. We will hand them over whenever asked. They will not decrypt on our side, or yours.",
  },
  {
    court:
      "The respondent is, in theory, capable of modifying its software to capture plaintext in future.",
    us:
      "The software is open source, version-controlled, and reviewed. Any such modification would be legible to any observer.",
  },
];

function C13Table() {
  return (
    <SectionShell>
      <div className="max-w-4xl">
        <div className="grid grid-cols-[1fr_1fr] gap-8 pb-4 border-b border-neutral-900">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500">
            As framed by the petitioner
          </div>
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500">
            As stated by us
          </div>
        </div>
        {C13_STIPULATIONS.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.04 }}
            className="grid grid-cols-[1fr_1fr] gap-8 py-10 border-b border-neutral-900 last:border-b-0"
          >
            <div className="text-lg text-neutral-400 leading-[1.7] font-serif">
              {row.court}
            </div>
            <div className="text-lg text-neutral-100 leading-[1.7] font-serif">
              {row.us}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function C13Voice() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <blockquote className="text-2xl md:text-3xl text-neutral-200 leading-[1.5] font-serif italic max-w-2xl">
          "Every other vendor's page about this is twelve paragraphs of
          hedging. This one is a sentence."
        </blockquote>
        <div className="mt-8 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — Dominik Mackiewicz
          <span className="text-neutral-700"> · </span>
          cofounder, bluemenu
        </div>
      </div>
    </SectionShell>
  );
}

function C13Closing() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.15] font-serif"
        >
          The stipulation is enough. We've written the rest on the{" "}
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

function C13CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Sign onto the record.
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

export function VariantC13() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C13Hero />
      <C13Table />
      <C13Voice />
      <C13Closing />
      <C13CTA />
    </div>
  );
}
