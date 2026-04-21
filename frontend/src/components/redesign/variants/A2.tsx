import Beams from "@/components/Beams";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  ArrowRight,
  Book,
  Calendar,
  Clock,
  FileWarning,
  Key,
  ScrollText,
  Shield,
} from "lucide-react";
import { useMemo } from "react";
import { fakeCiphertext, GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A2 — "The Receipt"
 * Formula A · A timeline-driven narrative. Starts with specific dates.
 * Angle: Dated incidents → running cost → alternative future.
 * ──────────────────────────────────────────────────────────────────────────── */

function A2Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 opacity-50">
        <Beams
          beamWidth={2}
          beamHeight={30}
          beamNumber={20}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/30 to-black" />

      <div className="relative z-10 mx-auto max-w-5xl w-full px-6 py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-medium uppercase tracking-[0.22em] bg-amber-500/10 text-amber-300 border-amber-500/30">
            <ScrollText className="h-3 w-3" />
            your receipt
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight">
            On Tuesday, you Slacked your Stripe key to a new hire.
          </h1>
          <p className="mt-7 text-lg md:text-xl text-neutral-400 leading-relaxed">
            You rotated the easy ones. The DM is still there. Slack's search
            index will outlive all of us.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <PrimaryCTA href="/app/login">
              <span>Start clean</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </PrimaryCTA>
            <GhostCTA href="#receipt">
              <span>Read the receipt</span>
            </GhostCTA>
          </div>
        </div>
      </div>
    </section>
  );
}

const A2_RECEIPTS = [
  {
    when: "Oct 14",
    where: "Slack · #eng-backend",
    who: "@alex",
    what: "STRIPE_SECRET_KEY pasted in a DM to the new hire",
    risk: "still unrotated",
  },
  {
    when: "Sep 22",
    where: "Google Drive",
    who: "@priya",
    what: "'.env.local copy (FINAL FINAL).txt' shared with 9 people",
    risk: "still accessible",
  },
  {
    when: "Aug 03",
    where: "Notion",
    who: "@marcus",
    what: "Onboarding doc pinned DATABASE_URL in the 'quickstart' section",
    risk: "indexed publicly",
  },
  {
    when: "Jul 18",
    where: "Laptop (off-network)",
    who: "@ex-senior",
    what: "Engineer left. Their SSH key is still in the team vault.",
    risk: "no revocation",
  },
  {
    when: "Jun 02",
    where: "GitHub",
    who: "@nina",
    what: "AWS_SECRET_ACCESS_KEY committed to a branch, force-pushed away",
    risk: "still in reflog",
  },
  {
    when: "May 09",
    where: "1Password (shared)",
    who: "@ops-team",
    what: "Prod DB password, last rotated 14 months ago",
    risk: "staleness critical",
  },
  {
    when: "Apr 21",
    where: "Email",
    who: "@jess",
    what: "OpenAI key mailed 'just this once' to a contractor",
    risk: "still valid",
  },
];

function A2ReceiptTimeline() {
  return (
    <div id="receipt">
      <SectionShell>
        <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
          <span className="text-neutral-600 tabular-nums">STEP 01 · STATUS QUO</span>
          <span className="h-px flex-1 bg-neutral-900" />
        </div>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            You've had these incidents. You just haven't been breached yet.
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Below is a rough receipt of the secrets your team has accidentally
            broadcast this year. We picked dates at random. Replace them with
            yours; the story reads the same.
          </p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-900 flex items-center gap-3 text-xs text-neutral-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>Year-to-date · 7 documented incidents</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-rose-400">
                unresolved
              </span>
            </div>
            {A2_RECEIPTS.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className={cn(
                  "grid grid-cols-[72px_140px_100px_1fr_auto] items-center gap-4 px-5 py-4",
                  i !== A2_RECEIPTS.length - 1 && "border-b border-neutral-900"
                )}
              >
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  {r.when}
                </div>
                <div className="text-xs text-neutral-400 font-mono truncate">
                  {r.where}
                </div>
                <div className="text-xs text-neutral-500 font-mono truncate">
                  {r.who}
                </div>
                <div className="text-sm text-neutral-200 min-w-0">{r.what}</div>
                <div className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 whitespace-nowrap">
                  {r.risk}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionShell>
    </div>
  );
}

function A2RunningCost() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">STEP 02 · TENSION</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          That receipt isn't closed. It's billing you daily.
        </h2>
      </div>

      <div className="mt-14 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6">
          <FileWarning className="h-6 w-6 text-amber-300" />
          <div className="mt-5 text-3xl font-semibold text-neutral-100 tabular-nums">
            ~$4.4M
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            industry average breach cost (IBM 2024)
          </div>
          <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
            87% start with credential misuse.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6">
          <Clock className="h-6 w-6 text-amber-300" />
          <div className="mt-5 text-3xl font-semibold text-neutral-100 tabular-nums">
            204 days
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            median time to detect
          </div>
          <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
            Your Oct-14 DM has plenty of runway.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6">
          <Key className="h-6 w-6 text-amber-300" />
          <div className="mt-5 text-3xl font-semibold text-neutral-100 tabular-nums">
            8.5 hrs
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            engineering time per rotation
          </div>
          <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
            Per our own customer surveys. It's why nobody does it.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

function A2ZeroedOut() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">STEP 03 · NEW WORLD</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Now imagine the same ledger — zeroed out.
        </h2>
      </div>

      <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] overflow-hidden">
        <div className="px-5 py-3 border-b border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-300">
          <Shield className="h-3.5 w-3.5" />
          <span>Year-to-date · 0 incidents</span>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-emerald-400">
            architectural
          </span>
        </div>
        <div className="p-10 text-center">
          <div className="text-7xl md:text-8xl font-semibold tabular-nums text-emerald-300">
            $0
          </div>
          <p className="mt-4 text-neutral-400 max-w-lg mx-auto">
            Not because you'd be more careful. Because the places where secrets
            used to leak — Slack, Drive, Notion, email — don't receive any in
            the first place.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

function A2BridgeHowItWorks() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">STEP 04 · BRIDGE</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          Cryptly is the ledger that stays at zero.
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          A vault where secrets actually live. Everywhere else points to it.
        </p>
      </div>

      <div className="mt-16 max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
        {[
          {
            n: "1",
            t: "Paste once",
            b: "Your .env goes in. Encrypted in your browser before it touches our wire.",
          },
          {
            n: "2",
            t: "Invite the team",
            b: "Each member gets their own re-wrapped key. Revoke in one click.",
          },
          {
            n: "3",
            t: "Push to CI",
            b: "GitHub Actions gets ciphertext. You get a green deploy. We see nothing.",
          },
        ].map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6"
          >
            <div className="h-8 w-8 rounded-full border border-neutral-800 bg-neutral-900 grid place-items-center text-sm text-neutral-300 font-mono">
              {s.n}
            </div>
            <div className="mt-4 text-lg font-semibold text-neutral-100">
              {s.t}
            </div>
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              {s.b}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function A2Proof() {
  const dump = useMemo(() => fakeCiphertext("a2-proof", 1400), []);
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">STEP 05 · PROOF</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
          If we got breached tomorrow, this is the whole leak.
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          We encrypt in your browser with a key we don't hold. Our database is
          just the filing cabinet.
        </p>
      </div>
      <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
        <div className="px-4 py-2 border-b border-neutral-900 text-xs text-neutral-400 font-mono">
          your-project.vault · raw bytes
        </div>
        <div
          className="p-5 md:p-6 font-mono text-[11px] md:text-[12px] leading-5 text-neutral-500 break-all"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {dump}
        </div>
      </div>
    </SectionShell>
  );
}

function A2CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto flex items-center gap-3 mb-6 text-[11px] uppercase tracking-[0.28em]">
        <span className="text-neutral-600 tabular-nums">STEP 06 · ACTION</span>
        <span className="h-px flex-1 bg-neutral-900" />
      </div>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.05]">
          Close last year's receipt. Open a different one.
        </h2>
        <p className="mt-5 text-neutral-400 text-lg leading-relaxed">
          Three minutes to set up. Forever to stop DMing <code>STRIPE_SECRET_KEY</code>.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Start clean</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="/blog">
            <Book className="h-4 w-4" />
            <span>Read the blog</span>
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
      <A2ReceiptTimeline />
      <A2RunningCost />
      <A2ZeroedOut />
      <A2BridgeHowItWorks />
      <A2Proof />
      <A2CTA />
    </div>
  );
}
