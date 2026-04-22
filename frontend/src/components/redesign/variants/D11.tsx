import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D11 — "A Team of Four"
 * Formula D · Four dossiers, one per company, quietly.
 * ──────────────────────────────────────────────────────────────────────────── */

function D11Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          Four of seventy-seven.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          A short file on each of the four teams we keep naming. The
          other seventy-three prefer we don't.
        </motion.p>
      </div>
    </section>
  );
}

type Dossier = {
  name: string;
  role: string;
  joined: string;
  note: string;
  quote?: { body: string; by: string };
};

const D11_DOSSIERS: Dossier[] = [
  {
    name: "logdash",
    role: "observability for small teams",
    joined: "one of the first three on the vault",
    note:
      "A handful of production projects. One of the quieter members — we hear from them when something is wrong, which is rare.",
  },
  {
    name: "signosh",
    role: "document signing",
    joined: "february",
    note:
      "Jerzy brought his cofounder and two early hires inside the first week. They keep roughly twenty secrets across four projects.",
    quote: {
      body:
        "Our whole team moved to Cryptly over a long lunch. I haven't thought about it since.",
      by: "Jerzy Wiśniewski · cofounder, signosh",
    },
  },
  {
    name: "bluemenu",
    role: "restaurant menus, done properly",
    joined: "march",
    note:
      "Dominik read the repo before creating an account. After three days he invited his cofounder, and then the engineers.",
    quote: {
      body:
        "The code review was the sales pitch. Everything after that was just typing.",
      by: "Dominik Mackiewicz · cofounder, bluemenu",
    },
  },
  {
    name: "jobref",
    role: "references, checked",
    joined: "april",
    note:
      "The newest name on the list. Two people, one project. The median shape of a team that joins us.",
  },
];

function D11Dossiers() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-20">
        {D11_DOSSIERS.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.05 }}
          >
            <div className="flex items-baseline gap-5 flex-wrap">
              <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
                {d.name}
              </h2>
              <span className="text-sm font-mono uppercase tracking-[0.25em] text-neutral-600">
                joined · {d.joined}
              </span>
            </div>
            <div className="mt-3 text-neutral-500 font-serif italic">
              {d.role}
            </div>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
              {d.note}
            </p>
            {d.quote && (
              <div className="mt-10 pl-6 border-l border-neutral-900">
                <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic max-w-xl">
                  "{d.quote.body}"
                </blockquote>
                <div className="mt-4 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
                  — {d.quote.by}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function D11Ledger() {
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
          Between the four of them, they hold roughly a tenth of our
          eighty-nine projects, and a good share of the 1,086 wrapped
          versions.
        </motion.h2>
        <p className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-xl">
          We've written about each of them, at different lengths, on the{" "}
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

function D11CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Open a file of your own.
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

export function VariantD11() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D11Hero />
      <D11Dossiers />
      <D11Ledger />
      <D11CTA />
    </div>
  );
}
