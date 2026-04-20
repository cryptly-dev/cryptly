import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Check, Copy, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Shared tokens used across the redesign sandbox. The page intentionally stays
// off-grid (at /redesign) so we can iterate on variants without disturbing the
// live landing page. Each hero and section is rendered inside a thin labelled
// frame so the user can pick which ones they like.

export const dottedMaskStyle: React.CSSProperties = {
  color: "transparent",
  backgroundImage:
    "radial-gradient(circle, rgb(156 163 175 / 0.9) 1.5px, transparent 1.5px)",
  backgroundSize: "8.4px 100%",
  backgroundRepeat: "repeat-x",
  backgroundPosition: "2px center",
  borderRadius: "3px",
};

export function DottedMask({
  value,
  reveal,
  className,
}: {
  value: string;
  reveal?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block align-middle select-none", className)}
      style={reveal ? undefined : dottedMaskStyle}
    >
      {value}
    </span>
  );
}

export function HoverRevealMask({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [reveal, setReveal] = useState(false);
  return (
    <span
      className={cn(
        "inline-block align-middle cursor-pointer select-none transition-colors",
        className
      )}
      style={reveal ? undefined : dottedMaskStyle}
      onMouseEnter={() => setReveal(true)}
      onMouseLeave={() => setReveal(false)}
      onFocus={() => setReveal(true)}
      onBlur={() => setReveal(false)}
      tabIndex={0}
    >
      {value}
    </span>
  );
}

export function Label({
  kind,
  index,
  title,
  subtitle,
}: {
  kind: "Hero" | "Section";
  index: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="sticky top-0 z-20 bg-black/80 backdrop-blur border-b border-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 px-2.5 py-0.5 text-[11px] font-medium text-neutral-400">
          <span className="text-neutral-500">{kind}</span>
          <span className="text-neutral-300">#{index}</span>
        </span>
        <div className="flex items-baseline gap-2 min-w-0">
          <h3 className="text-sm font-medium text-neutral-200 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-neutral-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Frame({
  kind,
  index,
  title,
  subtitle,
  children,
  id,
}: {
  kind: "Hero" | "Section";
  index: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <section id={id} className="scroll-mt-14">
      <Label kind={kind} index={index} title={title} subtitle={subtitle} />
      <div className="relative">{children}</div>
    </section>
  );
}

export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-xs text-neutral-300",
        className
      )}
    >
      {children}
    </span>
  );
}

export function BrowserChrome({
  url = "cryptly.dev/app/project/production",
  children,
  className,
}: {
  url?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl",
        className
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-900 bg-neutral-950/80">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-md border border-neutral-900 bg-neutral-900/50 px-2.5 py-0.5 text-[11px] text-neutral-500">
          <Lock className="h-3 w-3" />
          <span>{url}</span>
        </div>
        <div className="w-8" />
      </div>
      {children}
    </div>
  );
}

export function MockEnvEditor({
  rows,
  showLineNumbers = true,
  className,
}: {
  rows: { key: string; value: string; comment?: boolean }[];
  showLineNumbers?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-mono text-[13px] leading-6 bg-black rounded-lg overflow-hidden",
        className
      )}
    >
      <div className="grid grid-cols-[auto_1fr] min-w-0">
        {rows.map((r, i) =>
          r.comment ? (
            <div
              key={i}
              className="col-span-2 text-neutral-600 px-4"
              style={{ paddingLeft: showLineNumbers ? undefined : 16 }}
            >
              {showLineNumbers && (
                <span className="inline-block w-6 text-right mr-4 text-neutral-700">
                  {i + 1}
                </span>
              )}
              # {r.key}
            </div>
          ) : (
            <div key={i} className="col-span-2 px-4 flex min-w-0">
              {showLineNumbers && (
                <span className="inline-block w-6 text-right mr-4 text-neutral-700 shrink-0">
                  {i + 1}
                </span>
              )}
              <span className="text-sky-400 shrink-0">{r.key}</span>
              <span className="text-neutral-500 shrink-0">=</span>
              <HoverRevealMask
                value={r.value}
                className="text-neutral-300 min-w-0 truncate"
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function FakeTerminal({
  lines,
  className,
  prompt = "$",
}: {
  lines: { kind: "prompt" | "out" | "ok" | "warn" | "dim"; text: string }[];
  className?: string;
  prompt?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-800 bg-[#0a0a0a] overflow-hidden font-mono text-[13px] leading-6 shadow-2xl",
        className
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-900">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
        </div>
        <span className="text-[11px] text-neutral-600 mx-auto">~/cryptly</span>
        <div className="w-8" />
      </div>
      <div className="p-4 space-y-0.5 text-neutral-300">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2">
            {l.kind === "prompt" && (
              <span className="text-neutral-600 select-none">{prompt}</span>
            )}
            <span
              className={cn(
                l.kind === "ok" && "text-emerald-400",
                l.kind === "warn" && "text-amber-400",
                l.kind === "dim" && "text-neutral-600",
                l.kind === "prompt" && "text-neutral-200"
              )}
            >
              {l.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatTile({
  label,
  value,
  note,
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6">
      <div className="text-xs uppercase tracking-wider text-neutral-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold text-neutral-100">
        {value}
      </div>
      {note && <div className="mt-2 text-xs text-neutral-500">{note}</div>}
    </div>
  );
}

export function SectionShell({
  children,
  className,
  compact,
}: {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-6xl px-6",
        compact ? "py-16" : "py-24",
        className
      )}
    >
      {children}
    </div>
  );
}

export function HeroShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-6xl px-6 py-24 md:py-32 min-h-[80vh] flex flex-col justify-center",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TwoColumn({
  left,
  right,
  reverse,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
        reverse && "lg:[&>*:first-child]:order-2"
      )}
    >
      {left}
      {right}
    </div>
  );
}

export function HeroHeadline({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {eyebrow && (
        <div className="mb-4 text-xs uppercase tracking-[0.2em] text-neutral-500">
          {eyebrow}
        </div>
      )}
      <h1 className="text-5xl md:text-6xl font-semibold text-neutral-100 leading-[1.05] tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-6 text-lg text-neutral-400 max-w-xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

export function PrimaryCTA({
  children,
  href = "/app/login",
  className,
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium transition-all hover:scale-[1.02]",
        className
      )}
    >
      {children}
    </a>
  );
}

export function GhostCTA({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href ?? "#"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/40 px-5 py-2.5 text-sm text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors",
        className
      )}
    >
      {children}
    </a>
  );
}

export function CopyPill({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => {});
        setCopied(true);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 text-xs font-mono text-neutral-300 hover:bg-neutral-800/60 transition-colors",
        copied && "border-emerald-700/50 text-emerald-400"
      )}
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check className="h-3 w-3 shrink-0" />
      ) : (
        <Copy className="h-3 w-3 shrink-0 text-neutral-500" />
      )}
    </button>
  );
}

// A believable-looking ciphertext block for "what the server sees" demos.
export function fakeCiphertext(seed: string, length = 88): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  let out = "";
  for (let i = 0; i < length; i++) {
    h = (h * 1664525 + 1013904223) | 0;
    out += alphabet[Math.abs(h) % alphabet.length];
  }
  return out;
}

export function passphraseEntropyBits(pass: string): number {
  if (!pass) return 0;
  let pool = 0;
  if (/[a-z]/.test(pass)) pool += 26;
  if (/[A-Z]/.test(pass)) pool += 26;
  if (/[0-9]/.test(pass)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pass)) pool += 32;
  if (pool === 0) pool = 1;
  return Math.round(pass.length * Math.log2(pool));
}
