import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A11 — "The Formatted Disk"
 * Formula A · You reformatted the laptop. The .env was not in git.
 * ──────────────────────────────────────────────────────────────────────────── */

function A11Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight"
        >
          You erased the laptop on Sunday.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          The .env was not in the repo.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-2xl"
        >
          Fresh install, clean coffee, Monday morning. The repo clones.
          The app won't start.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-14 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Keep your secrets off the disk</span>
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

const A11_LOST = [
  { f: ".env", n: "DATABASE_URL, SESSION_SECRET, JWT_SIGNER" },
  { f: ".env.local", n: "STRIPE_SK, SEGMENT_WRITE_KEY" },
  { f: "~/.aws/credentials", n: "two profiles, both in use" },
  { f: "~/.ssh/deploy_key", n: "the one the runner uses" },
  { f: "~/Desktop/notes.txt", n: "mystery content, probably a token" },
];

function A11StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Unrecoverable, by choice.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          You deliberately did not commit these files, because they were
          secrets. You deliberately wiped the disk, because you were
          selling the laptop. Both decisions were correct.
        </p>
      </div>

      <div className="mt-14 max-w-3xl font-mono text-sm rounded-2xl border border-neutral-900 bg-neutral-950/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-900 text-xs text-neutral-500 uppercase tracking-[0.25em]">
          overwritten by the erase
        </div>
        <div className="divide-y divide-neutral-900">
          {A11_LOST.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="grid grid-cols-[260px_1fr] gap-4 items-start px-5 py-3"
            >
              <span className="text-neutral-200">{l.f}</span>
              <span className="text-neutral-500 line-through decoration-neutral-600">
                {l.n}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function A11Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The disk is not the right place for a secret.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          Disks get wiped, stolen, formatted, dropped, replaced. When the
          secret is a local file, every one of those events is a small
          outage. The canonical copy should live somewhere you can reach
          from any laptop that's yours — yours by passphrase, not by
          serial number.
        </p>
      </div>
    </SectionShell>
  );
}

function A11NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The .env moves off the disk, not out of reach.
        </h2>
      </div>

      <div className="mt-12 max-w-3xl space-y-6">
        {[
          {
            t: "Secrets live in a project vault.",
            b: "Still yours. Still encrypted in the browser. Accessible from any laptop that knows your passphrase.",
          },
          {
            t: "The disk holds no plaintext.",
            b: "You can erase and reformat freely. The secrets were never there to lose.",
          },
          {
            t: "Teammates aren't a dependency.",
            b: "You don't need to DM anyone to get back in. Your own passphrase decrypts your copy.",
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

function A11Testimonial() {
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
          "I reinstalled my OS twice last quarter. The first time I lost
          an afternoon. The second time I opened a tab and carried on."
        </motion.blockquote>
        <div className="mt-8 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — Jerzy Wiśniewski · cofounder, signosh
        </div>
      </div>
    </SectionShell>
  );
}

function A11Trusted() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          Used by
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
      </div>
    </SectionShell>
  );
}

function A11Numbers() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Where we are.
        </h2>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: "30", l: "stars" },
            { n: "77", l: "users" },
            { n: "89", l: "projects" },
            { n: "1,086", l: "versions" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-4xl md:text-5xl font-semibold text-neutral-100 tabular-nums">
                {s.n}
              </div>
              <div className="mt-2 text-sm text-neutral-500 uppercase tracking-[0.15em]">
                {s.l}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-xl">
          None of them rode out a drive wipe on someone's machine. More on
          how that's arranged on the{" "}
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

function A11CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Format the laptop. Keep the keys.
        </h2>
        <div className="mt-4 text-neutral-500">
          More context on the{" "}
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

export function VariantA11() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A11Hero />
      <A11StatusQuo />
      <A11Tension />
      <A11NewWorld />
      <A11Testimonial />
      <A11Trusted />
      <A11Numbers />
      <A11CTA />
    </div>
  );
}
