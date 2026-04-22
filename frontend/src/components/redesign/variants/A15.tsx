import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, Laptop } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A15 — "The Fresh Laptop"
 * Formula A · IT handed you a new machine. The old one is being wiped.
 * ──────────────────────────────────────────────────────────────────────────── */

function A15Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 text-xs text-neutral-500 mb-10 font-mono uppercase tracking-[0.25em]"
        >
          <Laptop className="h-3.5 w-3.5" />
          <span>setup assistant · hello</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight"
        >
          New laptop, empty dock.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          Old laptop, due back tomorrow.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-2xl"
        >
          You have one day to transfer the parts of your working life
          that weren't in iCloud or git. The secrets were in neither.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-14 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Make new-laptop-day boring</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Read the source</span>
          </GhostCTA>
        </motion.div>
      </div>
    </section>
  );
}

function A15StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          A migration checklist, incomplete.
        </h2>
      </div>

      <div className="mt-12 max-w-3xl space-y-3 font-mono text-sm">
        {[
          { t: "iCloud files sync", done: true },
          { t: "git clone everything", done: true },
          { t: "brew install the usual", done: true },
          { t: "1Password signs in", done: true },
          { t: ".env files", done: false },
          { t: "~/.aws/credentials", done: false },
          { t: "~/.ssh/ keys used for deploys", done: false },
          { t: "local .kube/config for dev", done: false },
        ].map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "flex items-center gap-4 px-4 py-2.5 rounded-lg border",
              row.done
                ? "border-neutral-900 bg-neutral-950/30 text-neutral-500"
                : "border-rose-900/40 bg-rose-950/10 text-rose-200/90"
            )}
          >
            <span className="text-xs w-20">
              {row.done ? "done" : "not a thing"}
            </span>
            <span>{row.t}</span>
          </motion.div>
        ))}
      </div>

      <p className="mt-10 max-w-2xl text-lg text-neutral-400 leading-relaxed">
        Four items don't have a documented migration path. The best plan
        is "open the old laptop one more time and scp."
      </p>
    </SectionShell>
  );
}

function A15Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Laptops come and go. Passphrases should too.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          The things that should follow you to a new machine are the
          ones that were never really tied to the old one. A passphrase
          in your head travels; a token in a local dotfile does not.
        </p>
      </div>
    </SectionShell>
  );
}

function A15NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          New-laptop-day is one tab and a passphrase.
        </h2>
      </div>

      <div className="mt-12 max-w-3xl space-y-6">
        {[
          {
            t: "Open a browser, open the vault.",
            b: "No dotfile migrations, no scp from the old machine. The project's vault recognises you once you type your passphrase.",
          },
          {
            t: "A fresh browser keychain.",
            b: "Your new device has a new private key. The first decrypt is a few seconds slower; everything after is the same.",
          },
          {
            t: "The old laptop goes back clean.",
            b: "IT wipes it without you worrying about what they might find. You worried about that last time.",
          },
        ].map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="pb-6 border-b border-neutral-900 last:border-b-0"
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

function A15Testimonial() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.blockquote
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-3xl text-neutral-200 leading-[1.5] font-serif italic max-w-2xl"
        >
          "Our engineers have rotated laptops twice this year. The
          credentials stayed exactly where they were. I noticed only
          because I expected a drama that never arrived."
        </motion.blockquote>
        <div className="mt-8 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — Jerzy Wiśniewski · cofounder, signosh
        </div>
        <div className="mt-14 text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-6">
          Alongside the rest of
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4 text-neutral-300 text-lg md:text-xl font-semibold tracking-tight">
          <span>logdash</span>
          <span className="text-neutral-700">·</span>
          <span>bluemenu</span>
          <span className="text-neutral-700">·</span>
          <span>jobref</span>
        </div>
      </div>
    </SectionShell>
  );
}

function A15CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          A passphrase, not an scp script.
        </h2>
        <div className="mt-4 text-neutral-500">
          More on our approach on the{" "}
          <a
            href="/blog"
            className={cn("underline underline-offset-4 hover:text-neutral-300")}
          >
            blog
          </a>
          .
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Set one up</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Cryptly on GitHub</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantA15() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A15Hero />
      <A15StatusQuo />
      <A15Tension />
      <A15NewWorld />
      <A15Testimonial />
      <A15CTA />
    </div>
  );
}
