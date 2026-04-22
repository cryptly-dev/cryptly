import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, KeyRound } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A13 — "The Hint That Didn't Help"
 * Formula A · You wrote a passphrase hint. Past-you was being clever.
 * ──────────────────────────────────────────────────────────────────────────── */

function A13Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight"
        >
          The hint said:
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight font-mono italic"
        >
          "the usual, but with the thing"
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-2xl"
        >
          Past-you wrote that eighteen months ago. Present-you is very
          annoyed with past-you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-14 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Don't rely on past-you's cleverness</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Read the source</span>
          </GhostCTA>
        </motion.div>
      </div>
    </section>
  );
}

function A13StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Solo vaults forget with you.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          Most vaults ask you to remember one passphrase forever.
          "Forever" has a way of being shorter than planned.
        </p>
      </div>

      <div className="mt-14 max-w-2xl rounded-2xl border border-neutral-900 bg-neutral-950/50 p-6">
        <div className="flex items-center gap-3 text-xs text-neutral-500 mb-4">
          <KeyRound className="h-4 w-4" />
          <span className="font-mono uppercase tracking-[0.25em]">
            attempts tonight
          </span>
        </div>
        <div className="space-y-2 font-mono text-sm text-neutral-300">
          {[
            "the usual",
            "theusualwiththething",
            "the-usual-dog",
            "the-usual-cat",
            "TheUsualWithTheThing!",
            "the usual but with the thing",
          ].map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center justify-between px-3 py-2 rounded-md bg-neutral-900/60"
            >
              <span>{g}</span>
              <span className="text-xs text-rose-300/70">incorrect</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-5 text-xs text-neutral-500 italic">
          There is, famously, no forgot-password link.
        </div>
      </div>
    </SectionShell>
  );
}

function A13Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Zero-knowledge, lonely version.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          You wanted a vendor who couldn't read your secrets. You did
          not, on reflection, want a vendor who couldn't help when your
          memory did what memory does. These are the same wish,
          described from two moods.
        </p>
      </div>
    </SectionShell>
  );
}

function A13NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Share the redundancy with teammates, not the vendor.
        </h2>
      </div>

      <div className="mt-14 max-w-3xl space-y-8">
        {[
          {
            t: "Each teammate has their own passphrase.",
            b: "Derived independently. Every one of them unlocks the project's vault on its own.",
          },
          {
            t: "When you forget, a teammate re-invites.",
            b: "Their browser rewraps the data key for a fresh key of yours. You pick a new passphrase, and you're back.",
          },
          {
            t: "We still can't read anything.",
            b: "Rewrapping is a local, cryptographic action. Plaintext doesn't pass through our side.",
          },
        ].map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="border-l border-neutral-800 pl-6"
          >
            <div className="text-lg md:text-xl text-neutral-100 leading-snug">
              {p.t}
            </div>
            <p className="mt-1.5 text-neutral-400 leading-relaxed">{p.b}</p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A13Testimonial() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.blockquote
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-3xl text-neutral-200 leading-[1.5] font-serif italic max-w-2xl"
        >
          "I forgot my passphrase three weeks in. My cofounder re-added
          me in about forty seconds. It was not a crisis."
        </motion.blockquote>
        <div className="mt-8 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — Dominik Mackiewicz · cofounder, bluemenu
        </div>
      </div>
    </SectionShell>
  );
}

function A13CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Forgetting should not be final.
        </h2>
        <div className="mt-4 text-neutral-500">
          We wrote more about this failure mode on the{" "}
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
            <span>Try it</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>On GitHub</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantA13() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A13Hero />
      <A13StatusQuo />
      <A13Tension />
      <A13NewWorld />
      <A13Testimonial />
      <A13CTA />
    </div>
  );
}
