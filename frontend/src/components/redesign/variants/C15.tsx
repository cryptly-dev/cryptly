import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT C15 — "Exhibits"
 * Formula C · Five exhibits, submitted in support.
 * ──────────────────────────────────────────────────────────────────────────── */

function C15Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-10"
        >
          Submitted in support
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
        >
          Five exhibits.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Entered in support of a single claim: we cannot read your
          secrets, and we would rather not be able to.
        </motion.p>
      </div>
    </section>
  );
}

type Exhibit = {
  mark: string;
  title: string;
  body: string;
  kind: "source" | "statement" | "record" | "roster" | "correspondence";
  extra?: React.ReactNode;
};

const C15_EXHIBITS: Exhibit[] = [
  {
    mark: "A",
    kind: "source",
    title: "The source.",
    body:
      "The repository at github.com/cryptly-dev/cryptly. Readable in any browser. The thirty people who have read it so far are listed there.",
  },
  {
    mark: "B",
    kind: "record",
    title: "The ledger.",
    body:
      "Seventy-seven persons. Eighty-nine projects. One thousand and eighty-six wrapped versions. The server has held each of these as ciphertext since the moment it received them.",
  },
  {
    mark: "C",
    kind: "roster",
    title: "The roster.",
    body:
      "A partial list of teams currently operating a project on the vault.",
    extra: (
      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-neutral-300 text-lg md:text-xl font-semibold tracking-tight">
        <span>logdash</span>
        <span className="text-neutral-700">·</span>
        <span>signosh</span>
        <span className="text-neutral-700">·</span>
        <span>bluemenu</span>
        <span className="text-neutral-700">·</span>
        <span>jobref</span>
      </div>
    ),
  },
  {
    mark: "D",
    kind: "statement",
    title: "A statement.",
    body:
      "Given voluntarily, by one of the team leads on the roster.",
    extra: (
      <div className="mt-8">
        <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic max-w-2xl">
          "I've never had to wonder whether the provider is a party to
          my security posture. They simply aren't."
        </blockquote>
        <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
          — Dominik Mackiewicz · cofounder, bluemenu
        </div>
      </div>
    ),
  },
  {
    mark: "E",
    kind: "correspondence",
    title: "Correspondence, long form.",
    body:
      "A running record of what we've written about this design. The full file is on the blog.",
    extra: (
      <div className="mt-6">
        <a
          href="/blog"
          className={cn(
            "text-lg text-neutral-200 underline underline-offset-[6px] decoration-neutral-700 hover:decoration-neutral-400"
          )}
        >
          read the correspondence →
        </a>
      </div>
    ),
  },
];

function C15Exhibits() {
  return (
    <SectionShell>
      <div className="max-w-3xl space-y-20">
        {C15_EXHIBITS.map((e, i) => (
          <motion.div
            key={e.mark}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
          >
            <div className="flex items-baseline gap-5">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500">
                Exhibit {e.mark}
              </span>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-700">
                {e.kind}
              </span>
            </div>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight font-serif">
              {e.title}
            </h2>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-2xl">
              {e.body}
            </p>
            {e.extra}
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function C15Closing() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.15] font-serif"
        >
          The exhibits speak for themselves, which is the most we have
          ever asked of them.
        </motion.h2>
      </div>
    </SectionShell>
  );
}

function C15CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Be Exhibit F.
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

export function VariantC15() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <C15Hero />
      <C15Exhibits />
      <C15Closing />
      <C15CTA />
    </div>
  );
}
