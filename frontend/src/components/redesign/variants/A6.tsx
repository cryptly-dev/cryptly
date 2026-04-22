import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT A6 — "The Scrolled-Past Message"
 * Formula A · Slack retention ate the secret.
 * ──────────────────────────────────────────────────────────────────────────── */

function A6Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-black">
      <div className="relative z-10 mx-auto max-w-4xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1.02] tracking-tight"
        >
          The secret was in a Slack DM.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-6 text-3xl md:text-5xl text-neutral-500 leading-tight tracking-tight"
        >
          Retention ate it last Thursday.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-lg text-neutral-400 leading-relaxed max-w-2xl"
        >
          90-day policy. Good for security. Less good for{" "}
          <em>can you paste me the webhook signing key one more time.</em>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-14 flex flex-wrap items-center gap-3"
        >
          <PrimaryCTA href="/app/login">
            <span>Paste it once, keep it</span>
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

function A6StatusQuo() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          A transcript of a very common exchange.
        </h2>
      </div>

      <div className="mt-14 max-w-2xl space-y-5">
        {[
          { who: "you", t: "hey can you paste me the webhook key? I'm redeploying" },
          { who: "them", t: "I DMed it to you last time lol, check up" },
          { who: "you", t: "checked. scroll bar is short. I think retention ate it" },
          { who: "them", t: "oh. yeah it probably did. let me re-fetch from dashboard" },
          {
            who: "system",
            t: "(four minutes later)",
            italic: true,
          },
          { who: "them", t: "sk_live_4vX7... (rotated)" },
          { who: "you", t: "thanks. saving to notes this time" },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              "flex gap-4",
              m.who === "you" ? "flex-row" : "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                m.who === "you" && "bg-neutral-900 text-neutral-200",
                m.who === "them" && "bg-sky-500/10 text-sky-100 border border-sky-500/20",
                m.who === "system" &&
                  "mx-auto text-neutral-600 italic text-xs border-0 px-0"
              )}
            >
              {m.t}
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-10 text-sm text-neutral-500 italic max-w-xl">
        The secret was rotated out of prudence, not convenience. Every
        exchange like this costs your team some attention.
      </p>
    </SectionShell>
  );
}

function A6Tension() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Chat is not a vault.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          A DM has the wrong lifecycle for a secret. The secret outlives
          the memory. The memory outlives the message. Eventually the
          message is gone, and you are Slack-DMing the CTO again.
        </p>
      </div>
    </SectionShell>
  );
}

function A6NewWorld() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Paste the secret once. Into a thing whose job is to keep it.
        </h2>
      </div>

      <div className="mt-12 max-w-3xl space-y-6">
        {[
          {
            t: "The secret lives in an encrypted record on our servers.",
            b: "Your teammates unlock it with their own browsers. We never see the value.",
          },
          {
            t: "Your teammates don't ask you to re-paste.",
            b: "They open the project and read it themselves. You were never the bottleneck.",
          },
          {
            t: "Retention is not a factor.",
            b: "There's nothing to retain. The value is stored once, encrypted, forever.",
          },
        ].map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="text-lg md:text-xl text-neutral-100 leading-snug">
              — {p.t}
            </div>
            <p className="mt-2 text-neutral-400 leading-relaxed ml-4">
              {p.b}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A6Bridge() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 leading-tight tracking-tight">
          So we built Cryptly.
        </h2>
        <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-xl">
          The place to put the webhook key so you never DM it again.
        </p>
      </div>
    </SectionShell>
  );
}

function A6Proof() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          The Slack exchange, now:
        </h2>
      </div>

      <div className="mt-14 max-w-2xl space-y-5">
        {[
          { who: "you", t: "hey, can you paste me the webhook key?" },
          {
            who: "them",
            t: "cryptly.sh/projects/payments — it's right there",
          },
          { who: "you", t: "ah. right. yeah." },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "flex gap-4",
              m.who === "you" ? "flex-row" : "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                m.who === "you" && "bg-neutral-900 text-neutral-200",
                m.who === "them" &&
                  "bg-emerald-500/10 text-emerald-100 border border-emerald-500/20"
              )}
            >
              {m.t}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

function A6CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Stop pasting secrets into chat.
        </h2>
        <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-xl">
          Or, keep pasting — but into a place that remembers.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <PrimaryCTA href="/app/login">
            <span>Set one up</span>
            <ArrowRight className="h-4 w-4" />
          </PrimaryCTA>
          <GhostCTA href="https://github.com/cryptly-dev/cryptly">
            <GitHubIcon className="h-4 w-4" />
            <span>On GitHub</span>
          </GhostCTA>
        </div>
      </div>
    </SectionShell>
  );
}

export function VariantA6() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <A6Hero />
      <A6StatusQuo />
      <A6Tension />
      <A6NewWorld />
      <A6Bridge />
      <A6Proof />
      <A6CTA />
    </div>
  );
}
