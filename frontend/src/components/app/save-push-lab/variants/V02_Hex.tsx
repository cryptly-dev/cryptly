import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

const HEX = "0123456789abcdef".split("");

/**
 * 02 — Hex. The pill scrambles like a hash digest. Even the resolved label
 * is shaped like a short hex prefix joined to the action. Reads like the
 * first 8 chars of a SHA you'd see in `git log`.
 */
export function V02_Hex({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const target = targetFor(state, changes);
  const display = useScramble(target, { alphabet: HEX, reseed: state, speed: 0.07 });
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
      className="relative h-11 overflow-hidden rounded-sm px-4 font-mono text-[12px] tracking-[0.06em]"
      style={{
        background: "#000",
        color: accent ? ACCENT : idle ? "rgba(255,255,255,0.45)" : "#22c55e",
        border: `1px solid ${accent ? `${ACCENT}77` : idle ? "rgba(255,255,255,0.15)" : "#22c55e55"}`,
        boxShadow: accent
          ? `0 0 28px ${ACCENT}44, inset 0 0 0 1px ${ACCENT}11`
          : "0 0 24px rgba(34,197,94,0.18)",
      }}
    >
      <motion.span layout="position" className="relative z-10 flex items-center gap-2 whitespace-nowrap">
        <span className="opacity-50">0x</span>
        <span className="tabular-nums">{display}</span>
      </motion.span>
    </motion.button>
  );
}

function targetFor(s: string, n: number) {
  switch (s) {
    case "dirty":
      return `c4f2-3a1d save+${n}`;
    case "saving":
      return "ee9c-7b32 sealing";
    case "saved":
      return "a17e-bd45 ok";
    case "clean":
      return "f3d2-90ae push→";
    case "pushing":
      return "21bb-cc04 tx…";
    case "pushed":
      return "5e4c-1d8f sync";
    case "idle":
      return "0000-0000 idle";
  }
  return "";
}
