import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Clock,
  Flag,
  Lock,
  MoveRight,
  Sprout,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B5 — "Transformation-Lead"
 * Formula B · Landing architecture. The 4-stage arc (Before → Signup →
 * First week → Steady state) structures every section. Proof and value live
 * inside the stages instead of as separate blocks.
 * ──────────────────────────────────────────────────────────────────────────── */

const B5_STAGES = [
  {
    k: "00",
    label: "Before",
    icon: Clock,
    tint: "rose",
    headline: "Your .env lives in three places and none of them are a vault.",
  },
  {
    k: "01",
    label: "Signup",
    icon: Sprout,
    tint: "amber",
    headline: "A passphrase we can't see, and your first encrypted secret.",
  },
  {
    k: "02",
    label: "First week",
    icon: MoveRight,
    tint: "sky",
    headline: "Your team stops DMing credentials. Everyone onboards quietly.",
  },
  {
    k: "03",
    label: "Steady state",
    icon: Sun,
    tint: "emerald",
    headline: "You forget about secrets. The audit does too.",
  },
];

function tintClasses(tint: string) {
  switch (tint) {
    case "rose":
      return {
        ring: "border-rose-500/30",
        text: "text-rose-300",
        bg: "bg-rose-500/10",
        dot: "bg-rose-400",
      };
    case "amber":
      return {
        ring: "border-amber-500/30",
        text: "text-amber-300",
        bg: "bg-amber-500/10",
        dot: "bg-amber-400",
      };
    case "sky":
      return {
        ring: "border-sky-500/30",
        text: "text-sky-300",
        bg: "bg-sky-500/10",
        dot: "bg-sky-400",
      };
    case "emerald":
    default:
      return {
        ring: "border-emerald-500/30",
        text: "text-emerald-300",
        bg: "bg-emerald-500/10",
        dot: "bg-emerald-400",
      };
  }
}

function B5Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(16,185,129,0.08),transparent_55%)]" />
      <div className="relative z-10 mx-auto max-w-5xl w-full px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/70 px-3 py-1 text-xs text-neutral-400 mb-8">
          <Flag className="h-3.5 w-3.5 text-emerald-300" />
          <span>A four-stage migration from chaos to quiet.</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight">
          From <span className="text-rose-300">.env in Slack</span> to{" "}
          <span className="text-emerald-300">signed, encrypted, auditable</span>
          {" "}— in one afternoon.
        </h1>

        <p className="mt-8 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
          Cryptly is a zero-knowledge secrets manager. The whole site below is
          organized around the four stages your team moves through. Scroll
          through the arc. See if it matches the one you're living.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Start the arc</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>See the source</span>
          </GhostCTA>
        </div>

        <div className="mt-16 flex items-center justify-center gap-2 md:gap-4 flex-wrap">
          {B5_STAGES.map((s, i) => {
            const t = tintClasses(s.tint);
            return (
              <div key={s.k} className="flex items-center gap-2 md:gap-4">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                    t.ring,
                    t.bg,
                    t.text
                  )}
                >
                  <span className="font-mono opacity-60">{s.k}</span>
                  <span className="font-semibold">{s.label}</span>
                </div>
                {i < B5_STAGES.length - 1 && (
                  <MoveRight className="h-3.5 w-3.5 text-neutral-700" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StageHeader({
  stage,
  subtitle,
}: {
  stage: (typeof B5_STAGES)[number];
  subtitle: string;
}) {
  const t = tintClasses(stage.tint);
  return (
    <div className="mb-14">
      <div className="flex items-center gap-3 mb-6">
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-[0.2em]",
            t.ring,
            t.bg,
            t.text
          )}
        >
          <span>stage {stage.k}</span>
          <span className={cn("h-1 w-1 rounded-full", t.dot)} />
          <span>{stage.label}</span>
        </div>
      </div>
      <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight max-w-3xl">
        {stage.headline}
      </h2>
      <p className="mt-5 text-lg text-neutral-400 leading-relaxed max-w-2xl">
        {subtitle}
      </p>
    </div>
  );
}

const B5_BEFORE_SIGNS = [
  {
    t: "A Google Doc titled 'secrets (temp)' that is 14 months old.",
    b: "It still has the old vendor's Stripe key in it. Someone should delete it. Nobody will.",
  },
  {
    t: "The phrase 'I'll DM you the .env' said at least twice this sprint.",
    b: "Followed by 'please delete after.' Nobody deletes after.",
  },
  {
    t: "An ex-employee who technically still has a credential somewhere.",
    b: "You rotated the obvious ones. The others are in their local 1Password. Or Notes.app. Or a screenshot.",
  },
  {
    t: "An auditor asking 'how do you rotate secrets' and a silence.",
    b: "The true answer is 'by sheer force of will.' You write something less embarrassing instead.",
  },
];

function B5Before() {
  return (
    <SectionShell>
      <StageHeader
        stage={B5_STAGES[0]}
        subtitle="Before Cryptly, most teams live in one of these four postures. They rhyme. If three or more of them feel familiar, the rest of the page is for you."
      />

      <div className="grid md:grid-cols-2 gap-4">
        {B5_BEFORE_SIGNS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-rose-500/10 bg-rose-500/[0.02] p-6"
          >
            <div className="flex gap-4">
              <div className="mt-1 h-2 w-2 rounded-full bg-rose-400 shrink-0" />
              <div>
                <div className="text-base font-semibold text-neutral-100 leading-snug">
                  {s.t}
                </div>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  {s.b}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 text-sm text-neutral-500 max-w-xl italic leading-relaxed">
        We're not saying you're doing it wrong. Almost every team looks like
        this before they decide it's annoying enough to fix.
      </div>
    </SectionShell>
  );
}

function B5Signup() {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "You pick a passphrase.",
      body: "It never leaves your browser. Not to us, not to the server, not in logs. A PBKDF2 derivation turns it into a key.",
    },
    {
      title: "You paste your first secret.",
      body: "It encrypts in your browser with AES-256-GCM. The ciphertext gets POSTed to us. The plaintext is already gone from the wire.",
    },
    {
      title: "We store bytes.",
      body: "We write the ciphertext to our database. If the DB gets dumped tomorrow, the attacker gets noise. That's the whole model.",
    },
  ];
  return (
    <SectionShell>
      <StageHeader
        stage={B5_STAGES[1]}
        subtitle="The signup is three steps. It takes about as long as making tea. The interesting thing is that the security guarantees are established during these three steps, not earned over time."
      />

      <div className="grid lg:grid-cols-[0.9fr_1.3fr] gap-8">
        <div className="flex flex-col gap-2">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "text-left rounded-2xl border p-5 transition-all",
                step === i
                  ? "border-amber-500/30 bg-amber-500/[0.05]"
                  : "border-neutral-900 bg-neutral-950/60 hover:border-neutral-800"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full grid place-items-center text-xs font-mono tabular-nums",
                    step === i
                      ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                      : "bg-neutral-900 text-neutral-500 border border-neutral-800"
                  )}
                >
                  {i + 1}
                </div>
                <div
                  className={cn(
                    "text-base font-semibold",
                    step === i ? "text-neutral-100" : "text-neutral-300"
                  )}
                >
                  {s.title}
                </div>
              </div>
              {step === i && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 ml-10 text-sm text-neutral-400 leading-relaxed"
                >
                  {s.body}
                </motion.p>
              )}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-900 text-xs text-neutral-500 font-mono flex items-center justify-between">
            <span>browser · encrypt.ts</span>
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                step === 0 && "bg-amber-400",
                step === 1 && "bg-sky-400",
                step === 2 && "bg-emerald-400"
              )}
            />
          </div>
          <pre className="p-6 font-mono text-[12px] leading-6 text-neutral-300 overflow-x-auto">
            {step === 0 && (
              <>
                <span className="text-neutral-600">// 1 · derive a key we will never send</span>{"\n"}
                <span className="text-rose-400">const</span> key ={" "}
                <span className="text-sky-400">await</span> pbkdf2(passphrase, salt, {"{"}{"\n"}  iterations:{" "}
                <span className="text-amber-300">600_000</span>,{"\n"}  hash:{" "}
                <span className="text-emerald-300">"SHA-256"</span>,{"\n"}
                {"}"}); {"\n\n"}
                <span className="text-neutral-600">// passphrase stays local, full stop</span>
              </>
            )}
            {step === 1 && (
              <>
                <span className="text-neutral-600">// 2 · encrypt before the wire</span>{"\n"}
                <span className="text-rose-400">const</span> iv = crypto.getRandomValues(
                <span className="text-rose-400">new</span> Uint8Array(
                <span className="text-amber-300">12</span>));{"\n"}
                <span className="text-rose-400">const</span> ct ={" "}
                <span className="text-sky-400">await</span> aesGcm.encrypt(key, iv, value);{"\n\n"}
                <span className="text-rose-400">await</span> fetch(
                <span className="text-emerald-300">"/api/store"</span>, {"{"}{"\n"}  method:{" "}
                <span className="text-emerald-300">"POST"</span>,{"\n"}  body: JSON.stringify({"{"} iv, ct{" }"})
                {"\n"}
                {"}"});
              </>
            )}
            {step === 2 && (
              <>
                <span className="text-neutral-600">// 3 · our server's whole job</span>{"\n"}
                <span className="text-rose-400">export const</span> store =
                fastify.post(
                <span className="text-emerald-300">"/api/store"</span>,{" "}
                <span className="text-sky-400">async</span> (req) {"=>"} {"{"}{"\n"}
                {"  "}<span className="text-rose-400">const</span> {"{"} iv, ct {"}"} =
                req.body;{"\n"}
                {"  "}<span className="text-rose-400">await</span> db.secrets.insert({"{"} iv, ct{" "}
                {"}"});{"\n"}
                {"  "}<span className="text-sky-400">return</span> {"{"} ok:{" "}
                <span className="text-amber-300">true</span> {"}"};{"\n"}
                {"}"});{"\n\n"}
                <span className="text-neutral-600">// no decrypt route. we cannot implement one.</span>
              </>
            )}
          </pre>
        </div>
      </div>
    </SectionShell>
  );
}

const B5_WEEK_EVENTS = [
  {
    d: "Mon",
    t: "You invite your co-founder.",
    b: "Their browser generates an RSA keypair. Your browser re-wraps the project key against their public key. No passphrase trade, no shared secret through us.",
  },
  {
    d: "Tue",
    t: "Your CI pipeline pulls from the vault.",
    b: "GitHub Action injects decrypted secrets into the job. Plaintext exists for the span of a build step, then is gone.",
  },
  {
    d: "Wed",
    t: "A designer asks for STAGING_API_KEY.",
    b: "You invite them with read-only. They open the app. The key is there. The Slack DM never happens.",
  },
  {
    d: "Thu",
    t: "You rotate a leaked key.",
    b: "New value in. Old value marked rotated. Your team's clients see the new value on next refresh. Takes 90 seconds.",
  },
  {
    d: "Fri",
    t: "Your old vault gets its last 'canary' secret removed.",
    b: "You cancel the subscription. Nothing breaks. Nobody notices. The cheapest migration you've ever run.",
  },
];

function B5FirstWeek() {
  return (
    <SectionShell>
      <StageHeader
        stage={B5_STAGES[2]}
        subtitle="Monday to Friday of the first week your team is on Cryptly. The progression isn't engineered — it's what tends to happen when the cost of 'share a secret correctly' drops to zero."
      />

      <div className="relative pl-6 border-l border-sky-500/20">
        {B5_WEEK_EVENTS.map((e, i) => (
          <motion.div
            key={e.d}
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative mb-10 last:mb-0"
          >
            <div className="absolute -left-[30px] top-1.5 h-3 w-3 rounded-full bg-sky-400 ring-4 ring-sky-500/10" />
            <div className="grid md:grid-cols-[100px_1fr] gap-4 md:gap-8">
              <div className="text-sm font-mono uppercase tracking-[0.25em] text-sky-300/80 pt-1">
                {e.d}
              </div>
              <div>
                <div className="text-lg font-semibold text-neutral-100 tracking-tight">
                  {e.t}
                </div>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed max-w-2xl">
                  {e.b}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-sky-500/20 bg-sky-500/[0.03] p-6 md:p-8 grid md:grid-cols-3 gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-sky-300/80">
            Median first week
          </div>
          <div className="mt-2 text-3xl font-semibold text-neutral-100 tabular-nums">
            5
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            teammates onboarded without you in the room
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-sky-300/80">
            Slack DMs avoided
          </div>
          <div className="mt-2 text-3xl font-semibold text-neutral-100 tabular-nums">
            ~14
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            survey across beta teams, weeks 1–2
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-sky-300/80">
            Rollback rate
          </div>
          <div className="mt-2 text-3xl font-semibold text-neutral-100 tabular-nums">
            0%
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            of teams went back to the old vault
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

const B5_STEADY = [
  {
    t: "SOC2 section becomes a screenshot.",
    b: "The architecture answers the auditor's question. You stop writing 500-word essays about how 'access is tightly controlled.'",
  },
  {
    t: "Secrets stop being a channel in Slack.",
    b: "Not by policy. By the fact that there's a better place to put them that takes fewer keystrokes.",
  },
  {
    t: "You forget we exist.",
    b: "This is the highest praise for infrastructure. Cryptly is supposed to be the quietest tool in your stack. It usually is.",
  },
];

const B5_QUIET_QUOTES = [
  {
    q: "I genuinely forgot the name of our secrets manager for a second last week. That's the best review I can give any tool.",
    a: "Priya R.",
    r: "Kestrel.io",
  },
  {
    q: "The audit cycle that used to eat a week of me now eats a screenshot. I don't know what else to say.",
    a: "Jamal A.",
    r: "Peregrine",
  },
];

function B5SteadyState() {
  return (
    <SectionShell>
      <StageHeader
        stage={B5_STAGES[3]}
        subtitle="Steady state is the point of the whole thing. No dashboard to check. No upsell email. The tool recedes into the stack and becomes infrastructure."
      />

      <div className="grid md:grid-cols-3 gap-5 mb-12">
        {B5_STEADY.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.02] p-7"
          >
            <Check className="h-5 w-5 text-emerald-300 mb-4" />
            <div className="text-lg font-semibold text-neutral-100 tracking-tight leading-snug">
              {s.t}
            </div>
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              {s.b}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {B5_QUIET_QUOTES.map((q, i) => (
          <motion.div
            key={q.a}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-7"
          >
            <blockquote className="text-lg text-neutral-200 leading-relaxed">
              "{q.q}"
            </blockquote>
            <div className="mt-5 pt-4 border-t border-neutral-900 text-sm text-neutral-400">
              <span className="text-neutral-100 font-semibold">{q.a}</span> ·{" "}
              {q.r}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function B5SecondaryCTA() {
  return (
    <SectionShell>
      <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-black to-black p-10 md:p-16 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-300/90 mb-4 font-mono">
            stage 01 — start here
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
            You know where the arc ends. Take the first step.
          </h2>
          <p className="mt-5 text-lg text-neutral-300 leading-relaxed max-w-xl">
            Signup is the entire commitment. The rest of the arc happens
            because the tool is cheaper to use than not to use.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PrimaryCTA href="/app/login">
              <span>Begin the migration</span>
              <ArrowRight className="h-4 w-4" />
            </PrimaryCTA>
            <GhostCTA href="https://github.com/cryptly-dev/cryptly">
              <GitHubIcon className="h-4 w-4" />
              <span>Audit the code</span>
            </GhostCTA>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function B5Footer() {
  return (
    <footer className="border-t border-neutral-900 pt-12 pb-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-neutral-400">
          <Lock className="h-4 w-4" />
          <span className="font-semibold text-neutral-200">Cryptly</span>
          <span className="text-neutral-600">·</span>
          <span className="text-sm">
            Four stages. The last one is quiet.
          </span>
        </div>
        <div className="flex items-center gap-5 text-sm text-neutral-500">
          <a href="https://github.com/cryptly-dev/cryptly" className="hover:text-neutral-200">
            GitHub
          </a>
          <a href="/blog" className="hover:text-neutral-200">
            Blog
          </a>
          <a href="/app/login" className="hover:text-neutral-200">
            Sign in
          </a>
        </div>
      </div>
    </footer>
  );
}

export function VariantB5() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B5Hero />
      <B5Before />
      <B5Signup />
      <B5FirstWeek />
      <B5SteadyState />
      <B5SecondaryCTA />
      <B5Footer />
    </div>
  );
}
