import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

const BIN = ["0", "1"];

/**
 * 03 — Binary. Just zeroes and ones until the action resolves at the right.
 * The scramble feels like a stream of bits collapsing into intent.
 */
export function V03_Binary({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const target = targetFor(state, changes);
  const display = useScramble(target, {
    alphabet: BIN,
    reseed: state,
    speed: 0.06,
    preserve: (c) => c === " " || c === "·" || /[A-Z]/.test(c),
  });
  const onClick =
    state === "dirty" ? onSave : state === "clean" || state === "saved" ? onPush : undefined;
  const accent = state === "dirty" || state === "saving" || state === "saved";
  const idle = state === "idle";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      layout
      transition={{ layout: { type: "spring", stiffness: 360, damping: 30 } }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className="relative h-11 overflow-hidden rounded-md px-5 font-mono text-[12px] tracking-[0.18em]"
      style={{
        background: accent
          ? `linear-gradient(180deg, ${ACCENT}22, ${ACCENT}08)`
          : "linear-gradient(180deg, #0c0c0d, #050505)",
        color: accent ? ACCENT : idle ? "rgba(255,255,255,0.4)" : "#fff",
        border: `1px solid ${accent ? `${ACCENT}66` : "rgba(255,255,255,0.08)"}`,
        boxShadow: accent ? `0 14px 36px ${ACCENT}33` : "0 14px 36px rgba(0,0,0,0.55)",
      }}
    >
      <motion.span layout="position" className="relative z-10 flex items-center gap-2 whitespace-nowrap tabular-nums">
        {display}
      </motion.span>
    </motion.button>
  );
}

function targetFor(s: string, n: number) {
  const bits = (n: number, w = 4) => n.toString(2).padStart(w, "0");
  switch (s) {
    case "dirty":
      return `${bits(n)} SAVE`;
    case "saving":
      return "1110 ENCR";
    case "saved":
      return "0000 OK";
    case "clean":
      return "0001 PUSH";
    case "pushing":
      return "1011 TX";
    case "pushed":
      return "0000 ACK";
    case "idle":
      return "0000 ----";
  }
  return "";
}
