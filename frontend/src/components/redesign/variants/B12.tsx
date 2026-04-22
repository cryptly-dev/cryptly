import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B12 — "The Site"
 * Formula B · Quiet nav at top · features described, plainly.
 * ──────────────────────────────────────────────────────────────────────────── */

function B12Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          A small site, for a small vault.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          What the product does, in three short entries. The rest is
          either on the blog or in the source.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
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

const B12_FEATURES = [
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

function B12Features() {
  return (
    <SectionShell className="scroll-mt-14">
      <div id="features" className="max-w-3xl space-y-20">
        {B12_FEATURES.map((f, i) => (
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
    </SectionShell>
  );
}

function B12Testimonials() {
  return (
    <SectionShell>
      <div className="max-w-3xl grid md:grid-cols-2 gap-16">
        <div>
          <p className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "The invite link flow took me roughly fifteen seconds, and
            my teammate was decrypting production values on his side a
            minute later."
          </p>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Jerzy Wiśniewski · signosh
          </div>
        </div>
        <div>
          <p className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "The history panel is the thing I didn't know I'd want
            until the day I wanted it."
          </p>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Dominik Mackiewicz · bluemenu
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function B12Trusted() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          Used here
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
      </div>
    </SectionShell>
  );
}

function B12Stats() {
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
          thousand and eighty-six versions. All four numbers are real,
          and all four are, for now, small. The{" "}
          <a
            href="/blog"
            className={cn(
              "underline underline-offset-[6px] decoration-neutral-700 hover:decoration-neutral-400"
            )}
          >
            blog
          </a>{" "}
          follows them as they move.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function B12CTA() {
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

export function VariantB12() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B12Hero />
      <B12Features />
      <B12Testimonials />
      <B12Trusted />
      <B12Stats />
      <B12CTA />
    </div>
  );
}
