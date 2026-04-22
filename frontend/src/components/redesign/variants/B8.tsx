import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B8 — "One Sentence"
 * Formula B · One claim, then the evidence.
 * ──────────────────────────────────────────────────────────────────────────── */

function B8Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center bg-black">
      <div className="mx-auto max-w-4xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.3, ease: [0.22, 0.61, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          We cannot read your secrets.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-16 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-xl"
        >
          The rest of this page is the evidence.
        </motion.p>
      </div>
    </section>
  );
}

const B8_EVIDENCE = [
  {
    t: "The plaintext never leaves your browser.",
    b: "Encryption is client-side. Our API receives ciphertext and returns ciphertext.",
  },
  {
    t: "Your passphrase never leaves your device.",
    b: "It is used locally to derive your key, and then forgotten.",
  },
  {
    t: "Your private key lives in your browser's keychain.",
    b: "We receive only the public half, to address envelopes to you.",
  },
  {
    t: "Every secret is wrapped per teammate.",
    b: "One envelope per person, one key per envelope. No shared master key in our possession.",
  },
  {
    t: "The crypto is in the open, in the client.",
    b: "You can read it. You can rebuild it. You can run it against our server without our binary.",
  },
];

function B8Evidence() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-sm font-mono uppercase tracking-[0.3em] text-neutral-500 mb-16">
          Evidence in support of the claim.
        </div>
        <div className="space-y-20">
          {B8_EVIDENCE.map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.04 }}
            >
              <h2 className="text-2xl md:text-4xl font-semibold text-neutral-100 tracking-tight leading-snug">
                {e.t}
              </h2>
              <p className="mt-5 text-lg text-neutral-400 leading-relaxed max-w-xl">
                {e.b}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function B8QED() {
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
          Therefore, the claim. We — the vendor — cannot read your
          secrets.
        </motion.h2>
        <div className="mt-10 text-sm font-mono uppercase tracking-[0.3em] text-neutral-500">
          Q.E.D.
        </div>
      </div>
    </SectionShell>
  );
}

function B8CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A secrets tool whose headline is its architecture.
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

export function VariantB8() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B8Hero />
      <B8Evidence />
      <B8QED />
      <B8CTA />
    </div>
  );
}
