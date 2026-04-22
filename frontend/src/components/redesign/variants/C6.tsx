import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C6 — "Dear Counsel"
 * Formula C · A note from engineering to legal.
 * ──────────────────────────────────────────────────────────────────────────── */

function C6Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Internal memo · engineering → legal
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          Dear counsel,
        </motion.h1>
      </div>
    </section>
  );
}

function C6Body() {
  return (
    <SectionShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl space-y-7 text-lg md:text-xl text-neutral-300 leading-[1.75] font-serif"
      >
        <p>
          You asked what we'd be able to produce if a court compelled
          disclosure of our customers' secrets. I am writing this ahead
          of time so that you have the engineering picture before the
          letter arrives.
        </p>
        <p>
          We store the customer's secrets in encrypted form. The
          encryption is performed in the customer's browser, using a key
          derived from a passphrase that is never transmitted to us. We
          do not hold the passphrase, the derived key, or the user's
          private key.
        </p>
        <p>
          Consequently, when a lawful request arrives, the complete set
          of what we can deliver is: the ciphertext, the metadata around
          it (timestamps, project ID, member public keys), and our
          declaration that we do not hold the means to decrypt any of it.
        </p>
        <p>
          We cannot be compelled to produce keys we do not possess. We
          can be compelled to change future versions of the software —
          but not to change existing ciphertext, because the keys that
          would unlock it live on user devices we do not control.
        </p>
        <p>
          If this helps you draft the standard response, please use it.
          I can sign a declaration if needed.
        </p>
      </motion.div>
      <div className="mt-10 max-w-2xl text-sm font-mono uppercase tracking-[0.3em] text-neutral-500">
        — the engineering lead
      </div>
    </SectionShell>
  );
}

function C6Note() {
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
          The memo is written in advance because the architecture was
          chosen in advance.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function C6CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A product your legal team can describe without discomfort.
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

export function VariantC6() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C6Hero />
      <C6Body />
      <C6Note />
      <C6CTA />
    </div>
  );
}
