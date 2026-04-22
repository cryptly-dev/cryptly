import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, Check, Link2, Users } from "lucide-react";
import { GhostCTA, PrimaryCTA, SectionShell } from "../common";

/* ────────────────────────────────────────────────────────────────────────────
 * VARIANT D12 — "The Daily Count"
 * Formula D · Dashboard-style mock with real stats and a working nav.
 * ──────────────────────────────────────────────────────────────────────────── */

function D12Nav() {
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

function D12Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black">
      <div className="mx-auto max-w-5xl w-full px-6 grid md:grid-cols-[1.1fr_1fr] gap-16 items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-semibold text-neutral-100 leading-[1] tracking-tight"
          >
            The daily count.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-md"
          >
            The numbers we watch. Small today, slightly less small
            tomorrow. The rate we like.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="rounded-2xl border border-neutral-900 bg-neutral-950/60 overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-neutral-900 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
              cryptly · ledger
            </span>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
            </div>
          </div>
          <div className="p-5 space-y-3 text-sm">
            <div className="flex items-baseline justify-between py-2 border-b border-neutral-900">
              <span className="text-neutral-500">users</span>
              <span className="font-mono text-neutral-100 tabular-nums">77</span>
            </div>
            <div className="flex items-baseline justify-between py-2 border-b border-neutral-900">
              <span className="text-neutral-500">projects</span>
              <span className="font-mono text-neutral-100 tabular-nums">89</span>
            </div>
            <div className="flex items-baseline justify-between py-2 border-b border-neutral-900">
              <span className="text-neutral-500">wrapped versions</span>
              <span className="font-mono text-neutral-100 tabular-nums">
                1,086
              </span>
            </div>
            <div className="flex items-baseline justify-between py-2">
              <span className="text-neutral-500">github stars</span>
              <span className="font-mono text-neutral-100 tabular-nums">30</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function D12FeaturePane({
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

function D12Features() {
  return (
    <SectionShell className="scroll-mt-14">
      <div id="features" className="max-w-3xl mb-16">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-tight">
          What those numbers are doing.
        </h2>
        <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl">
          Three features, described in the smallest number of words we
          could manage.
        </p>
      </div>
      <div className="max-w-5xl grid md:grid-cols-3 gap-5">
        <D12FeaturePane title="write">
          <div className="space-y-3">
            <div className="text-neutral-500">name</div>
            <div className="px-3 py-2 rounded-md bg-neutral-900/60 text-neutral-200 font-mono text-xs">
              STRIPE_SECRET
            </div>
            <div className="text-neutral-500 pt-2">value</div>
            <div className="px-3 py-2 rounded-md bg-neutral-900/60 text-neutral-200 font-mono text-xs tracking-wider">
              sk_live_••••••••••••
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-300/80 pt-2">
              <Check className="h-3 w-3" />
              wrapped in-browser
            </div>
          </div>
        </D12FeaturePane>
        <D12FeaturePane title="invite">
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-900/60 text-neutral-300">
              <Link2 className="h-3 w-3" />
              <span className="text-xs">invite link</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-900/60 text-neutral-300">
              <Users className="h-3 w-3" />
              <span className="text-xs">suggested · dominik</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-900/40 border border-dashed border-neutral-800 text-neutral-500">
              <span className="text-xs">teams · soon</span>
            </div>
          </div>
        </D12FeaturePane>
        <D12FeaturePane title="history">
          <div className="divide-y divide-neutral-900 font-mono text-xs">
            <div className="flex items-center justify-between py-2">
              <span className="text-neutral-100">v12</span>
              <span className="text-neutral-500">you · now</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>v11</span>
              <span className="text-neutral-500">jerzy · 1d</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>v10</span>
              <span className="text-neutral-500">dominik · 4d</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>v9</span>
              <span className="text-neutral-500">you · last wk</span>
            </div>
          </div>
        </D12FeaturePane>
      </div>
    </SectionShell>
  );
}

function D12Voices() {
  return (
    <SectionShell>
      <div className="max-w-3xl grid md:grid-cols-2 gap-14">
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "The count goes up on days when my team ships, and it
            doesn't bother me when it doesn't."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Jerzy Wiśniewski · signosh
          </div>
        </div>
        <div>
          <blockquote className="text-lg md:text-xl text-neutral-200 leading-[1.6] font-serif italic">
            "Seventy-seven is a small number. It's the number I wanted
            it to be when I signed up."
          </blockquote>
          <div className="mt-6 text-xs font-mono uppercase tracking-[0.25em] text-neutral-500">
            — Dominik Mackiewicz · bluemenu
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function D12Roster() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 mb-8">
          On the roster
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4 text-neutral-300 text-xl md:text-2xl font-semibold tracking-tight">
          <span>logdash</span>
          <span className="text-neutral-700">·</span>
          <span>signosh</span>
          <span className="text-neutral-700">·</span>
          <span>bluemenu</span>
          <span className="text-neutral-700">·</span>
          <span>jobref</span>
        </div>
        <p className="mt-8 text-neutral-500 text-lg leading-relaxed max-w-xl">
          The longer entries for each live on the{" "}
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

function D12CTA() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
          Tick up the count.
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

export function VariantD12() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 overflow-x-hidden">
      <D12Nav />
      <D12Hero />
      <D12Features />
      <D12Voices />
      <D12Roster />
      <D12CTA />
    </div>
  );
}
