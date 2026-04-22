import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, GitCommit } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A3 — "The Six-Month Gap"
 * Formula A · Coming back to an old project. The env is gone.
 * ──────────────────────────────────────────────────────────────────────────── */

function A3Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-mono text-xs text-neutral-600 mb-12"
        >
          $ git log --oneline --since="6 months ago" | head -1
          <br />
          <span className="text-neutral-700">
            (nothing)
          </span>
        </motion.div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight">
          You opened a repo{" "}
          <span className="text-neutral-500">
            you hadn't touched since October.
          </span>
        </h1>
        <h2 className="mt-6 text-2xl md:text-4xl text-neutral-400 leading-tight">
          The <code className="text-neutral-200 bg-neutral-900 px-2 py-0.5 rounded-md">.env</code>{" "}
          is gone.
        </h2>

        <p className="mt-10 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl">
          You wiped the laptop in January. You forgot that you'd never
          committed it. You did the sensible thing, and it cost you.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Never do this again</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Read the source</span>
          </GhostCTA>
        </div>
      </div>
    </section>
  );
}

const A3_COMMITS = [
  { sha: "a2f11d0", msg: "feat: initial commit", days: "Apr 2, 2024" },
  { sha: "9b3e721", msg: "wire up stripe", days: "May 18, 2024" },
  { sha: "c442ad1", msg: "env sample, not committing real values", days: "Jun 03, 2024" },
  { sha: "f71aa98", msg: "deploy to staging", days: "Oct 11, 2024" },
  { sha: "—", msg: "(no commits for six months)", days: "—" },
  { sha: "???", msg: "trying to resurrect", days: "today" },
];

function A3StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The repo remembers. The machine doesn't.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
          Git tracked every intention. It didn't track the values. Because
          you gitignored them, responsibly, and then trusted local memory.
        </p>
      </div>

      <div className="mt-14 max-w-3xl rounded-2xl border border-neutral-900 bg-neutral-950/50 overflow-hidden">
        {A3_COMMITS.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "grid grid-cols-[100px_1fr_140px] gap-4 items-center px-5 py-3 font-mono text-sm",
              i !== A3_COMMITS.length - 1 && "border-b border-neutral-900",
              c.sha === "—" && "bg-neutral-950/80 text-neutral-600 italic",
              c.sha === "???" && "bg-rose-500/[0.03] text-rose-300/90"
            )}
          >
            <span className="text-neutral-500 flex items-center gap-2">
              <GitCommit className="h-3.5 w-3.5" />
              {c.sha}
            </span>
            <span className={cn(c.sha !== "—" && c.sha !== "???" && "text-neutral-200")}>
              {c.msg}
            </span>
            <span className="text-neutral-600 text-xs text-right">{c.days}</span>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A3Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The trouble with local-only secrets.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          The values aren't in git, which is right. They aren't in a vault,
          which is the gap. They live in the machine that typed them. The
          machine and its memory eventually part ways — wiped, sold,
          reimaged, lost.
        </p>
        <p className="mt-6 text-lg text-neutral-500 leading-relaxed max-w-2xl italic">
          You picked the right thing to do with your repo, and the wrong
          thing to do with your fileystem. Both can be fixed.
        </p>
      </div>
    </SectionShell>
  );
}

function A3NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          A vault beside the repo.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          Not inside the repo. Not on your laptop. A small, encrypted
          object that outlives reimagings.
        </p>
      </div>

      <div className="mt-14 max-w-3xl space-y-8">
        {[
          {
            t: "The values live on our servers — encrypted.",
            b: "We store ciphertext only. If our DB gets dumped, the attacker gets noise.",
          },
          {
            t: "The keys live in the browsers of the team.",
            b: "Derived from their passphrases, wrapped per-member. Several redundant copies, none of them authoritative alone.",
          },
          {
            t: "The values survive reimaging.",
            b: "Because they weren't on your disk. Open the app six months later, decrypt with your passphrase.",
          },
        ].map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="border-l-2 border-neutral-800 pl-6"
          >
            <div className="text-lg md:text-xl text-neutral-100 leading-snug">
              {p.t}
            </div>
            <p className="mt-2 text-neutral-400 leading-relaxed">{p.b}</p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A3Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          Cryptly is that vault beside the repo.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          Open source. Encrypted in your browser. Quiet enough that you'll
          forget it's there until you need it in September.
        </p>
      </div>
    </SectionShell>
  );
}

function A3Proof() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Come back six months later.
        </h2>
      </div>

      <div className="mt-10 max-w-3xl font-mono text-sm rounded-2xl border border-neutral-900 bg-neutral-950/50 p-6 leading-relaxed">
        <div className="text-neutral-600">$ cd old-side-project</div>
        <div className="text-neutral-600">$ cryptly pull --project api-prod</div>
        <div className="text-neutral-300">
          decrypting with <span className="text-sky-300">your</span> passphrase...
        </div>
        <div className="text-neutral-300">
          wrote <span className="text-emerald-300">.env</span> (7 values)
        </div>
        <div className="text-neutral-600 mt-2">$ npm run dev</div>
        <div className="text-neutral-400">
          <span className="text-emerald-300">ready</span> · localhost:3000
        </div>
        <div className="mt-4 text-neutral-600 italic">
          took: ~12 seconds
        </div>
      </div>
    </SectionShell>
  );
}

function A3CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          The next time you come back, the .env should be there.
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Save one project</span>
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

export function VariantA3() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A3Hero />
      <A3StatusQuo />
      <A3Tension />
      <A3NewWorld />
      <A3Bridge />
      <A3Proof />
      <A3CTA />
    </div>
  );
}
