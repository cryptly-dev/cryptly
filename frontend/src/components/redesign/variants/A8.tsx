import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight, FileText } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A8 — "The Acquired Company"
 * Formula A · The M&A letter format, listing what wasn't transferred.
 * ──────────────────────────────────────────────────────────────────────────── */

function A8Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black">
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500 mb-8">
            FROM THE DESK OF THE CTO — POST-ACQUISITION
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.04] tracking-tight">
            We bought the company.
            <br />
            <span className="text-neutral-500">
              We did not buy the .env file.
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-2xl"
        >
          Closing was Friday. The last engineer on the acquired side had
          their access revoked by Legal on Sunday. On Monday morning, you
          learned that the secrets went with them.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-14 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Don't be on either side of this</span>
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

const A8_MISSING = [
  "Primary DB credentials (production)",
  "Third-party API keys — Stripe, Twilio, Segment",
  "OAuth client secrets — Google, Slack, GitHub app",
  "The deploy key for the self-hosted runner",
  "A notion doc titled 'misc keys (move to vault??)'",
  "The passphrase to the old vault itself",
];

function A8StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Assets transferred. Secrets, not so much.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
          The IP was conveyed by the purchase agreement. The literal
          credentials were in Janet's head, Paolo's laptop, and an
          abandoned 1Password vault nobody could log into.
        </p>
      </div>

      <div className="mt-14 max-w-3xl rounded-xl border border-neutral-900 bg-neutral-950/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-900 flex items-center gap-3 text-xs text-neutral-500 uppercase tracking-[0.25em]">
          <FileText className="h-3.5 w-3.5" />
          <span>Attachment B · Items not transferred</span>
        </div>
        <ol className="p-5 space-y-2.5">
          {A8_MISSING.map((t, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-4 text-sm leading-relaxed"
            >
              <span className="font-mono text-xs text-neutral-600 w-8 shrink-0 pt-0.5">
                B.{i + 1}
              </span>
              <span className="text-neutral-300">{t}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}

function A8Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The problem, structurally:
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          The acquired team stored secrets in places tied to individual
          humans — not to the company. When the humans left, the
          institution didn't have what the institution paid for.
        </p>
        <p className="mt-6 text-lg text-neutral-500 leading-relaxed max-w-2xl italic">
          The law firm cannot help with this. The acquired founder's new
          startup takes precedence over returning your Slack DMs.
        </p>
      </div>
    </SectionShell>
  );
}

function A8NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Secrets attached to the project, not the person.
        </h2>
      </div>

      <div className="mt-14 max-w-3xl space-y-8">
        {[
          {
            t: "The vault is a first-class company asset.",
            b: "Stored on infrastructure the company owns access to. Transferable in the same breath as a GitHub org.",
          },
          {
            t: "Membership is a set of public keys.",
            b: "People join, people leave. The vault persists. No private-key-on-a-laptop dependency.",
          },
          {
            t: "The vendor is not a custodian.",
            b: "Cryptly stores ciphertext. We cannot hand anything to anyone, by design — including new owners. The new team's keys unlock it.",
          },
        ].map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="text-lg md:text-xl text-neutral-100 leading-snug">
              — {p.t}
            </div>
            <p className="mt-2 text-neutral-400 leading-relaxed ml-4">
              {p.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A8Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          Cryptly is the vault.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          Small, open-source, free. One project, one vault, one transfer
          of ownership when the deal closes.
        </p>
      </div>
    </SectionShell>
  );
}

function A8Proof() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          On a Monday after closing:
        </h2>
      </div>
      <div className="mt-10 max-w-3xl font-mono text-sm rounded-2xl border border-neutral-900 bg-neutral-950/50 p-6 leading-relaxed">
        <div className="text-neutral-600">// seller's side, final day</div>
        <div className="text-neutral-300">
          <span className="text-rose-400">revoke</span> all seller team keys
        </div>
        <div className="text-neutral-600 mt-3">// buyer's side, Monday</div>
        <div className="text-neutral-300">
          <span className="text-emerald-400">invite</span> buyer team by public key
        </div>
        <div className="text-neutral-300">
          <span className="text-emerald-400">rewrap</span> all ciphertexts
        </div>
        <div className="text-neutral-600 mt-3">// ciphertext never changes, keys do</div>
        <div className="text-neutral-300">
          <span className="text-sky-400">deploy</span> · credentials resolved
        </div>
      </div>
    </SectionShell>
  );
}

function A8CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Store the keys with the company,
          <br />
          not with the humans.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Create the vault</span>
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

export function VariantA8() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A8Hero />
      <A8StatusQuo />
      <A8Tension />
      <A8NewWorld />
      <A8Bridge />
      <A8Proof />
      <A8CTA />
    </div>
  );
}
