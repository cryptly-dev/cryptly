import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C14 — "Chain of Custody"
 * Formula C · One secret, traced end to end, in the idiom of a ledger.
 * ──────────────────────────────────────────────────────────────────────────── */

function C14Nav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-950/80 bg-black/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold tracking-tight text-neutral-100">
          Cryptly
        </a>
        <div className="flex items-center gap-7 text-sm text-neutral-400">
          <a href="/" className="text-neutral-100">
            home
          </a>
          <a href="#chain" className="hover:text-neutral-100 transition-colors">
            features
          </a>
          <a href="/blog" className="hover:text-neutral-100 transition-colors">
            blog
          </a>
          <a
            href="https://github.com/cryptly-dev/cryptly"
            className="hover:text-neutral-100 transition-colors"
          >
            github
          </a>
        </div>
      </div>
    </nav>
  );
}

function C14Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Exhibit A · one secret
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          Chain of custody.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          A DATABASE_URL, followed through every hand that touches it.
          Note the stretch in the middle where we are.
        </motion.p>
      </div>
    </section>
  );
}

const C14_STEPS = [
  {
    at: "13:02:14",
    who: "Jerzy's browser",
    where: "signosh · staging",
    what:
      "Types the value. Derives the project key from passphrase. Wraps the value locally.",
    ours: false,
  },
  {
    at: "13:02:14",
    who: "Jerzy's browser",
    where: "HTTPS · POST /secrets",
    what:
      "Sends the wrapped ciphertext. The plaintext does not leave the tab.",
    ours: false,
  },
  {
    at: "13:02:15",
    who: "Cryptly",
    where: "api · receive",
    what:
      "Receives ciphertext. Verifies the caller's session. Writes the ciphertext to storage.",
    ours: true,
  },
  {
    at: "13:02:15",
    who: "Cryptly",
    where: "api · store",
    what:
      "Assigns a version number. Records who uploaded it and when. Never sees a plaintext byte.",
    ours: true,
  },
  {
    at: "—",
    who: "Cryptly",
    where: "custody",
    what:
      "Holds the wrapped copy. This is all we have: what we wrote down at 13:02:15, unchanged.",
    ours: true,
  },
  {
    at: "13:04:32",
    who: "Dominik's browser",
    where: "bluemenu · shared",
    what:
      "Signs in. Receives ciphertext. Unwraps the project key locally. Reads the value.",
    ours: false,
  },
];

function C14Chain() {
  return (
    <SectionShell className="scroll-mt-14">
      <div id="chain" className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10">
          Custody log
        </div>
        <div>
          {C14_STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.04 }}
              className={cn(
                "grid grid-cols-[90px_1fr] gap-6 py-6 border-b border-neutral-900 last:border-b-0",
                s.ours && "bg-neutral-950/40"
              )}
            >
              <div className="font-mono text-xs text-neutral-500 pt-1">
                {s.at}
              </div>
              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-lg text-neutral-100 font-medium">
                    {s.who}
                  </span>
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-600">
                    {s.where}
                  </span>
                  {s.ours && (
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-300/70">
                      our reach
                    </span>
                  )}
                </div>
                <p className="mt-2 text-neutral-400 leading-relaxed">
                  {s.what}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function C14Finding() {
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
          We are three rows in the middle. On every one of them, it's
          wrapped.
        </motion.h2>
        <p className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-xl">
          Eighty-nine projects follow the same chain. One thousand and
          eighty-six versions have been logged. All of them sit in our
          middle rows, unread.
        </p>
      </div>
    </SectionShell>
  );
}

function C14Voice() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <blockquote className="text-xl md:text-2xl text-neutral-200 leading-[1.6] font-serif italic max-w-2xl">
          "The part I point to when I'm convincing my cofounder is the
          middle of the log. Nothing interesting happens there, and
          that's the whole point."
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

function C14Register() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          On the register
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
          Longer notes on chains like this one are on the{" "}
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

function C14CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Write your first entry.
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

export function VariantC14() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C14Nav />
      <C14Hero />
      <C14Chain />
      <C14Finding />
      <C14Voice />
      <C14Register />
      <C14CTA />
    </div>
  );
}
