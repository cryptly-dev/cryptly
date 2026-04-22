import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B4 — "Letters to an Engineer"
 * Formula B · Correspondence format, unhurried.
 * ──────────────────────────────────────────────────────────────────────────── */

function B4Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-sm font-serif italic text-neutral-500 mb-10"
        >
          A short letter, from us to you.
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          Dear engineer,
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed"
        >
          You are reading this at the end of a long day. We'll be brief.
        </motion.p>
      </div>
    </section>
  );
}

function B4LetterOne() {
  return (
    <SectionShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl space-y-7 text-lg md:text-xl text-neutral-300 leading-[1.7]"
      >
        <p>
          We wrote a small tool. It stores secrets the way we wish every
          tool had stored them — encrypted in your browser, with a key
          that never travels to us.
        </p>
        <p>
          It isn't clever. Each teammate has a keypair. The data key is
          wrapped once per teammate. To decrypt, you unwrap your own copy
          in your own browser. We store ciphertext and nothing else.
        </p>
        <p>
          The interesting property is this: we are not in your threat
          model. If we are compelled to hand over what we have, what we
          have is noise.
        </p>
        <p className="text-neutral-500 italic">— the authors</p>
      </motion.div>
    </SectionShell>
  );
}

function B4LetterTwo() {
  return (
    <SectionShell>
      <div className="max-w-2xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight"
        >
          P.S.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 space-y-6 text-lg text-neutral-400 leading-[1.7]"
        >
          <p>
            We know what you're going to look for. The relevant files are{" "}
            <span className="font-mono text-neutral-300">crypto/*.ts</span>.
            The envelope is AES-GCM, the per-user wrap is RSA-OAEP, and
            the passphrase derives the user key via PBKDF2.
          </p>
          <p>
            If any of that is wrong, we would like you to open an issue
            before we hear about it somewhere else.
          </p>
        </motion.div>
      </div>
    </SectionShell>
  );
}

function B4Closing() {
  return (
    <SectionShell>
      <div className="max-w-2xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-[1.15] tracking-tight"
        >
          The tool is called Cryptly. It is free. It is open. It fits in
          an afternoon.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function B4CTA() {
  return (
    <SectionShell>
      <div className="max-w-2xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Yours, etc.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Write back</span>
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

export function VariantB4() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B4Hero />
      <B4LetterOne />
      <B4LetterTwo />
      <B4Closing />
      <B4CTA />
    </div>
  );
}
