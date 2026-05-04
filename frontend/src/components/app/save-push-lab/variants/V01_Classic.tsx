import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

/**
 * 01 — Classic. The original cipher pill, refined. Block glyphs, scanline
 * overlay, monospace prompt. Container animates width via layout as the
 * label changes shape.
 */
export function V01_Classic({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const target = labelFor(state, changes);
  const display = useScramble(target, { reseed: state, speed: 0.08 });
  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;
  const accent = isAccent(state);
  const idle = state === "idle";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      layout
      transition={{ layout: { type: "spring", stiffness: 360, damping: 30 } }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className="relative h-12 overflow-hidden rounded-md px-5 font-mono text-[13px] tracking-[0.04em]"
      style={{
        background: "linear-gradient(180deg, #0c0c0d, #050505)",
        color: idle ? "rgba(255,255,255,0.4)" : accent ? ACCENT : "#fff",
        border: `1px solid ${accent ? `${ACCENT}88` : "rgba(255,255,255,0.1)"}`,
        boxShadow: accent
          ? `0 14px 36px ${ACCENT}33, inset 0 0 0 1px ${ACCENT}22`
          : "0 14px 36px rgba(0,0,0,0.6)",
        opacity: idle ? 0.7 : 1,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)",
          mixBlendMode: "overlay",
        }}
      />
      <motion.span layout="position" className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        <span className="opacity-60">{">"}</span>
        <span className="tabular-nums">{display}</span>
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "saved" && <Tag key="ok"><Check className="size-3.5" /></Tag>}
          {state === "pushed" && <Tag key="ok2"><Check className="size-3.5" /></Tag>}
          {state === "clean" && <Tag key="up"><ArrowUpRight className="size-3.5" /></Tag>}
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.4, opacity: 0 }}
      transition={{ type: "spring", stiffness: 600, damping: 22 }}
    >
      {children}
    </motion.span>
  );
}

function isAccent(s: string) {
  return s === "dirty" || s === "saving" || s === "saved";
}

function labelFor(s: string, n: number) {
  switch (s) {
    case "dirty":
      return `save · ${n} chg`;
    case "saving":
      return "encrypting…";
    case "saved":
      return "sealed";
    case "clean":
      return "push to remote";
    case "pushing":
      return "transmitting…";
    case "pushed":
      return "synced";
    case "idle":
      return "in sync";
  }
  return "";
}
