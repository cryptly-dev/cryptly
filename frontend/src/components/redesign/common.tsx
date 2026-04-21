import { cn } from "@/lib/utils";
import { useState } from "react";

const dottedMaskStyle: React.CSSProperties = {
  color: "transparent",
  backgroundImage:
    "radial-gradient(circle, rgb(156 163 175 / 0.9) 1.5px, transparent 1.5px)",
  backgroundSize: "8.4px 100%",
  backgroundRepeat: "repeat-x",
  backgroundPosition: "2px center",
  borderRadius: "3px",
};

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

export function SectionShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-6xl px-6 py-24", className)}>
      {children}
    </div>
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
