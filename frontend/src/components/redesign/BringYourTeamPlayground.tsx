import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Copy,
  KeyRound,
  Link2,
  MessageSquare,
  Shield,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

// ── Shared data ──────────────────────────────────────────────────────────────

const LINK = "cryptly.dev/invite/a3f9-k2m-7bxQ";
const PASS = "sunrise-otter-42";

const COLLABS = [
  {
    id: "alex",
    name: "Alex Chen",
    handle: "alexchen",
    avatar: "/avatars/alex-chen.svg",
    hint: "on cryptly-dev/api",
  },
  {
    id: "marcus",
    name: "Marcus Rodriguez",
    handle: "mrodriguez",
    avatar: "/avatars/marcus-rodriguez.svg",
    hint: "last commit 2h ago",
  },
  {
    id: "priya",
    name: "Priya Patel",
    handle: "ppatel",
    avatar: "/avatars/priya-patel.svg",
    hint: "owns cryptly-dev/web",
  },
  {
    id: "nina",
    name: "Nina Gupta",
    handle: "ngupta",
    avatar: "/avatars/nina-gupta.svg",
    hint: "reviewed 3 PRs",
  },
];

// ── Layout helpers ───────────────────────────────────────────────────────────

function VariantFrame({
  index,
  title,
  blurb,
  children,
}: {
  index: number;
  title: string;
  blurb: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-neutral-900 first:border-t-0">
      <div className="mx-auto max-w-6xl px-6 py-6 flex items-baseline gap-4">
        <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-950 px-2.5 py-0.5 text-[11px] font-medium text-neutral-300">
          V{index.toString().padStart(2, "0")}
        </span>
        <h2 className="text-lg font-semibold text-neutral-100 tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-neutral-500 truncate">{blurb}</p>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-20">{children}</div>
    </section>
  );
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(null), 1400);
  };
  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );
  return { copied, copy };
}

function Stars() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(circle at 80% 70%, rgba(96,165,250,0.1), transparent 60%)",
      }}
    />
  );
}

// ── V01 — Editorial Split ────────────────────────────────────────────────────
// Magazine-style left column of big numbered steps, right column is the live
// invite UI. Feels curated and premium.
function V01Editorial() {
  const { copied, copy } = useCopy();
  const steps = [
    {
      n: "01",
      title: "Generate a link.",
      body: "One-time use, expires in 24 hours, scoped to this project.",
    },
    {
      n: "02",
      title: "A passphrase comes with it.",
      body: "Cryptly mints it on the spot. We never see it.",
    },
    {
      n: "03",
      title: "Send them on separate channels.",
      body: "Slack for the link. Signal for the passphrase. A leaked link alone is useless.",
    },
  ];
  return (
    <div className="rounded-3xl border border-neutral-900 bg-gradient-to-b from-neutral-950 to-black overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <div className="p-10 md:p-14 border-b lg:border-b-0 lg:border-r border-neutral-900">
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-600">
            Bring your team
          </div>
          <h3 className="mt-4 text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.02]">
            Two factors.
            <br />
            Two channels.
            <br />
            <span className="text-neutral-500">No plaintext.</span>
          </h3>
          <div className="mt-10 space-y-6">
            {steps.map((s) => (
              <div key={s.n} className="grid grid-cols-[40px_1fr] gap-5">
                <div className="font-mono text-[13px] text-neutral-600 pt-0.5">
                  {s.n}
                </div>
                <div>
                  <div className="text-[15px] font-medium text-neutral-200">
                    {s.title}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500 leading-relaxed">
                    {s.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-10 md:p-14 bg-black/40 flex flex-col justify-center">
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-wider text-neutral-600">
                <Link2 className="h-3 w-3" /> Invite link
              </div>
              <button
                onClick={() => copy(`https://${LINK}`, "link")}
                className="w-full flex items-center gap-3 rounded-lg bg-neutral-950 border border-neutral-900 px-4 py-3 text-sm font-mono text-neutral-300 hover:border-neutral-700 transition-colors text-left"
              >
                <span className="flex-1 truncate">https://{LINK}</span>
                {copied === "link" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-neutral-600" />
                )}
              </button>
            </div>
            <div>
              <div className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-wider text-neutral-600">
                <KeyRound className="h-3 w-3" /> Passphrase · different channel
              </div>
              <button
                onClick={() => copy(PASS, "pass")}
                className="w-full flex items-center gap-3 rounded-lg bg-neutral-950 border border-neutral-900 px-4 py-3 text-sm font-mono text-sky-300 hover:border-neutral-700 transition-colors text-left"
              >
                <span className="flex-1 truncate">{PASS}</span>
                {copied === "pass" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-neutral-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── V02 — Two-Path Flow Diagram ─────────────────────────────────────────────
// Visualizes the two-channel principle: sender on the left, recipient on the
// right, two distinct paths between them (link, passphrase).
function V02FlowDiagram() {
  return (
    <div className="relative rounded-3xl border border-neutral-900 bg-black overflow-hidden">
      <Stars />
      <div className="relative p-10 md:p-14">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-semibold text-neutral-100 tracking-tight leading-[1.02]">
            Bring your team.
          </h3>
          <p className="mt-3 text-neutral-400">
            Two secrets, two channels — one recipient. If either gets
            intercepted, the invite is still useless.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-[1fr_auto_1fr] items-center gap-8">
          <EndpointCard
            label="You"
            avatar="/avatars/alex-chen.svg"
            tag="Project owner"
          />
          <div className="relative h-32 w-56">
            <svg
              viewBox="0 0 224 128"
              className="absolute inset-0"
              fill="none"
            >
              <defs>
                <linearGradient id="fv2a" x1="0" x2="1">
                  <stop offset="0%" stopColor="rgba(96,165,250,0.1)" />
                  <stop offset="100%" stopColor="rgba(96,165,250,0.8)" />
                </linearGradient>
                <linearGradient id="fv2b" x1="0" x2="1">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.1)" />
                  <stop offset="100%" stopColor="rgba(16,185,129,0.8)" />
                </linearGradient>
              </defs>
              <path
                d="M0 32 C 80 32, 144 32, 224 32"
                stroke="url(#fv2a)"
                strokeWidth="1.5"
              />
              <path
                d="M0 96 C 80 96, 144 96, 224 96"
                stroke="url(#fv2b)"
                strokeWidth="1.5"
              />
              <motion.circle
                r="4"
                fill="rgba(96,165,250,1)"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ offsetPath: "path('M0 32 C 80 32, 144 32, 224 32')" }}
              />
              <motion.circle
                r="4"
                fill="rgba(16,185,129,1)"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
                style={{ offsetPath: "path('M0 96 C 80 96, 144 96, 224 96')" }}
              />
            </svg>
            <PathChip x="50%" y="32" icon={<Link2 className="h-3 w-3" />} label="Link · Slack" color="sky" />
            <PathChip x="50%" y="96" icon={<KeyRound className="h-3 w-3" />} label="Passphrase · Signal" color="emerald" />
          </div>
          <EndpointCard
            label="Nina Gupta"
            avatar="/avatars/nina-gupta.svg"
            tag="New member"
          />
        </div>
      </div>
    </div>
  );
}

function EndpointCard({
  label,
  avatar,
  tag,
}: {
  label: string;
  avatar: string;
  tag: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-5 flex flex-col items-center text-center">
      <img
        src={avatar}
        alt=""
        className="h-14 w-14 rounded-full border border-neutral-800"
      />
      <div className="mt-3 text-sm font-medium text-neutral-200">{label}</div>
      <div className="text-[11px] text-neutral-500">{tag}</div>
    </div>
  );
}

function PathChip({
  x,
  y,
  icon,
  label,
  color,
}: {
  x: string;
  y: number;
  icon: ReactNode;
  label: string;
  color: "sky" | "emerald";
}) {
  return (
    <div
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium bg-neutral-950",
        color === "sky"
          ? "border-sky-500/30 text-sky-300"
          : "border-emerald-500/30 text-emerald-300"
      )}
      style={{ left: x, top: y }}
    >
      {icon}
      {label}
    </div>
  );
}

// ── V03 — Terminal Command ─────────────────────────────────────────────────
// CLI-inspired. Typewriter command animates and the output reveals the link
// + passphrase. Speaks to the engineer audience directly.
function V03Terminal() {
  const lines = [
    { kind: "prompt", text: "cryptly invite --project production" },
    { kind: "dim", text: "→ generating single-use link…" },
    { kind: "out", text: `  link:       https://${LINK}` },
    { kind: "dim", text: "→ minting passphrase (client-side only)…" },
    { kind: "ok", text: `  passphrase: ${PASS}` },
    { kind: "dim", text: "" },
    {
      kind: "dim",
      text: "share each on a separate channel. both are required.",
    },
  ];
  return (
    <div className="rounded-3xl border border-neutral-900 bg-black overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr]">
        <div className="p-10 md:p-14 border-b lg:border-b-0 lg:border-r border-neutral-900">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-[11px] text-neutral-400">
            <Shield className="h-3 w-3" />
            Zero-knowledge invite
          </div>
          <h3 className="mt-4 text-3xl md:text-4xl font-semibold text-neutral-100 tracking-tight leading-[1.1]">
            Bring your team.
          </h3>
          <p className="mt-4 text-neutral-400 leading-relaxed">
            Every invite generates a one-time link and a passphrase. Your
            browser holds onto both for a second, so the server can't even read
            what it's forwarding.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-neutral-500">
            <span className="rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5">
              24h expiry
            </span>
            <span className="rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5">
              Single-use
            </span>
            <span className="rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5">
              Re-wrapped per member
            </span>
          </div>
        </div>
        <div className="bg-[#0a0a0a] font-mono text-[13px] leading-7 p-8">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
            <span className="ml-3 text-[11px] text-neutral-600">
              ~/cryptly
            </span>
          </div>
          {lines.map((l, i) => (
            <div key={i} className="flex gap-2">
              {l.kind === "prompt" && (
                <span className="text-neutral-600 select-none">$</span>
              )}
              <span
                className={cn(
                  l.kind === "ok" && "text-emerald-400",
                  l.kind === "dim" && "text-neutral-600 italic",
                  l.kind === "out" && "text-sky-300",
                  l.kind === "prompt" && "text-neutral-100"
                )}
              >
                {l.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── V04 — Chat Bubble Ritual ───────────────────────────────────────────────
// Renders the invite flow as chat bubbles across two apps, making the
// "two channels" point visceral.
function V04ChatBubble() {
  return (
    <div className="rounded-3xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
      <div className="p-10 md:p-14">
        <div className="max-w-2xl">
          <h3 className="text-3xl md:text-4xl font-semibold text-neutral-100 tracking-tight leading-[1.1]">
            Two apps. Two messages. One teammate.
          </h3>
          <p className="mt-3 text-neutral-400">
            The invite splits across channels by design. One message alone is
            useless. Both together unlock the vault.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Slack-ish */}
          <FakeChatWindow app="Slack" accent="#4a154b">
            <ChatBubble side="right">
              hey, adding you to the secrets vault — link here, passphrase
              coming over Signal
            </ChatBubble>
            <ChatBubble side="right" tight>
              <span className="font-mono text-sky-300">https://{LINK}</span>
            </ChatBubble>
          </FakeChatWindow>
          {/* Signal-ish */}
          <FakeChatWindow app="Signal" accent="#3a76f0">
            <ChatBubble side="right" tight>
              <span className="font-mono text-sky-300">{PASS}</span>
            </ChatBubble>
            <ChatBubble side="right">one-time, burn it after.</ChatBubble>
          </FakeChatWindow>
        </div>
      </div>
    </div>
  );
}

function FakeChatWindow({
  app,
  accent,
  children,
}: {
  app: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-900 bg-black overflow-hidden shadow-2xl shadow-black/50">
      <div
        className="h-10 flex items-center gap-2 px-4 border-b border-neutral-900 text-[12px] font-medium text-neutral-200"
        style={{ background: `linear-gradient(180deg, ${accent}33, transparent)` }}
      >
        <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
        {app}
        <span className="ml-auto text-neutral-600">just now</span>
      </div>
      <div className="p-4 space-y-2 min-h-[140px]">{children}</div>
    </div>
  );
}

function ChatBubble({
  side,
  tight,
  children,
}: {
  side: "left" | "right";
  tight?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex", side === "right" && "justify-end")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
          side === "right"
            ? "bg-sky-500/15 border border-sky-500/30 text-neutral-100"
            : "bg-neutral-900 border border-neutral-800 text-neutral-300",
          tight && "py-1.5"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ── V05 — Stacked Method Cards ─────────────────────────────────────────────
// A tactile card stack: tap a method and it slides to front. Feels physical
// — more interactive than flat tabs.
function V05CardStack() {
  const [active, setActive] = useState<"link" | "github" | "teams">("link");
  const order: ("link" | "github" | "teams")[] =
    active === "link"
      ? ["github", "teams", "link"]
      : active === "github"
        ? ["teams", "link", "github"]
        : ["link", "github", "teams"];

  return (
    <div className="rounded-3xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
      <div className="p-10 md:p-14">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-semibold text-neutral-100 tracking-tight">
            Pick your flavor.
          </h3>
          <p className="mt-2 text-neutral-400">
            Three ways to bring people in. All end with the vault re-wrapped
            for them.
          </p>
        </div>

        <div className="relative mt-10 h-[360px] max-w-xl mx-auto">
          {order.map((key, i) => {
            const isTop = i === order.length - 1;
            const offset = (order.length - 1 - i) * 16;
            const scale = 1 - (order.length - 1 - i) * 0.04;
            return (
              <motion.button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                animate={{ y: offset, scale, zIndex: i }}
                transition={{ type: "spring", stiffness: 240, damping: 26 }}
                className="absolute inset-0 rounded-2xl text-left overflow-hidden"
                style={{ zIndex: i }}
              >
                <StackCard kind={key} active={isTop} />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StackCard({
  kind,
  active,
}: {
  kind: "link" | "github" | "teams";
  active: boolean;
}) {
  const data = {
    link: {
      Icon: Link2,
      tint: "from-sky-500/20",
      title: "Invite link + passphrase",
      body: "Share a link in Slack and a passphrase in Signal. Both needed to join.",
    },
    github: {
      Icon: Sparkles,
      tint: "from-emerald-500/20",
      title: "From your GitHub org",
      body: "We show collaborators on this project's connected repos. One click invites them.",
    },
    teams: {
      Icon: Users,
      tint: "from-violet-500/20",
      title: "Teams · coming soon",
      body: "Define groups once. Onboard frontend, infra, on-call with one action.",
    },
  }[kind];
  return (
    <div
      className={cn(
        "relative h-full w-full rounded-2xl border border-neutral-800 bg-gradient-to-br to-neutral-950 p-6 flex flex-col justify-between transition-opacity",
        data.tint,
        !active && "opacity-80"
      )}
    >
      <div>
        <data.Icon className="h-6 w-6 text-neutral-200" />
        <div className="mt-4 text-xl font-semibold text-neutral-100">
          {data.title}
        </div>
        <div className="mt-2 text-sm text-neutral-400 max-w-md">
          {data.body}
        </div>
      </div>
      {active && (
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-neutral-300">
          Use this method
          <ArrowRight className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

// ── V06 — Dual-Pane Send/Receive ───────────────────────────────────────────
// Shows sender composing invite on left, receiver accepting on right,
// simultaneously. Builds confidence by making the full flow visible.
function V06DualPane() {
  return (
    <div className="rounded-3xl border border-neutral-900 bg-black overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 border-b md:border-b-0 md:border-r border-neutral-900 bg-neutral-950/40">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500">
            You
          </div>
          <div className="mt-2 text-lg font-semibold text-neutral-100">
            New invite
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-md border border-neutral-900 bg-neutral-950 p-3">
              <div className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1.5">
                Email (optional)
              </div>
              <div className="font-mono text-sm text-neutral-300">
                nina@cryptly.dev
              </div>
            </div>
            <div className="rounded-md border border-neutral-900 bg-neutral-950 p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 uppercase tracking-wider mb-1.5">
                <Link2 className="h-3 w-3" />
                Link
              </div>
              <div className="font-mono text-sm text-neutral-300 truncate">
                https://{LINK}
              </div>
            </div>
            <div className="rounded-md border border-neutral-900 bg-neutral-950 p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 uppercase tracking-wider mb-1.5">
                <KeyRound className="h-3 w-3" />
                Passphrase
              </div>
              <div className="font-mono text-sm text-sky-300">{PASS}</div>
            </div>
          </div>
        </div>
        <div className="p-8 bg-gradient-to-br from-neutral-950 to-black">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500">
            Nina's browser
          </div>
          <div className="mt-2 text-lg font-semibold text-neutral-100">
            Joining production
          </div>
          <div className="mt-6 rounded-2xl border border-neutral-900 bg-neutral-950 p-5">
            <div className="flex items-center gap-3">
              <img
                src="/avatars/nina-gupta.svg"
                alt=""
                className="h-10 w-10 rounded-full border border-neutral-800"
              />
              <div>
                <div className="text-sm text-neutral-100 font-medium">
                  Cryptly · production
                </div>
                <div className="text-xs text-neutral-500">
                  Invited by alex@cryptly.dev
                </div>
              </div>
            </div>
            <div className="mt-5">
              <div className="text-[10px] text-neutral-600 uppercase tracking-wider">
                Enter passphrase
              </div>
              <div className="mt-1.5 rounded-md border border-neutral-800 bg-black px-3 py-2.5 font-mono text-sm text-neutral-300">
                sunrise-otter-42
                <span className="inline-block w-1.5 h-4 bg-sky-400 align-middle ml-0.5 animate-pulse" />
              </div>
            </div>
            <button className="mt-4 w-full rounded-md bg-white text-black h-9 text-sm font-semibold">
              Unlock vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── V07 — Quiet Hero, Loud Restraint ───────────────────────────────────────
// Apple-like. Gigantic headline. One CTA. No clutter.
function V07QuietHero() {
  return (
    <div className="relative rounded-3xl border border-neutral-900 bg-black overflow-hidden">
      <Stars />
      <div className="relative p-16 md:p-24 text-center">
        <h3 className="text-5xl md:text-7xl font-semibold text-neutral-100 tracking-tight leading-[0.98] max-w-4xl mx-auto">
          One link.
          <br />
          One passphrase.
          <br />
          <span className="text-neutral-600">Zero leakage.</span>
        </h3>
        <p className="mt-8 text-lg text-neutral-400 max-w-xl mx-auto">
          The invite splits across two channels. You pick which ones. We never
          see either.
        </p>
        <div className="mt-10 inline-flex rounded-full border border-neutral-800 bg-neutral-950/80 px-1.5 py-1.5 gap-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 h-9 text-sm font-semibold">
            <UserPlus className="h-3.5 w-3.5" />
            New invite
          </div>
          <div className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm text-neutral-400">
            <Sparkles className="h-3.5 w-3.5" />
            From GitHub
          </div>
          <div className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm text-neutral-500">
            <Users className="h-3.5 w-3.5" />
            Teams
            <span className="text-[9px] uppercase tracking-wider rounded-full bg-neutral-900 px-1.5 py-0.5">
              Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── V08 — Avatar Cascade ───────────────────────────────────────────────────
// Big avatar wall sets the tone. People first. Methods feel like tools to
// get them in.
function V08Cascade() {
  const { copied, copy } = useCopy();
  const [added, setAdded] = useState<Record<string, boolean>>({});
  return (
    <div className="rounded-3xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr]">
        <div className="relative p-10 md:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-neutral-900">
          <div className="absolute inset-0 opacity-40">
            <AvatarGrid />
          </div>
          <div className="relative">
            <h3 className="text-3xl md:text-4xl font-semibold text-neutral-100 tracking-tight leading-[1.1]">
              Your team,
              <br /> already half-present.
            </h3>
            <p className="mt-4 text-neutral-400 max-w-md">
              We pull the people in GitHub repos you've connected. Adding them
              is a click.
            </p>
          </div>
        </div>
        <div className="p-8">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-3">
            Suggested · cryptly-dev/api
          </div>
          <div className="space-y-1.5">
            {COLLABS.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-neutral-900/40"
              >
                <img
                  src={p.avatar}
                  alt=""
                  className="h-8 w-8 rounded-full border border-neutral-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-neutral-200 truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-neutral-600 font-mono truncate">
                    {p.hint}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAdded((a) => ({ ...a, [p.id]: !a[p.id] }))
                  }
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 h-7 text-xs font-medium transition-colors",
                    added[p.id]
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-white text-black hover:bg-neutral-100"
                  )}
                >
                  {added[p.id] ? (
                    <>
                      <Check className="h-3 w-3" /> Invited
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3" /> Invite
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => copy(`https://${LINK}`, "link")}
            className="mt-5 w-full rounded-md border border-dashed border-neutral-800 px-3 py-2.5 text-sm text-neutral-400 hover:border-neutral-600 flex items-center justify-center gap-2"
          >
            {copied === "link" ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Link2 className="h-3.5 w-3.5" />
            )}
            Or copy an invite link
          </button>
        </div>
      </div>
    </div>
  );
}

function AvatarGrid() {
  const avs = [
    "/avatars/alex-chen.svg",
    "/avatars/marcus-rodriguez.svg",
    "/avatars/priya-patel.svg",
    "/avatars/nina-gupta.svg",
    "/avatars/david-kim.svg",
    "/avatars/emily-park.svg",
    "/avatars/james-wilson.svg",
    "/avatars/jessica-taylor.svg",
    "/avatars/lisa-zhang.svg",
    "/avatars/sarah-williams.svg",
    "/avatars/ryan-cooper.svg",
  ];
  return (
    <div className="grid grid-cols-6 gap-2 rotate-[-8deg] scale-125 origin-top-left -translate-y-6">
      {Array.from({ length: 36 }).map((_, i) => (
        <img
          key={i}
          src={avs[i % avs.length]}
          alt=""
          className="h-12 w-12 rounded-full border border-neutral-800"
          style={{
            opacity: 0.4 + Math.sin(i * 2.3) * 0.4,
          }}
        />
      ))}
    </div>
  );
}

// ── V09 — Vertical Rail + Preview ──────────────────────────────────────────
// Premium sidebar feel. Icon rail on the left, rich preview on the right.
function V09Rail() {
  const [active, setActive] = useState<"link" | "github" | "teams">("link");
  const methods = [
    { id: "link", label: "Invite link", Icon: Link2, desc: "Link + passphrase." },
    { id: "github", label: "From GitHub", Icon: Sparkles, desc: "Your collaborators." },
    { id: "teams", label: "Teams", Icon: Users, desc: "Groups · coming soon.", soon: true },
  ] as const;
  return (
    <div className="rounded-3xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
      <div className="grid grid-cols-[240px_1fr] min-h-[380px]">
        <div className="border-r border-neutral-900 p-3 bg-black/30">
          <div className="px-2 py-3 mb-1 text-[11px] uppercase tracking-wider text-neutral-600">
            Invite
          </div>
          {methods.map((m) => {
            const isActive = active === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActive(m.id)}
                className={cn(
                  "relative w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  isActive
                    ? "bg-neutral-900 text-neutral-100"
                    : "text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-200"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="rail-indicator"
                    className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-white"
                  />
                )}
                <m.Icon className="h-4 w-4 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {m.label}
                    {m.soon && (
                      <span className="text-[9px] uppercase tracking-wider rounded-full bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-neutral-500">
                        Soon
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-600">{m.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="p-10">
          <AnimatePresence mode="wait">
            {active === "link" && <RailLink key="link" />}
            {active === "github" && <RailGithub key="github" />}
            {active === "teams" && <RailTeams key="teams" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function RailLink() {
  const { copied, copy } = useCopy();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="h-full flex flex-col justify-center max-w-lg"
    >
      <h3 className="text-2xl font-semibold text-neutral-100 tracking-tight">
        Link + passphrase
      </h3>
      <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
        The link goes to the invitee. The passphrase goes over a separate
        channel. A leaked link alone can't open the vault.
      </p>
      <div className="mt-6 space-y-2">
        <button
          onClick={() => copy(`https://${LINK}`, "link")}
          className="w-full flex items-center gap-3 rounded-lg bg-neutral-950 border border-neutral-900 px-4 py-3 hover:border-neutral-700 transition-colors text-left"
        >
          <Link2 className="h-4 w-4 text-neutral-600" />
          <span className="flex-1 truncate font-mono text-sm text-neutral-300">
            https://{LINK}
          </span>
          {copied === "link" ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-neutral-600" />
          )}
        </button>
        <button
          onClick={() => copy(PASS, "pass")}
          className="w-full flex items-center gap-3 rounded-lg bg-neutral-950 border border-neutral-900 px-4 py-3 hover:border-neutral-700 transition-colors text-left"
        >
          <KeyRound className="h-4 w-4 text-neutral-600" />
          <span className="flex-1 truncate font-mono text-sm text-sky-300">
            {PASS}
          </span>
          {copied === "pass" ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-neutral-600" />
          )}
        </button>
      </div>
    </motion.div>
  );
}

function RailGithub() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="h-full flex flex-col justify-center max-w-lg"
    >
      <h3 className="text-2xl font-semibold text-neutral-100 tracking-tight">
        From GitHub
      </h3>
      <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
        Collaborators on repos connected to this project. One tap to invite.
      </p>
      <div className="mt-6 rounded-xl border border-neutral-800 bg-black/40 divide-y divide-neutral-900">
        {COLLABS.slice(0, 3).map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-3 py-2.5">
            <img
              src={p.avatar}
              alt=""
              className="h-7 w-7 rounded-full border border-neutral-800"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-neutral-200 truncate">{p.name}</div>
              <div className="text-xs text-neutral-600 font-mono truncate">
                {p.hint}
              </div>
            </div>
            <button className="inline-flex items-center gap-1 rounded-full bg-white text-black px-2.5 h-7 text-xs font-medium">
              <UserPlus className="h-3 w-3" /> Invite
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RailTeams() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="h-full flex flex-col justify-center max-w-lg"
    >
      <h3 className="text-2xl font-semibold text-neutral-100 tracking-tight">
        Teams
      </h3>
      <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
        Define groups once. Onboard frontend, infra, on-call in a single
        action. Coming soon.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {["Frontend", "Infra", "On-call"].map((n) => (
          <div
            key={n}
            className="rounded-xl border border-dashed border-neutral-800 bg-black/40 p-4"
          >
            <Users className="h-4 w-4 text-neutral-500" />
            <div className="mt-3 text-sm text-neutral-300">{n}</div>
            <div className="text-[11px] text-neutral-600">—</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── V10 — Brutalist Grid ───────────────────────────────────────────────────
// Strong grid, strong type, zero-fi aesthetic. High-contrast, very intentional.
function V10Brutalist() {
  return (
    <div className="rounded-none border border-neutral-100/10 bg-neutral-100 text-black overflow-hidden">
      <div className="grid grid-cols-12 gap-0 divide-x divide-black/10">
        <div className="col-span-12 md:col-span-7 p-10 md:p-16 border-b md:border-b-0 border-black/10">
          <div className="text-[11px] uppercase tracking-[0.3em] text-black/50">
            §04 · Bring your team
          </div>
          <h3 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[0.92]">
            Link
            <br />
            <span className="text-black/40">+</span>
            <br />
            Passphrase.
          </h3>
          <div className="mt-10 text-black/70 max-w-md text-base leading-relaxed">
            Two parts, two channels. Whoever holds both opens the vault — and
            no one else.
          </div>
        </div>
        <div className="col-span-12 md:col-span-5 divide-y divide-black/10">
          <div className="p-6">
            <div className="text-[10px] uppercase tracking-wider text-black/50">
              01 · Link
            </div>
            <div className="mt-2 font-mono text-sm">https://{LINK}</div>
          </div>
          <div className="p-6">
            <div className="text-[10px] uppercase tracking-wider text-black/50">
              02 · Passphrase
            </div>
            <div className="mt-2 font-mono text-sm">{PASS}</div>
          </div>
          <div className="p-6 bg-black text-white">
            <div className="text-[10px] uppercase tracking-wider text-white/50">
              03 · The math
            </div>
            <div className="mt-2 text-sm leading-relaxed">
              Passphrase → PBKDF2 → wraps the RSA private key → unlocks the
              AES-GCM project secrets. All client-side.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const VARIANTS: {
  title: string;
  blurb: string;
  Component: () => React.ReactElement;
}[] = [
  { title: "Editorial Split", blurb: "Magazine-style numbered steps + live UI.", Component: V01Editorial },
  { title: "Two-Path Flow Diagram", blurb: "Link + passphrase as two traced channels.", Component: V02FlowDiagram },
  { title: "Terminal", blurb: "CLI output with real secrets revealed.", Component: V03Terminal },
  { title: "Chat Bubbles", blurb: "Slack on one side, Signal on the other.", Component: V04ChatBubble },
  { title: "Card Stack", blurb: "Tactile stack of methods — swap what's on top.", Component: V05CardStack },
  { title: "Send / Receive Dual Pane", blurb: "Sender and recipient views side-by-side.", Component: V06DualPane },
  { title: "Quiet Hero", blurb: "Apple-style restraint. One big thought.", Component: V07QuietHero },
  { title: "Avatar Cascade", blurb: "People-first. Methods as tooling.", Component: V08Cascade },
  { title: "Rail + Preview", blurb: "Sidebar switcher with rich detail panel.", Component: V09Rail },
  { title: "Brutalist Grid", blurb: "High-contrast, editorial, intentional.", Component: V10Brutalist },
];

export function BringYourTeamPlayground() {
  return (
    <div className="min-h-screen bg-black text-neutral-200">
      <div className="sticky top-0 z-30 border-b border-neutral-900 bg-black/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Playground
            </div>
            <h1 className="text-xl font-semibold text-neutral-100 tracking-tight">
              Bring your team · 10 variants
            </h1>
          </div>
          <GitHubIcon className="h-5 w-5 text-neutral-500" />
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-6 py-6 text-sm text-neutral-500">
        Each take on the invite section — pick the one you want to land on the
        main page.
      </p>
      {VARIANTS.map((v, i) => (
        <VariantFrame
          key={v.title}
          index={i + 1}
          title={v.title}
          blurb={v.blurb}
        >
          <v.Component />
        </VariantFrame>
      ))}
    </div>
  );
}
