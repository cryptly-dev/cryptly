import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { motion } from "motion/react";
import {
  ArrowRight,
  Clock3,
  Code2,
  GitBranch,
  MessageSquare,
  Minus,
  Moon,
  Package,
  Plus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { fakeCiphertext, GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A5 — "Quiet Refactor"
 * Formula A · Narrative from the dev's-day perspective.
 * Angle: Tiny moments of friction. Compound cost. Refactor the system.
 * ──────────────────────────────────────────────────────────────────────────── */

function A5Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.05),transparent_50%)]" />
      <div className="relative z-10 mx-auto max-w-5xl w-full px-6 py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-medium uppercase tracking-[0.22em] bg-neutral-900/60 text-neutral-300 border-neutral-800">
            <Clock3 className="h-3 w-3" />
            this week's diary
          </div>
          <h1 className="mt-7 text-5xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight">
            How many Slack DMs this week ended with a .env?
          </h1>
          <p className="mt-7 text-lg text-neutral-400 leading-relaxed max-w-2xl">
            It's fine. Nobody is judging. But count them. Then multiply by the
            weeks in a year. That's the problem we're trying to name.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <PrimaryCTA href="/app/login">
              <span>Refactor it</span>
              <ArrowRight className="h-4 w-4" />
            </PrimaryCTA>
            <GhostCTA href="#moments">
              <span>See the math</span>
            </GhostCTA>
          </div>
        </div>
      </div>
    </section>
  );
}

const A5_MOMENTS = [
  {
    Icon: MessageSquare,
    when: "Monday, 10:14am",
    title: "'Hey can you send me the .env?'",
    cost: "3 minutes",
    body: "It's the new hire. Half a minute to Slack it. Two-and-a-half to figure out which file was actually current.",
  },
  {
    Icon: GitBranch,
    when: "Tuesday, 11:47am",
    title: "Rotating the Stripe key.",
    cost: "48 minutes",
    body: "Change the key. Update three repos' GitHub Actions. Update two Vercel envs. Ping the team. Someone's deploy breaks.",
  },
  {
    Icon: Users,
    when: "Wednesday, 2:03pm",
    title: "Engineer's last day.",
    cost: "~3 hours",
    body: "Block their GitHub, their Slack, their Notion. Trawl the shared 1Password. Hope the .env on their laptop stays on their laptop.",
  },
  {
    Icon: Package,
    when: "Thursday, 4:22pm",
    title: "New project, same story.",
    cost: "27 minutes",
    body: "Copy env from an old repo. Sanitize it (badly). Paste into a new Notion page. Invite four people. Half of them bounce.",
  },
  {
    Icon: Moon,
    when: "Friday, 11:58pm",
    title: "Prod's down. Which key is valid?",
    cost: "unbounded",
    body: "There are two Stripe keys in Slack. One is rotated. The pinned message hasn't been updated since March.",
  },
];

function A5MicroMoments() {
  return (
    <div id="moments">
      <SectionShell>
        <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
          <span className="text-neutral-600 tabular-nums">01 · STATUS QUO</span>
          <span className="h-px flex-1 bg-neutral-900" />
        </div>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            This is one week on a small engineering team.
          </h2>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="relative pl-10">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-neutral-900" />
            {A5_MOMENTS.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="relative mb-8 last:mb-0"
              >
                <div className="absolute left-[-26px] top-1 h-4 w-4 rounded-full border-2 border-neutral-700 bg-black" />
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                  {m.when}
                </div>
                <div className="mt-1 text-xl font-semibold text-neutral-100">
                  {m.title}
                </div>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed max-w-lg">
                  {m.body}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-400">
                  <Clock3 className="h-3 w-3" />
                  {m.cost}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionShell>
    </div>
  );
}

function A5Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">02 · TENSION</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          None of those moments is a big deal. That's the problem.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
          They're compounding interest, not a crisis. Death by paper-cut, in
          weekly installments. Nobody files a ticket because nobody notices.
          Then there's a breach post-mortem and everyone's surprised.
        </p>

        <div className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:p-8">
          <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
            Back of the envelope
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-semibold text-neutral-100 tabular-nums">
                ~5 hrs/wk
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                per engineer on secrets hygiene
              </div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-neutral-100 tabular-nums">
                ~250 hrs/yr
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                per engineer
              </div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-neutral-100 tabular-nums">
                ~6 weeks
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                of engineering time, gone quietly
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function A5NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">03 · NEW WORLD</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          The same week, refactored.
        </h2>
      </div>

      <div className="mt-14 max-w-3xl mx-auto space-y-3">
        {[
          {
            when: "Mon",
            was: "'Hey can you send me the .env?'",
            now: "New hire clicks the invite link. Vault decrypts. 30 seconds.",
          },
          {
            when: "Tue",
            was: "Rotate Stripe. Chase 5 deploy surfaces.",
            now: "Rotate in Cryptly. GitHub Actions re-syncs automatically. No DM.",
          },
          {
            when: "Wed",
            was: "Revoke access across 6 systems.",
            now: "Remove member. Vault is re-wrapped for everyone else.",
          },
          {
            when: "Thu",
            was: "Start a new repo. Clone the .env.",
            now: "New project. Paste. Done. Auditable from minute one.",
          },
          {
            when: "Fri",
            was: "Which key is valid?",
            now: "One source of truth. Diff history shows who changed what.",
          },
        ].map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-5 grid grid-cols-[48px_1fr_1fr] gap-4 items-start"
          >
            <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 font-mono">
              {r.when}
            </div>
            <div className="text-sm text-neutral-500 line-through">
              {r.was}
            </div>
            <div className="text-sm text-neutral-200">{r.now}</div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A5Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">04 · BRIDGE</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Cryptly is the refactor.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
          The point isn't features. It's removing the moments of friction above.
          Everything else is scaffolding.
        </p>
      </div>

      <div className="mt-14 max-w-3xl mx-auto grid md:grid-cols-2 gap-3">
        {[
          "Invite links with one-time passphrases",
          "Re-wrapped keys per member",
          "GitHub Actions sync in one click",
          "Signed diff history for every change",
          "Revoke access without a meeting",
          "Free. Open source. Self-hostable.",
        ].map((b, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-900 bg-neutral-950/60 p-4 flex items-center gap-3"
          >
            <div className="h-7 w-7 rounded-md bg-neutral-900 border border-neutral-800 grid place-items-center text-neutral-400">
              <Code2 className="h-3.5 w-3.5" />
            </div>
            <div className="text-sm text-neutral-300">{b}</div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function A5Proof() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const dump = useMemo(() => fakeCiphertext("a5-proof", 900), []);
  const faqs: { q: string; a: React.ReactNode }[] = [
    {
      q: "Does it really integrate with GitHub Actions?",
      a: "Yes. One-click sync, re-encrypts per repo against GitHub's public key in your browser. We never see the plaintext values.",
    },
    {
      q: "How small is the setup?",
      a: "Paste your .env, choose a passphrase, copy the invite link. For a small team, three minutes is honestly slow.",
    },
    {
      q: "What if I move on from Cryptly later?",
      a: "Export the vault. It's your data. The encryption primitives are standard — you can decrypt offline with 20 lines of JS.",
    },
  ];
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">05 · PROOF</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Because we don't hold the key, here's what our DB stores.
        </h2>
      </div>

      <div className="mt-14 max-w-3xl mx-auto rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
        <div
          className="p-5 font-mono text-[11px] leading-5 text-neutral-500 break-all"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {dump}
        </div>
      </div>

      <div className="mt-10 max-w-3xl mx-auto rounded-2xl border border-neutral-900 bg-neutral-950/40 px-6">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="border-b border-neutral-900 last:border-b-0"
          >
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center gap-4 py-5 text-left"
            >
              <span className="flex-1 text-base md:text-lg font-medium text-neutral-100">
                {f.q}
              </span>
              <span className="h-7 w-7 rounded-full border border-neutral-800 grid place-items-center text-neutral-400">
                {openIdx === i ? (
                  <Minus className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pb-5 pr-12 text-neutral-400 text-sm leading-relaxed">
                    {f.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function A5CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">06 · ACTION</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.05]">
          Make next week boring.
        </h2>
        <p className="mt-5 text-neutral-400 text-lg leading-relaxed">
          No Slack pings, no pinned messages, no midnight triage. Three minutes
          to set up and the whole category goes quiet.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Set up the vault</span>
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
      <A5MicroMoments />
      <A5Tension />
      <A5NewWorld />
      <A5Bridge />
      <A5Proof />
      <A5CTA />
    </div>
  );
}
