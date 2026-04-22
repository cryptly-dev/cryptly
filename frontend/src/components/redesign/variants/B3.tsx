import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B3 — "The Dictionary"
 * Formula B · Definitions, one word at a time.
 * ──────────────────────────────────────────────────────────────────────────── */

function B3Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          A short dictionary.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Six words, written down precisely, because precision is the whole
          product.
        </motion.p>
      </div>
    </section>
  );
}

const B3_ENTRIES = [
  {
    w: "secret",
    p: "noun",
    d: "A string of bytes you would not paste in public. A DB password, an API key, a webhook signer.",
    e: "\"The secret lived in a Notion page until it didn't.\"",
  },
  {
    w: "plaintext",
    p: "noun",
    d: "The secret before it's encrypted. The form we never receive.",
    e: "\"Plaintext exists only in the browser of someone on your team.\"",
  },
  {
    w: "ciphertext",
    p: "noun",
    d: "What we store. Unreadable without a key we don't have.",
    e: "\"Subpoena the ciphertext and you get ciphertext back.\"",
  },
  {
    w: "passphrase",
    p: "noun",
    d: "The thing only you know. Derives the key that unwraps your copy.",
    e: "\"Your passphrase never leaves your machine.\"",
  },
  {
    w: "wrapped",
    p: "adjective",
    d: "Encrypted once per teammate, so each person has their own door.",
    e: "\"The data key is wrapped for every member of the project.\"",
  },
  {
    w: "zero-knowledge",
    p: "adjective",
    d: "A property: the server can help, but cannot read.",
    e: "\"Cryptly is zero-knowledge by construction, not by promise.\"",
  },
];

function B3Entries() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-20">
        {B3_ENTRIES.map((e, i) => (
          <motion.div
            key={e.w}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
          >
            <div className="flex items-baseline gap-4">
              <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight">
                {e.w}
              </h2>
              <span className="text-sm italic text-neutral-500 font-serif">
                {e.p}.
              </span>
            </div>
            <p className="mt-5 text-lg md:text-xl text-neutral-300 leading-relaxed max-w-2xl">
              {e.d}
            </p>
            <p className="mt-4 text-base text-neutral-500 italic leading-relaxed max-w-2xl">
              {e.e}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B3Numbers() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          The dictionary in use
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: "30", l: "stars" },
            { n: "77", l: "users" },
            { n: "89", l: "projects" },
            { n: "1,086", l: "versions" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-4xl md:text-5xl font-semibold text-neutral-100 tabular-nums">
                {s.n}
              </div>
              <div className="mt-2 text-sm text-neutral-500 uppercase tracking-[0.15em]">
                {s.l}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-neutral-300 text-xl md:text-2xl font-semibold tracking-tight">
          <span>logdash</span>
          <span className="text-neutral-700">·</span>
          <span>signosh</span>
          <span className="text-neutral-700">·</span>
          <span>bluemenu</span>
          <span className="text-neutral-700">·</span>
          <span>jobref</span>
        </div>
      </div>
    </SectionShell>
  );
}

function B3Voices() {
  return (
    <SectionShell>
      <div className="max-w-3xl grid md:grid-cols-2 gap-14">
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "The words on the page are the same ones in the code. That
            is surprisingly rare."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Jerzy Wiśniewski · cofounder, signosh
          </div>
        </div>
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "I read the definitions before the pitch. That's the order I
            wanted them in."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Dominik Mackiewicz · cofounder, bluemenu
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function B3Closing() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.1]"
        >
          If the six definitions hold, the product follows. The longer
          entries for each word live on the{" "}
          <a
            href="/blog"
            className={cn(
              "underline underline-offset-[6px] decoration-neutral-700 hover:decoration-neutral-400"
            )}
          >
            blog
          </a>
          .
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function B3CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Use the words as a spec.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Try it</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Read the implementation</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantB3() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B3Hero />
      <B3Entries />
      <B3Numbers />
      <B3Voices />
      <B3Closing />
      <B3CTA />
    </div>
  );
}
