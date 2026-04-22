import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, HardDrive } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A2 — "The Laptop That Died"
 * Formula A · A receipt from the Apple Store, listing what's gone with it.
 * ──────────────────────────────────────────────────────────────────────────── */

function A2Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(244,114,182,0.05),transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500 mb-6">
            An essay in one ticket.
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight">
            Your DATABASE_URL lived on one MacBook.
          </h1>
          <h1 className="mt-2 text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-500 leading-[1.02] tracking-tight">
            It's at the Apple Store now.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl"
        >
          The logic board failed. The disk is encrypted, of course. Nobody
          can read it. Including you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Stop doing this</span>
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

const A2_LOST = [
  { k: "DATABASE_URL", loc: ".env · ~/work/api", status: "unrecoverable" },
  { k: "STRIPE_SECRET_KEY", loc: ".env.production", status: "unrecoverable" },
  { k: "JWT_SIGNING_KEY", loc: ".env.local", status: "unrecoverable" },
  { k: "SENTRY_DSN", loc: "macOS Keychain", status: "unrecoverable" },
  { k: "DEPLOY_TOKEN_PROD", loc: "1Password local vault", status: "unrecoverable" },
  { k: "FIREBASE_ADMIN_KEY", loc: "~/Downloads/firebase.json", status: "unrecoverable" },
  { k: "OPENAI_API_KEY", loc: "iCloud Notes (local copy)", status: "unrecoverable" },
];

function A2Receipt() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The inventory of what the disk took with it.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
          These are the things that existed, in some form, only on that
          machine. The list takes about four minutes to write. Most of a
          weekend to replace.
        </p>
      </div>

      <div className="mt-14 max-w-3xl rounded-2xl border border-neutral-900 bg-neutral-950/50 overflow-hidden font-mono text-sm">
        <div className="px-5 py-3 border-b border-neutral-900 flex items-center gap-3 text-xs text-neutral-500">
          <HardDrive className="h-3.5 w-3.5" />
          <span>disk0 — irrecoverable</span>
          <span className="ml-auto">MacBook Pro · 2021</span>
        </div>
        {A2_LOST.map((row, i) => (
          <motion.div
            key={row.k}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "grid grid-cols-[1.2fr_1.4fr_0.8fr] gap-4 px-5 py-3 items-center",
              i !== A2_LOST.length - 1 && "border-b border-neutral-900"
            )}
          >
            <span className="text-neutral-200 line-through decoration-rose-400/60">
              {row.k}
            </span>
            <span className="text-neutral-500 truncate">{row.loc}</span>
            <span className="text-rose-300/80 text-xs uppercase tracking-[0.2em]">
              {row.status}
            </span>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A2Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The problem isn't the disk.
          <br />
          It's that the disk was authoritative.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          No vault, no team-wide record, no place a teammate could look
          first. Just one disk that held the real values, and a handful of{" "}
          <em>I'll write it down later</em> across the company.
        </p>
      </div>
    </SectionShell>
  );
}

function A2NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Three claims. The rest of the page is a proof sketch.
        </h2>
      </div>

      <div className="mt-14 max-w-3xl space-y-10">
        {[
          {
            t: "The vault survives the machine.",
            b: "Because the ciphertext lives on our servers, not on your disk. Your disk holds the passphrase, in memory, while the tab is open.",
          },
          {
            t: "The passphrase survives a shared team.",
            b: "Because each teammate derives their own key locally, and keeps a wrapped copy. If yours is gone, theirs still opens the vault.",
          },
          {
            t: "Neither survives the last teammate forgetting.",
            b: "We don't lie about this. If everyone with a key forgets, the vault stays sealed. That's the zero-knowledge bargain.",
          },
        ].map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="text-xl md:text-2xl text-neutral-100 leading-snug">
              — {c.t}
            </div>
            <p className="mt-2 text-neutral-500 leading-relaxed max-w-2xl ml-4">
              {c.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A2Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          Cryptly is that vault.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          Small. Open source. Free. Your secrets don't live on a laptop
          because they don't have to.
        </p>
      </div>
    </SectionShell>
  );
}

function A2Proof() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The same list, six months later.
        </h2>
      </div>
      <div className="mt-12 max-w-3xl rounded-2xl border border-neutral-900 bg-neutral-950/50 overflow-hidden font-mono text-sm">
        <div className="px-5 py-3 border-b border-neutral-900 flex items-center gap-3 text-xs text-neutral-500">
          <HardDrive className="h-3.5 w-3.5" />
          <span>cryptly · project: api-prod</span>
          <span className="ml-auto">readable by: 4 people, 4 browsers</span>
        </div>
        {A2_LOST.map((row, i) => (
          <div
            key={row.k}
            className={cn(
              "grid grid-cols-[1.2fr_1.4fr_0.8fr] gap-4 px-5 py-3 items-center",
              i !== A2_LOST.length - 1 && "border-b border-neutral-900"
            )}
          >
            <span className="text-neutral-100">{row.k}</span>
            <span className="text-neutral-500 truncate">
              wrapped · 4 keys
            </span>
            <span className="text-emerald-300/80 text-xs uppercase tracking-[0.2em]">
              retrievable
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function A2CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Not every laptop makes it to 2027.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-xl">
          The vault should. It's free, it's open, it takes a couple minutes
          to set up.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Move the secrets</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Read the code</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantA2() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A2Hero />
      <A2Receipt />
      <A2Tension />
      <A2NewWorld />
      <A2Bridge />
      <A2Proof />
      <A2CTA />
    </div>
  );
}
