import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight, KeyRound } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A7 — "The Forgotten Passphrase"
 * Formula A · You changed the passphrase. Past-you didn't tell present-you
 * what to.
 * ──────────────────────────────────────────────────────────────────────────── */

function A7Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight"
        >
          You changed the passphrase.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 tracking-tight leading-tight"
        >
          Past-you didn't leave a note.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-2xl"
        >
          The hint said{" "}
          <span className="italic text-neutral-300">
            "hunter2 plus the day."
          </span>{" "}
          Which day. You've tried Tuesday.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-14 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Share the key instead</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Read the code</span>
          </GhostCTA>
        </motion.div>
      </div>
    </section>
  );
}

function A7StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Solo vaults have a single point of forgetting.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
          Most password managers want you to remember <em>one</em> thing
          forever. That thing is a human, doing a human job, under six
          months of sleep deprivation. The thing forgets.
        </p>
      </div>

      <div className="mt-14 max-w-2xl rounded-2xl border border-neutral-900 bg-neutral-950/50 p-6">
        <div className="flex items-center gap-3 text-xs text-neutral-500 mb-4">
          <KeyRound className="h-4 w-4" />
          <span className="font-mono uppercase tracking-[0.25em]">
            unlock master vault
          </span>
        </div>
        <div className="space-y-3">
          {[
            "hunter2monday",
            "hunter2tuesday",
            "hunter2wednesday",
            "Hunter2Thursday",
            "hunter2-friday",
            "hunter2 friday",
          ].map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="font-mono text-sm text-neutral-300 flex items-center justify-between px-3 py-2 rounded-md bg-neutral-900/70"
            >
              <span>{g}</span>
              <span className="text-xs text-rose-300/80">incorrect</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 text-xs text-neutral-600 italic">
          Support cannot recover this. That's the point, they remind you.
        </div>
      </div>
    </SectionShell>
  );
}

function A7Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          A good property, in a lonely place.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          Zero-knowledge is correct. You genuinely do not want a vendor who
          can remember for you. But you do want <em>someone</em> to
          remember for you — and that someone should be another human on
          your team, not the vendor and not yourself alone.
        </p>
      </div>
    </SectionShell>
  );
}

function A7NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Multiple humans, any of whom can open the door.
        </h2>
      </div>

      <div className="mt-14 max-w-3xl space-y-8">
        {[
          {
            t: "Every teammate has their own passphrase.",
            b: "They're derived independently. Each one unlocks the vault on its own.",
          },
          {
            t: "Forgetting yours doesn't lock the vault.",
            b: "A teammate decrypts. They re-invite you. You choose a new passphrase.",
          },
          {
            t: "We still can't read anything.",
            b: "Re-invite is a key re-wrap. The plaintext never visits us.",
          },
          {
            t: "If everyone forgets, the vault stays sealed.",
            b: "We're not lying to you. Zero-knowledge has one honest failure mode, and this is it.",
          },
        ].map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="border-l border-neutral-800 pl-6"
          >
            <div className="text-lg md:text-xl text-neutral-100 leading-snug">
              {p.t}
            </div>
            <p className="mt-1.5 text-neutral-400 leading-relaxed">{p.b}</p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A7Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          We built Cryptly for this.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          Zero-knowledge, but with humans redundancy. The vault opens for
          any teammate. The vendor is not one of them.
        </p>
      </div>
    </SectionShell>
  );
}

function A7Proof() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The re-invite, in plain English:
        </h2>
      </div>

      <div className="mt-10 max-w-2xl font-mono text-sm rounded-2xl border border-neutral-900 bg-neutral-950/50 p-6 leading-relaxed">
        <div className="text-neutral-600">// you forgot</div>
        <div className="text-neutral-300">
          you <span className="text-rose-400">→</span> teammate:{" "}
          <span className="text-neutral-200">
            "I forgot the passphrase — can you re-add me?"
          </span>
        </div>
        <div className="text-neutral-300 mt-3">
          teammate <span className="text-sky-400">→</span> cryptly:{" "}
          <span className="text-neutral-200">
            "rewrap project payments for new key"
          </span>
        </div>
        <div className="text-neutral-300 mt-3">
          you, now:{" "}
          <span className="text-neutral-200">
            pick a fresh passphrase, decrypt normally
          </span>
        </div>
        <div className="text-neutral-600 mt-4">
          // at no point does cryptly see plaintext
        </div>
      </div>
    </SectionShell>
  );
}

function A7CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Forgetting should not be final.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Try it</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>On GitHub</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantA7() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A7Hero />
      <A7StatusQuo />
      <A7Tension />
      <A7NewWorld />
      <A7Bridge />
      <A7Proof />
      <A7CTA />
    </div>
  );
}
