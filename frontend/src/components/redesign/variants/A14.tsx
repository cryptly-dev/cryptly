import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, CircuitBoard } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A14 — "The Dead SSD"
 * Formula A · The drive stopped mounting. The .env was on it.
 * ──────────────────────────────────────────────────────────────────────────── */

function A14Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 text-xs text-neutral-500 mb-10 font-mono uppercase tracking-[0.25em]"
        >
          <CircuitBoard className="h-3.5 w-3.5" />
          <span>smart · reallocated sector ct · 129</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight"
        >
          The drive stopped mounting at 2am.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          Your .env was on it at 2am.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-2xl"
        >
          The drive will probably come back. Eventually. Data-recovery
          quotes run into the thousands. Your deploy is due Monday.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-14 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Move secrets off the drive</span>
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

function A14StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          A brief inventory of the affected sectors.
        </h2>
      </div>
      <div className="mt-12 max-w-3xl font-mono text-sm rounded-2xl border border-neutral-900 bg-neutral-950/50 overflow-hidden">
        {[
          { p: "/Volumes/work/app/.env", s: "34 secrets, never committed" },
          { p: "/Volumes/work/app/.env.production", s: "live credentials" },
          { p: "/Volumes/work/app/db/seed.secret", s: "seed script" },
          { p: "/Volumes/work/keys/deploy_id_rsa", s: "deploy key" },
          {
            p: "/Volumes/work/notes/what-was-the-password.md",
            s: "an unfortunate filename",
          },
        ].map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-[1.4fr_1fr] gap-4 px-5 py-3 border-b border-neutral-900 last:border-b-0"
          >
            <span className="text-neutral-300 truncate">{row.p}</span>
            <span className="text-neutral-500">{row.s}</span>
          </motion.div>
        ))}
      </div>
      <p className="mt-8 max-w-2xl text-lg text-neutral-400 leading-relaxed">
        A week of deploy-adjacent work living on a consumer SSD. The
        drive was never meant to be the canonical copy. Everyone
        pretended otherwise.
      </p>
    </SectionShell>
  );
}

function A14Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Hardware fails. That is its job.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          An SSD's lifetime is measured in write cycles. Its datasheet
          explicitly tells you to plan for failure. A secrets strategy
          that relies on the drive mounting this morning is a strategy
          that already failed a few dozen times, quietly, across your
          team.
        </p>
      </div>
    </SectionShell>
  );
}

function A14NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Secrets stored on something that isn't your disk.
        </h2>
      </div>

      <div className="mt-12 max-w-3xl space-y-6">
        {[
          {
            t: "The vault is the canonical copy.",
            b: "Wrapped per teammate, replicated for us. Your drive is a cache at best.",
          },
          {
            t: "A dead SSD is an inconvenience, not an incident.",
            b: "New laptop, new tab, decrypt with your passphrase. The state was never on the drive.",
          },
          {
            t: "The vendor still can't read it.",
            b: "We replicate ciphertext. Our durability is the only thing we contribute — not confidentiality.",
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

function A14Trusted() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          Quietly in use at
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
        <p className="mt-10 text-neutral-500 text-lg leading-relaxed max-w-xl">
          A short list, an honest one. Read more on the{" "}
          <a
            href="/blog"
            className={cn("underline underline-offset-4 hover:text-neutral-300")}
          >
            blog
          </a>
          .
        </p>
      </div>
    </SectionShell>
  );
}

function A14CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          The drive fails. The deploy doesn't.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
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

export function VariantA14() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A14Hero />
      <A14StatusQuo />
      <A14Tension />
      <A14NewWorld />
      <A14Trusted />
      <A14CTA />
    </div>
  );
}
