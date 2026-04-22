import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B13 — "A Page of Numbers"
 * Formula B · Stats, paced like a poem.
 * ──────────────────────────────────────────────────────────────────────────── */

function B13Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Four numbers, kept honest.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          A product is often the numbers around it. Ours are small,
          which we think is a feature.
        </motion.p>
      </div>
    </section>
  );
}

function B13Number({
  n,
  label,
  body,
  i,
}: {
  n: string;
  label: string;
  body: string;
  i: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: i * 0.05 }}
      className="py-14 border-b border-neutral-900 last:border-b-0"
    >
      <div className="flex items-baseline gap-6 flex-wrap">
        <span className="text-6xl md:text-8xl font-semibold text-neutral-100 tabular-nums tracking-tight">
          {n}
        </span>
        <span className="text-2xl md:text-3xl text-neutral-500 font-serif italic">
          {label}
        </span>
      </div>
      <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
        {body}
      </p>
    </motion.div>
  );
}

function B13Numbers() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <B13Number
          i={0}
          n="30"
          label="stars on github."
          body="One per person who has read the repo and kept it open in a tab since."
        />
        <B13Number
          i={1}
          n="77"
          label="people with a passphrase."
          body="Each one lives on their own device. We've never seen any of them."
        />
        <B13Number
          i={2}
          n="89"
          label="projects."
          body="Some are company vaults. Some are weekend side projects. All of them fit in a browser."
        />
        <B13Number
          i={3}
          n="1,086"
          label="wrapped secret versions."
          body="Every time a secret changes, we keep the old wrapped copy. That's 1,086 envelopes, and zero we can open."
        />
      </div>
    </SectionShell>
  );
}

function B13Voices() {
  return (
    <SectionShell>
      <div className="max-w-3xl grid md:grid-cols-2 gap-14">
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "Our whole team has been on it since February. I forget it's
            there, which is how I know it's working."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Jerzy Wiśniewski · signosh
          </div>
        </div>
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "Onboarding a new engineer took me about a minute. The old
            process was maybe twenty."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Dominik Mackiewicz · bluemenu
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function B13Trusted() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          In use at
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

function B13CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Tick the 78 up.
        </h2>
        <div className="mt-4 text-neutral-500">
          The longer-form version lives on the{" "}
          <a
            href="/blog"
            className={cn("underline underline-offset-4 hover:text-neutral-300")}
          >
            blog
          </a>
          .
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-3">
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

export function VariantB13() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B13Hero />
      <B13Numbers />
      <B13Voices />
      <B13Trusted />
      <B13CTA />
    </div>
  );
}
