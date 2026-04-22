import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D15 — "A Note, From Us"
 * Formula D · First-person letter threaded with numbers, teams, and voices.
 * ──────────────────────────────────────────────────────────────────────────── */

function D15Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          A note · from us
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight font-serif"
        >
          Hello.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          A short letter, in place of a landing page. We think it's the
          better form.
        </motion.p>
      </div>
    </section>
  );
}

function D15Letter() {
  return (
    <SectionShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl space-y-7 text-lg md:text-xl text-neutral-200 leading-[1.8] font-serif"
      >
        <p>
          You've arrived at a small website, for a small tool, built by
          a small team. We want to tell you what it does, what it
          doesn't, and who it's for.
        </p>
        <p>
          Cryptly is a vault for your secrets — API keys, database
          URLs, the small set of strings your team passes around and
          would prefer not to lose. You write them in your browser. The
          browser encrypts them before they leave your tab. We store
          what comes out of that process, which is ciphertext. We don't
          see the plaintext, and we can't.
        </p>
        <p>
          The numbers, as of today, are these. Seventy-seven people use
          Cryptly. Eighty-nine projects live inside it. One thousand
          and eighty-six wrapped secret versions sit on our servers,
          unread by us. Thirty people have starred the repository.
        </p>
        <p>
          Four of the teams on the vault don't mind being named:
          logdash, signosh, bluemenu, jobref. The rest prefer we
          don't, and we don't.
        </p>
        <p>
          We are not trying to be bigger than this yet. We're trying to
          be correct, and to serve the people who find us.
        </p>
      </motion.div>
    </SectionShell>
  );
}

function D15Voices() {
  return (
    <SectionShell>
      <div className="max-w-3xl grid md:grid-cols-2 gap-14">
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.65] font-serif italic">
            "The smallness is the feature. I trust the smallness more
            than I trust the features."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Jerzy Wiśniewski · signosh
          </div>
        </div>
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.65] font-serif italic">
            "It reads like a project someone cared about. That's rare,
            and I don't take it for granted."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Dominik Mackiewicz · bluemenu
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function D15Close() {
  return (
    <SectionShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl space-y-7 text-lg md:text-xl text-neutral-200 leading-[1.8] font-serif"
      >
        <p>
          If you'd like the longer version of any of the above, we've
          written about it on the{" "}
          <a
            href="/blog"
            className={cn(
              "underline underline-offset-[6px] decoration-neutral-700 hover:decoration-neutral-400"
            )}
          >
            blog
          </a>
          . If you'd like the shortest version, you can read the source
          on GitHub — it is the shortest honest version we have.
        </p>
        <p>Thank you for reading this far.</p>
        <div className="mt-8 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — the cryptly authors
        </div>
      </motion.div>
    </SectionShell>
  );
}

function D15CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          If this sounds right, come in.
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

export function VariantD15() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D15Hero />
      <D15Letter />
      <D15Voices />
      <D15Close />
      <D15CTA />
    </div>
  );
}
