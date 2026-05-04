import { motion } from "motion/react";
import type { FlowController } from "../types";
import { ACCENT } from "../types";
import { useScramble } from "../useScramble";

const HEX = "0123456789abcdef".split("");

/**
 * 06 — SHA Preview. The button reads like a git commit hash: a six-char
 * prefix, an ellipsis, a four-char tail — all scrambling — followed by an
 * action verb. Anyone who's used `git log` will read it instantly.
 */
export function V06_ShaPreview({ flow }: { flow: FlowController }) {
  const { state, changes, onSave, onPush } = flow;
  const verb =
    state === "dirty"
      ? "save"
      : state === "saving"
        ? "..."
        : state === "saved"
          ? "ok"
          : state === "clean"
            ? "push"
            : state === "pushing"
              ? "tx"
              : state === "pushed"
                ? "ack"
                : "idle";
  const target = `7f3a9c…e4b2 ${verb}${state === "dirty" ? `+${changes}` : ""}`;
  const display = useScramble(target, {
    alphabet: HEX,
    reseed: state,
    speed: 0.07,
    preserve: (c) => /[a-z+…\s]/.test(c),
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
      className="relative h-11 overflow-hidden rounded-full px-5 font-mono text-[12.5px] tracking-[0.04em]"
      style={{
        background: "linear-gradient(180deg, #18181b, #0c0c0d)",
        color: idle ? "rgba(255,255,255,0.4)" : accent ? ACCENT : "#fff",
        border: `1px solid ${accent ? `${ACCENT}77` : "rgba(255,255,255,0.12)"}`,
        boxShadow: accent ? `0 12px 30px ${ACCENT}33` : "0 12px 30px rgba(0,0,0,0.5)",
      }}
    >
      <motion.span layout="position" className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        <span
          className="text-[10px] uppercase tracking-[0.2em] opacity-50"
          style={{ color: accent ? ACCENT : undefined }}
        >
          sha
        </span>
        <span className="tabular-nums">{display}</span>
      </motion.span>
    </motion.button>
  );
}
