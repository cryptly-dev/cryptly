import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D5 — "From Empty"
 * Formula D · Empty vault to first secret.
 * ──────────────────────────────────────────────────────────────────────────── */

function D5Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          A vault, empty.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          Then one secret.
        </motion.h2>
      </div>
    </section>
  );
}

function D5Stage1() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10">
            Stage one · the empty vault
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
            Three minutes after signup, you have a vault with nothing in
            it.
          </h2>
          <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
            No secrets, no teammates, no history. What you have is a
            place — addressable, stable, yours. The keys that open it
            exist only in your browser.
          </p>
        </motion.div>
      </div>
    </SectionShell>
  );
}

function D5Stage2() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10">
            Stage two · the first secret
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
            You paste a DATABASE_URL. The browser encrypts it before it
            leaves the tab.
          </h2>
          <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
            By the time the request reaches our server, the value is
            ciphertext. We store it; we cannot read it. The vault is no
            longer empty, and no plaintext of yours lives on our side.
          </p>
        </motion.div>
      </div>
    </SectionShell>
  );
}

function D5Stage3() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10">
            Stage three · the rest
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
            Everything after is a repeat of stage two, at scale.
          </h2>
          <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
            Our 77 users have run stage two 1,086 times across 89
            projects. Every one of those writes was a fresh envelope,
            sealed in the browser, stored as noise by us.
          </p>
        </motion.div>
      </div>
    </SectionShell>
  );
}

function D5CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Start with an empty vault. The first secret is the hard part.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Open an empty vault</span>
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

export function VariantD5() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D5Hero />
      <D5Stage1 />
      <D5Stage2 />
      <D5Stage3 />
      <D5CTA />
    </div>
  );
}
