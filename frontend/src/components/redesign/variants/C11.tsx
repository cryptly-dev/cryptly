import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C11 — "The Depositions"
 * Formula C · Sworn statements from the people who've been on the vault.
 * ──────────────────────────────────────────────────────────────────────────── */

function C11Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Depositions · two
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          Two statements,
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="mt-4 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          given voluntarily.
        </motion.h2>
      </div>
    </section>
  );
}

function C11Deposition({
  index,
  name,
  role,
  body,
  i,
}: {
  index: string;
  name: string;
  role: string;
  body: string[];
  i: number;
}) {
  return (
    <SectionShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: i * 0.05 }}
        className="max-w-2xl"
      >
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          Deposition {index}
        </div>
        <div className="space-y-5 text-lg md:text-xl text-neutral-200 leading-[1.8] font-serif">
          {body.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
        <div className="mt-10 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — {name}
          <span className="text-neutral-700"> · </span>
          {role}
        </div>
      </motion.div>
    </SectionShell>
  );
}

function C11Stipulated() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          Stipulated, between the parties
        </div>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.15] font-serif"
        >
          Seventy-seven persons operate the vault. Eighty-nine projects
          reside within. One thousand and eighty-six wrapped versions
          have been recorded. No party, including the service provider,
          can produce the plaintext of any.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function C11Appearances() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          Appearances of record
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4 text-neutral-300 text-xl md:text-2xl font-semibold tracking-tight">
          <span>logdash</span>
          <span className="text-neutral-700">·</span>
          <span>signosh</span>
          <span className="text-neutral-700">·</span>
          <span>bluemenu</span>
          <span className="text-neutral-700">·</span>
          <span>jobref</span>
        </div>
        <p className="mt-8 text-neutral-500 text-lg leading-relaxed max-w-xl">
          Four of seventy-seven. The full docket is on the{" "}
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

function C11CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Add your own deposition.
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

export function VariantC11() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C11Hero />
      <C11Deposition
        i={0}
        index="i"
        name="Jerzy Wiśniewski"
        role="cofounder, signosh"
        body={[
          "I have operated a project on Cryptly since February. The project contains production credentials for signosh.",
          "I understand, from reading the source and from the conduct of the service over four months, that the operators of Cryptly cannot read these credentials.",
          "I have been asked whether this concerns me. It does the opposite. The property I find reassuring is that no request, whether from me, the operators, or any third party, can elicit the plaintext from their side.",
        ]}
      />
      <C11Deposition
        i={1}
        index="ii"
        name="Dominik Mackiewicz"
        role="cofounder, bluemenu"
        body={[
          "I adopted Cryptly for bluemenu after a week of reviewing the repository. I was satisfied that the design, as described, was the design, as implemented.",
          "I have since invited three teammates. Each invitation rewrapped the project key on my device, not on the service. I watched this happen in the network tab.",
          "I have no further testimony. The architecture is the testimony.",
        ]}
      />
      <C11Stipulated />
      <C11Appearances />
      <C11CTA />
    </div>
  );
}
