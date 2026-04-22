import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, Mail, UserMinus } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A1 — "The Orphaned Project"
 * Formula A · Someone left. The secrets left with them.
 * ──────────────────────────────────────────────────────────────────────────── */

function A1Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.06),transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <div className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-8">
          · 01 ·
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.05] tracking-tight"
        >
          The project nobody can deploy{" "}
          <span className="text-neutral-500">
            because Kamil left.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-8 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl"
        >
          The secret was in his head, or on his laptop, or in a Notion page
          only he had. When the offboarding ticket closed, the secret closed
          with it. Now you can't ship.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>See a better way</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>On GitHub</span>
          </GhostCTA>
        </motion.div>
      </div>
    </section>
  );
}

const A1_THREAD = [
  {
    who: "alex @ eng",
    when: "9:12",
    line: "hey, anyone have the staging DB password? trying to run migrations",
  },
  {
    who: "priya @ ops",
    when: "9:14",
    line: "wasn't that in Kamil's 1Password?",
  },
  {
    who: "alex @ eng",
    when: "9:14",
    line: "Kamil left in March.",
  },
  {
    who: "priya @ ops",
    when: "9:15",
    line: "oh. oh no.",
  },
  {
    who: "jordan @ sre",
    when: "9:22",
    line: "he DMed me the .env once. checking scroll back.",
  },
  {
    who: "jordan @ sre",
    when: "9:24",
    line: "retention. 90 days. it's gone.",
  },
  {
    who: "alex @ eng",
    when: "9:26",
    line: "so we're going to rotate the DB and hope nothing else depends on it?",
  },
  {
    who: "priya @ ops",
    when: "9:27",
    line: "what else did Kamil own, actually.",
  },
];

function A1StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          It starts with a question at 9am.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
          Somewhere on your team, in a channel nobody thought to archive, a
          conversation like this is happening right now.
        </p>
      </div>

      <div className="mt-14 max-w-2xl rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
        {A1_THREAD.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              "px-6 py-3 flex items-start gap-4",
              i !== A1_THREAD.length - 1 && "border-b border-neutral-900"
            )}
          >
            <div className="w-28 shrink-0">
              <div className="text-xs text-neutral-300 font-medium truncate">
                {m.who}
              </div>
              <div className="text-[11px] text-neutral-600 font-mono">
                {m.when}
              </div>
            </div>
            <div
              className={cn(
                "text-sm leading-relaxed",
                m.line.includes("gone") || m.line.includes("left")
                  ? "text-rose-300/90"
                  : "text-neutral-300"
              )}
            >
              {m.line}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A1Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The real cost isn't Kamil.
          <br />
          It's that the secret was <em>one copy, one person</em>.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          Every team has a quiet ledger of secrets that only live in one
          person's head, or laptop, or DMs. The ledger grows silently. You
          only notice when someone leaves, and then you notice everything at
          once.
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-4 max-w-4xl">
        {[
          { k: "1", t: "A secret", b: "that only one person can produce" },
          { k: "2", t: "A person", b: "who can, for any reason, be unavailable" },
          { k: "3", t: "A deploy", b: "that needs the secret right now" },
        ].map((c, i) => (
          <motion.div
            key={c.k}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="p-6 border border-neutral-900 rounded-xl"
          >
            <div className="text-[11px] font-mono text-neutral-600">
              ingredient {c.k}
            </div>
            <div className="mt-2 text-lg text-neutral-100 font-medium">
              {c.t}
            </div>
            <div className="mt-1 text-sm text-neutral-500">{c.b}</div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A1NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          What if the secret had a team?
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          Not a central vendor that reads it and lets you borrow it back. A
          small set of teammates whose browsers each hold a wrapped key. Any
          one of them can invite another. No one of them is a single point of
          failure. And the vendor — us — can't read the secret even if Kamil
          asked us to.
        </p>
      </div>

      <div className="mt-14 max-w-3xl space-y-5">
        {[
          {
            t: "Your browser holds a key.",
            b: "Derived from your passphrase, local-only. You decrypt with it.",
          },
          {
            t: "Your teammate's browser holds one too.",
            b: "Wrapped against their public key. Cryptographically theirs, same ciphertext.",
          },
          {
            t: "When Kamil leaves, his key is revoked.",
            b: "Everyone else still decrypts. The secret does not leave with him. It did not leave with him.",
          },
          {
            t: "Cryptly holds ciphertext, and nothing else.",
            b: "We cannot produce the plaintext. For Kamil, for you, for a court.",
          },
        ].map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-5 pb-5 border-b border-neutral-900 last:border-b-0"
          >
            <div className="text-xs font-mono text-neutral-600 pt-1 w-8 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <div className="text-lg md:text-xl text-neutral-100 leading-snug">
                {p.t}
              </div>
              <p className="mt-1.5 text-neutral-400 leading-relaxed">{p.b}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A1Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          So we built Cryptly.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          Small, open source, free. A secrets vault where the key is
          cryptographically shared across your team. When someone leaves, the
          vault doesn't.
        </p>
      </div>
    </SectionShell>
  );
}

function A1Proof() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          When a teammate offboards:
        </h2>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-5 max-w-4xl">
        <div className="rounded-xl border border-neutral-900 p-6 bg-neutral-950/40">
          <div className="flex items-center gap-2 text-sm text-rose-300/80">
            <UserMinus className="h-4 w-4" />
            <span>Before Cryptly</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-neutral-400 leading-relaxed">
            <li>· You Slack five people asking where the secret lives.</li>
            <li>· Three don't know. Two are out of office.</li>
            <li>· You rotate what you can, hope for the rest.</li>
            <li>· A week later you discover one more secret they held.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-sky-500/20 p-6 bg-sky-500/[0.02]">
          <div className="flex items-center gap-2 text-sm text-sky-300/90">
            <Mail className="h-4 w-4" />
            <span>With Cryptly</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-neutral-300 leading-relaxed">
            <li>· You revoke Kamil's public key. His wrap is invalid.</li>
            <li>· The other teammates decrypt with their own keys, as before.</li>
            <li>· The vault never needed him. It doesn't miss him.</li>
            <li>· No rotation cascade. No Slack hunt.</li>
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}

function A1CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Your next Kamil is already writing their notice.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-xl">
          Take five minutes. Move the secrets into a place that survives
          them.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-3">
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

export function VariantA1() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A1Hero />
      <A1StatusQuo />
      <A1Tension />
      <A1NewWorld />
      <A1Bridge />
      <A1Proof />
      <A1CTA />
    </div>
  );
}
