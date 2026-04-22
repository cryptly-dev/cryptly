import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B11 — "A Page of Quotes"
 * Formula B · Two testimonials, treated as the main event.
 * ──────────────────────────────────────────────────────────────────────────── */

function B11Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Two people we believe.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Two cofounders using Cryptly in production, describing the
          part they didn't expect.
        </motion.p>
      </div>
    </section>
  );
}

function B11Quote1() {
  return (
    <SectionShell>
      <div className="max-w-2xl">
        <motion.blockquote
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl text-neutral-100 leading-[1.25] font-serif italic tracking-tight"
        >
          "The property I keep noticing is that I can't notice it. My
          production secrets are somewhere, my team can reach them, and
          I do not think about it."
        </motion.blockquote>
        <div className="mt-12 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — Jerzy Wiśniewski
          <span className="text-neutral-700"> · </span>
          cofounder, signosh
        </div>
      </div>
    </SectionShell>
  );
}

function B11Quote2() {
  return (
    <SectionShell>
      <div className="max-w-2xl">
        <motion.blockquote
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl text-neutral-100 leading-[1.25] font-serif italic tracking-tight"
        >
          "It felt less like adopting a tool and more like moving a
          drawer. Afterwards, the secrets are where they always should
          have been, and the team can all open it."
        </motion.blockquote>
        <div className="mt-12 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — Dominik Mackiewicz
          <span className="text-neutral-700"> · </span>
          cofounder, bluemenu
        </div>
      </div>
    </SectionShell>
  );
}

function B11Others() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          And the others
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4 text-neutral-300 text-xl md:text-2xl font-semibold tracking-tight">
          <span>logdash</span>
          <span className="text-neutral-700">·</span>
          <span>signosh</span>
          <span className="text-neutral-700">·</span>
          <span>bluemenu</span>
          <span className="text-neutral-700">·</span>
          <span>jobref</span>
        </div>
        <p className="mt-10 text-neutral-500 text-lg leading-relaxed max-w-xl">
          Four of the seventy-seven teams on the vault. Short list,
          honest list.
        </p>
      </div>
    </SectionShell>
  );
}

function B11Closing() {
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
          If quieter than we were expecting is what you were hoping for,
          we wrote about it on the{" "}
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

function B11CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Be the next quiet afternoon.
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

export function VariantB11() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B11Hero />
      <B11Quote1 />
      <B11Quote2 />
      <B11Others />
      <B11Closing />
      <B11CTA />
    </div>
  );
}
