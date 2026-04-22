import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import { ArrowRight, Plane } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A4 — "One Person's Head"
 * Formula A · The bus-factor-of-one pitch. Secrets living in a single skull.
 * ──────────────────────────────────────────────────────────────────────────── */

function A4Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center bg-black">
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight"
        >
          The deploy key{" "}
          <span className="text-neutral-500">
            lives in one person's head.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-xl md:text-2xl text-neutral-400 leading-relaxed"
        >
          That person is currently in Patagonia.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-base md:text-lg text-neutral-500 leading-relaxed max-w-xl"
        >
          The satellite phone in their lodge has two bars. You have a
          rollout scheduled for 4pm today. You are currently composing a
          very polite message.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-14 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Solve this forever</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Cryptly on GitHub</span>
          </GhostCTA>
        </motion.div>
      </div>
    </section>
  );
}

const A4_ONLY_THEY_KNOW = [
  "the production database password",
  "the AWS root account recovery phrase",
  "the SSH key for the bastion",
  "the Cloudflare API token with DNS write",
  "the Stripe restricted-key for refunds",
  "the Sentry org-admin OTP recovery codes",
  "the shape of the deploy script's error at line 412",
  "the reason we set timeout to 46 seconds, specifically",
];

function A4StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Things that live{" "}
          <span className="text-neutral-500">only in their head:</span>
        </h2>
      </div>

      <div className="mt-10 max-w-3xl">
        <ul className="space-y-2">
          {A4_ONLY_THEY_KNOW.map((t, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-baseline gap-4 py-2 border-b border-neutral-900/80 last:border-b-0"
            >
              <span className="font-mono text-xs text-neutral-700 w-8 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-lg text-neutral-200 leading-relaxed">
                {t}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="mt-12 flex items-center gap-3 text-sm text-neutral-500 max-w-3xl">
        <Plane className="h-4 w-4 -rotate-12" />
        <span>
          Currently between El Calafate and Torres del Paine.
        </span>
      </div>
    </SectionShell>
  );
}

function A4Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          This isn't a people problem.
          <br />
          It's a storage problem.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          The fix isn't better documentation. It isn't a stricter
          offboarding checklist. It isn't a Notion page that becomes
          immediately out of date.
        </p>
        <p className="mt-4 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          The fix is a place for those values to live that isn't anyone's
          skull.
        </p>
      </div>
    </SectionShell>
  );
}

function A4NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Three shapes, one shared vault.
        </h2>
      </div>

      <div className="mt-14 max-w-3xl space-y-10">
        {[
          {
            n: "i",
            t: "Everyone has a key.",
            b: "Every teammate derives their own key from a passphrase. The key stays in their browser.",
          },
          {
            n: "ii",
            t: "Nobody has the key alone.",
            b: "Each value is wrapped against every teammate's public key. A new teammate joins: we rewrap. Someone leaves: we revoke.",
          },
          {
            n: "iii",
            t: "Cryptly has no key at all.",
            b: "We store ciphertext. The passphrase never leaves the browser that typed it. We cannot decrypt, and neither can a court.",
          },
        ].map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="grid grid-cols-[40px_1fr] gap-6"
          >
            <div className="text-sm font-mono text-neutral-600 uppercase pt-1">
              {c.n}
            </div>
            <div>
              <div className="text-xl md:text-2xl text-neutral-100 leading-snug">
                {c.t}
              </div>
              <p className="mt-2 text-neutral-400 leading-relaxed">{c.b}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A4Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          We put this in a product and called it Cryptly.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          It's small. It's free. Your team's bus factor doesn't have to be
          one anymore.
        </p>
      </div>
    </SectionShell>
  );
}

function A4Proof() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The same list, with cryptly:
        </h2>
      </div>

      <div className="mt-10 max-w-3xl">
        <ul className="space-y-2">
          {A4_ONLY_THEY_KNOW.slice(0, 6).map((t, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-baseline gap-4 py-2 border-b border-neutral-900/80 last:border-b-0"
            >
              <span className="font-mono text-xs text-emerald-400/80 w-8 shrink-0">
                ✓
              </span>
              <span className="text-lg text-neutral-200 leading-relaxed">
                {t}
              </span>
              <span className="ml-auto text-xs text-neutral-500 tracking-wider">
                wrapped · 4 keys
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}

function A4CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Your best engineer is allowed to go to Patagonia.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-xl">
          The secrets should stay where you can reach them without the
          satellite phone.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Begin</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Audit the code</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantA4() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A4Hero />
      <A4StatusQuo />
      <A4Tension />
      <A4NewWorld />
      <A4Bridge />
      <A4Proof />
      <A4CTA />
    </div>
  );
}
