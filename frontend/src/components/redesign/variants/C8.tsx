import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C8 — "Disclosure Report"
 * Formula C · A compact legal posture document.
 * ──────────────────────────────────────────────────────────────────────────── */

function C8Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Cryptly · disclosure report · 2026
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          What we can, and can't, disclose.
        </motion.h1>
      </div>
    </section>
  );
}

const C8_CAN = [
  "Ciphertext we hold on a customer's behalf, in the format stored.",
  "Metadata: project IDs, member public keys, timestamps, version history.",
  "Account information: email addresses of registered users.",
  "Billing records, where applicable.",
  "A declaration, signed by an engineer, describing our architecture.",
];

const C8_CANNOT = [
  "Plaintext of any stored secret — no system at Cryptly holds it.",
  "User passphrases — never transmitted, never stored.",
  "User private keys — held only in end-user keychains.",
  "A mechanism for producing the above — none exists in the codebase.",
  "A silent promise to do any of the above in future — changes are public.",
];

function C8Columns() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
            What we can disclose.
          </h2>
          <ul className="mt-10 space-y-4">
            {C8_CAN.map((line, i) => (
              <li
                key={i}
                className="flex gap-4 text-lg text-neutral-300 leading-relaxed"
              >
                <span className="font-mono text-neutral-600 pt-1 w-8 shrink-0 text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="max-w-xl">{line}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
            What we cannot.
          </h2>
          <ul className="mt-10 space-y-4">
            {C8_CANNOT.map((line, i) => (
              <li
                key={i}
                className="flex gap-4 text-lg text-neutral-300 leading-relaxed"
              >
                <span className="font-mono text-neutral-600 pt-1 w-8 shrink-0 text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="max-w-xl">{line}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </SectionShell>
  );
}

function C8Note() {
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
          The two lists don't overlap. That is the entire design.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function C8CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A short report. An honest one.
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

export function VariantC8() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C8Hero />
      <C8Columns />
      <C8Note />
      <C8CTA />
    </div>
  );
}
