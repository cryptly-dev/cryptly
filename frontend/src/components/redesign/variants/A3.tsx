import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { fakeCiphertext, GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A3 — "Quiet Security"
 * Formula A · Manifesto. Heavy white space. Typographic.
 * Angle: Philosophical. Lean into the quiet confidence of the position.
 * ──────────────────────────────────────────────────────────────────────────── */

function A3Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.04),transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-3xl w-full px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight">
            Secrets that aren't ours to hold.
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl mx-auto leading-relaxed"
        >
          A secrets manager architected so that we — the vendor — can't read
          what's inside. Not 'don't.' <em>Can't</em>.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Begin</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Read the source</span>
          </GhostCTA>
        </motion.div>

        <div className="mt-24 text-[10px] uppercase tracking-[0.4em] text-neutral-600">
          Scroll
        </div>
      </div>
    </section>
  );
}

const A3_OBSERVATIONS = [
  {
    text: "Every other vault asks you to trust the vendor.",
    muted: false,
  },
  {
    text: "To trust that their employees don't read your plaintext. To trust that their servers are uncompromised. To trust that a subpoena, a leak, a rogue admin — none of these will ever happen.",
    muted: true,
  },
  {
    text: "That is a lot of trust to pay for with a login.",
    muted: false,
  },
];

function A3StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-[11px] uppercase tracking-[0.35em] text-neutral-500 mb-10">
          01 · The assumption
        </div>
        <div className="space-y-8 text-neutral-200 leading-relaxed">
          {A3_OBSERVATIONS.map((o, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={cn(
                "text-2xl md:text-3xl tracking-tight",
                o.muted && "text-neutral-500"
              )}
            >
              {o.text}
            </motion.p>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function A3Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-[11px] uppercase tracking-[0.35em] text-neutral-500 mb-10">
          02 · The quiet question
        </div>
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          What if the vendor simply <span className="text-neutral-500">couldn't</span> see the secrets —
          even if they wanted to?
        </h2>
        <p className="mt-8 text-neutral-400 text-lg leading-relaxed max-w-xl">
          Not as a promise on a marketing page. As a fact of the architecture.
          Audit-able. Reviewable. True when we're sleeping.
        </p>
      </div>
    </SectionShell>
  );
}

const A3_PRINCIPLES = [
  {
    n: "i",
    t: "The passphrase stays where it's typed.",
    b: "We never receive it. Not in transit, not at rest, not in logs.",
  },
  {
    n: "ii",
    t: "Encryption happens where the human is.",
    b: "AES-256-GCM in your browser, with a key derived by PBKDF2. The same primitives your bank runs on.",
  },
  {
    n: "iii",
    t: "The server is a filing cabinet.",
    b: "Ciphertext in. Ciphertext out. It has no opinion about what's inside.",
  },
  {
    n: "iv",
    t: "The invite is a protocol, not a promise.",
    b: "When you add a teammate, your browser re-wraps the key against their public key. We shuttle bytes.",
  },
];

function A3NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-[11px] uppercase tracking-[0.35em] text-neutral-500 mb-10">
          03 · Four principles
        </div>
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight mb-12">
          Here is what we mean by <em>can't.</em>
        </h2>
        <div className="space-y-8">
          {A3_PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="grid grid-cols-[60px_1fr] gap-6 pb-8 border-b border-neutral-900 last:border-b-0"
            >
              <div className="text-sm uppercase tracking-[0.2em] text-neutral-600 pt-1 font-mono">
                {p.n}
              </div>
              <div>
                <div className="text-xl md:text-2xl font-semibold text-neutral-100 tracking-tight">
                  {p.t}
                </div>
                <p className="mt-3 text-base text-neutral-400 leading-relaxed max-w-2xl">
                  {p.b}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function A3Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-[11px] uppercase tracking-[0.35em] text-neutral-500 mb-10">
          04 · The object
        </div>
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          We built it, and called it <span className="text-neutral-300">Cryptly.</span>
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          It's small. There's no upsell. No team plan. No seat-based metering.
          The product is the architecture.
        </p>
      </div>

      <div className="mt-16 max-w-2xl mx-auto">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-8 md:p-10 flex items-start gap-6">
          <div className="h-14 w-14 rounded-2xl bg-neutral-900 border border-neutral-800 grid place-items-center shrink-0">
            <Lock className="h-6 w-6 text-neutral-300" />
          </div>
          <div>
            <div className="text-xl font-semibold text-neutral-100 tracking-tight">
              Cryptly
            </div>
            <p className="mt-2 text-neutral-400 leading-relaxed">
              A vault. Open source. Encrypted in your browser. Free for as long
              as we exist, because there's nothing to charge for that would
              compromise the first line.
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function A3Proof() {
  const [passphrase, setPassphrase] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const dump = useMemo(() => fakeCiphertext("a3-proof", 1600), []);

  const fakeUnlock = () => {
    setUnlocked(true);
    setTimeout(() => setUnlocked(false), 1200);
  };

  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-[11px] uppercase tracking-[0.35em] text-neutral-500 mb-10">
          05 · Check our work
        </div>
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          This is what our database sees.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          It is not an excerpt. It is the record.
        </p>
      </div>

      <div className="mt-16 max-w-3xl mx-auto rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
        <div
          className="p-6 md:p-8 font-mono text-[11px] md:text-[12px] leading-5 text-neutral-500 break-all"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 6,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {dump}
        </div>
        <div className="px-6 pb-6 pt-2 border-t border-neutral-900 bg-black/40">
          <div className="text-xs text-neutral-500 mb-3">
            Try to decrypt it. You'll need a passphrase we don't have.
          </div>
          <div className="flex items-center gap-2">
            <input
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="any passphrase"
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm font-mono text-neutral-300 focus:outline-none focus:border-neutral-700"
            />
            <button
              onClick={fakeUnlock}
              className="rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-neutral-100"
            >
              Decrypt
            </button>
          </div>
          {unlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-sm text-rose-400 font-mono"
            >
              DecryptionError: MAC mismatch — wrong key. (As designed.)
            </motion.div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

function A3CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-[11px] uppercase tracking-[0.35em] text-neutral-500 mb-10">
          06 · If this resonates
        </div>
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 tracking-tight leading-[1.05]">
          Come and use it.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl mx-auto">
          No demo, no sales call. It's free, it's open, it takes three minutes.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Begin</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>Audit the code</span>
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
