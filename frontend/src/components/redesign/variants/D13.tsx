import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D13 — "A Month of Quiet"
 * Formula D · One team, four weeks, threaded with a cofounder's voice.
 * ──────────────────────────────────────────────────────────────────────────── */

function D13Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          A team of five · four weeks · february
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          A month of quiet.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          signosh came on in february. This is what happened next, in
          their words and ours.
        </motion.p>
      </div>
    </section>
  );
}

type Week = {
  n: string;
  t: string;
  body: string;
  quote?: string;
};

const D13_WEEKS: Week[] = [
  {
    n: "Week 1",
    t: "Arrival.",
    body:
      "Jerzy signs in. Creates three projects. Moves the production secrets over in an afternoon. The rest of the signosh team gets invite links before dinner.",
    quote:
      "I had expected the migration to be the scary part. It turned out to be the easy part.",
  },
  {
    n: "Week 2",
    t: "Settling.",
    body:
      "First real rotation: a Stripe key. One edit, one new wrapped version. Every teammate sees v2 in their own browser within minutes. We see nothing new on our side.",
  },
  {
    n: "Week 3",
    t: "A visitor.",
    body:
      "A contractor joins for a sprint. Jerzy issues an invite link that expires after use. She's in, decrypting values locally, before stand-up is over. When the sprint ends, access is revoked by re-wrapping the key without her.",
    quote:
      "The offboarding was one click and a page reload. I've spent hours on this in previous jobs.",
  },
  {
    n: "Week 4",
    t: "Silence.",
    body:
      "No tickets opened. No pages. Four of the five teammates stop thinking about the vault entirely; the fifth opens it once to read an old version.",
  },
];

function D13Weeks() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-20">
        {D13_WEEKS.map((w, i) => (
          <motion.div
            key={w.n}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.05 }}
          >
            <div className="flex items-baseline gap-5 flex-wrap">
              <span className="text-sm font-mono uppercase tracking-[0.25em] text-neutral-600">
                {w.n}
              </span>
              <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
                {w.t}
              </h2>
            </div>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
              {w.body}
            </p>
            {w.quote && (
              <blockquote className="mt-10 pl-6 border-l border-neutral-900 text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic max-w-xl">
                "{w.quote}"
              </blockquote>
            )}
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D13Attribution() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — Jerzy Wiśniewski
          <span className="text-neutral-700"> · </span>
          cofounder, signosh
        </div>
      </div>
    </SectionShell>
  );
}

function D13Scale() {
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
          signosh is one of seventy-seven. Their three projects are
          three of eighty-nine. Roughly forty of the 1,086 wrapped
          versions are theirs.
        </motion.h2>
        <p className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-xl">
          Three other teams with similar stories — logdash, bluemenu,
          jobref — have their own months written up on the{" "}
          <a
            href="/blog"
            className={cn(
              "underline underline-offset-[6px] decoration-neutral-700 hover:decoration-neutral-400"
            )}
          >
            blog
          </a>
          .
        </p>
      </div>
    </SectionShell>
  );
}

function D13SecondVoice() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <blockquote className="text-xl md:text-2xl text-neutral-200 leading-[1.55] font-serif italic max-w-2xl">
          "Our month looked almost the same. A Thursday migration, and
          then nothing — in the good sense of nothing."
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

function D13CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Have your own quiet month.
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

export function VariantD13() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D13Hero />
      <D13Weeks />
      <D13Attribution />
      <D13SecondVoice />
      <D13Scale />
      <D13CTA />
    </div>
  );
}
