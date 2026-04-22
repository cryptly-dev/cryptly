import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, Trash2 } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A12 — "The Deleted Project"
 * Formula A · You cleaned up ~/Projects. One of the folders wasn't old.
 * ──────────────────────────────────────────────────────────────────────────── */

function A12Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-10 inline-flex items-center gap-3 font-mono text-sm text-neutral-400 bg-neutral-950/60 border border-neutral-900 rounded-lg px-4 py-3"
        >
          <Trash2 className="h-4 w-4 text-neutral-500" />
          <span className="text-neutral-300">
            $ rm -rf ~/Projects/old-stuff
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight"
        >
          You deleted a folder called old-stuff.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          It wasn't as old as you thought.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Put secrets somewhere you can't rm</span>
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

function A12StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          A folder layout, timestamped.
        </h2>
      </div>
      <div className="mt-12 max-w-3xl font-mono text-sm rounded-2xl border border-neutral-900 bg-neutral-950/50 p-6 leading-relaxed">
        <div className="text-neutral-600">~/Projects/</div>
        <div className="ml-4 mt-1 text-neutral-400">old-stuff/</div>
        <div className="ml-8 text-neutral-500">
          draft-landing/ <span className="text-neutral-700">· last touched may</span>
        </div>
        <div className="ml-8 text-neutral-500">
          experiment-sketch/ <span className="text-neutral-700">· last touched april</span>
        </div>
        <div className="ml-8 text-neutral-500">
          prototype-auth/ <span className="text-neutral-700">· last touched march</span>
        </div>
        <div className="ml-8 text-rose-300/80">
          side-project/{" "}
          <span className="text-neutral-600">· last touched yesterday</span>
        </div>
        <div className="ml-12 text-rose-300/60">
          .env{" "}
          <span className="text-neutral-600">
            · not in git, not anywhere else
          </span>
        </div>
      </div>
      <p className="mt-10 max-w-2xl text-lg text-neutral-400 leading-relaxed">
        A housekeeping moment. A rogue path. Three months of side-project
        secrets, gone with the rest.
      </p>
    </SectionShell>
  );
}

function A12Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          A delete shouldn't be a disaster.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          The design of a secrets setup should make the cleanup of a
          folder a routine act. If a stray <span className="font-mono text-neutral-300">rm -rf</span> can
          turn into a week of explaining to your team what happened, the
          secrets were in the wrong place.
        </p>
      </div>
    </SectionShell>
  );
}

function A12NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Secrets outlive the folder.
        </h2>
      </div>
      <div className="mt-12 max-w-3xl space-y-6">
        {[
          {
            t: "The vault is addressed, not located.",
            b: "A project URL, not a folder path. Delete the folder, clone it fresh — your secrets are still where they were.",
          },
          {
            t: "The browser is the recipient.",
            b: "Your device decrypts on read. No .env file needs to sit on the disk between uses.",
          },
          {
            t: "Mistakes stay small.",
            b: "A deleted project folder is now a five-minute re-clone, not a catastrophe.",
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

function A12Numbers() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Where we are.
        </h2>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl">
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
        <p className="mt-10 text-neutral-400 text-lg leading-relaxed max-w-xl">
          None of those versions were lost when someone's laptop got a
          little too tidy over the weekend. More on our approach on the{" "}
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

function A12CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Clean the folder. Keep the keys.
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

export function VariantA12() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A12Hero />
      <A12StatusQuo />
      <A12Tension />
      <A12NewWorld />
      <A12Numbers />
      <A12CTA />
    </div>
  );
}
