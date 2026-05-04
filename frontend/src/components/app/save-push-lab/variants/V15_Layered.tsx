import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

const HEX = "0123456789abcdef".split("");

/**
 * 15 — Layered. Two cipher streams stacked. The background runs at half
 * opacity and a different speed; the foreground holds the readable label
 * which scrambles distinctly. You see ciphertext-on-ciphertext.
 */
export function V15_Layered({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const top = labelFor(state, changes);
  const back = backFor(state);
  const fg = useScramble(top, { reseed: state, speed: 0.08 });
  const bg = useScramble(back, { alphabet: HEX, reseed: state + "-bg", speed: 0.04 });
  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;
  const accent = state === "dirty" || state === "saving" || state === "saved";

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
        background: "linear-gradient(180deg, #0c0c0d, #050506)",
        color: accent ? ACCENT : "#e5e5e5",
        border: `1px solid ${accent ? `${ACCENT}66` : "rgba(255,255,255,0.08)"}`,
        boxShadow: accent ? `0 12px 30px ${ACCENT}33` : "0 12px 30px rgba(0,0,0,0.55)",
      }}
    >
      {/* Background cipher row */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] tracking-[0.18em] tabular-nums"
        style={{ color: accent ? `${ACCENT}33` : "rgba(255,255,255,0.18)" }}
      >
        {bg}
      </span>
      <motion.span layout="position" className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        <span className="opacity-50">{">"}</span>
        <span className="tabular-nums">{fg}</span>
      </motion.span>
    </motion.button>
  );
}

function labelFor(s: string, n: number) {
  switch (s) {
    case "dirty":
      return `save · ${n}`;
    case "saving":
      return `encrypting`;
    case "saved":
      return `sealed`;
    case "clean":
      return `push`;
    case "pushing":
      return `transmit`;
    case "pushed":
      return `synced`;
    case "idle":
      return `in sync`;
  }
  return "";
}

function backFor(s: string) {
  switch (s) {
    case "dirty":
      return "f4ac1d2e9b3c";
    case "saving":
      return "be11dead0042";
    case "saved":
      return "ca11ab1ef00d";
    case "clean":
      return "deadbeefcafe";
    case "pushing":
      return "0bf3ee9c1aaf";
    case "pushed":
      return "5a17ed4b0c9e";
    case "idle":
      return "000000000000";
  }
  return "000000000000";
}
