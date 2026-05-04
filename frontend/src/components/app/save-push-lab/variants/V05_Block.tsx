import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

const HEX = "0123456789abcdef".split("");

/**
 * 05 — Block. The label is shown as four-character blocks like an AES round
 * trace. Spaces are preserved during scramble so the structure stays
 * readable; the bytes inside each block churn until the action lands.
 */
export function V05_Block({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const target = blocks(state, changes);
  const display = useScramble(target, {
    alphabet: HEX,
    reseed: state,
    speed: 0.06,
    preserve: (c) => c === " " || c === "·",
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
      className="relative h-12 overflow-hidden rounded-md px-5 font-mono text-[12.5px] tracking-[0.18em]"
      style={{
        background: "linear-gradient(180deg, #0a0a0a, #050505)",
        color: accent ? ACCENT : idle ? "rgba(255,255,255,0.4)" : "#fff",
        border: `1px solid ${accent ? `${ACCENT}77` : "rgba(255,255,255,0.1)"}`,
        boxShadow: accent ? `0 14px 36px ${ACCENT}33` : "0 14px 36px rgba(0,0,0,0.6)",
      }}
    >
      <motion.span
        layout="position"
        className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap"
      >
        <span className="opacity-50">[</span>
        <span className="tabular-nums">{display}</span>
        <span className="opacity-50">]</span>
      </motion.span>
    </motion.button>
  );
}

function blocks(s: string, n: number) {
  const tag =
    s === "dirty"
      ? `save${n.toString(16).padStart(2, "0")}`
      : s === "saving"
        ? "encrpt"
        : s === "saved"
          ? "sealed"
          : s === "clean"
            ? "ready→"
            : s === "pushing"
              ? "tx•••"
              : s === "pushed"
                ? "synced"
                : "00idle";
  // Wrap into 4-char chunks for visual block-cipher rhythm
  const compact = (tag + "ff00").slice(0, 8);
  return `${compact.slice(0, 4)} ${compact.slice(4, 8)}`;
}
