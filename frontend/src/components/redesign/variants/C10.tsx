import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C10 — "The Hypothetical"
 * Formula C · Imagining the worst-case request.
 * ──────────────────────────────────────────────────────────────────────────── */

function C10Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          Imagine the worst letter a vendor could receive.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed"
        >
          We did. Then we wrote the reply, and then we wrote the
          software that makes the reply honest.
        </motion.p>
      </div>
    </section>
  );
}

const C10_EXCHANGE: { who: "LETTER" | "REPLY"; t: string }[] = [
  {
    who: "LETTER",
    t: "Produce the plaintext of every secret held on behalf of the account listed in Appendix A. The request is broad by design, on the theory that narrowness is what you hide behind.",
  },
  {
    who: "REPLY",
    t: "The breadth is noted, and it changes nothing in what we can return. The plaintext does not exist in our systems. It has never existed in our systems.",
  },
  {
    who: "LETTER",
    t: "Produce the keys that decrypt the ciphertext. If a key exists anywhere in your possession — in a production database, a developer's machine, a backup tape — we require it.",
  },
  {
    who: "REPLY",
    t: "No such key exists in our possession. The key is derived in the end user's browser from a passphrase we do not receive. We store ciphertext and public keys. Neither is sufficient to decrypt.",
  },
  {
    who: "LETTER",
    t: "Modify your software so that, going forward, a key can be intercepted and surrendered.",
  },
  {
    who: "REPLY",
    t: "Any such modification would be a public pull request in an open source client, visible to every user who reads the code. We are not at liberty to commit silently. Older data, in any case, would remain bound to keys we do not possess.",
  },
  {
    who: "LETTER",
    t: "Then produce everything you do have.",
  },
  {
    who: "REPLY",
    t: "Gladly. What we have is ciphertext and metadata. Here it is.",
  },
];

function C10Exchange() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-14">
        {C10_EXCHANGE.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.04 }}
          >
            <div
              className={cn(
                "text-xs font-mono uppercase tracking-[0.3em] mb-4",
                e.who === "LETTER" ? "text-neutral-500" : "text-sky-300/70"
              )}
            >
              {e.who === "LETTER" ? "The letter" : "Our reply"}
            </div>
            <p className="text-lg md:text-xl text-neutral-200 leading-[1.7] font-serif max-w-2xl">
              {e.t}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function C10Reflection() {
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
          The hypothetical is the feature. A vendor that can write this
          exchange truthfully is a vendor whose customers are shielded
          from the worst of it.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function C10CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A vault whose subpoena reply fits on a postcard.
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

export function VariantC10() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C10Hero />
      <C10Exchange />
      <C10Reflection />
      <C10CTA />
    </div>
  );
}
