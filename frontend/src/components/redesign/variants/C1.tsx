import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C1 — "The Exchange"
 * Formula C · A letter from a court, and our reply.
 * ──────────────────────────────────────────────────────────────────────────── */

function C1Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Correspondence
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          The court wrote us a letter.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="mt-4 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          We wrote one back.
        </motion.h2>
      </div>
    </section>
  );
}

function C1CourtLetter() {
  return (
    <SectionShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl"
      >
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-6">
          From the court
        </div>
        <div className="space-y-5 text-lg md:text-xl text-neutral-200 leading-[1.8] font-serif">
          <p>
            You are hereby directed to produce, within fourteen days, the
            unencrypted contents of all secrets stored on behalf of the
            entity listed in Schedule A.
          </p>
          <p>
            Failure to comply may result in sanctions under the
            applicable order.
          </p>
        </div>
        <div className="mt-8 text-sm text-neutral-500 italic font-serif">
          — the clerk of the court
        </div>
      </motion.div>
    </SectionShell>
  );
}

function C1OurReply() {
  return (
    <SectionShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl"
      >
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-6">
          From us
        </div>
        <div className="space-y-5 text-lg md:text-xl text-neutral-200 leading-[1.8] font-serif">
          <p>
            We have received the order, and would like to comply with its
            spirit if not its letter.
          </p>
          <p>
            We are architecturally unable to produce the plaintext. No
            employee, process, or system at Cryptly possesses the
            decryption key.
          </p>
          <p>
            What we can produce — and are prepared to deliver, in the
            format of your choosing — is the ciphertext, exactly as we
            store it. It will not decrypt without a key held by a member
            of the entity in Schedule A.
          </p>
          <p>
            The architecture that compels this answer is public. We would
            be glad to walk the court through it.
          </p>
        </div>
        <div className="mt-8 text-sm text-neutral-500 italic font-serif">
          — the cryptly authors
        </div>
      </motion.div>
    </SectionShell>
  );
}

function C1Closing() {
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
          The reply is the same regardless of who is writing. That is the
          design goal.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function C1CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Store secrets where this is the only answer.
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

export function VariantC1() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C1Hero />
      <C1CourtLetter />
      <C1OurReply />
      <C1Closing />
      <C1CTA />
    </div>
  );
}
