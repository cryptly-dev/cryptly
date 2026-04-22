import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B10 — "A Short Read"
 * Formula B · Chapters, unhurried.
 * ──────────────────────────────────────────────────────────────────────────── */

function B10Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-sm font-serif italic text-neutral-500 mb-10"
        >
          Five chapters · eight minutes
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          A short read about a small vault.
        </motion.h1>
      </div>
    </section>
  );
}

const B10_CHAPTERS = [
  {
    n: "i",
    h: "Where a secret lives.",
    b: "A password, an API key, a deploy token — these are the sorts of things people send each other in ways they later regret. Slack DMs, 1Password vaults tied to a single human, a note on a laptop that's about to be replaced. A secret wants to live somewhere durable, accessible to the right people, and legible to no one else.",
  },
  {
    n: "ii",
    h: "What a vendor shouldn't be.",
    b: "Most vaults hold the plaintext and promise not to look. This is fine until it isn't — until an employee leaves on bad terms, a database leaks, a court request lands, a junior mis-configures a permission. A vendor with read access is a vendor with latent risk, regardless of intent.",
  },
  {
    n: "iii",
    h: "What the browser can do.",
    b: "Modern browsers can encrypt. Sensitive bytes can be sealed before they reach our network, with a key derived from a passphrase that never leaves the device. The server's job shrinks: it stores ciphertext, routes ciphertext, and returns ciphertext. The plaintext is a local concern.",
  },
  {
    n: "iv",
    h: "And yet, humans forget.",
    b: "The honest failure mode of encrypting-on-the-client is that there is no customer support line that can recover a lost passphrase. The solution is not to weaken the design, but to widen it: wrap the project key for every teammate, so that any one of them can re-invite any one of the others.",
  },
  {
    n: "v",
    h: "This is the tool.",
    b: "Cryptly is a small, open-source secrets vault that does the above. Encryption in the browser. One wrap per teammate. Bytes in, bytes out on our side. Free. You can read the source, self-host the server, and be done by the end of an afternoon.",
  },
];

function B10Chapters() {
  return (
    <SectionShell>
      <div className="max-w-2xl space-y-28">
        {B10_CHAPTERS.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.05 }}
          >
            <div className="flex items-baseline gap-5">
              <span className="font-serif italic text-neutral-600 text-lg">
                {c.n}.
              </span>
              <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
                {c.h}
              </h2>
            </div>
            <p className="mt-8 text-lg md:text-xl text-neutral-300 leading-[1.8] font-serif">
              {c.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B10CTA() {
  return (
    <SectionShell>
      <div className="max-w-2xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Thanks for reading.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          When you're ready, the tool is here.
        </p>
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

export function VariantB10() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B10Hero />
      <B10Chapters />
      <B10CTA />
    </div>
  );
}
