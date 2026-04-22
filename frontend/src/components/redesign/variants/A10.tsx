import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A10 — "The Entry From 2022"
 * Formula A · The README says 'ask James.' James left in 2023.
 * ──────────────────────────────────────────────────────────────────────────── */

function A10Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 font-mono text-sm text-neutral-500 bg-neutral-950/60 border border-neutral-900 rounded-lg px-4 py-3 max-w-2xl"
        >
          <span className="text-neutral-700"># README.md, line 412</span>
          <br />
          <span className="text-neutral-300">
            {"> "}Staging DB credentials: ask James.
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight"
        >
          You need to redeploy a 2022 service.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-4 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          James left in 2023.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Replace 'ask James' with a vault</span>
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

const A10_LINES = [
  { t: "# 2022-03-12 — onboarding.md", muted: true },
  { t: "> Ask James for the staging password.", muted: false },
  { t: "", muted: true },
  { t: "# 2022-07-04 — infra.md", muted: true },
  { t: "> James has the deploy key.", muted: false },
  { t: "", muted: true },
  { t: "# 2022-11-19 — runbook.md", muted: true },
  { t: "> In case of outage: page James.", muted: false },
  { t: "", muted: true },
  { t: "# 2023-10-02 — people.md", muted: true },
  { t: "> James has left the company. (TODO: update runbooks)", muted: false, alert: true },
  { t: "", muted: true },
  { t: "# 2026-04-22 — TODO still TODO", muted: true, alert: true },
];

function A10StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          A grep through the docs, in chronological order.
        </h2>
      </div>

      <div className="mt-12 max-w-3xl font-mono text-sm rounded-2xl border border-neutral-900 bg-neutral-950/50 p-6 leading-relaxed">
        {A10_LINES.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              "min-h-[1.5rem]",
              l.muted ? "text-neutral-600" : "text-neutral-200",
              l.alert && "text-rose-300/90"
            )}
          >
            {l.t || " "}
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A10Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Docs point to people. People move on.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          The README gave you an address: <em>ask James</em>. The address
          was accurate for eighteen months, then wrong. It has been wrong
          for two and a half years and you are the first person to notice.
        </p>
      </div>
    </SectionShell>
  );
}

function A10NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Replace the name with a URL.
        </h2>
      </div>

      <div className="mt-12 max-w-3xl space-y-6">
        {[
          {
            t: "The runbook stops saying 'ask James.'",
            b: "It starts saying 'cryptly.sh/projects/legacy-2022'. Stable, versioned, still there after James.",
          },
          {
            t: "The secret is wrapped for whoever is on the project.",
            b: "Membership is current. James rolls off, the vault stays, the next maintainer rolls on.",
          },
          {
            t: "The README can be boring.",
            b: "Because the interesting information — the live values — lives somewhere it's actually allowed to live.",
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

function A10Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          Cryptly is that URL.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          A small, open-source vault. One project, one stable address,
          one list of members. The runbook stops naming people.
        </p>
      </div>
    </SectionShell>
  );
}

function A10Proof() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          A week from now, the README reads:
        </h2>
      </div>

      <div className="mt-10 max-w-3xl font-mono text-sm rounded-2xl border border-neutral-900 bg-neutral-950/50 p-6 leading-relaxed">
        <div className="text-neutral-600">
          # 2026-04-22 — onboarding.md
        </div>
        <div className="text-neutral-200">
          {"> "}
          Staging DB credentials:{" "}
          <span className="text-sky-300">cryptly.sh/projects/legacy-2022</span>
        </div>
        <div className="text-neutral-200">
          {"> "}
          Ask anyone on the project.
        </div>
        <div className="text-neutral-600 mt-4"># unchanged in 2028. still true.</div>
      </div>
    </SectionShell>
  );
}

function A10CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Names change. Vaults don't have to.
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

export function VariantA10() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A10Hero />
      <A10StatusQuo />
      <A10Tension />
      <A10NewWorld />
      <A10Bridge />
      <A10Proof />
      <A10CTA />
    </div>
  );
}
