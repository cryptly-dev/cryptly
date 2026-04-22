import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C7-explanation — "The Warrant Canary, Explained"
 * Formula C · Canary report + a short primer on what the product does.
 * ──────────────────────────────────────────────────────────────────────────── */

function C7EHero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Canary · q2 2026
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          As of today,
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight max-w-2xl"
        >
          Cryptly has received zero requests for customer data.
        </motion.h2>
      </div>
    </section>
  );
}

const C7E_FACTS = [
  { t: "Subpoenas received this quarter", v: "0" },
  { t: "National security letters received", v: "0" },
  { t: "Gag orders in effect", v: "0" },
  { t: "Requests we could honor if received", v: "0" },
];

function C7ECounts() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-14">
        {C7E_FACTS.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
            className="flex items-baseline justify-between border-b border-neutral-900 pb-6"
          >
            <div className="text-lg md:text-xl text-neutral-400 max-w-md leading-relaxed">
              {f.t}
            </div>
            <div className="text-4xl md:text-6xl font-semibold text-neutral-100 tracking-tight">
              {f.v}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function C7EHonest() {
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
          The last row is the important one. The first three will
          eventually change. The last one will not.
        </motion.h2>
        <p className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-xl">
          A request we cannot honor is not a refusal. It is the absence
          of a thing to hand over.
        </p>
      </div>
    </SectionShell>
  );
}

const C7E_FEATURES = [
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

function C7EFeatures() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10">
          Why the last row will not change
        </div>
        <div className="space-y-20">
          {C7E_FEATURES.map((f, i) => (
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
      </div>
    </SectionShell>
  );
}

function C7ENumbers() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          What we do hold
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: "30", l: "stars" },
            { n: "77", l: "users" },
            { n: "89", l: "projects" },
            { n: "1,086", l: "versions" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-4xl md:text-5xl font-semibold text-neutral-100 tabular-nums">
                {s.n}
              </div>
              <div className="mt-2 text-sm text-neutral-500 uppercase tracking-[0.15em]">
                {s.l}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-neutral-300 text-xl md:text-2xl font-semibold tracking-tight">
          <span>logdash</span>
          <span className="text-neutral-700">·</span>
          <span>signosh</span>
          <span className="text-neutral-700">·</span>
          <span>bluemenu</span>
          <span className="text-neutral-700">·</span>
          <span>jobref</span>
        </div>
        <p className="mt-8 text-neutral-500 text-lg leading-relaxed max-w-xl">
          The counter at the top stays at zero. These four climb as the
          list grows — more on the{" "}
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

function C7EVoices() {
  return (
    <SectionShell>
      <div className="max-w-3xl grid md:grid-cols-2 gap-14">
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "A canary that cannot lie, because the thing it would
            announce cannot happen."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Jerzy Wiśniewski · cofounder, signosh
          </div>
        </div>
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "I keep this page open in a pinned tab. It reads the same
            way every quarter, which is exactly the point."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Dominik Mackiewicz · cofounder, bluemenu
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function C7ECTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A number that stays at zero, by design.
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

export function VariantC7Explanation() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C7EHero />
      <C7ECounts />
      <C7EHonest />
      <C7EFeatures />
      <C7ENumbers />
      <C7EVoices />
      <C7ECTA />
    </div>
  );
}
