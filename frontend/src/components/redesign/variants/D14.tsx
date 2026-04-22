import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D14 — "The Arrivals"
 * Formula D · A timeline of who came, and in which month.
 * ──────────────────────────────────────────────────────────────────────────── */

function D14Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Arrivals.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          A log of who came, and when. Four months, four teams worth
          naming, and seventy-three worth of quiet company.
        </motion.p>
      </div>
    </section>
  );
}

type Arrival = {
  month: string;
  headline: string;
  note: string;
  cumulative: { users: number; projects: number; versions: string };
};

const D14_ARRIVALS: Arrival[] = [
  {
    month: "January",
    headline: "logdash comes on.",
    note:
      "Two engineers. A handful of staging secrets. The quietest of the four.",
    cumulative: { users: 14, projects: 9, versions: "102" },
  },
  {
    month: "February",
    headline: "signosh comes on.",
    note:
      "Jerzy signs in first, brings his cofounder the same afternoon, the team by the end of the week.",
    cumulative: { users: 32, projects: 28, versions: "318" },
  },
  {
    month: "March",
    headline: "bluemenu comes on.",
    note:
      "Dominik reads the repository for three days, then invites the engineers directly. They bring real production secrets with them.",
    cumulative: { users: 54, projects: 61, versions: "714" },
  },
  {
    month: "April",
    headline: "jobref comes on.",
    note:
      "The newest on the roster. Two people, one project, a shape we've seen many times before.",
    cumulative: { users: 77, projects: 89, versions: "1,086" },
  },
];

function D14Arrivals() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        {D14_ARRIVALS.map((a, i) => (
          <motion.div
            key={a.month}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.05 }}
            className="py-14 border-b border-neutral-900 last:border-b-0"
          >
            <div className="text-sm font-mono uppercase tracking-[0.3em] text-neutral-600">
              {a.month}
            </div>
            <h2 className="mt-4 text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
              {a.headline}
            </h2>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
              {a.note}
            </p>
            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-sm font-mono text-neutral-500">
              <span>
                users{" "}
                <span className="text-neutral-200 tabular-nums">
                  {a.cumulative.users}
                </span>
              </span>
              <span>
                projects{" "}
                <span className="text-neutral-200 tabular-nums">
                  {a.cumulative.projects}
                </span>
              </span>
              <span>
                versions{" "}
                <span className="text-neutral-200 tabular-nums">
                  {a.cumulative.versions}
                </span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D14Voice() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <blockquote className="text-xl md:text-2xl text-neutral-200 leading-[1.55] font-serif italic max-w-2xl">
          "We arrived on a Wednesday. By Friday, the team was inside,
          and I'd forgotten which week of february it was."
        </blockquote>
        <div className="mt-8 text-sm font-mono uppercase tracking-[0.25em] text-neutral-500">
          — Jerzy Wiśniewski
          <span className="text-neutral-700"> · </span>
          cofounder, signosh
        </div>
      </div>
    </SectionShell>
  );
}

function D14Reflection() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.15]"
        >
          Four months, seventy-seven arrivals. The other seventy-three
          came in a pattern we didn't need to plan for.
        </motion.h2>
        <p className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-xl">
          A longer month-by-month is on the{" "}
          <a
            href="/blog"
            className={cn(
              "underline underline-offset-[6px] decoration-neutral-700 hover:decoration-neutral-400"
            )}
          >
            blog
          </a>
          .
        </p>
      </div>
    </SectionShell>
  );
}

function D14CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Arrive.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Begin</span>
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

export function VariantD14() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D14Hero />
      <D14Arrivals />
      <D14Voice />
      <D14Reflection />
      <D14CTA />
    </div>
  );
}
