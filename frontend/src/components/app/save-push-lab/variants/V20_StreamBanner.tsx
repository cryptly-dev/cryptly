import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";

const HEX = "0123456789abcdef";

/**
 * 20 — Stream Banner. A horizontally scrolling marquee of hex bytes runs
 * underneath the action label like a stock-ticker. Bytes scroll faster
 * during active states, slow on idle. Label sits above the stream as the
 * legible authority.
 */
export function V20_StreamBanner({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;
  const accent = state === "dirty" || state === "saving" || state === "saved";
  const active = state === "saving" || state === "pushing";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      layout
      transition={{ layout: { type: "spring", stiffness: 360, damping: 30 } }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className="relative h-14 overflow-hidden rounded-md font-mono"
      style={{
        background: "linear-gradient(180deg, #0a0a0a, #050506)",
        border: `1px solid ${accent ? `${ACCENT}66` : "rgba(255,255,255,0.08)"}`,
        boxShadow: accent ? `0 14px 36px ${ACCENT}33` : "0 14px 36px rgba(0,0,0,0.6)",
      }}
    >
      <Marquee active={active} dim={!accent} />
      <motion.span
        layout="position"
        className="relative z-10 flex h-full items-center justify-center gap-2 px-5 text-[13px] font-semibold tracking-[0.04em] whitespace-nowrap"
        style={{
          color: accent ? ACCENT : "#fff",
          textShadow: "0 0 6px rgba(0,0,0,0.85)",
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.22em] opacity-50">cryptly</span>
        {labelFor(state, changes)}
      </motion.span>
    </motion.button>
  );
}

function Marquee({ active, dim }: { active: boolean; dim: boolean }) {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setSeed((s) => s + 1), active ? 80 : 600);
    return () => window.clearInterval(id);
  }, [active]);

  // Build a long pseudo-random hex stream
  const bytes = Array.from({ length: 160 }, (_, i) => {
    const a = HEX[(seed * 13 + i * 31) % 16];
    const b = HEX[(seed * 7 + i * 17) % 16];
    return `${a}${b}`;
  }).join(" ");

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center overflow-hidden"
      style={{ opacity: dim ? 0.18 : 0.42 }}
    >
      <motion.span
        className="whitespace-nowrap pl-4 text-[10px] tracking-[0.05em]"
        style={{ color: ACCENT }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: active ? 12 : 60, ease: "linear", repeat: Infinity }}
      >
        {bytes} {bytes}
      </motion.span>
    </span>
  );
}

function labelFor(s: string, n: number) {
  switch (s) {
    case "dirty":
      return `save · ${n} pending`;
    case "saving":
      return `encrypting…`;
    case "saved":
      return `sealed`;
    case "clean":
      return `push → origin`;
    case "pushing":
      return `transmitting…`;
    case "pushed":
      return `synced`;
    case "idle":
      return `in sync`;
  }
  return "";
}
