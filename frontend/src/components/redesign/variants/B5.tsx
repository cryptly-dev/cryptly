import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B5 — "Negative Space"
 * Formula B · The product defined by what it isn't, doesn't, can't.
 * ──────────────────────────────────────────────────────────────────────────── */

function B5Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Described by absence.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          The things we have carefully arranged not to have are the
          product.
        </motion.p>
      </div>
    </section>
  );
}

const B5_ABSENCES = [
  {
    t: "No plaintext on our servers.",
    b: "The encryption happens in the browser that typed the secret. What reaches us is ciphertext or nothing.",
  },
  {
    t: "No passphrase on our servers.",
    b: "It is derived on your device and stays there. We do not receive it, store it, or forward it.",
  },
  {
    t: "No user-key on our servers.",
    b: "Your private key lives in your keychain. We hold only the public half, to address envelopes.",
  },
  {
    t: "No backdoor in the binary.",
    b: "There is no binary. The client is the source, inspectable in the tab you already have open.",
  },
  {
    t: "No recovery flow we secretly control.",
    b: "When a teammate re-invites you, that teammate rewraps the key. We don't know your new passphrase either.",
  },
];

function B5Absences() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-20">
        {B5_ABSENCES.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
          >
            <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
              {a.t}
            </h2>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
              {a.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B5Inverse() {
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
          What remains, after the subtraction: a small, free, open-source
          vault that stores encrypted bytes on your team's behalf, and
          can't do anything else with them.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function B5Numbers() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          The presences
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
          The absences are worth more than the numbers, but these are
          real too. More on the{" "}
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

function B5Voices() {
  return (
    <SectionShell>
      <div className="max-w-3xl grid md:grid-cols-2 gap-14">
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "The list of things it doesn't have is what convinced me. I
            stopped reading competitors after."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Jerzy Wiśniewski · cofounder, signosh
          </div>
        </div>
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "No recovery flow they secretly control — that sentence is
            why I invited my team."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Dominik Mackiewicz · cofounder, bluemenu
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function B5CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A product measured by what it refuses.
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

export function VariantB5() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B5Hero />
      <B5Absences />
      <B5Inverse />
      <B5Numbers />
      <B5Voices />
      <B5CTA />
    </div>
  );
}
