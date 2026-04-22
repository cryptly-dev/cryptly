import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT B14 — "A Visit"
 * Formula B · A walk through the product, one pane at a time, with a nav.
 * ──────────────────────────────────────────────────────────────────────────── */

function B14Nav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-950/80 bg-black/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold tracking-tight text-neutral-100">
          Cryptly
        </a>
        <div className="flex items-center gap-7 text-sm text-neutral-400">
          <a href="/" className="text-neutral-100">
            home
          </a>
          <a href="#features" className="hover:text-neutral-100 transition-colors">
            features
          </a>
          <a href="/blog" className="hover:text-neutral-100 transition-colors">
            blog
          </a>
          <a
            href="https://github.com/cryptly-dev/cryptly"
            className="hover:text-neutral-100 transition-colors"
          >
            github
          </a>
        </div>
      </div>
    </nav>
  );
}

function B14Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black">
      <div className="mx-auto max-w-3xl w-full px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-100 leading-[0.98] tracking-tight"
        >
          A short walk through.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-lg md:text-xl text-neutral-400 max-w-xl leading-relaxed"
        >
          Three panes, in the order you'd meet them.
        </motion.p>
      </div>
    </section>
  );
}

function UiFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
      <div className="px-5 py-3 border-b border-neutral-900 flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
          {title}
        </span>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
        </div>
      </div>
      <div className="p-5 text-sm">{children}</div>
    </div>
  );
}

function B14Write() {
  return (
    <SectionShell className="scroll-mt-14">
      <div id="features" className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Write a secret.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          Paste a value. The browser derives the key, wraps the value,
          and sends ciphertext. The server stores it untouched.
        </p>
      </div>
      <div className="mt-12 max-w-2xl">
        <UiFrame title="project · staging · new secret">
          <div className="space-y-3">
            <div className="text-neutral-500">name</div>
            <div className="px-3 py-2 rounded-md bg-neutral-900/60 text-neutral-200 font-mono text-xs">
              DATABASE_URL
            </div>
            <div className="text-neutral-500 pt-2">value</div>
            <div className="px-3 py-2 rounded-md bg-neutral-900/60 text-neutral-200 font-mono text-xs tracking-wider">
              postgres://••••••••••••••••••
            </div>
            <div className="pt-3 flex items-center justify-between text-xs text-neutral-500">
              <span>encrypted in your browser</span>
              <span className="text-emerald-300/80">ready</span>
            </div>
          </div>
        </UiFrame>
      </div>
    </SectionShell>
  );
}

function B14Invite() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Invite a teammate.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          By invite link, from a list of suggested people, or (soon) by
          team. Each invitation rewraps the project key locally for the
          new member.
        </p>
      </div>
      <div className="mt-12 max-w-2xl">
        <UiFrame title="project · members">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-neutral-900/60">
              <span className="text-neutral-200">you</span>
              <span className="text-xs text-neutral-500">owner</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-neutral-900/60">
              <span className="text-neutral-200">jerzy @ signosh</span>
              <span className="text-xs text-neutral-500">invited just now</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-neutral-900/40 border border-dashed border-neutral-800">
              <span className="text-neutral-400">+ invite by link</span>
              <span className="text-xs text-neutral-500">
                teams · soon
              </span>
            </div>
          </div>
        </UiFrame>
      </div>
    </SectionShell>
  );
}

function B14History() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          Browse history, from any seat.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-2xl">
          Every change is a new wrapped copy. Your teammates can read
          any version — from their own browser. We can't, and don't.
        </p>
      </div>
      <div className="mt-12 max-w-2xl">
        <UiFrame title="DATABASE_URL · versions">
          <div className="divide-y divide-neutral-900 font-mono text-xs">
            {[
              { t: "v17", by: "you · 2m ago", now: true },
              { t: "v16", by: "dominik @ bluemenu · yesterday" },
              { t: "v15", by: "you · last week" },
              { t: "v14", by: "jerzy @ signosh · 3 weeks ago" },
              { t: "v13", by: "you · april" },
            ].map((row) => (
              <div
                key={row.t}
                className={cn(
                  "flex items-center justify-between px-1 py-2",
                  row.now && "text-neutral-100"
                )}
              >
                <span>{row.t}</span>
                <span className="text-neutral-500">{row.by}</span>
              </div>
            ))}
          </div>
        </UiFrame>
      </div>
    </SectionShell>
  );
}

function B14Voices() {
  return (
    <SectionShell>
      <div className="max-w-3xl grid md:grid-cols-2 gap-14">
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "My first action after signing in was inviting my team.
            That, incredibly, was my last concern."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Jerzy Wiśniewski · signosh
          </div>
        </div>
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "I rolled back a secret with the history view. I'd been
            avoiding the moment for a week."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Dominik Mackiewicz · bluemenu
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function B14CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          That's the whole product.
        </h2>
        <div className="mt-4 text-neutral-500">
          The rest of the thinking is on the{" "}
          <a
            href="/blog"
            className={cn("underline underline-offset-4 hover:text-neutral-300")}
          >
            blog
          </a>
          .
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-3">
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

export function VariantB14() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <B14Nav />
      <B14Hero />
      <B14Write />
      <B14Invite />
      <B14History />
      <B14Voices />
      <B14CTA />
    </div>
  );
}
