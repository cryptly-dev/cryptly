import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B7 — "The Specification"
 * Formula B · RFC-style clarity.
 * ──────────────────────────────────────────────────────────────────────────── */

function B7Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="font-mono text-sm text-neutral-500 mb-8 tracking-wide"
        >
          cryptly/spec · v1 · draft
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          A small specification.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Four sections. The words <span className="font-mono text-neutral-300">MUST</span>,{" "}
          <span className="font-mono text-neutral-300">MUST NOT</span>, and{" "}
          <span className="font-mono text-neutral-300">SHOULD</span> are used with
          the same meaning as RFC 2119.
        </motion.p>
      </div>
    </section>
  );
}

const B7_SECTIONS = [
  {
    n: "1.",
    h: "Storage",
    lines: [
      { k: "MUST", t: "store ciphertext only." },
      { k: "MUST NOT", t: "store user passphrases, in any form." },
      { k: "MUST NOT", t: "hold the private key of any user." },
      { k: "SHOULD", t: "be inexpensive to run, so it is easy to self-host." },
    ],
  },
  {
    n: "2.",
    h: "Access",
    lines: [
      { k: "MUST", t: "wrap the project data key once per member." },
      { k: "MUST", t: "allow any member to decrypt their copy independently." },
      { k: "MUST NOT", t: "require the vendor for a decrypt to succeed." },
    ],
  },
  {
    n: "3.",
    h: "Client",
    lines: [
      { k: "MUST", t: "perform all crypto in the user's browser." },
      { k: "MUST", t: "be distributed as source, legible and auditable." },
      { k: "SHOULD", t: "build and run without a vendor account." },
    ],
  },
  {
    n: "4.",
    h: "Loss",
    lines: [
      { k: "MUST", t: "support re-invitation by any existing member." },
      { k: "MUST NOT", t: "allow the vendor to recover a lost passphrase." },
      { k: "SHOULD", t: "fail closed, not silently." },
    ],
  },
];

function B7Sections() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-20">
        {B7_SECTIONS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
          >
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-neutral-600 text-lg">
                {s.n}
              </span>
              <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight">
                {s.h}
              </h2>
            </div>
            <ul className="mt-8 space-y-3">
              {s.lines.map((l, j) => (
                <li
                  key={j}
                  className="text-lg leading-relaxed flex gap-4 text-neutral-300"
                >
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-neutral-500 pt-1.5 w-24 shrink-0">
                    {l.k}
                  </span>
                  <span className="max-w-xl">{l.t}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B7Closing() {
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
          Cryptly is an implementation of the above. It is free, open
          source, and conforms to every line on this page.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function B7CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Check the implementation against the spec.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Use it</span>
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

export function VariantB7() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B7Hero />
      <B7Sections />
      <B7Closing />
      <B7CTA />
    </div>
  );
}
