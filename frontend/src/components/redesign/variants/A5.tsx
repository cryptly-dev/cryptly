import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, FolderArchive } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A5 — "The Notion Graveyard"
 * Formula A · Secrets that got buried under restructures.
 * ──────────────────────────────────────────────────────────────────────────── */

function A5Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight"
        >
          STRIPE_KEY was in a Notion page{" "}
          <span className="text-neutral-500">
            that got archived two restructures ago.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl"
        >
          You know what the key looks like: it begins with{" "}
          <code className="text-neutral-200 bg-neutral-900 px-2 py-0.5 rounded text-sm">
            sk_live_
          </code>
          . You know the rough time it was written down. You don't know
          which of the three team workspaces it landed in.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-14 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Somewhere obvious, instead</span>
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

const A5_TRAIL = [
  { t: "Infra", muted: false },
  { t: "Onboarding", muted: false },
  { t: "New Hire / Keys (2022)", muted: true, strike: false },
  { t: "Secrets (temp — move later)", muted: true, strike: false },
  { t: "Archived (Q3 restructure)", muted: true, strike: true },
  { t: "Archived (final cleanup)", muted: true, strike: true },
  { t: "???", muted: true, strike: true },
];

function A5StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The breadcrumb trail that dead-ends.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
          If you remember enough, you can follow it. Most of the time, you
          remember not-enough.
        </p>
      </div>

      <div className="mt-14 max-w-3xl rounded-2xl border border-neutral-900 bg-neutral-950/50 p-6 font-mono text-sm">
        <div className="flex items-center gap-2 text-neutral-600 text-xs mb-4">
          <FolderArchive className="h-4 w-4" />
          <span>workspace · infra</span>
        </div>
        <ol className="space-y-1.5">
          {A5_TRAIL.map((t, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3"
              style={{ paddingLeft: `${i * 20}px` }}
            >
              <span className="text-neutral-700">›</span>
              <span
                className={cn(
                  "text-sm",
                  t.muted ? "text-neutral-500" : "text-neutral-200",
                  t.strike && "line-through decoration-neutral-600"
                )}
              >
                {t.t}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>

      <p className="mt-10 text-sm text-neutral-500 italic max-w-2xl">
        The last breadcrumb is not a breadcrumb. It's you standing in the
        forest.
      </p>
    </SectionShell>
  );
}

function A5Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Documentation is not storage.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          The page you wrote was about <em>where to find the key</em>. The
          key itself, the live value, needed to live somewhere too. It's
          the second part most teams skip, and then discover they skipped.
        </p>
      </div>
    </SectionShell>
  );
}

function A5NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          One home. Not a pointer to a pointer to a pointer.
        </h2>
      </div>

      <div className="mt-12 max-w-3xl space-y-6">
        {[
          {
            t: "Secrets go in a vault. That's it.",
            b: "Not a doc about the vault. Not a screenshot of the vault. The vault.",
          },
          {
            t: "The vault is addressable and stable.",
            b: "One URL, one project, one list. It doesn't move when the team reorganizes.",
          },
          {
            t: "Your team, not your documentation, holds the keys.",
            b: "A wrapped key per teammate. No central 'admin of the doc.' No restructure archives this.",
          },
        ].map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
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

function A5Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          Cryptly is the home.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          A small, open-source vault. No workspace. No archives. One list
          per project, and it stays where you left it.
        </p>
      </div>
    </SectionShell>
  );
}

function A5Proof() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Here's what "where did I put it" looks like now.
        </h2>
      </div>
      <div className="mt-10 max-w-3xl font-mono text-sm rounded-2xl border border-neutral-900 bg-neutral-950/50 p-6 leading-relaxed">
        <div className="text-neutral-600">$ cryptly ls</div>
        <div className="grid grid-cols-[200px_1fr] gap-2 mt-2">
          <span className="text-neutral-200">STRIPE_SECRET_KEY</span>
          <span className="text-neutral-500">
            project://payments · updated 14 days ago
          </span>
          <span className="text-neutral-200">STRIPE_PUBLISHABLE_KEY</span>
          <span className="text-neutral-500">
            project://payments · updated 14 days ago
          </span>
          <span className="text-neutral-200">STRIPE_WEBHOOK_SIGNING_KEY</span>
          <span className="text-neutral-500">
            project://payments · updated 14 days ago
          </span>
        </div>
        <div className="text-neutral-600 mt-4">$ # one place. done.</div>
      </div>
    </SectionShell>
  );
}

function A5CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Stop playing breadcrumb-archaeology.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Put the values somewhere</span>
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

export function VariantA5() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A5Hero />
      <A5StatusQuo />
      <A5Tension />
      <A5NewWorld />
      <A5Bridge />
      <A5Proof />
      <A5CTA />
    </div>
  );
}
