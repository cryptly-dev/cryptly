import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, Moon } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A9 — "The 3am Redeploy"
 * Formula A · Need the token now. It's on a laptop currently asleep.
 * ──────────────────────────────────────────────────────────────────────────── */

function A9Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(56,189,248,0.04),transparent_55%)]" />
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex items-center gap-3 text-xs text-neutral-500 mb-8 font-mono uppercase tracking-[0.25em]"
        >
          <Moon className="h-3.5 w-3.5" />
          <span>03:47 · pager 002</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight"
        >
          PRODUCTION_TOKEN is on a laptop{" "}
          <span className="text-neutral-500">
            that is currently asleep.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-2xl"
        >
          The laptop is in Berlin. You are in New York. The rollback
          script needs the token to continue. You are typing very gently.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-14 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Fix this before 3am</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>On GitHub</span>
          </GhostCTA>
        </motion.div>
      </div>
    </section>
  );
}

function A9StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          An incident log, slightly redacted.
        </h2>
      </div>

      <div className="mt-14 max-w-3xl rounded-2xl border border-neutral-900 bg-neutral-950/50 overflow-hidden font-mono text-sm">
        {[
          { t: "03:41", m: "alerts: error rate 12%, climbing", tone: "warn" },
          { t: "03:44", m: "rollback initiated", tone: "ok" },
          {
            t: "03:46",
            m: "script halted: PRODUCTION_TOKEN not found in env",
            tone: "err",
          },
          { t: "03:47", m: "you wake the pager", tone: "neutral" },
          {
            t: "03:49",
            m: "only person with token: offline — last seen 22:40 CET",
            tone: "err",
          },
          { t: "03:55", m: "typed DM: 'really sorry, are you up?'", tone: "neutral" },
          { t: "04:04", m: "no reply", tone: "neutral" },
          {
            t: "04:12",
            m: "decide to rotate token, lose 11 minutes to change management",
            tone: "warn",
          },
        ].map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "grid grid-cols-[70px_1fr] gap-4 items-start px-5 py-2.5",
              i !== 7 && "border-b border-neutral-900"
            )}
          >
            <span className="text-neutral-600">{row.t}</span>
            <span
              className={cn(
                row.tone === "err" && "text-rose-300/90",
                row.tone === "warn" && "text-amber-200/90",
                row.tone === "ok" && "text-emerald-300/80",
                row.tone === "neutral" && "text-neutral-300"
              )}
            >
              {row.m}
            </span>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A9Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Timezones should not be a failure mode.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          If the incident depends on a specific human's machine being on,
          you have a two-level availability problem — the service's
          availability and your team's. The incident becomes an
          availability tax on sleep.
        </p>
      </div>
    </SectionShell>
  );
}

function A9NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The token should be wherever the on-call is.
        </h2>
      </div>

      <div className="mt-14 max-w-3xl space-y-8">
        {[
          {
            t: "The token lives in the vault, not on a laptop.",
            b: "It's encrypted at rest. The person on call decrypts with their own passphrase, from wherever they are.",
          },
          {
            t: "The on-call always has it.",
            b: "Because they're on the project's member list. Their browser unwraps their own copy.",
          },
          {
            t: "We, the vendor, can't read it.",
            b: "It's still ciphertext on our side. That doesn't change just because it's 3am.",
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

function A9Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          Cryptly is the vault.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          Small, open-source, free. The on-call doesn't need to wake
          anyone up.
        </p>
      </div>
    </SectionShell>
  );
}

function A9Proof() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The same log, with the vault:
        </h2>
      </div>

      <div className="mt-10 max-w-3xl rounded-2xl border border-neutral-900 bg-neutral-950/50 overflow-hidden font-mono text-sm">
        {[
          { t: "03:41", m: "alerts: error rate 12%, climbing", tone: "warn" },
          { t: "03:44", m: "rollback initiated", tone: "ok" },
          {
            t: "03:45",
            m: "cryptly: decrypt PRODUCTION_TOKEN · ok",
            tone: "ok",
          },
          {
            t: "03:46",
            m: "rollback complete · error rate restored",
            tone: "ok",
          },
          { t: "03:47", m: "you go back to sleep", tone: "neutral" },
        ].map((row, i) => (
          <div
            key={i}
            className={cn(
              "grid grid-cols-[70px_1fr] gap-4 items-start px-5 py-2.5",
              i !== 4 && "border-b border-neutral-900"
            )}
          >
            <span className="text-neutral-600">{row.t}</span>
            <span
              className={cn(
                row.tone === "warn" && "text-amber-200/90",
                row.tone === "ok" && "text-emerald-300/80",
                row.tone === "neutral" && "text-neutral-300"
              )}
            >
              {row.m}
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function A9CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          On-call should not depend on someone else's laptop battery.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Create a vault</span>
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

export function VariantA9() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A9Hero />
      <A9StatusQuo />
      <A9Tension />
      <A9NewWorld />
      <A9Bridge />
      <A9Proof />
      <A9CTA />
    </div>
  );
}
