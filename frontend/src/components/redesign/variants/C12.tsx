import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C12 — "In the Matter Of"
 * Formula C · A case caption, then findings of fact.
 * ──────────────────────────────────────────────────────────────────────────── */

function C12Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Caption · no. 2026–077
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.05] tracking-tight font-serif"
        >
          In the matter of a secret,
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="mt-6 text-2xl md:text-4xl text-neutral-500 leading-tight tracking-tight font-serif italic"
        >
          and the reach of those who hold it.
        </motion.h2>
      </div>
    </section>
  );
}

function C12Caption() {
  return (
    <SectionShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl border border-neutral-900 rounded-sm p-10 bg-neutral-950/40"
      >
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-6">
          Parties
        </div>
        <div className="space-y-6 text-base text-neutral-200 font-serif leading-relaxed">
          <div>
            <div className="text-neutral-500 text-sm uppercase tracking-wider mb-1">
              Petitioner
            </div>
            <div>A court of competent jurisdiction, seeking plaintext.</div>
          </div>
          <div>
            <div className="text-neutral-500 text-sm uppercase tracking-wider mb-1">
              Respondent
            </div>
            <div>Cryptly, operator of a zero-knowledge vault.</div>
          </div>
          <div>
            <div className="text-neutral-500 text-sm uppercase tracking-wider mb-1">
              Amici
            </div>
            <div>logdash, signosh, bluemenu, jobref — four teams among seventy-seven.</div>
          </div>
        </div>
      </motion.div>
    </SectionShell>
  );
}

const C12_FINDINGS = [
  {
    n: "1",
    body:
      "The respondent operates a vault in which plaintext values are encrypted within the user's browser prior to transmission. This fact is not disputed.",
  },
  {
    n: "2",
    body:
      "The decryption key for any given project is wrapped to each authorized member's passphrase-derived key and is never transmitted in unwrapped form to the respondent's servers.",
  },
  {
    n: "3",
    body:
      "The respondent maintains 1,086 wrapped secret versions across 89 projects on behalf of 77 named persons. No version has ever been decrypted on the respondent's infrastructure.",
  },
  {
    n: "4",
    body:
      "The source of the software is published. The petitioner, or any party, may inspect the claim and verify it in situ.",
  },
];

function C12Findings() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10">
          Findings of fact
        </div>
        <div className="space-y-12">
          {C12_FINDINGS.map((f, i) => (
            <motion.div
              key={f.n}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.05 }}
              className="flex gap-8"
            >
              <span className="text-neutral-600 font-serif italic text-xl shrink-0 w-6">
                {f.n}.
              </span>
              <p className="text-lg md:text-xl text-neutral-200 leading-[1.75] font-serif max-w-2xl">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function C12Conclusion() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          Conclusion
        </div>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.2] font-serif"
        >
          The respondent is unable, as a matter of architecture, to
          produce that which it does not possess.
        </motion.h2>
        <p className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-xl">
          A longer memorandum of decision is on file, on the{" "}
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

function C12Voice() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <blockquote className="text-xl md:text-2xl text-neutral-200 leading-[1.6] font-serif italic max-w-2xl">
          "I've never had to think about whether our secrets vendor
          could be compelled to hand something over. That sentence used
          to be two sentences."
        </blockquote>
        <div className="mt-8 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — Jerzy Wiśniewski
          <span className="text-neutral-700"> · </span>
          cofounder, signosh
        </div>
      </div>
    </SectionShell>
  );
}

function C12CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Pick the side of the caption we're on.
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

export function VariantC12() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C12Hero />
      <C12Caption />
      <C12Findings />
      <C12Voice />
      <C12Conclusion />
      <C12CTA />
    </div>
  );
}
